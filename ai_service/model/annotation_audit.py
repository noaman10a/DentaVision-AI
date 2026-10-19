"""
DentaVision AI — Annotation Audit for Difficult Classes
========================================================
Before investing another 10+ hours in training, inspect the ground-truth
annotations for the three classes that refuse to improve:
  - Carious Lesion (class 4): 21.6% → 17.2% recall across experiments
  - Bone Resorbtion (class 5): ~1% recall across all experiments
  - Apical Periodontitis (class 7): ~11% recall, unchanged

Inspection goals:
  1. Are the bounding boxes actually correct?
  2. Are the lesions visible to a human?
  3. How small are the boxes relative to the image?
  4. Are annotations consistent or noisy?
  5. Are there missing annotations (unlabeled pathology)?
"""

import os
import random
import cv2
import numpy as np
from pathlib import Path
from collections import Counter, defaultdict

BASE_DIR = Path("d:/Collage/Major Project/DentaVision-AI")
VAL_IMAGES = BASE_DIR / "dataset/DentaVision_Datasets/01_Dental_Condition_Detection/panoramic_radiography_yolo_dataset_14_classes/valid/images"
VAL_LABELS = BASE_DIR / "dataset/DentaVision_Datasets/01_Dental_Condition_Detection/panoramic_radiography_yolo_dataset_14_classes/valid/labels"
TRAIN_IMAGES = BASE_DIR / "dataset/split/step4_batch3_dataset/train/images"
TRAIN_LABELS = BASE_DIR / "dataset/split/step4_batch3_dataset/train/labels"

OUTPUT_DIR = BASE_DIR / "runs/detect/ai_service/model/runs/annotation_audit"

CLASS_NAMES = {
    0: "Implant", 1: "Prosthetic_restoration", 2: "Obturation",
    3: "Endodontic_treatment", 4: "Carious_lesion", 5: "Bone_resorbtion",
    6: "Impacted_tooth", 7: "Apical_periodontitis", 8: "Root_fragment",
    9: "Furcation_lesion", 10: "Apical_surgery", 11: "Root_resorption",
    12: "Orthodontic_device", 13: "Surgical_device"
}

# Colors: BGR format for OpenCV
CLASS_COLORS = {
    4: (0, 0, 255),     # Carious Lesion - RED
    5: (0, 165, 255),   # Bone Resorbtion - ORANGE
    7: (0, 255, 255),   # Apical Periodontitis - YELLOW
}

# Target classes to audit
TARGET_CLASSES = [4, 5, 7]
SAMPLES_PER_CLASS = 40  # How many images to inspect per class


def find_image_file(stem, img_dir):
    """Find the actual image file for a given stem."""
    for ext in (".jpg", ".jpeg", ".png", ".JPG", ".PNG", ".JPEG"):
        candidate = img_dir / f"{stem}{ext}"
        if candidate.exists():
            return candidate
    return None


def parse_yolo_label(label_path):
    """Parse a YOLO label file into list of (class_id, cx, cy, w, h)."""
    boxes = []
    if not label_path.exists():
        return boxes
    for line in open(label_path).readlines():
        parts = line.strip().split()
        if len(parts) >= 5:
            cls_id = int(parts[0])
            cx, cy, w, h = float(parts[1]), float(parts[2]), float(parts[3]), float(parts[4])
            boxes.append((cls_id, cx, cy, w, h))
    return boxes


def draw_boxes_on_image(img, boxes, img_h, img_w, target_cls=None):
    """Draw bounding boxes on image. Highlight target class, dim others."""
    annotated = img.copy()
    
    for cls_id, cx, cy, w, h in boxes:
        # Convert normalized YOLO coords to pixel coords
        x1 = int((cx - w / 2) * img_w)
        y1 = int((cy - h / 2) * img_h)
        x2 = int((cx + w / 2) * img_w)
        y2 = int((cy + h / 2) * img_h)
        
        box_w_px = x2 - x1
        box_h_px = y2 - y1
        
        if target_cls is not None and cls_id == target_cls:
            # Target class: thick bright box
            color = CLASS_COLORS.get(cls_id, (0, 255, 0))
            thickness = 3
            label = f"{CLASS_NAMES[cls_id]} ({box_w_px}x{box_h_px}px)"
            cv2.rectangle(annotated, (x1, y1), (x2, y2), color, thickness)
            # Label background
            (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
            cv2.rectangle(annotated, (x1, y1 - th - 6), (x1 + tw + 4, y1), color, -1)
            cv2.putText(annotated, label, (x1 + 2, y1 - 4),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        else:
            # Other classes: thin gray box
            cv2.rectangle(annotated, (x1, y1), (x2, y2), (180, 180, 180), 1)
            short_name = CLASS_NAMES.get(cls_id, f"cls{cls_id}")[:10]
            cv2.putText(annotated, short_name, (x1, y1 - 2),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.35, (180, 180, 180), 1)
    
    return annotated


def compute_box_statistics(all_boxes, img_sizes):
    """Compute size statistics for boxes of target classes."""
    stats = {}
    for cls_id in TARGET_CLASSES:
        cls_boxes = []
        for (stem, c, cx, cy, w, h) in all_boxes:
            if c == cls_id and stem in img_sizes:
                img_h, img_w = img_sizes[stem]
                box_w_px = w * img_w
                box_h_px = h * img_h
                box_area_px = box_w_px * box_h_px
                box_area_pct = (w * h) * 100  # percentage of image area
                cls_boxes.append({
                    'stem': stem,
                    'w_px': box_w_px, 'h_px': box_h_px,
                    'area_px': box_area_px, 'area_pct': box_area_pct,
                    'w_norm': w, 'h_norm': h
                })
        stats[cls_id] = cls_boxes
    return stats


def run_audit():
    print("=" * 80)
    print(" 🔎 ANNOTATION AUDIT: DIFFICULT CLASS INSPECTION")
    print("=" * 80)
    
    # Create output directories
    for cls_id in TARGET_CLASSES:
        for split in ["val", "train"]:
            out_dir = OUTPUT_DIR / f"class_{cls_id}_{CLASS_NAMES[cls_id]}" / split
            out_dir.mkdir(parents=True, exist_ok=True)
    stats_dir = OUTPUT_DIR / "statistics"
    stats_dir.mkdir(parents=True, exist_ok=True)
    
    all_boxes = []
    img_sizes = {}
    
    for split_name, img_dir, lbl_dir in [
        ("val", VAL_IMAGES, VAL_LABELS),
        ("train", TRAIN_IMAGES, TRAIN_LABELS),
    ]:
        print(f"\n{'='*60}")
        print(f" Processing {split_name} set...")
        print(f"{'='*60}")
        
        # Index: which images contain which target classes
        class_to_stems = defaultdict(list)
        label_files = sorted(lbl_dir.glob("*.txt"))
        
        for lf in label_files:
            stem = lf.stem
            boxes = parse_yolo_label(lf)
            for cls_id, cx, cy, w, h in boxes:
                all_boxes.append((stem, cls_id, cx, cy, w, h))
                if cls_id in TARGET_CLASSES:
                    class_to_stems[cls_id].append(stem)
        
        for cls_id in TARGET_CLASSES:
            stems = list(set(class_to_stems[cls_id]))  # unique images
            n_available = len(stems)
            n_sample = min(SAMPLES_PER_CLASS, n_available)
            
            if n_sample == 0:
                print(f"\n  ⚠️  Class {cls_id} ({CLASS_NAMES[cls_id]}): No images in {split_name} set!")
                continue
            
            random.seed(42)  # Reproducible sampling
            sampled = random.sample(stems, n_sample)
            
            print(f"\n  📋 Class {cls_id} ({CLASS_NAMES[cls_id]}): "
                  f"Sampling {n_sample}/{n_available} images from {split_name}")
            
            box_sizes = []
            
            for i, stem in enumerate(sampled):
                img_file = find_image_file(stem, img_dir)
                if img_file is None:
                    continue
                
                img = cv2.imread(str(img_file))
                if img is None:
                    continue
                
                img_h, img_w = img.shape[:2]
                img_sizes[stem] = (img_h, img_w)
                
                # Get all boxes for this image
                lbl_file = lbl_dir / f"{stem}.txt"
                boxes = parse_yolo_label(lbl_file)
                
                # Compute target class box sizes
                for c, cx, cy, w, h in boxes:
                    if c == cls_id:
                        box_w_px = w * img_w
                        box_h_px = h * img_h
                        box_area_pct = (w * h) * 100
                        box_sizes.append((box_w_px, box_h_px, box_area_pct))
                
                # Draw and save annotated image
                annotated = draw_boxes_on_image(img, boxes, img_h, img_w, target_cls=cls_id)
                
                # Add image info header
                info = f"Image: {stem} | Size: {img_w}x{img_h} | {split_name}"
                cv2.putText(annotated, info, (10, 25),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
                
                out_path = OUTPUT_DIR / f"class_{cls_id}_{CLASS_NAMES[cls_id]}" / split_name / f"{i:03d}_{stem}.jpg"
                cv2.imwrite(str(out_path), annotated)
            
            # Print box size statistics
            if box_sizes:
                widths = [b[0] for b in box_sizes]
                heights = [b[1] for b in box_sizes]
                areas_pct = [b[2] for b in box_sizes]
                
                print(f"    Box Width  (px): min={min(widths):.0f}, median={sorted(widths)[len(widths)//2]:.0f}, "
                      f"max={max(widths):.0f}, mean={np.mean(widths):.0f}")
                print(f"    Box Height (px): min={min(heights):.0f}, median={sorted(heights)[len(heights)//2]:.0f}, "
                      f"max={max(heights):.0f}, mean={np.mean(heights):.0f}")
                print(f"    Box Area   (% of image): min={min(areas_pct):.3f}%, "
                      f"median={sorted(areas_pct)[len(areas_pct)//2]:.3f}%, "
                      f"max={max(areas_pct):.3f}%, mean={np.mean(areas_pct):.3f}%")
                
                # Count how many boxes are "tiny" (< 32px in either dimension)
                tiny = sum(1 for w, h, _ in box_sizes if w < 32 or h < 32)
                small = sum(1 for w, h, _ in box_sizes if (w < 64 or h < 64) and not (w < 32 or h < 32))
                print(f"    Tiny (<32px):  {tiny}/{len(box_sizes)} ({tiny/len(box_sizes)*100:.1f}%)")
                print(f"    Small (<64px): {small}/{len(box_sizes)} ({small/len(box_sizes)*100:.1f}%)")
    
    # Overall box size analysis across ALL training + validation
    print(f"\n{'='*80}")
    print(" 📊 OVERALL BOX SIZE ANALYSIS (ALL SPLITS)")
    print(f"{'='*80}")
    
    for cls_id in TARGET_CLASSES:
        cls_data = [(s, c, cx, cy, w, h) for s, c, cx, cy, w, h in all_boxes if c == cls_id]
        if not cls_data:
            print(f"\n  Class {cls_id} ({CLASS_NAMES[cls_id]}): No boxes found!")
            continue
        
        # Compute in 640px equivalent
        widths_640 = [w * 640 for _, _, _, _, w, h in cls_data]
        heights_640 = [h * 640 for _, _, _, _, w, h in cls_data]
        areas_pct = [w * h * 100 for _, _, _, _, w, h in cls_data]
        
        print(f"\n  Class {cls_id} ({CLASS_NAMES[cls_id]}): {len(cls_data)} total boxes")
        print(f"    At 640px input:")
        print(f"      Width:  min={min(widths_640):.1f}, median={sorted(widths_640)[len(widths_640)//2]:.1f}, "
              f"max={max(widths_640):.1f}, mean={np.mean(widths_640):.1f}px")
        print(f"      Height: min={min(heights_640):.1f}, median={sorted(heights_640)[len(heights_640)//2]:.1f}, "
              f"max={max(heights_640):.1f}, mean={np.mean(heights_640):.1f}px")
        print(f"      Area:   min={min(areas_pct):.4f}%, median={sorted(areas_pct)[len(areas_pct)//2]:.4f}%, "
              f"max={max(areas_pct):.4f}%, mean={np.mean(areas_pct):.4f}%")
        
        tiny_640 = sum(1 for w in widths_640 if w < 16)
        small_640 = sum(1 for w in widths_640 if 16 <= w < 32)
        print(f"      Tiny (<16px at 640):  {tiny_640}/{len(cls_data)} ({tiny_640/len(cls_data)*100:.1f}%)")
        print(f"      Small (16-32px at 640): {small_640}/{len(cls_data)} ({small_640/len(cls_data)*100:.1f}%)")

    # Check original image resolutions
    print(f"\n{'='*80}")
    print(" 📐 ORIGINAL IMAGE RESOLUTION STATISTICS")
    print(f"{'='*80}")
    
    resolutions = []
    for img_file in sorted(VAL_IMAGES.glob("*.*")):
        if img_file.suffix.lower() in ('.jpg', '.jpeg', '.png'):
            img = cv2.imread(str(img_file))
            if img is not None:
                resolutions.append((img.shape[1], img.shape[0]))  # width, height
    
    if resolutions:
        widths = [r[0] for r in resolutions]
        heights = [r[1] for r in resolutions]
        print(f"  Validation images: {len(resolutions)}")
        print(f"  Width:  min={min(widths)}, median={sorted(widths)[len(widths)//2]}, max={max(widths)}")
        print(f"  Height: min={min(heights)}, median={sorted(heights)[len(heights)//2]}, max={max(heights)}")
        print(f"  Unique resolutions: {len(set(resolutions))}")
        for res, count in Counter(resolutions).most_common(10):
            print(f"    {res[0]}x{res[1]}: {count} images")
    
    print(f"\n{'='*80}")
    print(f" ✅ AUDIT COMPLETE!")
    print(f" Annotated images saved to: {OUTPUT_DIR}")
    print(f" Inspect the images in each class folder to check annotation quality.")
    print(f"{'='*80}")


if __name__ == "__main__":
    run_audit()
