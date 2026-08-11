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

if __name__ == "__main__":
    unittest.main()
