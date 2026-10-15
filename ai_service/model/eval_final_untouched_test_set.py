"""
DentaVision AI — Final Untouched Test Set Benchmark (Phase 9)
============================================================
Executes a single, unbiased final evaluation on the 100 untouched test radiographs
(1,369 gold human annotations, 0% train/val leakage) using the frozen production pipeline:
  - Architecture: YOLO11m Gold Tiled (30 epochs)
  - Tile Config: 640x640, Stride 448 (30% Overlap)
  - Merging: Weighted Box Fusion (IoU=0.40)
  - Un-truncated PR integration down to conf=0.001
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
TEST_IMAGES = BASE_DIR / "dataset/DentaVision_Datasets/01_Dental_Condition_Detection/panoramic_radiography_yolo_dataset_14_classes/test/images"
TEST_LABELS = BASE_DIR / "dataset/DentaVision_Datasets/01_Dental_Condition_Detection/panoramic_radiography_yolo_dataset_14_classes/test/labels"
MODEL_PATH = BASE_DIR / "ai_service/model/checkpoints/best_model_gold_tiled_30ep.pt"
OUTPUT_DIR = BASE_DIR / "runs/detect/ai_service/model/runs/final_test_benchmark"

CLASS_NAMES = {
    0: "Implant", 1: "Prosthetic_restoration", 2: "Obturation",
    3: "Endodontic_treatment", 4: "Carious_lesion", 5: "Bone_resorbtion",
    6: "Impacted_tooth", 7: "Apical_periodontitis", 8: "Root_fragment",
    9: "Furcation_lesion", 10: "Apical_surgery", 11: "Root_resorption",
    12: "Orthodontic_device", 13: "Surgical_device"
}

TILE_SIZE = 640
STRIDE = 448


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
            results[cls_id] = {'P': 0, 'R': 0, 'AP': 0, 'F1': 0, 'TP': 0, 'FP': 0, 'FN': 0, 'n_gt': 0, 'n_pred': len(preds)}
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

        tp_total = int(tp_cum[best_f1_idx]) if len(tp_cum) > 0 else 0
        fp_total = int(fp_cum[best_f1_idx]) if len(fp_cum) > 0 else 0
        fn_total = n_gt - tp_total

        results[cls_id] = {
            'P': float(p_curve[best_f1_idx]) if len(p_curve) > 0 else 0,
            'R': float(r_curve[best_f1_idx]) if len(r_curve) > 0 else 0,
            'AP': float(ap),
            'F1': float(f1_curve[best_f1_idx]) if len(f1_curve) > 0 else 0,
            'TP': tp_total,
            'FP': fp_total,
            'FN': fn_total,
            'n_gt': n_gt,
            'n_pred': len(preds),
        }
    return results


def run_final_test_benchmark():
    print("=" * 80)
    print(" 🏆 PHASE 9: FINAL UNTOUCHED TEST SET EVALUATION (100 RADIOGRAPHS)")
    print("=" * 80)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    model = YOLO(str(MODEL_PATH))
    test_images = sorted(list(TEST_IMAGES.glob("*.jpg")) + list(TEST_IMAGES.glob("*.png")))
    print(f" Loaded Model: {MODEL_PATH.name}")
    print(f" Test Set Size: {len(test_images)} radiographs")
    print(f" Pipeline: 640x640 Native Tiles, 30% Overlap (Stride 448), WBF (IoU=0.40)")
    print()

    all_preds = []
    all_gts = []
    total_tiles = 0
    t0 = time.time()

    for img_idx, img_path in enumerate(test_images):
        img = cv2.imread(str(img_path))
        if img is None:
            continue
        h, w = img.shape[:2]
        all_gts.append(parse_labels(TEST_LABELS / f"{img_path.stem}.txt", w, h))

        tiles = generate_tiles(w, h, stride=448)
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
                    x1_orig = max(0, min(float(x1) + tx1, w))
                    y1_orig = max(0, min(float(y1) + ty1, h))
                    x2_orig = max(0, min(float(x2) + tx1, w))
                    y2_orig = max(0, min(float(y2) + ty1, h))
                    if x2_orig > x1_orig and y2_orig > y1_orig:
                        raw_dets.append((cls_id, conf, x1_orig, y1_orig, x2_orig, y2_orig))

        all_preds.append(weighted_box_fusion(raw_dets, iou_thresh=0.40))

        if (img_idx + 1) % 25 == 0 or (img_idx + 1) == len(test_images):
            print(f"  [{img_idx+1:3d}/{len(test_images)}] Processed {img_path.stem}")

    total_time = time.time() - t0
    avg_latency_per_img = (total_time / len(test_images)) * 1000
    avg_tiles_per_img = total_tiles / len(test_images)

    # Evaluate Metrics at IoU=0.50
    res50 = evaluate_detections(all_preds, all_gts, iou_thresh=0.5)
    valid_classes = [c for c, m in res50.items() if m['n_gt'] > 0]
    mP = np.mean([res50[c]['P'] for c in valid_classes])
    mR = np.mean([res50[c]['R'] for c in valid_classes])
    mF1 = 2 * mP * mR / (mP + mR) if (mP + mR) > 0 else 0
    mAP50 = np.mean([res50[c]['AP'] for c in valid_classes])

    print("\n" + "=" * 95)
    print(" 🌟 FINAL UNTOUCHED TEST SET BENCHMARK RESULTS (100 OPGs, 1,369 GTs)")
    print("=" * 95)
    print(f"  Full Radiograph mAP@50  : {mAP50*100:.1f}%")
    print(f"  Overall Macro-Precision : {mP*100:.1f}%")
    print(f"  Overall Macro-Recall    : {mR*100:.1f}%")
    print(f"  Overall Macro-F1 Score  : {mF1*100:.1f}%")
    print(f"  Avg Latency per OPG     : {avg_latency_per_img:.0f} ms (~{1000/avg_latency_per_img:.1f} OPGs/sec)")
    print(f"  Avg Tiles per OPG       : {avg_tiles_per_img:.1f} tiles")
    print()
    print(f" {'Class Name':<25s} {'GT':>5s} {'Pred':>6s} {'TP':>5s} {'FP':>5s} {'FN':>5s} {'Precision':>10s} {'Recall':>8s} {'F1':>7s} {'AP@50':>8s}")
    print(f" {'-'*25} {'-'*5} {'-'*6} {'-'*5} {'-'*5} {'-'*5} {'-'*10} {'-'*8} {'-'*7} {'-'*8}")

    for c in sorted(CLASS_NAMES.keys()):
        m = res50[c]
        print(f" {CLASS_NAMES[c]:<25s} {m['n_gt']:5d} {m['n_pred']:6d} {m['TP']:5d} {m['FP']:5d} {m['FN']:5d} "
              f"{m['P']*100:9.1f}% {m['R']*100:7.1f}% {m['F1']*100:6.1f}% {m['AP']*100:7.1f}%")

    print("=" * 95)

    test_benchmark_data = {
        'model': MODEL_PATH.name,
        'test_images_count': len(test_images),
        'total_gt_boxes': sum(m['n_gt'] for m in res50.values()),
        'macro_metrics': {'mAP50': mAP50, 'precision': mP, 'recall': mR, 'f1': mF1},
        'latency': {'per_opg_ms': avg_latency_per_img, 'tiles_per_opg': avg_tiles_per_img},
        'class_breakdown': {CLASS_NAMES[c]: res50[c] for c in sorted(CLASS_NAMES.keys())}
    }

    with open(OUTPUT_DIR / "final_test_benchmark_results.json", "w") as f:
        json.dump(test_benchmark_data, f, indent=2)

    print(f"\n Final test benchmark saved to: {OUTPUT_DIR / 'final_test_benchmark_results.json'}")


if __name__ == "__main__":
    run_final_test_benchmark()
