"""
DentaVision AI - Postprocessing & Structured Findings Formatter
Owner: Noaman (AI Model Lead)

Formats raw model predictions into the official API JSON contract schema.
"""

import uuid
import time
from typing import List, Dict, Any, Optional
from ai_service.model.architecture import MODEL_VERSION, DENTAL_CLASSES

class StructuredFindingsFormatter:
    @staticmethod
    def format_results(
        raw_predictions: List[Dict[str, Any]],
        inference_time_ms: float,
        patient_id: Optional[str] = None,
        xray_id: Optional[str] = None,
        confidence_threshold: float = 0.5
    ) -> Dict[str, Any]:
        """
        Converts raw model outputs into the formal API response structure.
        """
        formatted_findings = []

        for pred in raw_predictions:
            conf = float(pred.get("confidence", pred.get("score", 0.0)))
            if conf < confidence_threshold:
                continue

            class_id = pred.get("class_id", 0)
            finding_type = pred.get(
                "finding_type",
                DENTAL_CLASSES[class_id] if class_id < len(DENTAL_CLASSES) else "Unknown"
            )

            bbox = pred.get("bounding_box", pred.get("box", [0.0, 0.0, 0.0, 0.0]))
            if isinstance(bbox, (list, tuple)) and len(bbox) == 4:
                bbox_dict = {
                    "x_min": round(float(bbox[0]), 4),
                    "y_min": round(float(bbox[1]), 4),
                    "x_max": round(float(bbox[2]), 4),
                    "y_max": round(float(bbox[3]), 4)
                }
            elif isinstance(bbox, dict):
                bbox_dict = bbox
            else:
                bbox_dict = {"x_min": 0.0, "y_min": 0.0, "x_max": 0.0, "y_max": 0.0}

            finding_item = {
                "id": str(uuid.uuid4()),
                "finding_type": finding_type,
                "confidence": round(conf, 4),
                "confidence_percentage": f"{round(conf * 100, 1)}%",
                "bounding_box": bbox_dict,
                "tooth_number": pred.get("tooth_number"),
                "severity": pred.get("severity", "Pending Review")
            }
            formatted_findings.append(finding_item)

        response = {
            "status": "success",
            "patient_id": patient_id,
            "xray_id": xray_id,
            "model_version": MODEL_VERSION,
            "inference_time_ms": round(inference_time_ms, 2),
            "findings_count": len(formatted_findings),
            "findings": formatted_findings,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        }

        return response
