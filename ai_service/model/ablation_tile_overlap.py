"""
DentaVision AI — Tile Overlap & Stride Ablation (Experiment B)
=============================================================
Ablation on Overlap Density:
  - 30% Overlap (Stride = 448 px, ~17.1 tiles / image)
  - 40% Overlap (Stride = 384 px, ~24.3 tiles / image)
  - 50% Overlap (Stride = 320 px, ~35.0 tiles / image)

Evaluated on the exact same untouched 153 gold validation radiographs using candidate champion model.
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
MODEL_PATH = BASE_DIR / "ai_service/model/checkpoints/best_model_gold_tiled_30ep.pt"
OUTPUT_DIR = BASE_DIR / "runs/detect/ai_service/model/runs/overlap_ablation"

CLASS_NAMES = {
    0: "Implant", 1: "Prosthetic_restoration", 2: "Obturation",
    3: "Endodontic_treatment", 4: "Carious_lesion", 5: "Bone_resorbtion",
    6: "Impacted_tooth", 7: "Apical_periodontitis", 8: "Root_fragment",
    9: "Furcation_lesion", 10: "Apical_surgery", 11: "Root_resorption",
    12: "Orthodontic_device", 13: "Surgical_device"
}

TILE_SIZE = 640


def generate_tiles(img_w, img_h, stride):
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


def weighted_box_fusion(detections, iou_thresh=0.50):
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


def run_overlap_ablation():
    print("=" * 80)
    print(" 🔬 EXPERIMENT B: TILE OVERLAP & STRIDE DENSITY ABLATION")
    print("=" * 80)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    model = YOLO(str(MODEL_PATH))
    val_images = sorted(list(VAL_IMAGES.glob("*.jpg")) + list(VAL_IMAGES.glob("*.png")))
    # Pre-parse ground truth using exact dimensions of each validation image
    all_gts = []
    for p in val_images:
        im = cv2.imread(str(p))
        h, w = im.shape[:2]
        all_gts.append(parse_labels(VAL_LABELS / f"{p.stem}.txt", w, h))

    configs = [
        ("30% Overlap (Stride 448)", 448),
        ("40% Overlap (Stride 384)", 384),
        ("50% Overlap (Stride 320)", 320),
    ]

    ablation_summary = []

    for name, stride in configs:
        print(f"\n--- Testing Configuration: {name} ---")
        t0 = time.time()
        all_preds = []
        total_tiles = 0

        for img_idx, img_path in enumerate(val_images):
            img = cv2.imread(str(img_path))
            if img is None:
                all_preds.append([])
                continue

            img_h, img_w = img.shape[:2]
            tiles = generate_tiles(img_w, img_h, stride)
            total_tiles += len(tiles)

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
                        x1_orig = max(0, min(float(x1) + tx1, img_w))
                        y1_orig = max(0, min(float(y1) + ty1, img_h))
                        x2_orig = max(0, min(float(x2) + tx1, img_w))
                        y2_orig = max(0, min(float(y2) + ty1, img_h))
                        if x2_orig > x1_orig and y2_orig > y1_orig:
                            raw_dets.append((cls_id, conf, x1_orig, y1_orig, x2_orig, y2_orig))

            merged = weighted_box_fusion(raw_dets, iou_thresh=0.40)
            all_preds.append(merged)

        elapsed = time.time() - t0
        avg_tiles_per_img = total_tiles / len(val_images)
        latency_per_img = (elapsed / len(val_images)) * 1000

        # Evaluate metrics on true un-truncated PR curves
        res50 = evaluate_detections(all_preds, all_gts, iou_thresh=0.5)
        valid_classes = [c for c, m in res50.items() if m['n_gt'] > 0]
        mP = np.mean([res50[c]['P'] for c in valid_classes])
        mR = np.mean([res50[c]['R'] for c in valid_classes])
        mF1 = 2 * mP * mR / (mP + mR) if (mP + mR) > 0 else 0
        mAP50 = np.mean([res50[c]['AP'] for c in valid_classes])

        result_row = {
            'config': name, 'stride': stride,
            'avg_tiles': avg_tiles_per_img, 'latency_ms': latency_per_img,
            'mP': mP, 'mR': mR, 'mF1': mF1, 'mAP50': mAP50,
            'caries_r': res50[4]['R'], 'caries_ap': res50[4]['AP'],
            'bone_r': res50[5]['R'], 'bone_ap': res50[5]['AP'],
            'apical_r': res50[7]['R'], 'apical_ap': res50[7]['AP'],
            'furcation_r': res50[9]['R'], 'furcation_ap': res50[9]['AP'],
        }
        ablation_summary.append(result_row)

        print(f"  Avg Tiles/Img: {avg_tiles_per_img:.1f} | Latency: {latency_per_img:.0f} ms")
        print(f"  mAP@50: {mAP50*100:5.1f}% | Recall: {mR*100:5.1f}% | Precision: {mP*100:5.1f}% | F1: {mF1*100:5.1f}%")
        print(f"  Caries Recall: {res50[4]['R']*100:5.1f}% (AP: {res50[4]['AP']*100:5.1f}%)")
        print(f"  Bone Recall:   {res50[5]['R']*100:5.1f}% (AP: {res50[5]['AP']*100:5.1f}%)")
        print(f"  Apical Recall: {res50[7]['R']*100:5.1f}% (AP: {res50[7]['AP']*100:5.1f}%)")
        print(f"  Furcation R:   {res50[9]['R']*100:5.1f}% (AP: {res50[9]['AP']*100:5.1f}%)")

    # Output master summary table
    print("\n" + "=" * 80)
    print(" 📊 MASTER OVERLAP ABLATION SUMMARY")
    print("=" * 80)
    print(f" {'Configuration':<26s} {'Tiles':>6s} {'Latency':>9s} {'P':>6s} {'R':>6s} {'F1':>6s} {'mAP50':>7s} {'Caries R':>9s} {'Bone R':>8s} {'Apical R':>9s}")
    print(f" {'-'*26} {'-'*6} {'-'*9} {'-'*6} {'-'*6} {'-'*6} {'-'*7} {'-'*9} {'-'*8} {'-'*9}")
    for r in ablation_summary:
        print(f" {r['config']:<26s} {r['avg_tiles']:6.1f} {r['latency_ms']:8.0f}ms "
              f"{r['mP']*100:5.1f}% {r['mR']*100:5.1f}% {r['mF1']*100:5.1f}% {r['mAP50']*100:6.1f}% "
              f"{r['caries_r']*100:8.1f}% {r['bone_r']*100:7.1f}% {r['apical_r']*100:8.1f}%")

    with open(OUTPUT_DIR / "overlap_ablation_results.json", "w") as f:
        json.dump(ablation_summary, f, indent=2)


if __name__ == "__main__":
    run_overlap_ablation()
