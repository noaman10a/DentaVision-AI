"""
DentaVision AI - Independent Test Set Benchmark Evaluation Script
Evaluates SOTA Step 4 Batch 2 Model (best_model.pt) on 60 Unseen External Test Radiographs:
- Bitewing (20 images, Mendeley Data Record 4fbdxs7s7w - Caries ground truth)
- Periapical (20 images, Zenodo Record 13772918 - Lesion ground truth)
- OPG / Panoramic (20 images, Zenodo Record 4457648 - Qualitative pathology counts)
"""

import os
import sys
import csv
import time
import json
import cv2
import numpy as np

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from ai_service.inference.predictor import XRayPredictor

def evaluate_testset():
    print("=" * 80)
    print(" 🔬 DENTAVISION AI — INDEPENDENT 60-IMAGE BENCHMARK EVALUATION ")
    print("=" * 80)
    
    weights_path = os.path.join(PROJECT_ROOT, "ai_service", "model", "checkpoints", "best_model.pt")
    testset_dir = os.path.join(PROJECT_ROOT, "dataset", "independent_test_set", "DentaVision_Test_XRays")
    csv_path = os.path.join(testset_dir, "ground_truth.csv")
    
    if not os.path.exists(weights_path):
        print(f"❌ Error: Weights file not found at {weights_path}")
        return
        
    if not os.path.exists(csv_path):
        print(f"❌ Error: Ground truth CSV not found at {csv_path}")
        return
        
    predictor = XRayPredictor(weights_path=weights_path, confidence_threshold=0.15)
    
    # Parse Ground Truth CSV
    ground_truth = {}
    with open(csv_path, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            ground_truth[row["image"].strip()] = row

    print(f"\n✅ Loaded {len(ground_truth)} ground truth entries from CSV.\n")

    # Metrics accumulators
    bitewing_tp = 0 # Caries predicted & Ground Truth = caries
    bitewing_fp = 0 # Caries predicted & Ground Truth = no_caries
    bitewing_fn = 0 # No caries predicted & Ground Truth = caries
    bitewing_tn = 0 # No caries predicted & Ground Truth = no_caries

    periapical_tp = 0 # Lesion predicted & Ground Truth = periapical_lesion
    periapical_fp = 0 # Lesion predicted & Ground Truth = normal
    periapical_fn = 0 # No lesion predicted & Ground Truth = periapical_lesion
    periapical_tn = 0 # No lesion predicted & Ground Truth = normal

    opg_findings_summary = {}
    
    latencies = []

    print("-" * 80)
    print(f"{'Image':<12} | {'Modality':<10} | {'Ground Truth':<18} | {'Model Prediction':<22} | {'Result':<10}")
    print("-" * 80)

    for img_name, meta in ground_truth.items():
        modality = meta["modality"].strip()
        gt_label = meta["ground_truth"].strip()
        
        modality_folder = "Bitewing" if modality == "Bitewing" else ("Periapical" if modality == "Periapical" else "OPG")
        img_file_path = os.path.join(testset_dir, modality_folder, img_name)
        
        if not os.path.exists(img_file_path):
            print(f"⚠️ Warning: Image file not found {img_file_path}")
            continue

        img = cv2.imread(img_file_path)
        if img is None:
            continue

        t0 = time.time()
        result = predictor.predict(img)
        lat = (time.time() - t0) * 1000.0
        latencies.append(lat)

        findings = result.get("findings", [])
        
        # 1. Bitewing Evaluation (Caries Detection)
        if modality == "Bitewing":
            has_caries_pred = any("caries" in f["finding_type"].lower() or "carious" in f["finding_type"].lower() for f in findings)
            pred_str = "Caries Detected" if has_caries_pred else "No Caries"
            
            if gt_label == "caries":
                if has_caries_pred:
                    bitewing_tp += 1
                    status = "✅ TP"
                else:
                    bitewing_fn += 1
                    status = "❌ FN"
            elif gt_label == "no_caries":
                if not has_caries_pred:
                    bitewing_tn += 1
                    status = "✅ TN"
                else:
                    bitewing_fp += 1
                    status = "❌ FP"
            else:
                status = "N/A"

            print(f"{img_name:<12} | {modality:<10} | {gt_label:<18} | {pred_str:<22} | {status:<10}")

        # 2. Periapical Evaluation (Apical Periodontitis / Lesion)
        elif modality == "Periapical":
            has_lesion_pred = any("apical" in f["finding_type"].lower() or "lesion" in f["finding_type"].lower() for f in findings)
            pred_str = "Periapical Lesion" if has_lesion_pred else "Normal"

            if gt_label == "periapical_lesion":
                if has_lesion_pred:
                    periapical_tp += 1
                    status = "✅ TP"
                else:
                    periapical_fn += 1
                    status = "❌ FN"
            elif gt_label == "normal":
                if not has_lesion_pred:
                    periapical_tn += 1
                    status = "✅ TN"
                else:
                    periapical_fp += 1
                    status = "❌ FP"
            else:
                status = "N/A"

            print(f"{img_name:<12} | {modality:<10} | {gt_label:<18} | {pred_str:<22} | {status:<10}")

        # 3. OPG Panoramic Evaluation (Qualitative Pathology Detection)
        elif modality == "OPG":
            detected_types = [f["finding_type"] for f in findings]
            for t in detected_types:
                opg_findings_summary[t] = opg_findings_summary.get(t, 0) + 1
            pred_str = f"{len(findings)} Pathologies"
            print(f"{img_name:<12} | {modality:<10} | {'Unlabeled':<18} | {pred_str:<22} | {'Qualitative':<10}")

    print("-" * 80)
    print("\n" + "=" * 80)
    print(" 📊 INDEPENDENT EVALUATION BENCHMARK SUMMARY RESULTS ")
    print("=" * 80)

    # Calculate Bitewing Caries Metrics
    bw_total = bitewing_tp + bitewing_fp + bitewing_fn + bitewing_tn
    bw_acc = ((bitewing_tp + bitewing_tn) / bw_total * 100.0) if bw_total > 0 else 0.0
    bw_prec = (bitewing_tp / (bitewing_tp + bitewing_fp) * 100.0) if (bitewing_tp + bitewing_fp) > 0 else 0.0
    bw_rec = (bitewing_tp / (bitewing_tp + bitewing_fn) * 100.0) if (bitewing_tp + bitewing_fn) > 0 else 0.0

    print("\n1️⃣ BITEWING RADIOGRAPHS — CARIES DETECTION (20 IMAGES)")
    print(f"   • Accuracy:    {bw_acc:.1f}% ({bitewing_tp + bitewing_tn}/{bw_total})")
    print(f"   • Precision:   {bw_prec:.1f}% ({bitewing_tp}/{bitewing_tp + bitewing_fp})")
    print(f"   • Sensitivity: {bw_rec:.1f}% ({bitewing_tp}/{bitewing_tp + bitewing_fn})")
    print(f"   • TP: {bitewing_tp} | TN: {bitewing_tn} | FP: {bitewing_fp} | FN: {bitewing_fn}")

    # Calculate Periapical Lesion Metrics
    pa_total = periapical_tp + periapical_fp + periapical_fn + periapical_tn
    pa_acc = ((periapical_tp + periapical_tn) / pa_total * 100.0) if pa_total > 0 else 0.0
    pa_prec = (periapical_tp / (periapical_tp + periapical_fp) * 100.0) if (periapical_tp + periapical_fp) > 0 else 0.0
    pa_rec = (periapical_tp / (periapical_tp + periapical_fn) * 100.0) if (periapical_tp + periapical_fn) > 0 else 0.0
    pa_spec = (periapical_tn / (periapical_tn + periapical_fp) * 100.0) if (periapical_tn + periapical_fp) > 0 else 0.0

    print("\n2️⃣ PERIAPICAL RADIOGRAPHS — LESION DETECTION (20 IMAGES)")
    print(f"   • Accuracy:    {pa_acc:.1f}% ({periapical_tp + periapical_tn}/{pa_total})")
    print(f"   • Specificity: {pa_spec:.1f}% ({periapical_tn}/{periapical_tn + periapical_fp})")
    print(f"   • Sensitivity: {pa_rec:.1f}% ({periapical_tp}/{periapical_tp + periapical_fn})")
    print(f"   • TP: {periapical_tp} | TN: {periapical_tn} | FP: {periapical_fp} | FN: {periapical_fn}")

    # OPG Summary
    print("\n3️⃣ OPG PANORAMIC RADIOGRAPHS — QUALITATIVE DETECTIONS (20 IMAGES)")
    for finding_name, count in sorted(opg_findings_summary.items(), key=lambda x: x[1], reverse=True):
        print(f"   • {finding_name:<25}: {count} instances")

    avg_lat = np.mean(latencies) if len(latencies) > 0 else 0.0
    print(f"\n⚡ Mean Inference Speed: {avg_lat:.2f} ms ({1000.0/avg_lat:.1f} FPS)")
    print("=" * 80 + "\n")

if __name__ == "__main__":
    evaluate_testset()
