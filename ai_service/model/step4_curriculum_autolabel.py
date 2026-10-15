"""
Step 4: Iterative Batch Curriculum Pseudo-Labeling Engine
========================================================================
Implements Noaman's 4-Batch Progressive Self-Training Strategy.
- Raw Image Corpus: 16,400 raw clinical dental X-rays across 5 dataset suites.
- Batch 1 Target   : Auto-label Batch 1 (4,100 raw images) using 100-epoch Phase 2 SOTA Model.
- Filtering        : High-confidence threshold (conf >= 0.40) to prevent noisy pseudo-labels.
- Output           : Pseudo-labeled dataset created at dataset/split/step4_batch1_dataset.
"""

import os
import sys
import glob
import shutil
import time
from pathlib import Path
import torch
from ultralytics import YOLO

BASE_DIR = Path("d:/Collage/Major Project/DentaVision-AI")
RAW_DATASETS_DIR = BASE_DIR / "dataset/DentaVision_Datasets"
BENCHMARK_YAML = BASE_DIR / "ai_service/model/denta_yolo.yaml"
MODEL_WEIGHTS = BASE_DIR / "ai_service/model/checkpoints/best_model.pt"

BATCH1_OUTPUT_DIR = BASE_DIR / "dataset/split/step4_batch1_dataset"
BATCH1_YAML = BASE_DIR / "ai_service/model/step4_batch1.yaml"

def collect_raw_images():
    raw_dirs = [
        RAW_DATASETS_DIR / "02_Dental_Panoramic(healty)",
        RAW_DATASETS_DIR / "04_DenPAR",
        RAW_DATASETS_DIR / "05_Bitewing",
        RAW_DATASETS_DIR / "06_Dental_Periapical_Kaggle",
        RAW_DATASETS_DIR / "07_Dental_XRay_YOLO",
    ]
    
    image_paths = []
    for rdir in raw_dirs:
        if rdir.exists():
            for ext in ("*.jpg", "*.jpeg", "*.png", "*.JPG", "*.PNG"):
                image_paths.extend(glob.glob(str(rdir / "**" / ext), recursive=True))
                
    print(f"📦 Total raw X-ray corpus collected: {len(image_paths)} images.", flush=True)
    return sorted(image_paths)

def execute_batch1_autolabel():
    print("=" * 70, flush=True)
    print("🚀 DENTAVISION-AI | STEP 4 BATCH 1 CURRICULUM AUTO-LABELING", flush=True)
    print("=" * 70, flush=True)
    
    raw_images = collect_raw_images()
    if not raw_images:
        print("❌ No raw images found! Check dataset directory.", flush=True)
        return
        
    batch1_images = raw_images[:4100]
    print(f"🎯 Target Batch 1 Count: {len(batch1_images)} raw images.", flush=True)
    
    # Prepare Output Directories
    images_out = BATCH1_OUTPUT_DIR / "train/images"
    labels_out = BATCH1_OUTPUT_DIR / "train/labels"
    images_out.mkdir(parents=True, exist_ok=True)
    labels_out.mkdir(parents=True, exist_ok=True)
    
    print(f"📦 Loading Phase 2 SOTA Model ({MODEL_WEIGHTS.name})...", flush=True)
    model = YOLO(str(MODEL_WEIGHTS))
    
    device = 0 if torch.cuda.is_available() else "cpu"
    print(f"⚡ Running GPU inference on {len(batch1_images)} images (Device: {device})...", flush=True)
    
    start_time = time.time()
    labeled_count = 0
    box_count = 0
    
    for idx, img_path in enumerate(batch1_images):
        results = model.predict(img_path, conf=0.40, iou=0.45, device=device, verbose=False)
        result = results[0]
        
        # Save image and label txt if detections exist
        img_name = Path(img_path).stem
        dest_img_path = images_out / f"b1_{idx:05d}_{img_name}.jpg"
        dest_txt_path = labels_out / f"b1_{idx:05d}_{img_name}.txt"
        
        boxes = result.boxes
        if len(boxes) > 0:
            shutil.copy2(img_path, dest_img_path)
            with open(dest_txt_path, "w") as f:
                for box in boxes:
                    cls_id = int(box.cls[0].item())
                    xywh = box.xywhn[0].tolist()
                    f.write(f"{cls_id} {xywh[0]:.6f} {xywh[1]:.6f} {xywh[2]:.6f} {xywh[3]:.6f}\n")
                    box_count += 1
            labeled_count += 1
            
        if (idx + 1) % 100 == 0 or (idx + 1) == len(batch1_images):
            elapsed = time.time() - start_time
            img_per_sec = (idx + 1) / elapsed
            print(f"  ➜ Processed [{idx+1}/{len(batch1_images)}] ({elapsed:.1f}s, {img_per_sec:.1f} img/s) | Labeled: {labeled_count} images ({box_count} boxes)", flush=True)
            
    # Create Batch 1 YAML Configuration
    yaml_content = f"""# Step 4 Batch 1 Curriculum Dataset Config
path: {BATCH1_OUTPUT_DIR.as_posix()}
train: train/images
val: {BASE_DIR.as_posix()}/dataset/DentaVision_Datasets/01_Dental_Condition_Detection/panoramic_radiography_yolo_dataset_14_classes/valid/images

nc: 14
names:
  0: "Implant"
  1: "Prosthetic restoration"
  2: "Obturation"
  3: "Endodontic treatment"
  4: "Carious lesion"
  5: "Bone resorbtion"
  6: "Impacted tooth"
  7: "Apical periodontitis"
  8: "Root fragment"
  9: "Furcation lesion"
  10: "Apical surgery"
  11: "Root resorption"
  12: "Orthodontic device"
  13: "Surgical device"
"""
    with open(BATCH1_YAML, "w") as f:
        f.write(yaml_content)
        
    print("=" * 70, flush=True)
    print("🎉 STEP 4 BATCH 1 AUTO-LABELING COMPLETED!", flush=True)
    print(f"  ➜ Verified High-Confidence Pseudo-Labeled Images : {labeled_count} / {len(batch1_images)}", flush=True)
    print(f"  ➜ Total Auto-Generated Pathology Bounding Boxes  : {box_count}", flush=True)
    print(f"  ➜ Curriculum Dataset Location                    : {BATCH1_OUTPUT_DIR}", flush=True)
    print(f"  ➜ Batch 1 YAML Configuration Saved               : {BATCH1_YAML}", flush=True)
    print("=" * 70, flush=True)

if __name__ == "__main__":
    execute_batch1_autolabel()
