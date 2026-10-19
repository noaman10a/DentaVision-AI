"""
DentaVision AI — Experiment 1: Class-Balanced Oversampling Training Script
==========================================================================
CONTROLLED EXPERIMENT: Identical to Batch 3 baseline training config.
Only change: training dataset uses class-balanced oversampled distribution.

Baseline comparison:
  Batch 3: P=58.3%, R=42.4%, F1=49.1%, mAP@50=42.4%, mAP@50-95=19.1%

Success criteria:
  - Recall ↑ (especially Carious Lesion, Bone Resorbtion, Apical Periodontitis)
  - mAP@50 ↑
  - mAP@50-95 ↑
  - F1 ↑
  - Precision may drop slightly — that is acceptable
"""

import os
import torch
from ultralytics import YOLO

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
YAML_PATH = os.path.join(PROJECT_ROOT, "ai_service", "model", "exp1_balanced.yaml")

# Use the ORIGINAL Batch 2 weights (same starting point as Batch 3)
# This ensures fair comparison: same initial weights, same epochs, different data
BATCH3_START_WEIGHTS = os.path.join(PROJECT_ROOT, "ai_service", "model", "checkpoints", "step4_batch3_best.pt")

RUNS_DIR = os.path.join(PROJECT_ROOT, "runs", "detect", "ai_service", "model", "runs")


def run_exp1_training():
    print("=" * 80)
    print(" 🔬 EXPERIMENT 1: CLASS-BALANCED OVERSAMPLING (CONTROLLED)")
    print("=" * 80)
    print()
    print(" CONTROL VARIABLES (identical to Batch 3 baseline):")
    print("   Model:      YOLO11m (20.04M params)")
    print("   Image Size:  640 × 640")
    print("   Epochs:      30")
    print("   Batch Size:  8")
    print("   Optimizer:   SGD (lr0=0.01, momentum=0.937)")
    print("   Box Loss:    7.5 (SIoU)")
    print("   DFL Loss:    1.5")
    print("   Cls Loss:    0.5")
    print("   Val Set:     SAME as Batch 3 (153 images, 1972 boxes)")
    print()
    print(" INDEPENDENT VARIABLE:")
    print("   Training data: Class-balanced oversampled dataset")
    print()

    if not os.path.exists(YAML_PATH):
        print(f"❌ Error: Dataset YAML missing at {YAML_PATH}")
        print("   Run exp1_build_balanced_dataset.py first!")
        return

    if not os.path.exists(BATCH3_START_WEIGHTS):
        print(f"❌ Error: Batch 3 weights missing at {BATCH3_START_WEIGHTS}")
        return

    device = 0 if torch.cuda.is_available() else "cpu"
    gpu_name = torch.cuda.get_device_name(0) if device == 0 else "CPU"
    print(f" Device: {device} ({gpu_name})")
    print()

    model = YOLO(BATCH3_START_WEIGHTS)

    print("Launching 30-epoch training on class-balanced dataset...")
    print("=" * 80)

    results = model.train(
        data=YAML_PATH,
        epochs=30,           # SAME as Batch 3
        imgsz=640,           # SAME as Batch 3
        batch=8,             # SAME as Batch 3
        workers=2,           # SAME as Batch 3
        device=device,
        optimizer="SGD",     # SAME as Batch 3
        lr0=0.01,            # SAME as Batch 3
        lrf=0.01,            # SAME as Batch 3
        momentum=0.937,      # SAME as Batch 3
        weight_decay=0.0005, # SAME as Batch 3
        warmup_epochs=3.0,   # SAME as Batch 3
        box=7.5,             # SAME as Batch 3
        cls=0.5,             # SAME as Batch 3
        dfl=1.5,             # SAME as Batch 3
        mosaic=1.0,          # SAME as Batch 3
        mixup=0.0,           # SAME as Batch 3
        copy_paste=0.0,      # SAME as Batch 3 (NO copy-paste — controlled)
        degrees=0.0,         # SAME as Batch 3 (NO rotation — controlled)
        translate=0.1,       # SAME as Batch 3
        scale=0.5,           # SAME as Batch 3
        fliplr=0.5,          # SAME as Batch 3
        flipud=0.0,          # SAME as Batch 3
        hsv_h=0.015,         # SAME as Batch 3
        hsv_s=0.7,           # SAME as Batch 3
        hsv_v=0.4,           # SAME as Batch 3
        erasing=0.4,         # SAME as Batch 3
        close_mosaic=10,     # SAME as Batch 3
        amp=True,            # SAME as Batch 3
        deterministic=True,  # SAME as Batch 3
        seed=0,              # SAME as Batch 3
        project=RUNS_DIR,
        name="exp1_balanced",
        exist_ok=True,
        plots=True,
        save=True,
        verbose=True
    )

    print()
    print("=" * 80)
    print(" 🎉 EXPERIMENT 1 TRAINING COMPLETED!")
    print()
    print(" Compare against Batch 3 baseline:")
    print("   Batch 3: P=58.3%, R=42.4%, F1=49.1%, mAP@50=42.4%, mAP@50-95=19.1%")
    print("=" * 80)


if __name__ == "__main__":
    run_exp1_training()
