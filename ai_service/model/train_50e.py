"""
DentaVision AI - Phase 2: 50-Epoch YOLOv8 Pathology Detection Training Script
Owner: Noaman (AI Model Lead)

Executes Phase 2 of the protocol:
- Model: YOLOv8 Nano (yolov8n.pt)
- Epochs: 50
- Image Size: 640
- Batch Size: 16
- Learning Rate: 0.001
- Optimizer: AdamW
- Output Project: ai_service/model/checkpoints
- Experiment Name: yolov8_50e (Does NOT overwrite 30e run)
"""

import sys
from pathlib import Path

_project_root = str(Path(__file__).resolve().parents[2])
if _project_root not in sys.path:
    sys.path.insert(0, _project_root)

import os
import logging
from ultralytics import YOLO

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("TrainYOLO50e")

def main():
    yaml_path = Path(_project_root) / "ai_service" / "model" / "denta_yolo.yaml"
    checkpoint_dir = Path(_project_root) / "ai_service" / "model" / "checkpoints"
    checkpoint_dir.mkdir(parents=True, exist_ok=True)

    if not yaml_path.exists():
        logger.error(f"Dataset YAML not found at {yaml_path}")
        return

    logger.info("Initializing YOLOv8 Nano model for Phase 2 (50 Epoch Experiment)...")
    model = YOLO("yolov8n.pt")

    logger.info(f"Starting Phase 2 training on {yaml_path} (50 epochs, 640 imgsz, lr=0.001, AdamW)...")
    results = model.train(
        data=str(yaml_path),
        epochs=50,
        imgsz=640,
        batch=16,
        lr0=0.001,
        optimizer="AdamW",
        workers=2,
        project=str(checkpoint_dir),
        name="yolov8_50e",
        exist_ok=True,
        verbose=True
    )

    logger.info("Phase 2 (50 Epochs) Training complete! Best weights saved to ai_service/model/checkpoints/yolov8_50e/weights/best.pt")

if __name__ == "__main__":
    main()
