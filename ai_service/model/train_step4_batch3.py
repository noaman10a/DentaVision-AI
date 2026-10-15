"""
DentaVision AI - Step 4 Batch 3 Fine-Tuning Script
Owner: Noaman (Curriculum Learning Lead)

Retrains YOLO11m / YOLO26m model on expanded Step 4 Batch 3 Corpus (~4,500+ images) for 30 epochs.
Uses SGD optimizer (lr0=0.01, momentum=0.937, weight_decay=0.0005) and SIoU Box Loss weighting (box=7.5, dfl=1.5).
"""

import os
import sys
import torch
from ultralytics import YOLO

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
YAML_PATH = os.path.join(PROJECT_ROOT, "ai_service", "model", "step4_batch3.yaml")
BEST_BATCH2_WEIGHTS = os.path.join(PROJECT_ROOT, "ai_service", "model", "checkpoints", "best_model.pt")
RUNS_DIR = os.path.join(PROJECT_ROOT, "runs", "detect", "ai_service", "model", "runs")

def run_step4_batch3_training():
    print("=" * 80)
    print(" 🚀 STEP 4 BATCH 3 30-EPOCH RETRAINING (SGD + SIoU BOX LOSS) ")
    print("=" * 80)

    if not os.path.exists(YAML_PATH):
        print(f"❌ Error: Dataset YAML config missing at {YAML_PATH}")
        return

    if not os.path.exists(BEST_BATCH2_WEIGHTS):
        print(f"❌ Error: Base Batch 2 weights missing at {BEST_BATCH2_WEIGHTS}")
        return

    device = 0 if torch.cuda.is_available() else "cpu"
    print(f"Using compute device: {device} ({torch.cuda.get_device_name(0) if device == 0 else 'CPU'})")

    print(f"Loading weights from: {BEST_BATCH2_WEIGHTS}")
    model = YOLO(BEST_BATCH2_WEIGHTS)

    print("Launching 30-epoch fine-tuning on Step 4 Batch 3 dataset...")
    results = model.train(
        data=YAML_PATH,
        epochs=30,
        imgsz=640,
        batch=8,
        workers=2,
        device=device,
        optimizer="SGD",
        lr0=0.01,
        momentum=0.937,
        weight_decay=0.0005,
        box=7.5,
        dfl=1.5,
        project=RUNS_DIR,
        name="step4_batch3_retrain",
        exist_ok=True,
        plots=True,
        save=True,
        verbose=True
    )

    print("\n" + "=" * 80)
    print(" 🎉 STEP 4 BATCH 3 RETRAINING COMPLETED! ")
    print("=" * 80)

if __name__ == "__main__":
    run_step4_batch3_training()
