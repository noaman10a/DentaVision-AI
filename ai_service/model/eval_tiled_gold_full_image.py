"""
DentaVision AI — Full-Image Evaluator for Tile-Trained YOLO11m
==============================================================
Runs the tile-trained YOLO11m model over full panoramic radiographs,
merges detections with Weighted NMS, and evaluates against untouched
full-image gold validation annotations.
"""

import os
import time
import json
import cv2
import numpy as np
from pathlib import Path
from collections import defaultdict
from ultralytics import YOLO

BASE_DIR = Path("d:/Collage/Major Project/DentaVision-AI")
VAL_IMAGES = BASE_DIR / "dataset/DentaVision_Datasets/01_Dental_Condition_Detection/panoramic_radiography_yolo_dataset_14_classes/valid/images"
VAL_LABELS = BASE_DIR / "dataset/DentaVision_Datasets/01_Dental_Condition_Detection/panoramic_radiography_yolo_dataset_14_classes/valid/labels"
MODEL_PATH = BASE_DIR / "runs/detect/ai_service/model/runs/exp_tiled_gold_yolo11m/weights/best.pt"

CLASS_NAMES = {
    0: "Implant", 1: "Prosthetic_restoration", 2: "Obturation",
    3: "Endodontic_treatment", 4: "Carious_lesion", 5: "Bone_resorbtion",
    6: "Impacted_tooth", 7: "Apical_periodontitis", 8: "Root_fragment",
    9: "Furcation_lesion", 10: "Apical_surgery", 11: "Root_resorption",
    12: "Orthodontic_device", 13: "Surgical_device"
}

TILE_SIZE = 640
STRIDE = 448
CONF_THRESH = 0.15
NMS_IOU = 0.45
MERGE_IOU = 0.50


def generate_tiles(img_w, img_h, tile_size=TILE_SIZE, stride=STRIDE):
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


def weighted_nms(detections, iou_thresh=MERGE_IOU):
    if not detections:
        return []
    class_dets = defaultdict(list)
    for d in detections:
        class_dets[d[0]].append(d)
    merged = []
    for cls_id, dets in class_dets.items():
        dets = sorted(dets, key=lambda x: x[1], reverse=True)
        keep = []
        while dets:
            best = dets.pop(0)
            keep.append(best)
            dets = [d for d in dets if compute_iou(best[2:6], d[2:6]) < iou_thresh]
        merged.extend(keep)
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


def compute_ap(recalls, precisions):
    recalls = np.concatenate(([0.0], np.array(recalls), [1.0]))
    precisions = np.concatenate(([1.0], np.array(precisions), [0.0]))
    for i in range(len(precisions) - 2, -1, -1):
        precisions[i] = max(precisions[i], precisions[i + 1])
    ap = 0.0
    for t in np.linspace(0, 1, 101):
        p = precisions[recalls >= t]
        if len(p) > 0:
            ap += np.max(p)
    return ap / 101


def evaluate_detections(all_preds, all_gts, iou_thresh=0.5):
    results = {}
    for cls_id in sorted(CLASS_NAMES.keys()):
        preds = []
        gts = defaultdict(list)
        n_gt = 0
        for idx in range(len(all_gts)):
            for gt in all_gts[idx]:
                if gt[0] == cls_id:
                    gts[idx].append(gt[1:5])
                    n_gt += 1
            for p in all_preds[idx]:
                if p[0] == cls_id:
                    preds.append((idx, p[1], p[2], p[3], p[4], p[5]))

        if n_gt == 0:
            results[cls_id] = {'P': 0, 'R': 0, 'AP': 0, 'F1': 0, 'n_gt': 0, 'n_pred': len(preds)}
            continue

        preds = sorted(preds, key=lambda x: x[1], reverse=True)
        tp = np.zeros(len(preds))
        fp = np.zeros(len(preds))
        matched = defaultdict(set)

        for p_idx, p in enumerate(preds):
            img_idx = p[0]
            p_box = p[2:6]
            best_iou, best_gt_idx = 0, -1
            for g_idx, g_box in enumerate(gts[img_idx]):
                iou = compute_iou(p_box, g_box)
                if iou > best_iou:
                    best_iou = iou
                    best_gt_idx = g_idx
            if best_iou >= iou_thresh and best_gt_idx not in matched[img_idx]:
                tp[p_idx] = 1
                matched[img_idx].add(best_gt_idx)
            else:
                fp[p_idx] = 1

        tp_cum = np.cumsum(tp)
        fp_cum = np.cumsum(fp)
        r_curve = tp_cum / n_gt
        p_curve = tp_cum / (tp_cum + fp_cum)
        ap = compute_ap(r_curve.tolist(), p_curve.tolist())
        f1_curve = 2 * p_curve * r_curve / (p_curve + r_curve + 1e-16)
        best_f1_idx = np.argmax(f1_curve) if len(f1_curve) > 0 else 0

        results[cls_id] = {
            'P': float(p_curve[best_f1_idx]) if len(p_curve) > 0 else 0,
            'R': float(r_curve[best_f1_idx]) if len(r_curve) > 0 else 0,
            'AP': float(ap),
            'F1': float(f1_curve[best_f1_idx]) if len(f1_curve) > 0 else 0,
            'n_gt': n_gt,
            'n_pred': len(preds),
        }
    return results


def run_full_eval():
    print("=" * 80)
    print(" 🌟 FULL-IMAGE EVALUATION OF TILE-TRAINED YOLO11m")
    print("=" * 80)
    print(f" Model: {MODEL_PATH}")

    if not MODEL_PATH.exists():
        print(f"❌ Checkpoint missing at {MODEL_PATH}")
        return

    model = YOLO(str(MODEL_PATH))
    val_images = sorted(list(VAL_IMAGES.glob("*.jpg")) + list(VAL_IMAGES.glob("*.png")))
    print(f" Validation Images: {len(val_images)}")

    all_preds = []
    all_gts = []

    for img_idx, img_path in enumerate(val_images):
        img = cv2.imread(str(img_path))
        if img is None:
            all_preds.append([])
            all_gts.append([])
            continue

        img_h, img_w = img.shape[:2]
        stem = img_path.stem
        tiles = generate_tiles(img_w, img_h)

        all_tile_dets = []
        for tx1, ty1, tx2, ty2 in tiles:
            tile_img = img[ty1:ty2, tx1:tx2]
            th, tw = tile_img.shape[:2]
            if th < TILE_SIZE or tw < TILE_SIZE:
                padded = np.zeros((TILE_SIZE, TILE_SIZE, 3), dtype=np.uint8)
                padded[:th, :tw] = tile_img
                tile_img = padded

            res = model.predict(tile_img, conf=CONF_THRESH, iou=NMS_IOU, imgsz=TILE_SIZE, verbose=False, device=0)
            if res and len(res) > 0 and res[0].boxes is not None:
                for b in res[0].boxes:
                    cls_id = int(b.cls[0])
                    conf = float(b.conf[0])
                    x1, y1, x2, y2 = b.xyxy[0].cpu().numpy()
                    x1_orig = max(0, min(float(x1) + tx1, img_w))
                    y1_orig = max(0, min(float(y1) + ty1, img_h))
                    x2_orig = max(0, min(float(x2) + tx1, img_w))
                    y2_orig = max(0, min(float(y2) + ty1, img_h))
                    if x2_orig > x1_orig and y2_orig > y1_orig:
                        all_tile_dets.append((cls_id, conf, x1_orig, y1_orig, x2_orig, y2_orig))

        merged = weighted_nms(all_tile_dets)
        all_preds.append(merged)
        all_gts.append(parse_labels(VAL_LABELS / f"{stem}.txt", img_w, img_h))

        if (img_idx + 1) % 25 == 0 or (img_idx + 1) == len(val_images):
            print(f"  [{img_idx+1:3d}/{len(val_images)}] Evaluated {stem}")

    res50 = evaluate_detections(all_preds, all_gts, iou_thresh=0.5)
    valid_classes = [c for c, m in res50.items() if m['n_gt'] > 0]
    mP = np.mean([res50[c]['P'] for c in valid_classes])
    mR = np.mean([res50[c]['R'] for c in valid_classes])
    mF1 = 2 * mP * mR / (mP + mR) if (mP + mR) > 0 else 0
    mAP50 = np.mean([res50[c]['AP'] for c in valid_classes])

    print(f"\n{'='*80}")
    print(f" FULL-IMAGE EVALUATION RESULTS (TILE-TRAINED YOLO11m)")
    print(f"{'='*80}")
    print(f"  Precision: {mP*100:.1f}%")
    print(f"  Recall:    {mR*100:.1f}%")
    print(f"  F1:        {mF1*100:.1f}%")
    print(f"  mAP@50:    {mAP50*100:.1f}%")
    print()
    print(f"  {'Class':<25s} {'GT':>5s} {'Pred':>6s} {'P':>7s} {'R':>7s} {'F1':>7s} {'AP@50':>7s}")
    print(f"  {'-'*25} {'-'*5} {'-'*6} {'-'*7} {'-'*7} {'-'*7} {'-'*7}")
    for c in sorted(CLASS_NAMES.keys()):
        m = res50[c]
        print(f"  {CLASS_NAMES[c]:<25s} {m['n_gt']:5d} {m['n_pred']:6d} {m['P']*100:6.1f}% {m['R']*100:6.1f}% {m['F1']*100:6.1f}% {m['AP']*100:6.1f}%")
    print(f"{'='*80}")


if __name__ == "__main__":
    run_full_eval()
