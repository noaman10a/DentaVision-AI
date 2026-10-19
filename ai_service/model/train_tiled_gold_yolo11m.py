"""
DentaVision AI — Train Tile-Trained YOLO11m on Gold Annotations
==============================================================
METHODOLOGY:
  - Trains YOLO11m directly on 640×640 native-resolution tiles.
  - Receptive field matches native tooth anatomy (no 4.1× downscaling).
  - Uses 100% human gold-standard annotations (2,745 Caries, 2,763 Bone Resorption).
  - Evaluated on tile validation set + full-image merged evaluation.
"""

import os
import torch
from ultralytics import YOLO

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
YAML_PATH = os.path.join(PROJECT_ROOT, "ai_service", "model", "tiled_gold.yaml")
START_WEIGHTS = os.path.join(PROJECT_ROOT, "ai_service", "model", "checkpoints", "step4_batch3_best.pt")
RUNS_DIR = os.path.join(PROJECT_ROOT, "runs", "detect", "ai_service", "model", "runs")


def run_tiled_gold_training():
    print("=" * 80)
    print(" 🌟 DENTAVISION AI: TRAINING YOLO11m ON GOLD TILED DATASET")
    print("=" * 80)
    print()

    if not os.path.exists(YAML_PATH):
        print(f"❌ Error: Dataset YAML missing at {YAML_PATH}")
        print("   Run build_tiled_gold_dataset.py first!")
        return

    device = 0 if torch.cuda.is_available() else "cpu"
    gpu_name = torch.cuda.get_device_name(0) if device == 0 else "CPU"
    print(f" Device: {device} ({gpu_name})")
    print(f" Initial Weights: {START_WEIGHTS}")
    print()

    model = YOLO(START_WEIGHTS if os.path.exists(START_WEIGHTS) else "yolo11m.pt")

    print("Launching 30-epoch training on gold native-resolution tiles...")
    print("=" * 80)

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
        degrees=5.0,        # Controlled 5-degree tilt for anatomical head angle
        translate=0.1,
        scale=0.2,          # Mild scale variation (since tiles are already at native scale)
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
        name="exp_tiled_gold_yolo11m",
        exist_ok=True,
        plots=True,
        save=True,
        verbose=True
    )

    print()
    print("=" * 80)
    print(" 🎉 GOLD TILED TRAINING COMPLETED!")
    print("=" * 80)


if __name__ == "__main__":
    run_tiled_gold_training()
