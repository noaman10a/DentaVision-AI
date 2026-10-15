"""
Step 4 Batch 2: Curriculum Pseudo-Labeling Engine
========================================================================
Implements Batch 2 of Noaman's Progressive Self-Training Strategy.
- Target Corpus   : Raw X-rays 4,100 to 8,200 (4,100 raw images).
- Model           : Batch 1 Model (best_model.pt) with 74.4% cavity precision.
- Confidence Filter: High-confidence threshold (conf >= 0.40).
- Output Dataset  : dataset/split/step4_batch2_dataset (combines Batch 1 + Batch 2).
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
MODEL_WEIGHTS = BASE_DIR / "ai_service/model/checkpoints/best_model.pt"

BATCH1_DATASET = BASE_DIR / "dataset/split/step4_batch1_dataset"
BATCH2_OUTPUT_DIR = BASE_DIR / "dataset/split/step4_batch2_dataset"
BATCH2_YAML = BASE_DIR / "ai_service/model/step4_batch2.yaml"

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
                
    return sorted(image_paths)

def execute_batch2_autolabel():
    print("=" * 70, flush=True)
    print("🚀 DENTAVISION-AI | STEP 4 BATCH 2 CURRICULUM AUTO-LABELING", flush=True)
    print("=" * 70, flush=True)
    
    raw_images = collect_raw_images()
    batch2_raw = raw_images[4100:8200]
    print(f"🎯 Target Batch 2 Count: {len(batch2_raw)} raw images (4,100 to 8,200).", flush=True)
    
    # Prepare Output Directories for Combined Batch 1 + Batch 2 Dataset
    images_out = BATCH2_OUTPUT_DIR / "train/images"
    labels_out = BATCH2_OUTPUT_DIR / "train/labels"
    images_out.mkdir(parents=True, exist_ok=True)
    labels_out.mkdir(parents=True, exist_ok=True)
    
    # 1. Copy over all existing Batch 1 pseudo-labeled images & labels
    b1_images = list((BATCH1_DATASET / "train/images").glob("*.jpg"))
    print(f"📦 Copying existing Batch 1 dataset ({len(b1_images)} images)...", flush=True)
    for b1_img in b1_images:
        shutil.copy2(b1_img, images_out / b1_img.name)
        b1_txt = BATCH1_DATASET / "train/labels" / f"{b1_img.stem}.txt"
        if b1_txt.exists():
            shutil.copy2(b1_txt, labels_out / b1_txt.name)
            
    # 2. Run Batch 2 GPU Auto-Labeling using stronger Batch 1 Model
    print(f"📦 Loading Stronger Batch 1 Model ({MODEL_WEIGHTS.name})...", flush=True)
    model = YOLO(str(MODEL_WEIGHTS))
    device = 0 if torch.cuda.is_available() else "cpu"
    print(f"⚡ Running GPU inference on Batch 2 ({len(batch2_raw)} images)...", flush=True)
    
    start_time = time.time()
    b2_labeled_count = 0
    b2_box_count = 0
    
    for idx, img_path in enumerate(batch2_raw):
        results = model.predict(img_path, conf=0.40, iou=0.45, device=device, verbose=False)
        result = results[0]
        
        img_name = Path(img_path).stem
        dest_img_path = images_out / f"b2_{idx:05d}_{img_name}.jpg"
        dest_txt_path = labels_out / f"b2_{idx:05d}_{img_name}.txt"
        
        boxes = result.boxes
        if len(boxes) > 0:
            shutil.copy2(img_path, dest_img_path)
            with open(dest_txt_path, "w") as f:
                for box in boxes:
                    cls_id = int(box.cls[0].item())
                    xywh = box.xywhn[0].tolist()
                    f.write(f"{cls_id} {xywh[0]:.6f} {xywh[1]:.6f} {xywh[2]:.6f} {xywh[3]:.6f}\n")
                    b2_box_count += 1
            b2_labeled_count += 1
            
        if (idx + 1) % 100 == 0 or (idx + 1) == len(batch2_raw):
            elapsed = time.time() - start_time
            img_per_sec = (idx + 1) / elapsed
            print(f"  ➜ Processed [{idx+1}/{len(batch2_raw)}] ({elapsed:.1f}s, {img_per_sec:.1f} img/s) | Labeled: {b2_labeled_count} images ({b2_box_count} boxes)", flush=True)
            
    total_train_images = len(list(images_out.glob("*.jpg")))
    
    # Create Batch 2 YAML Configuration
    yaml_content = f"""# Step 4 Batch 2 Curriculum Dataset Config
path: {BATCH2_OUTPUT_DIR.as_posix()}
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
    with open(BATCH2_YAML, "w") as f:
        f.write(yaml_content)
        
    print("=" * 70, flush=True)
    print("🎉 STEP 4 BATCH 2 AUTO-LABELING COMPLETED!", flush=True)
    print(f"  ➜ Newly Labeled Batch 2 Images                   : {b2_labeled_count} / {len(batch2_raw)}", flush=True)
    print(f"  ➜ Newly Generated Batch 2 Bounding Boxes         : {b2_box_count}", flush=True)
    print(f"  🔥 Combined Training Corpus (Batch 1 + Batch 2)   : {total_train_images} Images", flush=True)
    print(f"  ➜ Curriculum Dataset Location                    : {BATCH2_OUTPUT_DIR}", flush=True)
    print(f"  ➜ Batch 2 YAML Configuration Saved               : {BATCH2_YAML}", flush=True)
    print("=" * 70, flush=True)

if __name__ == "__main__":
    execute_batch2_autolabel()
