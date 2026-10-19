"""
DentaVision AI - Step 4 Batch 4 Curriculum Auto-Labeling Pipeline
Owner: Noaman (Curriculum Learning Lead)

Auto-labels Batch 4 of raw unlabeled images (images 12,300 to 16,400)
using the Step 4 Batch 3 SOTA Model (best_model.pt).
Confidence threshold filtering: conf >= 0.40.
Combines Batch 1 + Batch 2 + Batch 3 + Batch 4 datasets into dataset/split/step4_batch4_dataset.
"""

import os
import sys
import glob
import time
import shutil
from pathlib import Path
import torch
from ultralytics import YOLO

BASE_DIR = Path("d:/Collage/Major Project/DentaVision-AI")
RAW_DATASETS_DIR = BASE_DIR / "dataset/DentaVision_Datasets"
MODEL_WEIGHTS = BASE_DIR / "ai_service/model/checkpoints/best_model.pt"

BATCH3_DATASET = BASE_DIR / "dataset/split/step4_batch3_dataset"
BATCH4_OUTPUT_DIR = BASE_DIR / "dataset/split/step4_batch4_dataset"
BATCH4_YAML = BASE_DIR / "ai_service/model/step4_batch4.yaml"

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

def execute_batch4_autolabel():
    print("=" * 75, flush=True)
    print("🚀 DENTAVISION-AI | STEP 4 BATCH 4 CURRICULUM AUTO-LABELING", flush=True)
    print("=" * 75, flush=True)
    
    raw_images = collect_raw_images()
    print(f"Total raw unannotated images collected: {len(raw_images)}")
    batch4_raw = raw_images[12300:16400] if len(raw_images) >= 16400 else raw_images[12300:]
    print(f"🎯 Target Batch 4 Count: {len(batch4_raw)} raw images (12,300 to 16,400).", flush=True)
    
    # Prepare Output Directories for Combined Batch 1 + Batch 2 + Batch 3 + Batch 4 Dataset
    images_out = BATCH4_OUTPUT_DIR / "train/images"
    labels_out = BATCH4_OUTPUT_DIR / "train/labels"
    
    if BATCH4_OUTPUT_DIR.exists():
        shutil.rmtree(BATCH4_OUTPUT_DIR)
        
    images_out.mkdir(parents=True, exist_ok=True)
    labels_out.mkdir(parents=True, exist_ok=True)
    
    # 1. Copy over all existing Batch 3 pseudo-labeled images & labels
    b3_images = list((BATCH3_DATASET / "train/images").glob("*.*"))
    print(f"📦 Copying existing Batch 3 dataset ({len(b3_images)} images)...", flush=True)
    for b3_img in b3_images:
        shutil.copy2(b3_img, images_out / b3_img.name)
        b3_txt = BATCH3_DATASET / "train/labels" / f"{b3_img.stem}.txt"
        if b3_txt.exists():
            shutil.copy2(b3_txt, labels_out / b3_txt.name)
            
    # 2. Run Batch 4 GPU Auto-Labeling using SOTA Batch 3 Model
    print(f"📦 Loading SOTA Batch 3 Model ({MODEL_WEIGHTS.name})...", flush=True)
    model = YOLO(str(MODEL_WEIGHTS))
    device = 0 if torch.cuda.is_available() else "cpu"
    print(f"⚡ Running GPU inference on Batch 4 ({len(batch4_raw)} images)...", flush=True)
    
    start_time = time.time()
    b4_labeled_count = 0
    b4_box_count = 0
    
    for idx, img_path in enumerate(batch4_raw):
        results = model.predict(img_path, conf=0.40, iou=0.45, device=device, verbose=False)
        result = results[0]
        
        img_name = Path(img_path).stem
        dest_img_path = images_out / f"b4_{idx:05d}_{img_name}.jpg"
        dest_txt_path = labels_out / f"b4_{idx:05d}_{img_name}.txt"
        
        boxes = result.boxes
        if len(boxes) > 0:
            shutil.copy2(img_path, dest_img_path)
            with open(dest_txt_path, "w") as f:
                for box in boxes:
                    cls_id = int(box.cls[0].item())
                    xywh = box.xywhn[0].tolist()
                    f.write(f"{cls_id} {xywh[0]:.6f} {xywh[1]:.6f} {xywh[2]:.6f} {xywh[3]:.6f}\n")
                    b4_box_count += 1
            b4_labeled_count += 1
            
        if (idx + 1) % 250 == 0 or (idx + 1) == len(batch4_raw):
            elapsed = time.time() - start_time
            img_per_sec = (idx + 1) / elapsed
            print(f"  ➜ Processed [{idx+1}/{len(batch4_raw)}] ({elapsed:.1f}s, {img_per_sec:.1f} img/s) | Labeled: {b4_labeled_count} images ({b4_box_count} boxes)", flush=True)
            
    total_train_images = len(list(images_out.glob("*.*")))
    
    # Create Batch 4 YAML Configuration
    yaml_content = f"""# Step 4 Batch 4 Curriculum Dataset Config
path: {BATCH4_OUTPUT_DIR.as_posix()}
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
    with open(BATCH4_YAML, "w") as f:
        f.write(yaml_content)
        
    print("=" * 75, flush=True)
    print("🎉 STEP 4 BATCH 4 AUTO-LABELING COMPLETED!", flush=True)
    print(f"  ➜ Newly Labeled Batch 4 Images                   : {b4_labeled_count} / {len(batch4_raw)}", flush=True)
    print(f"  ➜ Newly Generated Batch 4 Bounding Boxes         : {b4_box_count}", flush=True)
    print(f"  🔥 Final Full Training Corpus (Batch 1+2+3+4)   : {total_train_images} Images", flush=True)
    print(f"  ➜ Curriculum Dataset Location                    : {BATCH4_OUTPUT_DIR}", flush=True)
    print(f"  ➜ Batch 4 YAML Configuration Saved               : {BATCH4_YAML}", flush=True)
    print("=" * 75, flush=True)

if __name__ == "__main__":
    execute_batch4_autolabel()
