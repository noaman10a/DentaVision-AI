import csv
from pathlib import Path

csv_path = Path("runs/detect/ai_service/model/runs/exp_tiled_gold_yolo11m/results.csv")
with open(csv_path, mode='r') as f:
    reader = csv.DictReader(f)
    rows = [{k.strip(): float(v.strip()) for k, v in row.items()} for row in reader]

print(f"Total epochs recorded: {len(rows)}")
print()
print("=" * 85)
print(f" {'Epoch':>5s} {'Train Box':>10s} {'Train Cls':>10s} {'Val Box':>9s} {'Val Cls':>9s} {'P':>7s} {'R':>7s} {'mAP50':>8s} {'mAP50-95':>9s}")
print("=" * 85)

for idx in range(len(rows)):
    if idx % 3 == 0 or idx == len(rows) - 1:
        r = rows[idx]
        ep = int(r["epoch"])
        tb = r.get("train/box_loss", 0)
        tc = r.get("train/cls_loss", 0)
        vb = r.get("val/box_loss", 0)
        vc = r.get("val/cls_loss", 0)
        p = r.get("metrics/precision(B)", 0)
        rc = r.get("metrics/recall(B)", 0)
        m50 = r.get("metrics/mAP50(B)", 0)
        m95 = r.get("metrics/mAP50-95(B)", 0)
        print(f" {ep:5d} {tb:10.3f} {tc:10.3f} {vb:9.3f} {vc:9.3f} {p*100:6.1f}% {rc*100:6.1f}% {m50*100:7.1f}% {m95*100:8.1f}%")

print("=" * 85)
last5_map50 = [round(r["metrics/mAP50(B)"] * 100, 2) for r in rows[-5:]]
last5_map95 = [round(r["metrics/mAP50-95(B)"] * 100, 2) for r in rows[-5:]]
last5_val_loss = [round(r["val/cls_loss"], 4) for r in rows[-5:]]
print(f"Last 5 Epochs mAP50    : {last5_map50}")
print(f"Last 5 Epochs mAP50-95 : {last5_map95}")
print(f"Last 5 Epochs Val Cls  : {last5_val_loss}")

# Plateau / Overfitting evaluation
val_cls_change = rows[-1]["val/cls_loss"] - rows[-5]["val/cls_loss"]
map50_change = rows[-1]["metrics/mAP50(B)"] - rows[-5]["metrics/mAP50(B)"]
print()
print(f"Net change across final 5 epochs (Epoch 25 -> 30):")
print(f"  mAP50 delta        : {map50_change*100:+.2f}%")
print(f"  Val Cls Loss delta : {val_cls_change:+.4f}")

if map50_change > 0.005 and val_cls_change <= 0.05:
    print("  -> Scientific Assessment: Model was STILL IMPROVING at epoch 30. A controlled 50-epoch fine-tuning run IS mathematically justified!")
elif map50_change <= 0.002 and val_cls_change > 0.05:
    print("  -> Scientific Assessment: Model has PLATEAUED / began slight overfitting. 30 epochs is near-optimal.")
else:
    print("  -> Scientific Assessment: Model converged with steady validation loss.")
