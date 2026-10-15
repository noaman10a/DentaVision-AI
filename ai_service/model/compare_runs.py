"""
DentaVision AI - Protocol Phase 3: 30e vs 50e Comparison Suite
Owner: Noaman (AI Model Lead)

Compares Phase 1 (30/35 Epochs) vs Phase 2 (50 Epochs) across all protocol metrics:
- Precision, Recall, mAP@50, mAP@50-95
- Training Losses: Box, Cls, DFL, Total
- Validation Losses: Box, Cls, DFL, Total
- Overfitting assessment & Phase 4 recommendation
"""

import sys
from pathlib import Path

_project_root = Path(__file__).resolve().parents[2]
if str(_project_root) not in sys.path:
    sys.path.insert(0, str(_project_root))

from ai_service.model.eval_experiments import parse_results_csv

def main():
    path_30e = _project_root / "ai_service" / "model" / "checkpoints" / "yolov8_30e" / "results.csv"
    path_50e = _project_root / "ai_service" / "model" / "checkpoints" / "yolov8_50e" / "results.csv"

    r30 = parse_results_csv(path_30e)
    r50 = parse_results_csv(path_50e)

    if not r30 or not r50:
        print("Error reading results.csv files.")
        return

    # Find peak epochs for 30e
    peak30_map = max(r30, key=lambda x: x['map50_95'])
    peak30_map50 = max(r30, key=lambda x: x['map50'])
    min30_val = min(r30, key=lambda x: x['val_loss'])

    # Find peak epochs for 50e
    peak50_map = max(r50, key=lambda x: x['map50_95'])
    peak50_map50 = max(r50, key=lambda x: x['map50'])
    min50_val = min(r50, key=lambda x: x['val_loss'])

    # Last epochs
    last30 = r30[-1]
    last50 = r50[-1]

    print("=" * 95)
    print(" DentaVision AI - Protocol Phase 3: 30-Epoch vs 50-Epoch Comprehensive Comparison")
    print("=" * 95)

    print("\n--- 1. OVERALL MODEL PERFORMANCE METRICS ---")
    print(f"{'Metric':<25} | {'Phase 1 (30e/35e Best)':<25} | {'Phase 2 (50e Best)':<25} | {'Gain / Change':<15}")
    print("-" * 95)
    
    p_gain = peak50_map['precision'] - peak30_map['precision']
    r_gain = peak50_map['recall'] - peak30_map['recall']
    m50_gain = peak50_map50['map50'] - peak30_map50['map50']
    m95_gain = peak50_map['map50_95'] - peak30_map['map50_95']

    print(f"{'Precision':<25} | {peak30_map['precision']:<25.4f} | {peak50_map['precision']:<25.4f} | {p_gain:+.4f}")
    print(f"{'Recall':<25} | {peak30_map['recall']:<25.4f} | {peak50_map['recall']:<25.4f} | {r_gain:+.4f}")
    print(f"{'mAP@50':<25} | {peak30_map50['map50']:<25.4f} (Ep {peak30_map50['epoch']}) | {peak50_map50['map50']:<25.4f} (Ep {peak50_map50['epoch']}) | {m50_gain:+.4f}")
    print(f"{'mAP@50-95':<25} | {peak30_map['map50_95']:<25.4f} (Ep {peak30_map['epoch']}) | {peak50_map['map50_95']:<25.4f} (Ep {peak50_map['epoch']}) | {m95_gain:+.4f}")

    print("\n--- 2. DETAILED LOSS BREAKDOWN ---")
    print(f"{'Loss Metric':<25} | {'Phase 1 (30e Best Val)':<25} | {'Phase 2 (50e Best Val)':<25} | {'Loss Reduction':<15}")
    print("-" * 95)

    train_box_diff = min50_val['train_box_loss'] - min30_val['train_box_loss']
    train_cls_diff = min50_val['train_cls_loss'] - min30_val['train_cls_loss']
    train_dfl_diff = min50_val['train_dfl_loss'] - min30_val['train_dfl_loss']
    train_tot_diff = min50_val['train_loss'] - min30_val['train_loss']

    val_box_diff = min50_val['val_box_loss'] - min30_val['val_box_loss']
    val_cls_diff = min50_val['val_cls_loss'] - min30_val['val_cls_loss']
    val_dfl_diff = min50_val['val_dfl_loss'] - min30_val['val_dfl_loss']
    val_tot_diff = min50_val['val_loss'] - min30_val['val_loss']

    print(f"{'Train Box Loss':<25} | {min30_val['train_box_loss']:<25.4f} | {min50_val['train_box_loss']:<25.4f} | {train_box_diff:+.4f}")
    print(f"{'Train Class Loss':<25} | {min30_val['train_cls_loss']:<25.4f} | {min50_val['train_cls_loss']:<25.4f} | {train_cls_diff:+.4f}")
    print(f"{'Train DFL Loss':<25} | {min30_val['train_dfl_loss']:<25.4f} | {min50_val['train_dfl_loss']:<25.4f} | {train_dfl_diff:+.4f}")
    print(f"{'Total Train Loss':<25} | {min30_val['train_loss']:<25.4f} | {min50_val['train_loss']:<25.4f} | {train_tot_diff:+.4f}")
    print("-" * 95)
    print(f"{'Val Box Loss':<25} | {min30_val['val_box_loss']:<25.4f} | {min50_val['val_box_loss']:<25.4f} | {val_box_diff:+.4f}")
    print(f"{'Val Class Loss':<25} | {min30_val['val_cls_loss']:<25.4f} | {min50_val['val_cls_loss']:<25.4f} | {val_cls_diff:+.4f}")
    print(f"{'Val DFL Loss':<25} | {min30_val['val_dfl_loss']:<25.4f} | {min50_val['val_dfl_loss']:<25.4f} | {val_dfl_diff:+.4f}")
    print(f"{'Total Val Loss':<25} | {min30_val['val_loss']:<25.4f} (Ep {min30_val['epoch']}) | {min50_val['val_loss']:<25.4f} (Ep {min50_val['epoch']}) | {val_tot_diff:+.4f}")

    print("\n--- 3. OVERFITTING & CONVERGENCE ASSESSMENT ---")
    val_loss_trend = [x['val_loss'] for x in r50[-10:]]
    train_loss_trend = [x['train_loss'] for x in r50[-10:]]
    
    print(f"Phase 2 Last 10 Epochs Val Loss Min: {min(val_loss_trend):.4f}, Max: {max(val_loss_trend):.4f}, Final: {r50[-1]['val_loss']:.4f}")
    print(f"Phase 2 Last 10 Epochs Train Loss Min: {min(train_loss_trend):.4f}, Max: {max(train_loss_trend):.4f}, Final: {r50[-1]['train_loss']:.4f}")

    if m95_gain > 0.005 and val_tot_diff < 0:
        print("\n✅ DECISION: Phase 2 (50 Epochs) improved meaningfully over Phase 1 without overfitting!")
        print("Recommendation: PROCEED TO PHASE 4 (75-Epoch Experiment yolov8_75e).")
    else:
        print("\n⚠️ DECISION: Phase 2 showed minor gain or plateauing.")

    print("=" * 95)

if __name__ == "__main__":
    main()
