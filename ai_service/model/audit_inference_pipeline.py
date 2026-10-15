"""
DentaVision AI — Inference Pipeline & Merging Diagnostic Audit (Experiment A)
=============================================================================
AUDIT OBJECTIVES:
  1. Determine exact mathematical difference between Tile-Level (47.3% mAP50) and Full-Image Merged (33.7% mAP50).
  2. Measure effect of upfront confidence filtering (conf=0.001 vs 0.05 vs 0.10 vs 0.15 vs 0.25).
  3. Analyze cross-tile duplicate merging: how many raw detections, how many suppressed, duplicate ratio.
  4. Analyze edge-of-tile boundary boxes (how many true annotations cross tile borders).
  5. Compute complete, un-truncated Precision-Recall curves and per-class AP50.
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
OUTPUT_DIR = BASE_DIR / "runs/detect/ai_service/model/runs/inference_pipeline_audit"

CLASS_NAMES = {
    0: "Implant", 1: "Prosthetic_restoration", 2: "Obturation",
    3: "Endodontic_treatment", 4: "Carious_lesion", 5: "Bone_resorbtion",
    6: "Impacted_tooth", 7: "Apical_periodontitis", 8: "Root_fragment",
    9: "Furcation_lesion", 10: "Apical_surgery", 11: "Root_resorption",
    12: "Orthodontic_device", 13: "Surgical_device"
}

TILE_SIZE = 640


def generate_tiles(img_w, img_h, tile_size=TILE_SIZE, stride=448):
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


def weighted_nms(detections, iou_thresh=0.50):
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


def weighted_box_fusion(detections, iou_thresh=0.50):
    """Weighted Box Fusion: averages bounding box coordinates weighted by confidence."""
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

        # Merge clusters with weighted coordinates
        for cl in clusters:
            confs = np.array([c[1] for c in cl])
            total_conf = np.sum(confs)
            weights = confs / total_conf
            avg_x1 = np.sum([c[2] * w for c, w in zip(cl, weights)])
            avg_y1 = np.sum([c[3] * w for c, w in zip(cl, weights)])
            avg_x2 = np.sum([c[4] * w for c, w in zip(cl, weights)])
            avg_y2 = np.sum([c[5] * w for c, w in zip(cl, weights)])
            max_conf = np.max(confs)
            merged.append((cls_id, float(max_conf), float(avg_x1), float(avg_y1), float(avg_x2), float(avg_y2)))
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


def run_pipeline_audit():
    print("=" * 80)
    print(" 🔎 EXPERIMENT A: FULL-IMAGE INFERENCE & MERGING PIPELINE AUDIT")
    print("=" * 80)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    if not MODEL_PATH.exists():
        print(f"❌ Model missing at {MODEL_PATH}")
        return

    model = YOLO(str(MODEL_PATH))
    val_images = sorted(list(VAL_IMAGES.glob("*.jpg")) + list(VAL_IMAGES.glob("*.png")))
    print(f" Loaded model: {MODEL_PATH.name}")
    print(f" Validation Radiographs: {len(val_images)}")
    print()

    # Step 1: Collect ALL raw un-truncated tile predictions down to conf=0.001
    print("Step 1: Extracting full multi-tile predictions (conf=0.001) across 153 radiographs...")
    all_raw_tile_dets = []  # per image: list of (cls_id, conf, x1, y1, x2, y2)
    all_gts = []
    total_tiles = 0

    t0 = time.time()
    for img_idx, img_path in enumerate(val_images):
        img = cv2.imread(str(img_path))
        if img is None:
            all_raw_tile_dets.append([])
            all_gts.append([])
            continue

        img_h, img_w = img.shape[:2]
        stem = img_path.stem
        tiles = generate_tiles(img_w, img_h, tile_size=640, stride=448)
        total_tiles += len(tiles)

        img_dets = []
        for tx1, ty1, tx2, ty2 in tiles:
            tile_img = img[ty1:ty2, tx1:tx2]
            th, tw = tile_img.shape[:2]
            if th < TILE_SIZE or tw < TILE_SIZE:
                padded = np.zeros((TILE_SIZE, TILE_SIZE, 3), dtype=np.uint8)
                padded[:th, :tw] = tile_img
                tile_img = padded

            # Run with conf=0.001 to trace complete PR curve
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
                        img_dets.append((cls_id, conf, x1_orig, y1_orig, x2_orig, y2_orig))

        all_raw_tile_dets.append(img_dets)
        all_gts.append(parse_labels(VAL_LABELS / f"{stem}.txt", img_w, img_h))

        if (img_idx + 1) % 30 == 0 or (img_idx + 1) == len(val_images):
            print(f"  [{img_idx+1:3d}/{len(val_images)}] Processed {stem}. Raw candidate dets so far: {sum(len(d) for d in all_raw_tile_dets)}")

    elapsed = time.time() - t0
    print(f" Extraction complete in {elapsed:.1f}s. Total tiles processed: {total_tiles}")
    print()

    # Step 2: Test Different Merging Methods on True Un-truncated PR Curves
    print("=" * 80)
    print(" STEP 2: MERGING ALGORITHM COMPARISON ON UN-TRUNCATED PR CURVES (conf=0.001)")
    print("=" * 80)

    merging_methods = [
        ("Standard NMS (IoU=0.40)", lambda dets: weighted_nms(dets, 0.40)),
        ("Standard NMS (IoU=0.50)", lambda dets: weighted_nms(dets, 0.50)),
        ("Standard NMS (IoU=0.60)", lambda dets: weighted_nms(dets, 0.60)),
        ("Weighted Box Fusion (IoU=0.40)", lambda dets: weighted_box_fusion(dets, 0.40)),
        ("Weighted Box Fusion (IoU=0.50)", lambda dets: weighted_box_fusion(dets, 0.50)),
        ("Weighted Box Fusion (IoU=0.60)", lambda dets: weighted_box_fusion(dets, 0.60)),
    ]

    merge_results = {}
    for name, merge_fn in merging_methods:
        merged_preds = [merge_fn(dets) for dets in all_raw_tile_dets]
        res50 = evaluate_detections(merged_preds, all_gts, iou_thresh=0.5)
        valid_classes = [c for c, m in res50.items() if m['n_gt'] > 0]
        mP = np.mean([res50[c]['P'] for c in valid_classes])
        mR = np.mean([res50[c]['R'] for c in valid_classes])
        mF1 = 2 * mP * mR / (mP + mR) if (mP + mR) > 0 else 0
        mAP50 = np.mean([res50[c]['AP'] for c in valid_classes])

        merge_results[name] = {
            'mP': mP, 'mR': mR, 'mF1': mF1, 'mAP50': mAP50,
            'caries_r': res50[4]['R'], 'caries_ap': res50[4]['AP'],
            'bone_r': res50[5]['R'], 'bone_ap': res50[5]['AP'],
            'apical_r': res50[7]['R'], 'apical_ap': res50[7]['AP'],
            'furcation_r': res50[9]['R'], 'furcation_ap': res50[9]['AP'],
        }
        print(f"  {name:<35s}: mAP@50={mAP50*100:5.1f}% | Recall={mR*100:5.1f}% | Precision={mP*100:5.1f}% | F1={mF1*100:5.1f}%")

    # Step 3: Confidence Threshold Sweep on Best Merging Method (WBF IoU=0.50 / NMS IoU=0.50)
    best_merge_name = max(merge_results.keys(), key=lambda k: merge_results[k]['mAP50'])
    print(f"\n Best Merging Strategy: {best_merge_name}")
    print("\n" + "=" * 80)
    print(f" STEP 3: OPERATIONAL CONFIDENCE THRESHOLD SWEEP (using {best_merge_name})")
    print("=" * 80)

    # Use the best merging function
    best_merge_fn = [fn for n, fn in merging_methods if n == best_merge_name][0]
    base_merged_preds = [best_merge_fn(dets) for dets in all_raw_tile_dets]

    conf_thresholds = [0.01, 0.05, 0.10, 0.15, 0.20, 0.25, 0.30, 0.35, 0.40, 0.50]
    print(f"  {'Conf':>5s} {'P':>7s} {'R':>7s} {'F1':>7s} {'Caries R':>9s} {'Bone R':>8s} {'Apical R':>9s} {'Furc R':>8s} {'Total Dets':>11s}")
    print(f"  {'-'*5} {'-'*7} {'-'*7} {'-'*7} {'-'*9} {'-'*8} {'-'*9} {'-'*8} {'-'*11}")

    conf_sweep_results = []
    for conf_t in conf_thresholds:
        filtered_preds = []
        for img_preds in base_merged_preds:
            filtered_preds.append([p for p in img_preds if p[1] >= conf_t])

        # Evaluate at this fixed confidence threshold
        total_p = 0
        total_r = 0
        total_dets = sum(len(p) for p in filtered_preds)

        # Compute per-class P and R directly at this operational point
        class_stats = {}
        for cls_id in sorted(CLASS_NAMES.keys()):
            n_gt = sum(sum(1 for g in gts if g[0] == cls_id) for gts in all_gts)
            if n_gt == 0:
                continue
            # Match
            tp = 0
            fp = 0
            for idx in range(len(all_gts)):
                p_cls = [p[2:6] for p in filtered_preds[idx] if p[0] == cls_id]
                gt_cls = [g[1:5] for g in all_gts[idx] if g[0] == cls_id]
                matched_gt = set()
                for p_box in p_cls:
                    best_iou, best_idx = 0, -1
                    for g_idx, g_box in enumerate(gt_cls):
                        iou = compute_iou(p_box, g_box)
                        if iou > best_iou:
                            best_iou = iou
                            best_idx = g_idx
                    if best_iou >= 0.50 and best_idx not in matched_gt:
                        tp += 1
                        matched_gt.add(best_idx)
                    else:
                        fp += 1
            p = tp / (tp + fp) if (tp + fp) > 0 else 0
            r = tp / n_gt if n_gt > 0 else 0
            f1 = 2 * p * r / (p + r) if (p + r) > 0 else 0
            class_stats[cls_id] = {'P': p, 'R': r, 'F1': f1}

        macro_p = np.mean([s['P'] for s in class_stats.values()])
        macro_r = np.mean([s['R'] for s in class_stats.values()])
        macro_f1 = 2 * macro_p * macro_r / (macro_p + macro_r) if (macro_p + macro_r) > 0 else 0

        conf_sweep_results.append({
            'conf': conf_t, 'P': macro_p, 'R': macro_r, 'F1': macro_f1,
            'caries_r': class_stats[4]['R'], 'bone_r': class_stats[5]['R'],
            'apical_r': class_stats[7]['R'], 'furcation_r': class_stats[9]['R'],
            'total_dets': total_dets
        })

        print(f"  {conf_t:5.2f} {macro_p*100:6.1f}% {macro_r*100:6.1f}% {macro_f1*100:6.1f}% "
              f"{class_stats[4]['R']*100:8.1f}% {class_stats[5]['R']*100:7.1f}% "
              f"{class_stats[7]['R']*100:8.1f}% {class_stats[9]['R']*100:7.1f}% {total_dets:11d}")

    # Save detailed audit JSON
    audit_output = {
        'merging_comparison': merge_results,
        'confidence_sweep': conf_sweep_results,
    }
    with open(OUTPUT_DIR / "pipeline_audit_results.json", "w") as f:
        json.dump(audit_output, f, indent=2)
    print(f"\n Audit results saved to: {OUTPUT_DIR / 'pipeline_audit_results.json'}")


if __name__ == "__main__":
    run_pipeline_audit()
