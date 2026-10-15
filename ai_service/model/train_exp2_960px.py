"""
DentaVision AI — Experiment 2: Higher Resolution Training (960×960)
===================================================================
CONTROLLED EXPERIMENT: Only change is image resolution (640 → 960).
All other parameters identical to Batch 3 baseline.

Hypothesis:
  "The major difficult classes (Carious Lesion, Bone Resorbtion, Apical
   Periodontitis) require better spatial/visual representation rather
   than simply more copies of the same training examples."

Methodology:
  - Training data: ORIGINAL Batch 3 dataset (3,608 images, 13,288 boxes)
    NOT the oversampled Exp 1 dataset — isolates resolution as single variable
  - Image resolution: 640×640 → 960×960
  - Batch size: 8 → 4 (due to 4 GB VRAM constraint at higher resolution)
  - Note: Ultralytics nbs=64 gradient accumulation ensures effective batch
    size remains ~64 regardless of actual batch size, minimizing this confound
  - Validation set: IDENTICAL to Batch 3 (153 images, 1,972 boxes)

Baseline comparison:
  Batch 3 (Exp 0): P=58.3%, R=42.4%, F1=49.1%, mAP@50=42.4%, mAP@50-95=19.1%
  Exp 1 (Balanced): P=61.8%, R=43.0%, F1=50.7%, mAP@50=42.1%, mAP@50-95=18.7%

Key metrics to watch:
  - Carious Lesion recall (baseline: 21.6%)
  - Bone Resorbtion recall (baseline: 1.35%)
  - Apical Periodontitis recall (baseline: 11.0%)
  - mAP@50-95 (baseline: 19.1%) — strict localization quality
"""

import os
import torch
from ultralytics import YOLO

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

# Use ORIGINAL Batch 3 dataset — NOT the oversampled one
YAML_PATH = os.path.join(PROJECT_ROOT, "ai_service", "model", "step4_batch3.yaml")

# Use same starting weights as Batch 3 for fair comparison
BATCH3_START_WEIGHTS = os.path.join(PROJECT_ROOT, "ai_service", "model", "checkpoints", "step4_batch3_best.pt")

RUNS_DIR = os.path.join(PROJECT_ROOT, "runs", "detect", "ai_service", "model", "runs")


def run_exp2_training():
    print("=" * 80)
    print(" 🔬 EXPERIMENT 2: HIGHER RESOLUTION (960×960) — CONTROLLED")
    print("=" * 80)
    print()
    print(" CONTROL VARIABLES (identical to Batch 3 baseline):")
    print("   Model:       YOLO11m (20.04M params)")
    print("   Dataset:     Original Batch 3 (3,608 images, 13,288 boxes)")
    print("   Epochs:      30")
    print("   Optimizer:   SGD (lr0=0.01, momentum=0.937)")
    print("   Box Loss:    7.5 (SIoU)")
    print("   DFL Loss:    1.5")
    print("   Cls Loss:    0.5")
    print("   Augmentation: IDENTICAL to Batch 3")
    print("   Val Set:     SAME (153 images, 1972 boxes)")
    print()
    print(" INDEPENDENT VARIABLE:")
    print("   Image resolution: 640×640 → 960×960")
    print("   Batch size: 8 → 4 (GPU VRAM constraint)")
    print("   Note: nbs=64 gradient accumulation preserves effective batch size")
    print()

    if not os.path.exists(YAML_PATH):
        print(f"❌ Error: Dataset YAML missing at {YAML_PATH}")
        return

    if not os.path.exists(BATCH3_START_WEIGHTS):
        print(f"❌ Error: Batch 3 weights missing at {BATCH3_START_WEIGHTS}")
        return

    device = 0 if torch.cuda.is_available() else "cpu"
    gpu_name = torch.cuda.get_device_name(0) if device == 0 else "CPU"
    vram_gb = round(torch.cuda.get_device_properties(0).total_memory / 1024**3, 1) if device == 0 else 0
    print(f" Device: {device} ({gpu_name}, {vram_gb} GB VRAM)")
    print()

    model = YOLO(BATCH3_START_WEIGHTS)

    print("Launching 30-epoch training at 960×960 resolution...")
    print("=" * 80)

    results = model.train(
        data=YAML_PATH,
        epochs=30,            # SAME as Batch 3
        imgsz=960,            # CHANGED: 640 → 960
        batch=4,              # CHANGED: 8 → 4 (4 GB VRAM constraint)
        workers=2,            # SAME as Batch 3
        device=device,
        optimizer="SGD",      # SAME as Batch 3
        lr0=0.01,             # SAME as Batch 3
        lrf=0.01,             # SAME as Batch 3
        momentum=0.937,       # SAME as Batch 3
        weight_decay=0.0005,  # SAME as Batch 3
        warmup_epochs=3.0,    # SAME as Batch 3
        box=7.5,              # SAME as Batch 3
        cls=0.5,              # SAME as Batch 3
        dfl=1.5,              # SAME as Batch 3
        nbs=64,               # SAME as Batch 3 (gradient accumulation)
        mosaic=1.0,           # SAME as Batch 3
        mixup=0.0,            # SAME as Batch 3
        copy_paste=0.0,       # SAME as Batch 3
        degrees=0.0,          # SAME as Batch 3
        translate=0.1,        # SAME as Batch 3
        scale=0.5,            # SAME as Batch 3
        fliplr=0.5,           # SAME as Batch 3
        flipud=0.0,           # SAME as Batch 3
        hsv_h=0.015,          # SAME as Batch 3
        hsv_s=0.7,            # SAME as Batch 3
        hsv_v=0.4,            # SAME as Batch 3
        erasing=0.4,          # SAME as Batch 3
        close_mosaic=10,      # SAME as Batch 3
        amp=True,             # SAME as Batch 3
        deterministic=True,   # SAME as Batch 3
        seed=0,               # SAME as Batch 3
        project=RUNS_DIR,
        name="exp2_960px",
        exist_ok=True,
        plots=True,
        save=True,
        verbose=True
    )

    print()
    print("=" * 80)
    print(" 🎉 EXPERIMENT 2 TRAINING COMPLETED!")
    print()
    print(" Compare against baselines:")
    print("   Exp 0 (Batch 3): P=58.3%, R=42.4%, F1=49.1%, mAP@50=42.4%, mAP@50-95=19.1%")
    print("   Exp 1 (Balanced): P=61.8%, R=43.0%, F1=50.7%, mAP@50=42.1%, mAP@50-95=18.7%")
    print()
    print(" Key classes to evaluate:")
    print("   Carious Lesion recall    (baseline: 21.6%)")
    print("   Bone Resorbtion recall   (baseline:  1.35%)")
    print("   Apical Periodontitis recall (baseline: 11.0%)")
    print("   mAP@50-95               (baseline: 19.1%)")
    print("=" * 80)


if __name__ == "__main__":
    run_exp2_training()
