"""
Step 4 Batch 1 GPU Retraining Script
========================================================================
Retrains Phase 2 SOTA model on Batch 1 Curriculum Dataset (3,729 training images, 13,688 bounding boxes).
- Base Model   : Phase 2 SOTA (ai_service/model/checkpoints/best_model.pt)
- Dataset      : ai_service/model/step4_batch1.yaml
- Target Epochs: 30 Epochs fine-tuning on expanded corpus
- Hardware     : NVIDIA GeForce RTX 3050 Laptop GPU (CUDA 12.4)
"""

import sys
import torch
from ultralytics import YOLO

def train_batch1():
    print("=" * 70)
    print("🚀 DENTAVISION-AI | STEP 4 BATCH 1 GPU RETRAINING")
    print("=" * 70)
    
    if not torch.cuda.is_available():
        print("❌ ERROR: CUDA GPU not detected! Aborting.")
        sys.exit(1)
        
    gpu_name = torch.cuda.get_device_name(0)
    print(f"Target Hardware : {gpu_name}")
    print(f"Base Weights    : ai_service/model/checkpoints/best_model.pt")
    print(f"Dataset Config  : ai_service/model/step4_batch1.yaml")
    print(f"Target Epochs   : 30")
    print("-" * 70)
    
    model = YOLO("ai_service/model/checkpoints/best_model.pt")
    
    results = model.train(
        data="ai_service/model/step4_batch1.yaml",
        epochs=30,
        imgsz=640,
        batch=8,
        optimizer="SGD",
        lr0=0.005,                # Fine-tuning learning rate
        momentum=0.937,
        weight_decay=0.0005,
        box=7.5,
        cls=0.5,
        dfl=1.5,
        device=0,
        workers=4,
        project="ai_service/model/runs",
        name="step4_batch1_retrain",
        exist_ok=True,
        verbose=True
    )
    
    print("=" * 70)
    print("🎉 STEP 4 BATCH 1 GPU RETRAINING COMPLETED!")
    print("=" * 70)

if __name__ == "__main__":
    train_batch1()
