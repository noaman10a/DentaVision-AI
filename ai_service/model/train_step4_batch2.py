"""
Step 4 Batch 2 GPU Retraining Script
========================================================================
Retrains Batch 1 model on combined Batch 1 + Batch 2 Curriculum Dataset (~6,100+ images, ~25,000+ bounding boxes).
- Base Model   : Batch 1 SOTA (ai_service/model/checkpoints/best_model.pt)
- Dataset      : ai_service/model/step4_batch2.yaml
- Target Epochs: 30 Epochs fine-tuning
- Hardware     : NVIDIA GeForce RTX 3050 Laptop GPU (CUDA 12.4)
"""

import sys
import torch
from ultralytics import YOLO

def train_batch2():
    print("=" * 70)
    print("🚀 DENTAVISION-AI | STEP 4 BATCH 2 GPU RETRAINING")
    print("=" * 70)
    
    if not torch.cuda.is_available():
        print("❌ ERROR: CUDA GPU not detected! Aborting.")
        sys.exit(1)
        
    gpu_name = torch.cuda.get_device_name(0)
    print(f"Target Hardware : {gpu_name}")
    print(f"Base Weights    : ai_service/model/checkpoints/best_model.pt")
    print(f"Dataset Config  : ai_service/model/step4_batch2.yaml")
    print(f"Target Epochs   : 30")
    print("-" * 70)
    
    model = YOLO("ai_service/model/checkpoints/best_model.pt")
    
    results = model.train(
        data="ai_service/model/step4_batch2.yaml",
        epochs=30,
        imgsz=640,
        batch=8,
        optimizer="SGD",
        lr0=0.005,
        momentum=0.937,
        weight_decay=0.0005,
        box=7.5,
        cls=0.5,
        dfl=1.5,
        device=0,
        workers=4,
        project="ai_service/model/runs",
        name="step4_batch2_retrain",
        exist_ok=True,
        verbose=True
    )
    
    print("=" * 70)
    print("🎉 STEP 4 BATCH 2 GPU RETRAINING COMPLETED!")
    print("=" * 70)

if __name__ == "__main__":
    train_batch2()
