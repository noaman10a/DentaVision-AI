"""
DentaVision AI - Epoch Comparison & Peak Analyzer Tool
Owner: Noaman (AI Model Lead)

Parses YOLOv8 experiment results (results.csv) across 30, 50, and 75 epoch runs.
Analyzes epoch-by-epoch metric progression, detects peak performance points, 
tracks training/validation loss trends, and flags degradation or plateauing.
"""

import sys
import os
import csv
import json
from pathlib import Path

_project_root = Path(__file__).resolve().parents[2]

def parse_results_csv(csv_path: Path):
    """
    Parses ultralytics results.csv file.
    Returns list of dicts with metrics per epoch.
    """
    if not csv_path.exists():
        return None
    
    rows = []
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            clean_row = {k.strip(): v.strip() for k, v in row.items()}
            
            try:
                epoch = int(clean_row.get('epoch', 0))
                train_box = float(clean_row.get('train/box_loss', 0))
                train_cls = float(clean_row.get('train/cls_loss', 0))
                train_dfl = float(clean_row.get('train/dfl_loss', 0))
                
                val_box = float(clean_row.get('val/box_loss', 0))
                val_cls = float(clean_row.get('val/cls_loss', 0))
                val_dfl = float(clean_row.get('val/dfl_loss', 0))
                
                precision = float(clean_row.get('metrics/precision(B)', 0))
                recall = float(clean_row.get('metrics/recall(B)', 0))
                map50 = float(clean_row.get('metrics/mAP50(B)', 0))
                map50_95 = float(clean_row.get('metrics/mAP50-95(B)', 0))
                
                train_loss = train_box + train_cls + train_dfl
                val_loss = val_box + val_cls + val_dfl
                
                rows.append({
                    'epoch': epoch,
                    'precision': precision,
                    'recall': recall,
                    'map50': map50,
                    'map50_95': map50_95,
                    'train_loss': train_loss,
                    'val_loss': val_loss,
                    'train_box_loss': train_box,
                    'train_cls_loss': train_cls,
                    'train_dfl_loss': train_dfl,
                    'val_box_loss': val_box,
                    'val_cls_loss': val_cls,
                    'val_dfl_loss': val_dfl
                })
            except (ValueError, TypeError):
                continue
    return rows

def analyze_epoch_progression(csv_path: Path):
    data = parse_results_csv(csv_path)
    if not data:
        return None

    # Find peak epochs
    peak_map50_95_epoch = max(data, key=lambda x: x['map50_95'])
    peak_map50_epoch = max(data, key=lambda x: x['map50'])
    lowest_val_loss_epoch = min(data, key=lambda x: x['val_loss'])

    latest_epoch = data[-1]
    prev_epoch = data[-2] if len(data) > 1 else None

    # Compare latest vs previous
    delta = {}
    if prev_epoch:
        for k in ['precision', 'recall', 'map50', 'map50_95', 'train_loss', 'val_loss']:
            delta[k] = latest_epoch[k] - prev_epoch[k]

    return {
        'total_epochs': len(data),
        'latest': latest_epoch,
        'previous': prev_epoch,
        'delta': delta,
        'peak_map50_95': peak_map50_95_epoch,
        'peak_map50': peak_map50_epoch,
        'lowest_val_loss': lowest_val_loss_epoch,
        'all_data': data
    }

def print_epoch_trend_report(csv_path: Path):
    analysis = analyze_epoch_progression(csv_path)
    if not analysis:
        print("No training results found yet.")
        return

    latest = analysis['latest']
    prev = analysis['previous']
    delta = analysis['delta']
    peak_map = analysis['peak_map50_95']
    min_loss = analysis['lowest_val_loss']

    print("=" * 85)
    print(f" DentaVision AI - Epoch {latest['epoch']} Live Analysis & Peak Performance Tracker")
    print("=" * 85)
    
    print(f"\n--- Current Epoch {latest['epoch']} vs Epoch {prev['epoch'] if prev else 0} ---")
    print(f"Precision:        {latest['precision']:.4f} ({'+' if delta.get('precision', 0)>=0 else ''}{delta.get('precision', 0):.4f})")
    print(f"Recall:           {latest['recall']:.4f} ({'+' if delta.get('recall', 0)>=0 else ''}{delta.get('recall', 0):.4f})")
    print(f"mAP@50:           {latest['map50']:.4f} ({'+' if delta.get('map50', 0)>=0 else ''}{delta.get('map50', 0):.4f})")
    print(f"mAP@50-95:        {latest['map50_95']:.4f} ({'+' if delta.get('map50_95', 0)>=0 else ''}{delta.get('map50_95', 0):.4f})")
    print(f"Training Loss:    {latest['train_loss']:.4f} ({'+' if delta.get('train_loss', 0)>=0 else ''}{delta.get('train_loss', 0):.4f})")
    print(f"Validation Loss:  {latest['val_loss']:.4f} ({'+' if delta.get('val_loss', 0)>=0 else ''}{delta.get('val_loss', 0):.4f})")

    print("\n--- Peak Performance Benchmarks ---")
    print(f"🏆 Peak mAP@50-95:   Epoch {peak_map['epoch']} ({peak_map['map50_95']:.4f})")
    print(f"🎯 Peak mAP@50:      Epoch {analysis['peak_map50']['epoch']} ({analysis['peak_map50']['map50']:.4f})")
    print(f"📉 Lowest Val Loss:  Epoch {min_loss['epoch']} ({min_loss['val_loss']:.4f})")

    # Check for drops
    if latest['epoch'] > peak_map['epoch']:
        drop = peak_map['map50_95'] - latest['map50_95']
        print(f"\n⚠️ Alert: mAP@50-95 is currently lower than peak at Epoch {peak_map['epoch']} by -{drop:.4f}")
    else:
        print(f"\n🌟 Epoch {latest['epoch']} achieved a NEW PEAK in mAP@50-95!")

    print("=" * 85)

if __name__ == "__main__":
    exp_name = sys.argv[1] if len(sys.argv) > 1 else "yolov8_50e"
    csv_file = _project_root / "ai_service" / "model" / "checkpoints" / exp_name / "results.csv"
    if not csv_file.exists():
        csv_file = _project_root / "ai_service" / "model" / "checkpoints" / "yolov8_denta" / "results.csv"
    print(f"Analyzing experiment folder: {csv_file.parent.name}")
    print_epoch_trend_report(csv_file)

