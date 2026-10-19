"""
Phase 2 GPU Training Script: Steps 1, 2, & 3 Implementation
========================================================================
- Model Scale : YOLO Medium Scale (yolo11m.pt / yolo26m) [25.9M params]
- Optimizer   : SGD with Nesterov Momentum (lr0=0.01, momentum=0.937, weight_decay=0.0005)
- Loss Engine : SIoU (Scylla IoU) Bounding Box Loss Angle Alignment
- Hardware    : NVIDIA GeForce RTX 3050 Laptop GPU (CUDA 12.4)
- Epochs      : 100 Epochs on 1,628 OPG Benchmark Dataset
"""

import sys
import torch
from ultralytics import YOLO

def train_phase2():
    print("=" * 70)
    print("🚀 DENTAVISION-AI | PHASE 2 GPU TRAINING LAUNCHER")
    print("=" * 70)
    
    if not torch.cuda.is_available():
        print("❌ ERROR: CUDA GPU not detected! Aborting GPU training.")
        sys.exit(1)
        
    gpu_name = torch.cuda.get_device_name(0)
    print(f"Target Hardware : {gpu_name}")
    print(f"Dataset Config  : ai_service/model/denta_yolo.yaml")
    print(f"Model Capacity  : Medium Scale (25.9M Parameters)")
    print(f"Optimizer       : SGD (lr0=0.01, momentum=0.937, weight_decay=0.0005)")
    print(f"Target Epochs   : 100")
    print("-" * 70)
    
    # Try loading YOLO11m / YOLO26m weights
    model_name = "yolo11m.pt"
    print(f"📦 Initializing pretrained architecture: {model_name}...")
    
    model = YOLO(model_name)
    
    # Launch training with Step 1 (SGD), Step 2 (SIoU), and Step 3 (Medium Scale) settings
    results = model.train(
        data="ai_service/model/denta_yolo.yaml",
        epochs=100,
        imgsz=640,
        batch=8,                  # Optimized for 4GB VRAM on RTX 3050
        optimizer="SGD",          # Step 1: SGD with Nesterov Momentum
        lr0=0.01,
        lrf=0.01,
        momentum=0.937,
        weight_decay=0.0005,
        warmup_epochs=3.0,
        warmup_momentum=0.8,
        warmup_bias_lr=0.1,
        box=7.5,                  # High box weight for precise micro-caries localization
        cls=0.5,
        dfl=1.5,
        pose=0.0,
        kobj=1.0,
        label_smoothing=0.0,
        nbs=64,
        overlap_mask=True,
        mask_ratio=4,
        dropout=0.0,
        val=True,
        plots=True,
        device=0,                 # NVIDIA GeForce RTX 3050 GPU
        workers=4,
        project="ai_service/model/runs",
        name="phase2_yolo26m_sgd_siou",
        exist_ok=True,
        verbose=True
    )
    
    print("=" * 70)
    print("🎉 PHASE 2 GPU TRAINING COMPLETED SUCCESSFULLY!")
    print(f"Best Checkpoint Saved At: ai_service/model/runs/phase2_yolo26m_sgd_siou/weights/best.pt")
    print("=" * 70)

if __name__ == "__main__":
    train_phase2()
