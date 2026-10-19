"""
DentaVision AI — Experiment 1: Class-Balanced Oversampling Dataset Builder
==========================================================================
CONTROLLED EXPERIMENT: Only change is training data distribution.
All other parameters (model, imgsz, optimizer, lr, epochs, val set) remain
identical to Batch 3 baseline.

Strategy:
  - Identify images containing under-represented classes
  - Duplicate those images (with unique filenames) to increase class frequency
  - Target: bring each minority class to ≥5% of total training boxes
  - Do NOT modify the validation set
"""

import os
import shutil
from pathlib import Path
from collections import Counter, defaultdict

BASE_DIR = Path("d:/Collage/Major Project/DentaVision-AI")
BATCH3_DATASET = BASE_DIR / "dataset/split/step4_batch3_dataset"
EXP1_DATASET = BASE_DIR / "dataset/split/exp1_balanced_dataset"
EXP1_YAML = BASE_DIR / "ai_service/model/exp1_balanced.yaml"

CLASS_NAMES = {
    0: "Implant", 1: "Prosthetic_restoration", 2: "Obturation",
    3: "Endodontic_treatment", 4: "Carious_lesion", 5: "Bone_resorbtion",
    6: "Impacted_tooth", 7: "Apical_periodontitis", 8: "Root_fragment",
    9: "Furcation_lesion", 10: "Apical_surgery", 11: "Root_resorption",
    12: "Orthodontic_device", 13: "Surgical_device"
}

# Target: oversample classes that are under-represented relative to validation demand
# Classes and their oversampling multipliers (how many EXTRA copies of each image)
OVERSAMPLE_TARGETS = {
    4: 3,   # Carious lesion:        7.6% train vs 20.6% val → 3x oversample
    5: 4,   # Bone resorbtion:       3.7% train vs 15.1% val → 4x oversample
    7: 3,   # Apical periodontitis:  3.0% train vs  5.1% val → 3x oversample
    9: 8,   # Furcation lesion:      0.3% train vs  1.2% val → 8x oversample
    11: 5,  # Root resorption:       0.1% train (10 boxes)   → 5x oversample
    12: 3,  # Orthodontic device:    1.0% train vs  2.6% val → 3x oversample
    8: 2,   # Root fragment:         5.6% train vs  8.7% val → 2x oversample
}


def build_balanced_dataset():
    print("=" * 75)
    print("🔬 EXPERIMENT 1: CLASS-BALANCED OVERSAMPLING DATASET BUILDER")
    print("=" * 75)

    src_images = BATCH3_DATASET / "train/images"
    src_labels = BATCH3_DATASET / "train/labels"

    dst_images = EXP1_DATASET / "train/images"
    dst_labels = EXP1_DATASET / "train/labels"

    # Clean and create output
    if EXP1_DATASET.exists():
        shutil.rmtree(EXP1_DATASET)
    dst_images.mkdir(parents=True, exist_ok=True)
    dst_labels.mkdir(parents=True, exist_ok=True)

    # Step 1: Copy ALL original Batch 3 images and labels (1:1 baseline copy)
    all_label_files = sorted(src_labels.glob("*.txt"))
    print(f"\n📦 Step 1: Copying original Batch 3 dataset ({len(all_label_files)} labeled images)...")

    # Build index: which images contain which classes
    image_classes = {}  # filename_stem -> set of class IDs
    class_to_images = defaultdict(list)  # class_id -> list of filename stems

    for lf in all_label_files:
        stem = lf.stem
        classes_in_image = set()
        for line in open(lf).readlines():
            parts = line.strip().split()
            if parts:
                cls_id = int(parts[0])
                classes_in_image.add(cls_id)
        image_classes[stem] = classes_in_image
        for cls_id in classes_in_image:
            class_to_images[cls_id].append(stem)

    # Copy originals
    copied = 0
    for lf in all_label_files:
        stem = lf.stem
        # Find matching image (could be .jpg, .jpeg, .png)
        img_file = None
        for ext in (".jpg", ".jpeg", ".png", ".JPG", ".PNG"):
            candidate = src_images / f"{stem}{ext}"
            if candidate.exists():
                img_file = candidate
                break
        if img_file is None:
            continue

        shutil.copy2(img_file, dst_images / img_file.name)
        shutil.copy2(lf, dst_labels / lf.name)
        copied += 1

    print(f"  ✅ Copied {copied} original images + labels.")

    # Step 2: Count original class distribution
    print(f"\n📊 Step 2: Original class distribution:")
    orig_counter = Counter()
    for lf in all_label_files:
        for line in open(lf).readlines():
            parts = line.strip().split()
            if parts:
                orig_counter[int(parts[0])] += 1

    total_orig = sum(orig_counter.values())
    for cls_id in sorted(CLASS_NAMES.keys()):
        cnt = orig_counter.get(cls_id, 0)
        pct = (cnt / total_orig * 100) if total_orig > 0 else 0
        marker = " 🔴 TARGET" if cls_id in OVERSAMPLE_TARGETS else ""
        print(f"  Class {cls_id:2d} ({CLASS_NAMES[cls_id]:25s}): {cnt:5d} ({pct:5.1f}%){marker}")

    # Step 3: Oversample minority classes
    print(f"\n⚡ Step 3: Oversampling minority classes...")
    total_added_images = 0
    total_added_boxes = 0

    for cls_id, multiplier in sorted(OVERSAMPLE_TARGETS.items()):
        source_stems = class_to_images.get(cls_id, [])
        if not source_stems:
            print(f"  ⚠️  Class {cls_id} ({CLASS_NAMES[cls_id]}): 0 source images, cannot oversample.")
            continue

        added_for_class = 0
        for copy_idx in range(1, multiplier + 1):
            for stem in source_stems:
                # Find original image
                img_file = None
                for ext in (".jpg", ".jpeg", ".png", ".JPG", ".PNG"):
                    candidate = src_images / f"{stem}{ext}"
                    if candidate.exists():
                        img_file = candidate
                        break
                if img_file is None:
                    continue

                # Create unique filename for the duplicate
                new_stem = f"os{cls_id}_{copy_idx:02d}_{stem}"
                new_img = dst_images / f"{new_stem}{img_file.suffix}"
                new_lbl = dst_labels / f"{new_stem}.txt"

                shutil.copy2(img_file, new_img)
                shutil.copy2(src_labels / f"{stem}.txt", new_lbl)
                added_for_class += 1

                # Count added boxes
                for line in open(src_labels / f"{stem}.txt").readlines():
                    parts = line.strip().split()
                    if parts:
                        total_added_boxes += 1

        total_added_images += added_for_class
        print(f"  ✅ Class {cls_id:2d} ({CLASS_NAMES[cls_id]:25s}): +{added_for_class} duplicated images (x{multiplier} oversample from {len(source_stems)} sources)")

    # Step 4: Count final distribution
    print(f"\n📊 Step 4: Final balanced class distribution:")
    final_counter = Counter()
    final_labels = list(dst_labels.glob("*.txt"))
    for lf in final_labels:
        for line in open(lf).readlines():
            parts = line.strip().split()
            if parts:
                final_counter[int(parts[0])] += 1

    total_final = sum(final_counter.values())
    for cls_id in sorted(CLASS_NAMES.keys()):
        cnt = final_counter.get(cls_id, 0)
        orig = orig_counter.get(cls_id, 0)
        pct = (cnt / total_final * 100) if total_final > 0 else 0
        change = cnt - orig
        print(f"  Class {cls_id:2d} ({CLASS_NAMES[cls_id]:25s}): {cnt:5d} ({pct:5.1f}%) [+{change} boxes]")

    # Step 5: Create YAML config
    yaml_content = f"""# Experiment 1: Class-Balanced Oversampling Dataset Config
# CONTROLLED EXPERIMENT: Only change is training data distribution
# Validation set is IDENTICAL to Batch 3 baseline
path: {EXP1_DATASET.as_posix()}
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
    with open(EXP1_YAML, "w") as f:
        f.write(yaml_content)

    total_final_images = len(list(dst_images.glob("*.*")))

    print(f"\n{'=' * 75}")
    print(f"🎉 EXPERIMENT 1 DATASET ASSEMBLY COMPLETE!")
    print(f"  ➜ Original Batch 3 Images              : {copied}")
    print(f"  ➜ Added Oversampled Duplicates          : {total_added_images}")
    print(f"  ➜ Total Training Images (Balanced)      : {total_final_images}")
    print(f"  ➜ Original Total Boxes                  : {total_orig}")
    print(f"  ➜ Final Total Boxes (After Oversampling) : {total_final}")
    print(f"  ➜ Dataset Location                      : {EXP1_DATASET}")
    print(f"  ➜ YAML Config                           : {EXP1_YAML}")
    print(f"{'=' * 75}")


if __name__ == "__main__":
    build_balanced_dataset()
