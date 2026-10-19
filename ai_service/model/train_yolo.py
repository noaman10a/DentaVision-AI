"""
DentaVision AI - YOLOv8 Pathology Detection Training Script
Owner: Noaman (AI Model Lead)

Trains YOLOv8 object detection model following IEEE 2023 Paper specifications:
- Model: YOLOv8 Nano (yolov8n.pt)
- Epochs: 35
- Image Size: 640
- Batch Size: 16
- Learning Rate: 0.001
- Optimizer: AdamW / SGD
"""

import sys
from pathlib import Path

# Ensure project root is in sys.path
_project_root = str(Path(__file__).resolve().parents[2])
if _project_root not in sys.path:
    sys.path.insert(0, _project_root)

import os
import logging
from ultralytics import YOLO

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("TrainYOLO")

def main():
    yaml_path = Path(_project_root) / "ai_service" / "model" / "denta_yolo.yaml"
    checkpoint_dir = Path(_project_root) / "ai_service" / "model" / "checkpoints"
    checkpoint_dir.mkdir(parents=True, exist_ok=True)

    if not yaml_path.exists():
        logger.error(f"Dataset YAML not found at {yaml_path}")
        return

    logger.info("Initializing YOLOv8 Nano model...")
    model = YOLO("yolov8n.pt")

    logger.info(f"Starting training on {yaml_path} with IEEE paper parameters (35 epochs, 640 imgsz, lr=0.001)...")
    results = model.train(
        data=str(yaml_path),
        epochs=35,
        imgsz=640,
        batch=16,
        lr0=0.001,
        optimizer="AdamW",
        workers=2,
        project=str(checkpoint_dir),
        name="yolov8_denta",
        exist_ok=True,
        verbose=True
    )

    logger.info("Training complete! Best weights saved to ai_service/model/checkpoints/yolov8_denta/weights/best.pt")

    # Copy best weights to yolov8_best.pt in checkpoints folder
    best_pt = checkpoint_dir / "yolov8_denta" / "weights" / "best.pt"
    target_pt = checkpoint_dir / "yolov8_best.pt"
    if best_pt.exists():
        import shutil
        shutil.copy(best_pt, target_pt)
        logger.info(f"Copied best model weights to {target_pt}")

if __name__ == "__main__":
    main()
