"""
DentaVision AI — Experiment 3B: YOLO26m-P2 Architecture
========================================================
CONTROLLED EXPERIMENT: Test YOLO26m-P2 with dedicated stride-4 small-object head.
All training data, epochs, batch size, resolution, and validation set are IDENTICAL.

Architecture Innovation Tested:
  - P2 Head (Stride 4 feature map, 160×160 resolution at 640 input)
  - 4-scale detection: P2 (xsmall), P3 (small), P4 (medium), P5 (large)
  - Instantiated from yolo26m-p2.yaml (scale='m', 21.14M parameters)

Control Variables (identical to Batch 3 baseline):
  - Dataset: Original Batch 3 dataset (3,608 images, 13,288 boxes)
  - Validation Set: Untouched 153 images, 1,972 boxes
  - Image Resolution: 640×640
  - Epochs: 30
  - Batch Size: 8 (or 4 if VRAM constrained by P2 feature maps)
  - Device: GPU 0 (RTX 3050 4GB)

Baseline Reference:
  - YOLO11m Batch 3: P=58.3%, R=42.4%, F1=49.1%, mAP@50=42.4%, mAP@50-95=19.1%
  - Caries Recall: 21.6% | Bone Recall: 1.35% | Apical Periodontitis Recall: 11.0%
"""

import os
import torch
from ultralytics import YOLO

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
YAML_PATH = os.path.join(PROJECT_ROOT, "ai_service", "model", "step4_batch3.yaml")
RUNS_DIR = os.path.join(PROJECT_ROOT, "runs", "detect", "ai_service", "model", "runs")


def run_exp3b_training():
    print("=" * 80)
    print(" 🔬 EXPERIMENT 3B: YOLO26m-P2 SMALL-OBJECT ARCHITECTURE (CONTROLLED)")
    print("=" * 80)
    print()
    print(" CONTROL VARIABLES (identical to YOLO11m Batch 3 baseline):")
    print("   Dataset:      Original Batch 3 (3,608 images, 13,288 boxes)")
    print("   Image Size:   640 × 640")
    print("   Epochs:       30")
    print("   Val Set:      153 images, 1,972 boxes (UNTOUCHED)")
    print()
    print(" INDEPENDENT VARIABLE:")
    print("   Architecture: YOLO26m-P2 (4 detection scales: P2/4, P3/8, P4/16, P5/32)")
    print("   P2 Feature:   Stride 4 high-resolution feature map for small lesions")
    print("   Config:       yolo26m-p2.yaml (scale='m', 21.14M params)")
    print()

    if not os.path.exists(YAML_PATH):
        print(f"❌ Error: Dataset YAML missing at {YAML_PATH}")
        return

    device = 0 if torch.cuda.is_available() else "cpu"
    gpu_name = torch.cuda.get_device_name(0) if device == 0 else "CPU"
    vram_gb = round(torch.cuda.get_device_properties(0).total_memory / 1024**3, 1) if device == 0 else 0
    print(f" Device: {device} ({gpu_name}, {vram_gb} GB VRAM)")
    print()

    # Instantiate YOLO26m-P2 from architecture YAML
    model = YOLO("yolo26m-p2.yaml")

    print("Launching 30-epoch training for YOLO26m-P2...")
    print("=" * 80)

    # Note: P2 adds 160x160 feature maps, batch=8 with AMP fits in 4GB VRAM
    results = model.train(
        data=YAML_PATH,
        epochs=30,
        imgsz=640,
        batch=8,
        workers=2,
        device=device,
        optimizer="SGD",
        lr0=0.01,
        lrf=0.01,
        momentum=0.937,
        weight_decay=0.0005,
        warmup_epochs=3.0,
        box=7.5,
        cls=0.5,
        dfl=1.5,
        mosaic=1.0,
        mixup=0.0,
        copy_paste=0.0,
        degrees=0.0,
        translate=0.1,
        scale=0.5,
        fliplr=0.5,
        flipud=0.0,
        hsv_h=0.015,
        hsv_s=0.7,
        hsv_v=0.4,
        erasing=0.4,
        close_mosaic=10,
        amp=True,
        deterministic=True,
        seed=0,
        project=RUNS_DIR,
        name="exp3b_yolo26m_p2",
        exist_ok=True,
        plots=True,
        save=True,
        verbose=True
    )

    print()
    print("=" * 80)
    print(" 🎉 EXPERIMENT 3B (YOLO26m-P2) TRAINING COMPLETED!")
    print()
    print(" Compare against baselines:")
    print("   YOLO11m Batch 3: P=58.3%, R=42.4%, F1=49.1%, mAP@50=42.4%, mAP@50-95=19.1%")
    print("   Caries Recall: 21.6% | Bone Recall: 1.35% | Apical Periodontitis Recall: 11.0%")
    print("=" * 80)


if __name__ == "__main__":
    run_exp3b_training()
