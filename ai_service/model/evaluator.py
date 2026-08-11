"""
DentaVision AI - Model Evaluation Engine
Owner: Noaman (AI Model Lead)

Calculates key classification & detection evaluation metrics:
Accuracy, Precision, Recall, F1-Score, Confusion Matrix, and Average CPU Inference Latency.
"""

import time
import json
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional
import numpy as np

from ai_service.model.architecture import load_model, DENTAL_CLASSES, MODEL_VERSION
from ai_service.model.dataset import create_dataloader

logger = logging.getLogger("ModelEvaluator")


class ModelEvaluator:
    def __init__(self, weights_path: Optional[str] = None, device: str = "cpu"):
        self.device = device
        self.weights_path = weights_path
        self.model = load_model(weights_path=weights_path, device=device)

    def evaluate(self, test_data_dir: str = "dataset/split/test") -> Dict[str, Any]:
        """Evaluates the model on test dataset and produces official evaluation report."""
        test_dir = Path(test_data_dir)
        logger.info(f"Evaluating model on test dataset: {test_dir}")

        test_loader = create_dataloader(str(test_dir), batch_size=1, shuffle=False)

        all_y_true: List[int] = []
        all_y_pred: List[int] = []
        latencies_ms: List[float] = []

        if test_loader and len(test_loader) > 0:
            try:
                import torch
                self.model.eval()
                with torch.no_grad():
                    for x_test, y_test in test_loader:
                        x_test = x_test.to(self.device)
                        
                        start_t = time.time()
                        outputs = self.model(x_test)
                        elapsed_ms = (time.time() - start_t) * 1000.0
                        latencies_ms.append(elapsed_ms)

                        _, preds = torch.max(outputs, 1)
                        all_y_pred.append(int(preds.item()))
                        all_y_true.append(int(y_test.item()))
            except Exception as e:
                logger.error(f"Error during PyTorch evaluation: {e}")

        # Compute metrics
        metrics = self._calculate_metrics(all_y_true, all_y_pred, latencies_ms)

        report = {
            "model_version": MODEL_VERSION,
            "weights_path": self.weights_path,
            "test_samples_count": len(all_y_true),
            "classes": DENTAL_CLASSES,
            "metrics": metrics,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        }

        # Save evaluation report
        output_report_path = Path("ai_service/evaluation_report.json")
        output_report_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_report_path, "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2)

        logger.info(f"Evaluation report saved to: {output_report_path.resolve()}")
        return report

    def _calculate_metrics(
        self,
        y_true: List[int],
        y_pred: List[int],
        latencies_ms: List[float]
    ) -> Dict[str, Any]:
        """Calculates accuracy, precision, recall, F1, confusion matrix, and average latency."""
        num_classes = len(DENTAL_CLASSES)
        cm = np.zeros((num_classes, num_classes), dtype=int)

        for t, p in zip(y_true, y_pred):
            if 0 <= t < num_classes and 0 <= p < num_classes:
                cm[t, p] += 1

        total_samples = len(y_true)
        correct = sum([1 for t, p in zip(y_true, y_pred) if t == p])
        accuracy = correct / total_samples if total_samples > 0 else 0.0

        # Class-wise metrics
        precisions, recalls, f1s = [], [], []
        for i in range(num_classes):
            tp = cm[i, i]
            fp = cm[:, i].sum() - tp
            fn = cm[i, :].sum() - tp

            precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
            recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
            f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0

            precisions.append(precision)
            recalls.append(recall)
            f1s.append(f1)

        avg_precision = float(np.mean(precisions)) if precisions else 0.0
        avg_recall = float(np.mean(recalls)) if recalls else 0.0
        macro_f1 = float(np.mean(f1s)) if f1s else 0.0
        avg_latency = float(np.mean(latencies_ms)) if latencies_ms else 0.0

        return {
            "accuracy": round(accuracy, 4),
            "macro_precision": round(avg_precision, 4),
            "macro_recall": round(avg_recall, 4),
            "macro_f1": round(macro_f1, 4),
            "avg_latency_ms": round(avg_latency, 2),
            "confusion_matrix": cm.tolist()
        }


if __name__ == "__main__":
    evaluator = ModelEvaluator()
    rep = evaluator.evaluate()
    print(json.dumps(rep, indent=2))
