"""
DentaVision AI — Visual Error Analysis & Diagnostic Inspection (Phase 7)
========================================================================
Renders side-by-side Ground Truth vs Model Prediction visualizations
for representative clinical cases across the 14 dental classes.
"""

import os
import cv2
import numpy as np
from pathlib import Path
from collections import defaultdict
from ultralytics import YOLO

BASE_DIR = Path("d:/Collage/Major Project/DentaVision-AI")
VAL_IMAGES = BASE_DIR / "dataset/DentaVision_Datasets/01_Dental_Condition_Detection/panoramic_radiography_yolo_dataset_14_classes/valid/images"
VAL_LABELS = BASE_DIR / "dataset/DentaVision_Datasets/01_Dental_Condition_Detection/panoramic_radiography_yolo_dataset_14_classes/valid/labels"
MODEL_PATH = BASE_DIR / "ai_service/model/checkpoints/best_model_gold_tiled_30ep.pt"
OUTPUT_DIR = BASE_DIR / "runs/detect/ai_service/model/runs/visual_error_analysis"

CLASS_NAMES = {
    0: "Implant", 1: "Prosthetic", 2: "Obturation",
    3: "Endo_Tx", 4: "Caries", 5: "Bone_Loss",
    6: "Impacted", 7: "Apical_Perio", 8: "Root_Frag",
    9: "Furcation", 10: "Apical_Surg", 11: "Root_Resorp",
    12: "Ortho_Dev", 13: "Surg_Dev"
}

CLASS_COLORS = {
    0: (0, 255, 255),    # Cyan - Implant
    1: (255, 128, 0),    # Orange - Prosthetic
    2: (0, 200, 255),    # Light Orange - Obturation
    3: (0, 255, 0),      # Bright Green - Endo
    4: (0, 0, 255),      # Red - Caries (Critical)
    5: (255, 0, 128),    # Purple - Bone loss
    6: (255, 255, 0),    # Yellow - Impacted
    7: (0, 128, 255),    # Dark Orange - Apical
    8: (128, 0, 255),    # Magenta - Root frag
    9: (0, 255, 128),    # Mint - Furcation
    10: (255, 0, 0),     # Blue - Apical Surg
    11: (128, 128, 0),   # Olive - Root Resorp
    12: (200, 200, 200), # Gray - Ortho
    13: (255, 200, 100)  # Pale Blue - Surg Dev
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
            x1 = int((cx - w / 2) * img_w)
            y1 = int((cy - h / 2) * img_h)
            x2 = int((cx + w / 2) * img_w)
            y2 = int((cy + h / 2) * img_h)
            boxes.append((cls_id, x1, y1, x2, y2))
    return boxes


def run_visual_analysis():
    print("=" * 80)
    print(" 🎨 PHASE 7: VISUAL ERROR ANALYSIS & SAMPLE RENDERING")
    print("=" * 80)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    model = YOLO(str(MODEL_PATH))
    val_images = sorted(list(VAL_IMAGES.glob("*.jpg")) + list(VAL_IMAGES.glob("*.png")))

    # Select 8 diverse validation cases (covering Caries, Bone loss, Endo, Implants, Ortho, Surgery)
    selected_stems = ["10", "110", "210", "310", "410", "510", "610", "710"]
    sample_images = [p for p in val_images if p.stem in selected_stems]
    if len(sample_images) < 4:
        sample_images = val_images[:8]

    print(f" Rendering visual comparison for {len(sample_images)} clinical OPG cases...")

    for img_path in sample_images:
        img = cv2.imread(str(img_path))
        if img is None:
            continue
        h, w = img.shape[:2]
        stem = img_path.stem

        # 1. Parse Ground Truth
        gts = parse_labels(VAL_LABELS / f"{stem}.txt", w, h)

        # 2. Run Tiled Prediction with WBF
        tiles = generate_tiles(w, h, stride=448)
        raw_dets = []
        for tx1, ty1, tx2, ty2 in tiles:
            tile_img = img[ty1:ty2, tx1:tx2]
            th, tw = tile_img.shape[:2]
            if th < TILE_SIZE or tw < TILE_SIZE:
                padded = np.zeros((TILE_SIZE, TILE_SIZE, 3), dtype=np.uint8)
                padded[:th, :tw] = tile_img
                tile_img = padded
            res = model.predict(tile_img, conf=0.10, iou=0.45, imgsz=640, verbose=False, device=0)
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

        preds = weighted_box_fusion(raw_dets, iou_thresh=0.40)

        # 3. Create Side-by-Side Comparison Canvas
        # Left: Ground Truth | Right: AI Predictions
        canvas_gt = img.copy()
        canvas_pred = img.copy()

        # Draw Ground Truth (Solid Green boxes with class tags)
        for cls_id, gx1, gy1, gx2, gy2 in gts:
            cname = CLASS_NAMES.get(cls_id, f"C{cls_id}")
            cv2.rectangle(canvas_gt, (gx1, gy1), (gx2, gy2), (0, 255, 0), 2)
            cv2.putText(canvas_gt, cname, (gx1, max(gy1 - 6, 15)), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 255, 0), 1, cv2.LINE_AA)

        # Draw Predictions (Color-coded by class + confidence)
        for cls_id, conf, px1, py1, px2, py2 in preds:
            cname = CLASS_NAMES.get(cls_id, f"C{cls_id}")
            col = CLASS_COLORS.get(cls_id, (0, 255, 255))
            cv2.rectangle(canvas_pred, (int(px1), int(py1)), (int(px2), int(py2)), col, 2)
            lbl = f"{cname} {conf:.2f}"
            cv2.putText(canvas_pred, lbl, (int(px1), max(int(py1) - 6, 15)), cv2.FONT_HERSHEY_SIMPLEX, 0.45, col, 1, cv2.LINE_AA)

        # Add Titles
        cv2.putText(canvas_gt, f"GROUND TRUTH (Gold Human Annotations: {len(gts)})", (30, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2, cv2.LINE_AA)
        cv2.putText(canvas_pred, f"DENTAVISION AI (WBF Tiled Predictions: {len(preds)})", (30, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 200, 255), 2, cv2.LINE_AA)

        # Resize for combined display (width ~1400 each -> combined 2800)
        scale = 1200 / w
        disp_gt = cv2.resize(canvas_gt, (1200, int(h * scale)))
        disp_pred = cv2.resize(canvas_pred, (1200, int(h * scale)))
        combined = np.hstack((disp_gt, disp_pred))

        out_file = OUTPUT_DIR / f"visual_case_{stem}.jpg"
        cv2.imwrite(str(out_file), combined)
        print(f"  Saved visual comparison: {out_file.name} (GT: {len(gts)}, Preds: {len(preds)})")

    print(f"\n Visual error analysis samples saved to: {OUTPUT_DIR}")


if __name__ == "__main__":
    run_visual_analysis()
