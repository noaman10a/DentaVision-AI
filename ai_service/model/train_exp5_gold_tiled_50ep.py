"""
DentaVision AI — Experiment E: 50-Epoch Gold Tiled Training
===========================================================
CONTROLLED EXPERIMENT: Evaluate whether extending training from 30 to 50 epochs
allows YOLO11m to converge further on subtle gold-standard pathologies without overfitting.

CONTROL VARIABLES:
  - Dataset: Gold Tiled Dataset (13,018 tiles, 44,349 boxes)
  - Resolution: 640×640
  - Batch Size: 8 (AMP enabled)
  - Optimizer: SGD (lr0=0.01, lrf=0.01, momentum=0.937, weight_decay=0.0005)
  - Augmentations: degrees=5.0, scale=0.2, fliplr=0.5, hsv
  - Early Stopping: patience=15 epochs
"""

import os
import torch
from ultralytics import YOLO

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
YAML_PATH = os.path.join(PROJECT_ROOT, "ai_service", "model", "tiled_gold.yaml")
START_WEIGHTS = os.path.join(PROJECT_ROOT, "ai_service", "model", "checkpoints", "best_model_gold_tiled_30ep.pt")
RUNS_DIR = os.path.join(PROJECT_ROOT, "runs", "detect", "ai_service", "model", "runs")


def run_50ep_training():
    print("=" * 80)
    print(" 🔬 EXPERIMENT E: 50-EPOCH GOLD TILED TRAINING (CONTROLLED)")
    print("=" * 80)
    print()

    if not os.path.exists(YAML_PATH):
        print(f"❌ Error: Dataset YAML missing at {YAML_PATH}")
        return

    device = 0 if torch.cuda.is_available() else "cpu"
    gpu_name = torch.cuda.get_device_name(0) if device == 0 else "CPU"
    print(f" Device: {device} ({gpu_name})")
    print(f" Initial Weights: {START_WEIGHTS}")
    print()

    model = YOLO(START_WEIGHTS if os.path.exists(START_WEIGHTS) else "yolo11m.pt")

    print("Launching 50-epoch training (patience=15)...")
    print("=" * 80)

    results = model.train(
        data=YAML_PATH,
        epochs=50,
        patience=15,
        imgsz=640,
        batch=8,
        workers=2,
        device=device,
        optimizer="SGD",
        lr0=0.005,          # Slightly reduced learning rate for smooth 50-epoch fine-tuning
        lrf=0.01,
        momentum=0.937,
        weight_decay=0.0005,
        warmup_epochs=2.0,
        box=7.5,
        cls=0.5,
        dfl=1.5,
        mosaic=1.0,
        mixup=0.0,
        copy_paste=0.0,
        degrees=5.0,
        translate=0.1,
        scale=0.2,
        fliplr=0.5,
        flipud=0.0,
        hsv_h=0.015,
        hsv_s=0.7,
        hsv_v=0.4,
        erasing=0.2,
        close_mosaic=10,
        amp=True,
        deterministic=True,
        seed=0,
        project=RUNS_DIR,
        name="exp5_gold_tiled_50ep",
        exist_ok=True,
        plots=True,
        save=True,
        verbose=True
    )

    print()
    print("=" * 80)
    print(" 🎉 EXPERIMENT E (50-EPOCH GOLD TILED) TRAINING COMPLETED!")
    print("=" * 80)


if __name__ == "__main__":
    run_50ep_training()
