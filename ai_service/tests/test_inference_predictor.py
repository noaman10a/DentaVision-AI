"""
Unit tests for End-to-End Inference Predictor and Structured Findings Formatter
Owner: Noaman (AI Model Lead)
"""

import unittest
import numpy as np
from ai_service.postprocessing.formatter import StructuredFindingsFormatter
from ai_service.inference.predictor import XRayPredictor

class TestInferencePredictor(unittest.TestCase):
    def setUp(self):
        self.sample_xray = np.random.randint(40, 220, (300, 400), dtype=np.uint8)

    def test_formatter_output_structure(self):
        raw_preds = [
            {
                "class_id": 0,
                "finding_type": "Caries",
                "confidence": 0.92,
                "bounding_box": [0.1, 0.2, 0.4, 0.5],
                "tooth_number": "16"
            }
        ]
        result = StructuredFindingsFormatter.format_results(
            raw_predictions=raw_preds,
            inference_time_ms=45.2,
            patient_id="2026/0705",
            xray_id="xray_123"
        )
        self.assertEqual(result["status"], "success")
        self.assertEqual(result["patient_id"], "2026/0705")
        self.assertEqual(result["xray_id"], "xray_123")
        self.assertEqual(result["findings_count"], 1)
        self.assertEqual(len(result["findings"]), 1)
        finding = result["findings"][0]
        self.assertEqual(finding["finding_type"], "Caries")
        self.assertEqual(finding["confidence"], 0.92)
        self.assertEqual(finding["tooth_number"], "16")

    def test_predictor_full_pipeline(self):
        predictor = XRayPredictor(confidence_threshold=0.5)
        res = predictor.predict(self.sample_xray, patient_id="2026/0101")
        self.assertEqual(res["status"], "success")
        self.assertEqual(res["patient_id"], "2026/0101")
        self.assertIn("findings", res)
        self.assertGreaterEqual(res["inference_time_ms"], 0.0)

    def test_predictor_nms_suppression(self):
        # Two overlapping proposals with class_id 0
        raw_proposals = [
            {"class_id": 0, "finding_type": "Caries", "confidence": 0.95, "bounding_box": [0.1, 0.1, 0.4, 0.4]},
            {"class_id": 0, "finding_type": "Caries", "confidence": 0.85, "bounding_box": [0.12, 0.12, 0.38, 0.38]}
        ]
        nms_filtered = XRayPredictor.apply_nms(raw_proposals, iou_threshold=0.45)
        # Should keep only the higher confidence proposal (0.95)
        self.assertEqual(len(nms_filtered), 1)
        self.assertEqual(nms_filtered[0]["confidence"], 0.95)

    def test_blank_or_normal_image_returns_zero_findings(self):
        """Verifies that a normal/blank radiograph never fabricates findings."""
        predictor = XRayPredictor(confidence_threshold=0.25)
        # Blank/black image simulating clean or healthy input
        blank_xray = np.zeros((600, 1000), dtype=np.uint8)
        result = predictor.predict(blank_xray, patient_id="NORMAL-001")
        self.assertEqual(result["status"], "success")
        self.assertEqual(result["findings_count"], 0)
        self.assertEqual(len(result["findings"]), 0)

    def test_unloaded_model_raises_explicit_error(self):
        """Ensures predict() raises RuntimeError if no AI model could be loaded."""
        predictor = XRayPredictor(weights_path=None)
        # Explicitly simulate unloaded model state
        predictor.model = None
        predictor.yolo_model = None
        predictor.custom_model = None
        with self.assertRaises(RuntimeError):
            predictor.predict(self.sample_xray)

    def test_fdi_tooth_numbering_validity(self):
        """Verifies that tooth coordinates map strictly to valid FDI 2-digit tooth codes."""
        valid_fdi_teeth = {
            # Quadrant 1 (Upper Right)
            "11", "12", "13", "14", "15", "16", "17", "18",
            # Quadrant 2 (Upper Left)
            "21", "22", "23", "24", "25", "26", "27", "28",
            # Quadrant 3 (Lower Left)
            "31", "32", "33", "34", "35", "36", "37", "38",
            # Quadrant 4 (Lower Right)
            "41", "42", "43", "44", "45", "46", "47", "48"
        }

        # Test grid across all quadrants and horizontal distances
        for y in [0.2, 0.4, 0.6, 0.8]:
            for x in [0.05, 0.2, 0.35, 0.48, 0.52, 0.65, 0.8, 0.95]:
                box = [x, y, min(1.0, x + 0.05), min(1.0, y + 0.05)]
                tooth = XRayPredictor.estimate_fdi_tooth_number(box)
                self.assertIn(
                    tooth,
                    valid_fdi_teeth,
                    f"Computed invalid FDI tooth number '{tooth}' for box {box}"
                )

if __name__ == "__main__":
    unittest.main()
