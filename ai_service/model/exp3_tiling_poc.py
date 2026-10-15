"""
DentaVision AI — Experiment 3: Tiled/Patch-Based Detection PoC
===============================================================
HYPOTHESIS: "Preserving native spatial detail through localized patches
improves detection of subtle dental pathologies (Carious Lesion, Bone
Resorbtion, Apical Periodontitis)."

KEY DESIGN DECISIONS:
  - NO retraining. Uses existing Batch 3 model (best checkpoint).
  - Tiles are generated from ORIGINAL resolution images (~2652×1536).
  - Tile size: 640×640 (matches the model's trained input size).
  - Overlap: 25% (stride=480) to catch objects near tile boundaries.
  - Detection merging: Weighted NMS across tiles.
  - Evaluation: Against ORIGINAL validation annotations (153 images, 1972 boxes).
  - Comparison: Directly comparable to Exp 0/1/2 on the same val set.

EXPECTED OUTCOME:
  - Caries median box: 20.8px (global) → ~85px (tiled) → should improve recall
  - If this PoC shows meaningful improvement, we proceed to tiled training.
  - If not, we pivot to annotation quality / class-specific strategies.
"""

import os
import sys
import time
import json
import cv2
import numpy as np
import torch
from pathlib import Path
from collections import defaultdict
from ultralytics import YOLO

BASE_DIR = Path("d:/Collage/Major Project/DentaVision-AI")
VAL_IMAGES = BASE_DIR / "dataset/DentaVision_Datasets/01_Dental_Condition_Detection/panoramic_radiography_yolo_dataset_14_classes/valid/images"
VAL_LABELS = BASE_DIR / "dataset/DentaVision_Datasets/01_Dental_Condition_Detection/panoramic_radiography_yolo_dataset_14_classes/valid/labels"
MODEL_PATH = BASE_DIR / "ai_service/model/checkpoints/step4_batch3_best.pt"
OUTPUT_DIR = BASE_DIR / "runs/detect/ai_service/model/runs/exp3_tiling_poc"

CLASS_NAMES = {
    0: "Implant", 1: "Prosthetic_restoration", 2: "Obturation",
    3: "Endodontic_treatment", 4: "Carious_lesion", 5: "Bone_resorbtion",
    6: "Impacted_tooth", 7: "Apical_periodontitis", 8: "Root_fragment",
    9: "Furcation_lesion", 10: "Apical_surgery", 11: "Root_resorption",
    12: "Orthodontic_device", 13: "Surgical_device"
}

# Tiling configuration
TILE_SIZE = 640        # Matches model's trained input size
TILE_OVERLAP = 0.25    # 25% overlap between tiles
TILE_STRIDE = int(TILE_SIZE * (1 - TILE_OVERLAP))  # 480 pixels

# Detection configuration
CONF_THRESHOLD = 0.10   # Standard operational confidence threshold
NMS_IOU_THRESHOLD = 0.45  # Same NMS threshold as Batch 3 inference
MERGE_IOU_THRESHOLD = 0.5  # IoU threshold for merging cross-tile duplicates


def generate_tiles(img_w, img_h, tile_size=TILE_SIZE, stride=TILE_STRIDE):
    """Generate tile coordinates (x1, y1, x2, y2) with overlap."""
    tiles = []
    for y in range(0, img_h, stride):
        for x in range(0, img_w, stride):
            x1 = x
            y1 = y
            x2 = min(x + tile_size, img_w)
            y2 = min(y + tile_size, img_h)
            # Adjust start to ensure tile is full size when possible
            if x2 - x1 < tile_size and x1 > 0:
                x1 = max(0, x2 - tile_size)
            if y2 - y1 < tile_size and y1 > 0:
                y1 = max(0, y2 - tile_size)
            tiles.append((x1, y1, x2, y2))
    # Deduplicate tiles
    tiles = list(set(tiles))
    return sorted(tiles)


def extract_tile(img, x1, y1, x2, y2, tile_size=TILE_SIZE):
    """Extract a tile from the image, padding if necessary."""
    tile = img[y1:y2, x1:x2]
    # Pad if tile is smaller than expected (at image borders)
    h, w = tile.shape[:2]
    if h < tile_size or w < tile_size:
        padded = np.zeros((tile_size, tile_size, 3), dtype=np.uint8)
        padded[:h, :w] = tile
        tile = padded
    return tile


def tile_to_original_coords(boxes, tile_x1, tile_y1, img_w, img_h):
    """Convert YOLO-format detections from tile coordinates to original image coordinates.
    boxes: list of (cls_id, conf, x1_tile, y1_tile, x2_tile, y2_tile) in pixel coords
    Returns: list of (cls_id, conf, x1_orig, y1_orig, x2_orig, y2_orig) clipped to image bounds
    """
    mapped = []
    for cls_id, conf, x1, y1, x2, y2 in boxes:
        x1_orig = x1 + tile_x1
        y1_orig = y1 + tile_y1
        x2_orig = x2 + tile_x1
        y2_orig = y2 + tile_y1
        # Clip to image bounds
        x1_orig = max(0, min(x1_orig, img_w))
        y1_orig = max(0, min(y1_orig, img_h))
        x2_orig = max(0, min(x2_orig, img_w))
        y2_orig = max(0, min(y2_orig, img_h))
        if x2_orig > x1_orig and y2_orig > y1_orig:
            mapped.append((cls_id, conf, x1_orig, y1_orig, x2_orig, y2_orig))
    return mapped


def compute_iou(box1, box2):
    """Compute IoU between two boxes (x1, y1, x2, y2)."""
    x1 = max(box1[0], box2[0])
    y1 = max(box1[1], box2[1])
    x2 = min(box1[2], box2[2])
    y2 = min(box1[3], box2[3])
    inter = max(0, x2 - x1) * max(0, y2 - y1)
    area1 = (box1[2] - box1[0]) * (box1[3] - box1[1])
    area2 = (box2[2] - box2[0]) * (box2[3] - box2[1])
    union = area1 + area2 - inter
    return inter / union if union > 0 else 0


def weighted_nms(detections, iou_threshold=MERGE_IOU_THRESHOLD):
    """Apply per-class weighted NMS to merge cross-tile duplicate detections.
    detections: list of (cls_id, conf, x1, y1, x2, y2)
    Returns: merged detections
    """
    if not detections:
        return []

    # Group by class
    class_dets = defaultdict(list)
    for det in detections:
        class_dets[det[0]].append(det)

    merged = []
    for cls_id, dets in class_dets.items():
        # Sort by confidence (descending)
        dets = sorted(dets, key=lambda x: x[1], reverse=True)

        keep = []
        while dets:
            best = dets.pop(0)
            keep.append(best)
            remaining = []
            for det in dets:
                iou = compute_iou(best[2:6], det[2:6])
                if iou < iou_threshold:
                    remaining.append(det)
                # else: suppress (duplicate from overlapping tile)
            dets = remaining

        merged.extend(keep)

    return merged


def parse_yolo_labels(label_path, img_w, img_h):
    """Parse YOLO label file to (cls_id, x1, y1, x2, y2) in pixel coordinates."""
    boxes = []
    if not label_path.exists():
        return boxes
    for line in open(label_path).readlines():
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


def compute_ap(recalls, precisions):
    """Compute AP using 101-point interpolation (COCO-style)."""
    recalls = np.array(recalls)
    precisions = np.array(precisions)

    # Prepend/append sentinel values
    recalls = np.concatenate(([0.0], recalls, [1.0]))
    precisions = np.concatenate(([1.0], precisions, [0.0]))

    # Make precision monotonically decreasing
    for i in range(len(precisions) - 2, -1, -1):
        precisions[i] = max(precisions[i], precisions[i + 1])

    # 101-point interpolation
    ap = 0.0
    for t in np.linspace(0, 1, 101):
        p = precisions[recalls >= t]
        if len(p) > 0:
            ap += np.max(p)
    return ap / 101


def evaluate_detections(all_predictions, all_ground_truths, iou_threshold=0.5):
    """Compute per-class Precision, Recall, AP at given IoU threshold."""
    results = {}

    for cls_id in sorted(CLASS_NAMES.keys()):
        # Collect all predictions and GTs for this class
        preds = []  # (image_idx, conf, x1, y1, x2, y2)
        gts = defaultdict(list)  # image_idx -> [(x1, y1, x2, y2)]
        n_gt = 0

        for img_idx in range(len(all_ground_truths)):
            for gt in all_ground_truths[img_idx]:
                if gt[0] == cls_id:
                    gts[img_idx].append(gt[1:5])
                    n_gt += 1

            for pred in all_predictions[img_idx]:
                if pred[0] == cls_id:
                    preds.append((img_idx, pred[1], pred[2], pred[3], pred[4], pred[5]))

        if n_gt == 0:
            results[cls_id] = {'P': 0, 'R': 0, 'AP': 0, 'F1': 0, 'n_gt': 0, 'n_pred': len(preds)}
            continue

        # Sort predictions by confidence
        preds = sorted(preds, key=lambda x: x[1], reverse=True)

        # Match predictions to ground truths
        tp = np.zeros(len(preds))
        fp = np.zeros(len(preds))
        matched_gt = defaultdict(set)  # image_idx -> set of matched GT indices

        for pred_idx, pred in enumerate(preds):
            img_idx = pred[0]
            pred_box = pred[2:6]
            gt_boxes = gts[img_idx]

            best_iou = 0
            best_gt_idx = -1
            for gt_idx, gt_box in enumerate(gt_boxes):
                iou = compute_iou(pred_box, gt_box)
                if iou > best_iou:
                    best_iou = iou
                    best_gt_idx = gt_idx

            if best_iou >= iou_threshold and best_gt_idx not in matched_gt[img_idx]:
                tp[pred_idx] = 1
                matched_gt[img_idx].add(best_gt_idx)
            else:
                fp[pred_idx] = 1

        # Compute precision-recall curve
        tp_cum = np.cumsum(tp)
        fp_cum = np.cumsum(fp)
        recalls_curve = tp_cum / n_gt
        precisions_curve = tp_cum / (tp_cum + fp_cum)

        ap = compute_ap(recalls_curve.tolist(), precisions_curve.tolist())

        # Final P/R at optimal F1 threshold
        f1_scores = 2 * precisions_curve * recalls_curve / (precisions_curve + recalls_curve + 1e-16)
        best_f1_idx = np.argmax(f1_scores) if len(f1_scores) > 0 else 0

        results[cls_id] = {
            'P': float(precisions_curve[best_f1_idx]) if len(precisions_curve) > 0 else 0,
            'R': float(recalls_curve[best_f1_idx]) if len(recalls_curve) > 0 else 0,
            'AP': float(ap),
            'n_gt': n_gt,
            'n_pred': len(preds),
            'F1': float(f1_scores[best_f1_idx]) if len(f1_scores) > 0 else 0,
        }

    return results


def run_tiling_poc():
    print("=" * 80)
    print(" 🔬 EXPERIMENT 3: TILED/PATCH-BASED DETECTION PoC")
    print("=" * 80)
    print()
    print(f" Tile Size:    {TILE_SIZE}×{TILE_SIZE}")
    print(f" Overlap:      {TILE_OVERLAP*100:.0f}%")
    print(f" Stride:       {TILE_STRIDE} px")
    print(f" Conf Thresh:  {CONF_THRESHOLD}")
    print(f" Merge IoU:    {MERGE_IOU_THRESHOLD}")
    print(f" NMS IoU:      {NMS_IOU_THRESHOLD}")
    print(f" Model:        {MODEL_PATH.name}")
    print(f" Val Set:      {VAL_IMAGES} (SAME as all previous experiments)")
    print()

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Load model
    model = YOLO(str(MODEL_PATH))

    # Find all validation images
    val_images = sorted([
        f for f in VAL_IMAGES.glob("*.*")
        if f.suffix.lower() in ('.jpg', '.jpeg', '.png')
    ])
    print(f" Validation images: {len(val_images)}")

    all_predictions = []   # list of list of (cls_id, conf, x1, y1, x2, y2) per image
    all_ground_truths = [] # list of list of (cls_id, x1, y1, x2, y2) per image

    # Statistics
    total_tiles = 0
    total_raw_detections = 0
    total_merged_detections = 0
    total_inference_time = 0.0
    total_end_to_end_time = 0.0
    tiles_per_image = []

    for img_idx, img_path in enumerate(val_images):
        img = cv2.imread(str(img_path))
        if img is None:
            all_predictions.append([])
            all_ground_truths.append([])
            continue

        img_h, img_w = img.shape[:2]
        stem = img_path.stem

        e2e_start = time.time()

        # Generate tiles
        tiles = generate_tiles(img_w, img_h)
        n_tiles = len(tiles)
        total_tiles += n_tiles
        tiles_per_image.append(n_tiles)

        # Run YOLO on each tile and map detections to original coordinates
        all_tile_dets = []
        for tile_idx, (tx1, ty1, tx2, ty2) in enumerate(tiles):
            tile_img = extract_tile(img, tx1, ty1, tx2, ty2)

            inf_start = time.time()
            results = model.predict(
                tile_img,
                conf=CONF_THRESHOLD,
                iou=NMS_IOU_THRESHOLD,
                imgsz=TILE_SIZE,
                verbose=False,
                device=0
            )
            inf_time = time.time() - inf_start
            total_inference_time += inf_time
            if results and len(results) > 0:
                result = results[0]
                if result.boxes is not None and len(result.boxes) > 0:
                    for box in result.boxes:
                        cls_id = int(box.cls[0])
                        conf = float(box.conf[0])
                        x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                        # Map to original coordinates
                        x1_orig = float(x1) + tx1
                        y1_orig = float(y1) + ty1
                        x2_orig = float(x2) + tx1
                        y2_orig = float(y2) + ty1
                        # Clip
                        x1_orig = max(0, min(x1_orig, img_w))
                        y1_orig = max(0, min(y1_orig, img_h))
                        x2_orig = max(0, min(x2_orig, img_w))
                        y2_orig = max(0, min(y2_orig, img_h))
                        if x2_orig > x1_orig and y2_orig > y1_orig:
                            all_tile_dets.append((cls_id, conf, x1_orig, y1_orig, x2_orig, y2_orig))

        total_raw_detections += len(all_tile_dets)

        # Merge cross-tile duplicate detections
        merged = weighted_nms(all_tile_dets)
        total_merged_detections += len(merged)

        e2e_time = time.time() - e2e_start
        total_end_to_end_time += e2e_time

        all_predictions.append(merged)

        # Load ground truth
        label_path = VAL_LABELS / f"{stem}.txt"
        gt_boxes = parse_yolo_labels(label_path, img_w, img_h)
        all_ground_truths.append(gt_boxes)

        if (img_idx + 1) % 10 == 0 or img_idx == 0:
            print(f"  [{img_idx+1:3d}/{len(val_images)}] {stem}: "
                  f"{n_tiles} tiles, {len(all_tile_dets)} raw dets → {len(merged)} merged, "
                  f"{e2e_time:.2f}s")

    # Compute evaluation metrics
    print(f"\n{'='*80}")
    print(" 📊 EVALUATION RESULTS")
    print(f"{'='*80}")

    # AP@50
    results_50 = evaluate_detections(all_predictions, all_ground_truths, iou_threshold=0.5)

    # AP@50-95 (average over IoU thresholds 0.5 to 0.95 in steps of 0.05)
    ap_50_95_per_class = defaultdict(list)
    for iou_t in np.arange(0.5, 1.0, 0.05):
        results_t = evaluate_detections(all_predictions, all_ground_truths, iou_threshold=iou_t)
        for cls_id, metrics in results_t.items():
            ap_50_95_per_class[cls_id].append(metrics['AP'])

    # Compute mAP across all classes (excluding classes with 0 GT)
    valid_classes = [cls_id for cls_id, m in results_50.items() if m['n_gt'] > 0]
    map50 = np.mean([results_50[c]['AP'] for c in valid_classes]) if valid_classes else 0
    map50_95 = np.mean([np.mean(ap_50_95_per_class[c]) for c in valid_classes]) if valid_classes else 0

    # Overall P, R, F1 (macro average over valid classes)
    macro_P = np.mean([results_50[c]['P'] for c in valid_classes]) if valid_classes else 0
    macro_R = np.mean([results_50[c]['R'] for c in valid_classes]) if valid_classes else 0
    macro_F1 = 2 * macro_P * macro_R / (macro_P + macro_R) if (macro_P + macro_R) > 0 else 0

    print(f"\n  OVERALL METRICS (macro avg over {len(valid_classes)} classes with GT > 0):")
    print(f"    Precision:  {macro_P*100:.1f}%")
    print(f"    Recall:     {macro_R*100:.1f}%")
    print(f"    F1:         {macro_F1*100:.1f}%")
    print(f"    mAP@50:     {map50*100:.1f}%")
    print(f"    mAP@50-95:  {map50_95*100:.1f}%")

    print(f"\n  PER-CLASS RESULTS:")
    print(f"  {'Class':<25s} {'GT':>5s} {'Pred':>6s} {'P':>7s} {'R':>7s} {'F1':>7s} {'AP@50':>7s} {'AP@50-95':>9s}")
    print(f"  {'-'*25} {'-'*5} {'-'*6} {'-'*7} {'-'*7} {'-'*7} {'-'*7} {'-'*9}")

    for cls_id in sorted(CLASS_NAMES.keys()):
        m = results_50[cls_id]
        ap5095 = np.mean(ap_50_95_per_class[cls_id]) if ap_50_95_per_class[cls_id] else 0
        marker = " ◀ TARGET" if cls_id in [4, 5, 7] else ""
        print(f"  {CLASS_NAMES[cls_id]:<25s} {m['n_gt']:5d} {m['n_pred']:6d} "
              f"{m['P']*100:6.1f}% {m['R']*100:6.1f}% {m['F1']*100:6.1f}% "
              f"{m['AP']*100:6.1f}% {ap5095*100:8.1f}%{marker}")

    # Tiling and performance statistics
    print(f"\n  TILING STATISTICS:")
    print(f"    Tile size:            {TILE_SIZE}×{TILE_SIZE}")
    print(f"    Overlap:              {TILE_OVERLAP*100:.0f}%")
    print(f"    Stride:               {TILE_STRIDE} px")
    print(f"    Total tiles processed: {total_tiles}")
    print(f"    Tiles per image:      min={min(tiles_per_image)}, "
          f"median={sorted(tiles_per_image)[len(tiles_per_image)//2]}, "
          f"max={max(tiles_per_image)}, "
          f"mean={np.mean(tiles_per_image):.1f}")

    print(f"\n  DETECTION STATISTICS:")
    print(f"    Raw detections (before merge): {total_raw_detections}")
    print(f"    Merged detections (after NMS): {total_merged_detections}")
    print(f"    Duplicate ratio:               {total_raw_detections/max(total_merged_detections,1):.2f}x")

    print(f"\n  LATENCY:")
    avg_inf_per_tile = (total_inference_time / total_tiles * 1000) if total_tiles > 0 else 0
    avg_e2e_per_image = (total_end_to_end_time / len(val_images) * 1000) if len(val_images) > 0 else 0
    avg_tiles = np.mean(tiles_per_image)
    print(f"    Inference per tile:    {avg_inf_per_tile:.1f} ms")
    print(f"    End-to-end per image:  {avg_e2e_per_image:.0f} ms ({avg_e2e_per_image/1000:.2f}s)")
    print(f"    Avg tiles per image:   {avg_tiles:.1f}")
    print(f"    Effective FPS:         {1000/avg_e2e_per_image:.1f}" if avg_e2e_per_image > 0 else "")

    print(f"\n{'='*80}")
    print(f" BASELINE COMPARISON:")
    print(f"  Exp 0 (Batch 3, 640px): P=58.3%, R=42.4%, F1=49.1%, mAP@50=42.4%, mAP@50-95=19.1%")
    print(f"  Exp 1 (Balanced):       P=61.8%, R=43.0%, F1=50.7%, mAP@50=42.1%, mAP@50-95=18.7%")
    print(f"  Exp 2 (960px):          P=68.5%, R=41.3%, F1=51.5%, mAP@50=42.0%, mAP@50-95=18.7%")
    print(f"  Exp 3 (Tiling PoC):     P={macro_P*100:.1f}%, R={macro_R*100:.1f}%, "
          f"F1={macro_F1*100:.1f}%, mAP@50={map50*100:.1f}%, mAP@50-95={map50_95*100:.1f}%")
    print(f"{'='*80}")

    # Save results to JSON
    results_json = {
        'config': {
            'tile_size': TILE_SIZE,
            'overlap': TILE_OVERLAP,
            'stride': TILE_STRIDE,
            'conf_threshold': CONF_THRESHOLD,
            'merge_iou_threshold': MERGE_IOU_THRESHOLD,
        },
        'overall': {
            'precision': float(macro_P),
            'recall': float(macro_R),
            'f1': float(macro_F1),
            'map50': float(map50),
            'map50_95': float(map50_95),
        },
        'per_class': {
            CLASS_NAMES[cls_id]: {
                'precision': results_50[cls_id]['P'],
                'recall': results_50[cls_id]['R'],
                'f1': results_50[cls_id]['F1'],
                'ap50': results_50[cls_id]['AP'],
                'ap50_95': float(np.mean(ap_50_95_per_class[cls_id])) if ap_50_95_per_class[cls_id] else 0,
                'n_gt': results_50[cls_id]['n_gt'],
                'n_pred': results_50[cls_id]['n_pred'],
            }
            for cls_id in sorted(CLASS_NAMES.keys())
        },
        'tiling_stats': {
            'total_tiles': total_tiles,
            'tiles_per_image_mean': float(np.mean(tiles_per_image)),
            'raw_detections': total_raw_detections,
            'merged_detections': total_merged_detections,
            'avg_inference_per_tile_ms': avg_inf_per_tile,
            'avg_e2e_per_image_ms': avg_e2e_per_image,
        }
    }

    json_path = OUTPUT_DIR / "exp3_results.json"
    with open(json_path, 'w') as f:
        json.dump(results_json, f, indent=2)
    print(f"\n  Results saved to: {json_path}")


if __name__ == "__main__":
    run_tiling_poc()
