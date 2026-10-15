"""
Step 0 Verification Script: GPU Environment & YOLO Architecture Check
========================================================================
- Verifies CUDA GPU acceleration (RTX 3050 Laptop GPU).
- Checks VRAM capacity and PyTorch CUDA version.
- Validates Ultralytics YOLO framework readiness.
"""

import sys
import torch

def verify_gpu_environment():
    print("=" * 70)
    print("🚀 DENTAVISION-AI | STEP 0 GPU ENVIRONMENT VERIFICATION")
    print("=" * 70)
    print(f"Python Version    : {sys.version.split()[0]}")
    print(f"PyTorch Version   : {torch.__version__}")
    print(f"CUDA Available    : {torch.cuda.is_available()}")
    
    if not torch.cuda.is_available():
        print("❌ CRITICAL ERROR: CUDA GPU NOT DETECTED IN PYTORCH!")
        sys.exit(1)
        
    gpu_name = torch.cuda.get_device_name(0)
    vram_bytes = torch.cuda.get_device_properties(0).total_memory
    vram_gb = vram_bytes / (1024 ** 3)
    cuda_ver = torch.version.cuda
    
    print(f"GPU Device Name   : {gpu_name}")
    print(f"CUDA Version      : {cuda_ver}")
    print(f"Total VRAM        : {vram_gb:.2f} GB")
    print("-" * 70)
    
    # Verify Ultralytics YOLO
    try:
        import ultralytics
        print(f"Ultralytics Ver   : {ultralytics.__version__}")
        print("✅ Ultralytics framework imported successfully.")
    except ImportError as e:
        print(f"❌ Ultralytics import error: {e}")
        sys.exit(1)
        
    print("-" * 70)
    print("🎉 STEP 0 GPU ENVIRONMENT VERIFICATION PASSED SUCCESSFULLY!")
    print("=" * 70)

if __name__ == "__main__":
    verify_gpu_environment()
