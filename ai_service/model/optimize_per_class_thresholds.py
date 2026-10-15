"""
DentaVision AI — Per-Class Threshold Optimization & F1 Calibration (Experiment D)
==================================================================================
Calibrates per-class operating confidence thresholds on full panoramic radiographs
using Weighted Box Fusion detections to find the mathematically optimal F1 balance
for each of the 14 dental conditions.
"""

import json
import cv2
import numpy as np
from pathlib import Path
from collections import defaultdict
from ultralytics import YOLO

BASE_DIR = Path("d:/Collage/Major Project/DentaVision-AI")
VAL_IMAGES = BASE_DIR / "dataset/DentaVision_Datasets/01_Dental_Condition_Detection/panoramic_radiography_yolo_dataset_14_classes/valid/images"
VAL_LABELS = BASE_DIR / "dataset/DentaVision_Datasets/01_Dental_Condition_Detection/panoramic_radiography_yolo_dataset_14_classes/valid/labels"
MODEL_PATH = BASE_DIR / "ai_service/model/checkpoints/best_model_gold_tiled_30ep.pt"
OUTPUT_DIR = BASE_DIR / "runs/detect/ai_service/model/runs/threshold_optimization"

CLASS_NAMES = {
    0: "Implant", 1: "Prosthetic_restoration", 2: "Obturation",
    3: "Endodontic_treatment", 4: "Carious_lesion", 5: "Bone_resorbtion",
    6: "Impacted_tooth", 7: "Apical_periodontitis", 8: "Root_fragment",
    9: "Furcation_lesion", 10: "Apical_surgery", 11: "Root_resorption",
    12: "Orthodontic_device", 13: "Surgical_device"
}

TILE_SIZE = 640


def generate_tiles(img_w, img_h, stride=448):
    tiles = []
    for y in range(0, img_h, stride):
        for x in range(0, img_w, stride):
            x1 = x
            y1 = y
            x2 = min(x + TILE_SIZE, img_w)
            y2 = min(y + TILE_SIZE, img_h)
            if x2 - x1 < TILE_SIZE and x1 > 0:
                x1 = max(0, x2 - TILE_SIZE)
            if y2 - y1 < TILE_SIZE and y1 > 0:
                y1 = max(0, y2 - TILE_SIZE)
            tiles.append((x1, y1, x2, y2))
    return sorted(list(set(tiles)))


def compute_iou(b1, b2):
    x1 = max(b1[0], b2[0])
    y1 = max(b1[1], b2[1])
    x2 = min(b1[2], b2[2])
    y2 = min(b1[3], b2[3])
    inter = max(0, x2 - x1) * max(0, y2 - y1)
    a1 = (b1[2] - b1[0]) * (b1[3] - b1[1])
    a2 = (b2[2] - b2[0]) * (b2[3] - b2[1])
    union = a1 + a2 - inter
    return inter / union if union > 0 else 0


def weighted_box_fusion(detections, iou_thresh=0.40):
    if not detections:
        return []
    class_dets = defaultdict(list)
    for d in detections:
        class_dets[d[0]].append(d)
    merged = []
    for cls_id, dets in class_dets.items():
        dets = sorted(dets, key=lambda x: x[1], reverse=True)
        clusters = []
        while dets:
            seed = dets.pop(0)
            cluster = [seed]
            remaining = []
            for d in dets:
                if compute_iou(seed[2:6], d[2:6]) >= iou_thresh:
                    cluster.append(d)
                else:
                    remaining.append(d)
            dets = remaining
            clusters.append(cluster)

        for cl in clusters:
            confs = np.array([c[1] for c in cl])
            weights = confs / np.sum(confs)
            avg_x1 = np.sum([c[2] * w for c, w in zip(cl, weights)])
            avg_y1 = np.sum([c[3] * w for c, w in zip(cl, weights)])
            avg_x2 = np.sum([c[4] * w for c, w in zip(cl, weights)])
            avg_y2 = np.sum([c[5] * w for c, w in zip(cl, weights)])
            merged.append((cls_id, float(np.max(confs)), float(avg_x1), float(avg_y1), float(avg_x2), float(avg_y2)))
    return merged


def parse_labels(label_path, img_w, img_h):
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


def run_threshold_optimization():
    print("=" * 80)
    print(" 🎯 EXPERIMENT D: PER-CLASS THRESHOLD OPTIMIZATION & CALIBRATION")
    print("=" * 80)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    model = YOLO(str(MODEL_PATH))
    val_images = sorted(list(VAL_IMAGES.glob("*.jpg")) + list(VAL_IMAGES.glob("*.png")))
    all_gts = []
    all_merged_preds = []

    print("Extracting multi-tile detections with Weighted Box Fusion...")
    for img_path in val_images:
        img = cv2.imread(str(img_path))
        if img is None:
            continue
        h, w = img.shape[:2]
        all_gts.append(parse_labels(VAL_LABELS / f"{img_path.stem}.txt", w, h))

        tiles = generate_tiles(w, h, stride=448)
        raw_dets = []
        for tx1, ty1, tx2, ty2 in tiles:
            tile_img = img[ty1:ty2, tx1:tx2]
            th, tw = tile_img.shape[:2]
            if th < TILE_SIZE or tw < TILE_SIZE:
                padded = np.zeros((TILE_SIZE, TILE_SIZE, 3), dtype=np.uint8)
                padded[:th, :tw] = tile_img
                tile_img = padded
            res = model.predict(tile_img, conf=0.001, iou=0.45, imgsz=640, verbose=False, device=0)
            if res and len(res) > 0 and res[0].boxes is not None:
                for b in res[0].boxes:
                    cls_id = int(b.cls[0])
                    conf = float(b.conf[0])
                    x1, y1, x2, y2 = b.xyxy[0].cpu().numpy()
                    x1_orig = max(0, min(float(x1) + tx1, w))
                    y1_orig = max(0, min(float(y1) + ty1, h))
                    x2_orig = max(0, min(float(x2) + tx1, w))
                    y2_orig = max(0, min(float(y2) + ty1, h))
                    if x2_orig > x1_orig and y2_orig > y1_orig:
                        raw_dets.append((cls_id, conf, x1_orig, y1_orig, x2_orig, y2_orig))

        all_merged_preds.append(weighted_box_fusion(raw_dets, iou_thresh=0.40))

    print(f" Extracted detections for {len(val_images)} radiographs.")
    print("\nOptimizing per-class operating confidence thresholds (sweeping 0.05 to 0.60)...")

    threshold_candidates = np.arange(0.05, 0.65, 0.025)
    optimal_thresholds = {}
    class_reports = {}

    print(f"\n {'Class Name':<25s} {'GT':>5s} {'Opt Conf':>9s} {'Precision':>10s} {'Recall':>8s} {'F1-Score':>9s}")
    print(f" {'-'*25} {'-'*5} {'-'*9} {'-'*10} {'-'*8} {'-'*9}")

    for cls_id in sorted(CLASS_NAMES.keys()):
        n_gt = sum(sum(1 for g in gts if g[0] == cls_id) for gts in all_gts)
        if n_gt == 0:
            optimal_thresholds[cls_id] = 0.25
            class_reports[cls_id] = {'P': 0, 'R': 0, 'F1': 0, 'conf': 0.25, 'n_gt': 0}
            continue

        best_f1 = -1
        best_p = 0
        best_r = 0
        best_conf = 0.25

        for c_thresh in threshold_candidates:
            tp, fp = 0, 0
            for idx in range(len(all_gts)):
                p_cls = [p[2:6] for p in all_merged_preds[idx] if p[0] == cls_id and p[1] >= c_thresh]
                gt_cls = [g[1:5] for g in all_gts[idx] if g[0] == cls_id]
                matched = set()
                for p_box in p_cls:
                    best_iou, best_idx = 0, -1
                    for g_idx, g_box in enumerate(gt_cls):
                        iou = compute_iou(p_box, g_box)
                        if iou > best_iou:
                            best_iou = iou
                            best_idx = g_idx
                    if best_iou >= 0.50 and best_idx not in matched:
                        tp += 1
                        matched.add(best_idx)
                    else:
                        fp += 1

            p = tp / (tp + fp) if (tp + fp) > 0 else 0
            r = tp / n_gt if n_gt > 0 else 0
            f1 = 2 * p * r / (p + r) if (p + r) > 0 else 0

            if f1 > best_f1:
                best_f1 = f1
                best_p = p
                best_r = r
                best_conf = float(c_thresh)

        optimal_thresholds[cls_id] = best_conf
        class_reports[cls_id] = {'P': best_p, 'R': best_r, 'F1': best_f1, 'conf': best_conf, 'n_gt': n_gt}
        print(f" {CLASS_NAMES[cls_id]:<25s} {n_gt:5d} {best_conf:8.3f} {best_p*100:9.1f}% {best_r*100:7.1f}% {best_f1*100:8.1f}%")

    valid_classes = [c for c, r in class_reports.items() if r['n_gt'] > 0]
    macro_P = np.mean([class_reports[c]['P'] for c in valid_classes])
    macro_R = np.mean([class_reports[c]['R'] for c in valid_classes])
    macro_F1 = 2 * macro_P * macro_R / (macro_P + macro_R) if (macro_P + macro_R) > 0 else 0

    print("\n" + "=" * 80)
    print(" 🌟 OVERALL MACRO RESULTS WITH CALIBRATED PER-CLASS THRESHOLDS")
    print("=" * 80)
    print(f"  Macro-Precision: {macro_P*100:.1f}%")
    print(f"  Macro-Recall:    {macro_R*100:.1f}%")
    print(f"  Macro-F1 Score:  {macro_F1*100:.1f}%")
    print("=" * 80)

    # Save to JSON
    calib_json = {
        'optimal_thresholds': {CLASS_NAMES[k]: v for k, v in optimal_thresholds.items()},
        'optimal_thresholds_by_id': {k: v for k, v in optimal_thresholds.items()},
        'macro_metrics': {'precision': macro_P, 'recall': macro_R, 'f1': macro_F1},
        'class_reports': {CLASS_NAMES[k]: class_reports[k] for k in sorted(CLASS_NAMES.keys())}
    }
    with open(OUTPUT_DIR / "per_class_threshold_calibration.json", "w") as f:
        json.dump(calib_json, f, indent=2)
    print(f"\n Calibration saved to: {OUTPUT_DIR / 'per_class_threshold_calibration.json'}")


if __name__ == "__main__":
    run_threshold_optimization()
