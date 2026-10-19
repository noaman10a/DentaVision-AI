"""
DentaVision AI — Gold-Standard Tile-Trained Dataset Generator
============================================================
BREAKTHROUGH DISCOVERY:
  - The previous Step 4 Batch 1/2/3 auto-labeling pipeline replaced human gold
    labels with sparse model pseudo-labels (e.g. 101.txt went from 38 gold boxes
    to 8 pseudo boxes, losing 75% of annotations).
  - The original pristine dataset at `panoramic_radiography_yolo_dataset_14_classes`
    contains ALL 18,570 human gold-standard annotations across 1,375 train images:
      * 2,745 Carious lesions (vs 1,014 in Batch 3)
      * 2,763 Bone resorptions (vs 492 in Batch 3)
      *   973 Apical periodontitis (vs 404 in Batch 3)
      *   268 Furcation lesions (vs 36 in Batch 3)
      *    66 Apical surgeries (vs 0 in Batch 3)

METHODOLOGY:
  1. Slice high-resolution (2652×1536) GOLD images into overlapping 640×640 tiles (stride 448 = ~30% overlap).
  2. Recalculate and map all 18,570 gold bounding boxes into local tile normalized [0, 1] coordinates.
  3. Filter truncated edge boxes (keep if ≥35% of box area is within the tile).
  4. Preserve non-empty pathology tiles + calibrated 10% negative background tiles.
  5. Train YOLO11m on pristine native-resolution tiles.
"""

import os
import shutil
import cv2
import numpy as np
from pathlib import Path
from collections import Counter

BASE_DIR = Path("d:/Collage/Major Project/DentaVision-AI")
SRC_DIR = BASE_DIR / "dataset/DentaVision_Datasets/01_Dental_Condition_Detection/panoramic_radiography_yolo_dataset_14_classes"
OUT_DIR = BASE_DIR / "dataset/split/tiled_gold_dataset"
YAML_PATH = BASE_DIR / "ai_service/model/tiled_gold.yaml"

CLASS_NAMES = {
    0: "Implant", 1: "Prosthetic_restoration", 2: "Obturation",
    3: "Endodontic_treatment", 4: "Carious_lesion", 5: "Bone_resorbtion",
    6: "Impacted_tooth", 7: "Apical_periodontitis", 8: "Root_fragment",
    9: "Furcation_lesion", 10: "Apical_surgery", 11: "Root_resorption",
    12: "Orthodontic_device", 13: "Surgical_device"
}

TILE_SIZE = 640
STRIDE = 448  # 30% overlap (640 - 448 = 192 px overlap)
MIN_BOX_AREA_RATIO = 0.35  # Keep box if >=35% is inside tile
BG_SAMPLE_RATE = 0.10      # Keep 10% of empty background tiles for negative learning


def generate_tile_grid(img_w, img_h, tile_size=TILE_SIZE, stride=STRIDE):
    tiles = []
    for y in range(0, img_h, stride):
        for x in range(0, img_w, stride):
            x1 = x
            y1 = y
            x2 = min(x + tile_size, img_w)
            y2 = min(y + tile_size, img_h)
            if x2 - x1 < tile_size and x1 > 0:
                x1 = max(0, x2 - tile_size)
            if y2 - y1 < tile_size and y1 > 0:
                y1 = max(0, y2 - tile_size)
            tiles.append((x1, y1, x2, y2))
    return sorted(list(set(tiles)))


def parse_boxes(label_path, img_w, img_h):
    boxes = []
    if not label_path.exists():
        return boxes
    for line in open(label_path):
        parts = line.strip().split()
        if len(parts) >= 5:
            cls_id = int(parts[0])
            cx, cy, w, h = float(parts[1]), float(parts[2]), float(parts[3]), float(parts[4])
            x1 = (cx - w / 2) * img_w
            y1 = (cy - h / 2) * img_h
            x2 = (cx + w / 2) * img_w
            y2 = (cy + h / 2) * img_h
            boxes.append((cls_id, x1, y1, x2, y2))
    return boxes


def clip_box_to_tile(box, tx1, ty1, tx2, ty2, tile_size=TILE_SIZE):
    cls_id, bx1, by1, bx2, by2 = box
    orig_area = max(1.0, (bx2 - bx1) * (by2 - by1))

    # Intersection
    ix1 = max(bx1, tx1)
    iy1 = max(by1, ty1)
    ix2 = min(bx2, tx2)
    iy2 = min(by2, ty2)

    if ix2 <= ix1 or iy2 <= iy1:
        return None

    inter_area = (ix2 - ix1) * (iy2 - iy1)
    if inter_area / orig_area < MIN_BOX_AREA_RATIO:
        return None

    # Convert to tile-local normalized coordinates
    local_x1 = ix1 - tx1
    local_y1 = iy1 - ty1
    local_x2 = ix2 - tx1
    local_y2 = iy2 - ty1

    local_cx = ((local_x1 + local_x2) / 2.0) / tile_size
    local_cy = ((local_y1 + local_y2) / 2.0) / tile_size
    local_w = (local_x2 - local_x1) / tile_size
    local_h = (local_y2 - local_y1) / tile_size

    # Clamp
    local_cx = max(0.001, min(0.999, local_cx))
    local_cy = max(0.001, min(0.999, local_cy))
    local_w = max(0.001, min(1.0, local_w))
    local_h = max(0.001, min(1.0, local_h))

    return (cls_id, local_cx, local_cy, local_w, local_h)


def process_split(split_name, src_split_dir, dst_split_dir):
    print(f"\n{'='*70}")
    print(f" Processing {split_name.upper()} split from GOLD annotations...")
    print(f"{'='*70}")

    src_imgs_dir = src_split_dir / "images"
    src_lbls_dir = src_split_dir / "labels"

    dst_imgs_dir = dst_split_dir / "images"
    dst_lbls_dir = dst_split_dir / "labels"

    dst_imgs_dir.mkdir(parents=True, exist_ok=True)
    dst_lbls_dir.mkdir(parents=True, exist_ok=True)

    img_files = sorted(list(src_imgs_dir.glob("*.jpg")) + list(src_imgs_dir.glob("*.png")) + list(src_imgs_dir.glob("*.jpeg")))
    print(f" Found {len(img_files)} source gold images in {split_name}.")

    total_tiles_saved = 0
    total_boxes_saved = Counter()
    bg_tiles_saved = 0

    np.random.seed(42)

    for idx, img_path in enumerate(img_files):
        stem = img_path.stem
        lbl_path = src_lbls_dir / f"{stem}.txt"

        img = cv2.imread(str(img_path))
        if img is None:
            continue

        img_h, img_w = img.shape[:2]
        boxes = parse_boxes(lbl_path, img_w, img_h)
        tiles = generate_tile_grid(img_w, img_h)

        for t_idx, (tx1, ty1, tx2, ty2) in enumerate(tiles):
            tile_boxes = []
            for b in boxes:
                clipped = clip_box_to_tile(b, tx1, ty1, tx2, ty2)
                if clipped is not None:
                    tile_boxes.append(clipped)

            is_bg = (len(tile_boxes) == 0)

            # Skip most background tiles to prevent imbalance
            if is_bg and np.random.rand() > BG_SAMPLE_RATE:
                continue

            tile_img = img[ty1:ty2, tx1:tx2]
            th, tw = tile_img.shape[:2]
            if th < TILE_SIZE or tw < TILE_SIZE:
                padded = np.zeros((TILE_SIZE, TILE_SIZE, 3), dtype=np.uint8)
                padded[:th, :tw] = tile_img
                tile_img = padded

            tile_stem = f"{stem}_t{t_idx:02d}"
            out_img = dst_imgs_dir / f"{tile_stem}.jpg"
            out_lbl = dst_lbls_dir / f"{tile_stem}.txt"

            cv2.imwrite(str(out_img), tile_img)

            with open(out_lbl, "w") as f:
                for cls_id, cx, cy, w, h in tile_boxes:
                    f.write(f"{cls_id} {cx:.6f} {cy:.6f} {w:.6f} {h:.6f}\n")
                    total_boxes_saved[cls_id] += 1

            total_tiles_saved += 1
            if is_bg:
                bg_tiles_saved += 1

        if (idx + 1) % 250 == 0 or (idx + 1) == len(img_files):
            print(f"  [{idx+1:4d}/{len(img_files)}] Processed. Total tiles: {total_tiles_saved}, Total boxes: {sum(total_boxes_saved.values())}")

    print(f"\n Summary for {split_name}:")
    print(f"   Total tiles generated: {total_tiles_saved} (including {bg_tiles_saved} background tiles)")
    print(f"   Total bounding boxes:  {sum(total_boxes_saved.values())}")
    for cls_id in sorted(CLASS_NAMES.keys()):
        cnt = total_boxes_saved.get(cls_id, 0)
        pct = (cnt / sum(total_boxes_saved.values()) * 100) if total_boxes_saved else 0
        print(f"     Class {cls_id:2d} ({CLASS_NAMES[cls_id]:24s}): {cnt:5d} ({pct:5.1f}%)")


def build_tiled_dataset():
    print("=" * 80)
    print(" 🌟 DENTAVISION AI: BUILDING GOLD-STANDARD TILE-TRAINED DATASET")
    print("=" * 80)

    if OUT_DIR.exists():
        shutil.rmtree(OUT_DIR)
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    # Process Train split
    process_split("train", SRC_DIR / "train", OUT_DIR / "train")

    # Process Validation split (for tile-level validation)
    process_split("valid", SRC_DIR / "valid", OUT_DIR / "valid")

    # Write YAML configuration
    yaml_content = f"""# DentaVision AI — Gold-Standard Tile-Trained Dataset Config
path: {OUT_DIR.as_posix()}
train: train/images
val: valid/images

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
    with open(YAML_PATH, "w") as f:
        f.write(yaml_content)

    print(f"\n{'='*80}")
    print(f" 🎉 GOLD-STANDARD TILED DATASET GENERATION COMPLETE!")
    print(f"  Dataset Directory: {OUT_DIR}")
    print(f"  YAML Config:       {YAML_PATH}")
    print(f"{'='*80}")


if __name__ == "__main__":
    build_tiled_dataset()
