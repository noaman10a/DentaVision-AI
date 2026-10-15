"""
Resume Phase 2 GPU Training Script
========================================================================
Resumes YOLO26m training from the latest checkpoint (last.pt) on RTX 3050 GPU.
"""

from ultralytics import YOLO

def main():
    checkpoint_path = "d:/Collage/Major Project/DentaVision-AI/runs/detect/ai_service/model/runs/phase2_yolo26m_sgd_siou/weights/last.pt"
    print(f"🚀 Resuming DentaVision AI Phase 2 GPU Training from: {checkpoint_path}...")
    model = YOLO(checkpoint_path)
    model.train(resume=True)

if __name__ == "__main__":
    main()
