# DentaVision AI — Complete Training Configuration & Improvement Plan

## 1. Exact Training Configuration (Batch 3 — Current Best Checkpoint)

| Parameter | Value |
| :--- | :--- |
| **Model Architecture** | YOLO11m (Ultralytics `yolo26m`) |
| **Parameters** | 20,040,826 (20.04M) |
| **GFLOPs** | 67.8 |
| **Model Size** | 40.5 MB |
| **Image Size** | **640 × 640** |
| **Epochs** | 30 (Batch 3) / 100 (Batch 4) |
| **Batch Size** | **8** |
| **Workers** | 2 |
| **Optimizer** | SGD |
| **Learning Rate (lr0)** | 0.01 |
| **LR Final (lrf)** | 0.01 |
| **Momentum** | 0.937 |
| **Weight Decay** | 0.0005 |
| **Warmup Epochs** | 3.0 |
| **Warmup Momentum** | 0.8 |
| **Warmup Bias LR** | 0.1 |
| **Cosine LR** | No (linear decay) |
| **AMP (Mixed Precision)** | Yes |
| **Pretrained** | Yes (fine-tuned from previous batch checkpoint) |
| **Box Loss Weight** | **7.5** |
| **Classification Loss Weight** | 0.5 |
| **DFL Loss Weight** | 1.5 |
| **Confidence Threshold (training)** | Not set (default) |
| **NMS IoU Threshold (training)** | **0.7** |
| **NMS IoU Threshold (inference)** | **0.45** |
| **Max Detections** | 300 |
| **Mosaic** | **1.0 (always on)** |
| **Mixup** | 0.0 (off) |
| **Copy-Paste** | 0.0 (off) |
| **Close Mosaic** | 10 (turns off mosaic at epoch N-10) |
| **HSV Hue** | 0.015 |
| **HSV Saturation** | 0.7 |
| **HSV Value** | 0.4 |
| **Rotation (degrees)** | **0.0 (off!)** |
| **Translation** | 0.1 |
| **Scale** | 0.5 |
| **Shear** | 0.0 (off) |
| **Perspective** | 0.0 (off) |
| **Flip UD** | 0.0 (off) |
| **Flip LR** | 0.5 |
| **Erasing** | 0.4 |
| **Auto Augment** | randaugment |
| **Dropout** | 0.0 |
| **Deterministic** | Yes |
| **Seed** | 0 |
| **GPU** | NVIDIA GeForce RTX 3050 Laptop GPU |
| **GPU VRAM** | **4.0 GB** |
| **PyTorch** | 2.6.0+cu124 |
| **Ultralytics** | 8.4.121 |
| **Framework** | Ultralytics YOLO (Python 3.12.14) |

---

## 2. Dataset Statistics — The Root Cause Analysis

### Training Set (Batch 3 — 3,608 images, 13,288 bounding boxes)

| Class ID | Pathology | Train Boxes | Train % | Val Boxes | Val % | Train:Val Ratio | Diagnosis |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| 3 | **Endodontic Treatment** | **3,096** | **23.3%** | 224 | 11.4% | 13.8:1 | ✅ Well-represented |
| 1 | **Prosthetic Restoration** | **2,662** | **20.0%** | 103 | 5.2% | 25.8:1 | ✅ Well-represented |
| 2 | **Obturation** | **2,414** | **18.2%** | 359 | 18.2% | 6.7:1 | ✅ Well-represented |
| 6 | **Impacted Tooth** | **1,024** | **7.7%** | 110 | 5.6% | 9.3:1 | ✅ Adequate |
| 4 | **Carious Lesion** | **1,014** | **7.6%** | **407** | **20.6%** | **2.5:1** 🔴 | 🔴 **SEVERELY UNDER-REPRESENTED in training vs. val demand!** |
| 0 | **Implant** | 766 | 5.8% | 25 | 1.3% | 30.6:1 | ✅ Adequate |
| 8 | **Root Fragment** | 746 | 5.6% | 171 | 8.7% | 4.4:1 | 🟡 Moderate |
| 13 | **Surgical Device** | 496 | 3.7% | 98 | 5.0% | 5.1:1 | ✅ Performs excellently |
| 5 | **Bone Resorbtion** | **492** | **3.7%** | **297** | **15.1%** | **1.7:1** 🔴 | 🔴🔴 **EXTREME imbalance! Only 492 train boxes but 297 val instances!** |
| 7 | **Apical Periodontitis** | **404** | **3.0%** | **100** | **5.1%** | **4.0:1** 🔴 | 🔴 **Under-represented + subtle pathology** |
| 12 | **Orthodontic Device** | 128 | 1.0% | 51 | 2.6% | 2.5:1 | 🟡 Low count |
| 9 | **Furcation Lesion** | **36** | **0.3%** | **23** | **1.2%** | **1.6:1** 🔴 | 🔴🔴 **Near-zero training data! 36 boxes total!** |
| 11 | **Root Resorption** | **10** | **0.1%** | **0** | **0.0%** | — | 🔴🔴🔴 **10 train boxes, 0 val boxes! Cannot evaluate!** |
| 10 | **Apical Surgery** | **0** | **0.0%** | **4** | **0.2%** | **0:4** 🔴 | 🔴🔴🔴 **ZERO training examples! 4 val instances! Impossible to learn!** |

---

## 3. Root Cause Diagnosis

> [!CAUTION]
> The data now tells us **exactly why your model fails on specific classes**. This is NOT a model architecture problem. It is a **data distribution problem**.

### Finding 1: Carious Lesion — "High Precision, Catastrophic Recall"
- **1,014 training boxes** but **407 validation boxes** (Train:Val = 2.5:1).
- The validation set has proportionally **2.7x more cavities** than the training set (20.6% vs 7.6%).
- The model learned cavities from only 7.6% of its training signal → it learned to be conservative (high precision) but never saw enough variety to generalize (low recall).
- **Root cause**: Training set severely under-represents cavities relative to validation demand.

### Finding 2: Bone Resorbtion — "Model Failure"
- **492 training boxes** but **297 validation boxes** (Train:Val = 1.7:1).
- Validation set has proportionally **4x more bone resorbtion** than training set (15.1% vs 3.7%).
- Additionally, crestal bone loss is visually subtle (low contrast, no sharp edges).
- **Root cause**: Extreme train/val distribution mismatch + inherently difficult visual feature.

### Finding 3: Apical Surgery — "Impossible to Learn"
- **0 training boxes** and **4 validation boxes**.
- The model has literally never seen this class during training.
- **Root cause**: Missing training data entirely.

### Finding 4: Furcation Lesion — "Near-Zero Data"
- Only **36 training boxes** across 3,608 images.
- **Root cause**: Insufficient training examples for meaningful feature learning.

---

## 4. Prioritized Improvement Plan

### 🔴 Priority 1: Fix Training Data Distribution (HIGHEST IMPACT)

**Goal**: Align training class distribution to match validation demand.

| Action | Class Target | Expected Impact |
| :--- | :--- | :--- |
| **A. Source additional annotated Caries images** from the original 14-class panoramic dataset or external open datasets (e.g., UFBA-UESC dental caries dataset) | Carious Lesion | Recall 15.5% → 45-60%+ |
| **B. Oversample minority classes** using image-level weighted sampling (images containing Bone Resorbtion, Furcation, Apical Periodontitis get 3-5x sampling weight) | All weak classes | Overall Recall +10-15% |
| **C. Copy-paste augmentation** for minority class bounding boxes onto majority-class images | Bone Resorbtion, Furcation | AP@50 for these classes +15-25% |
| **D. Remove Apical Surgery and Root Resorption** from evaluation (document as "excluded due to insufficient data") or source external annotations | Apical Surgery, Root Resorption | Removes 0% AP classes from macro average drag |

### 🟠 Priority 2: Higher Resolution Training (HIGH IMPACT)

**Goal**: Give subtle pathology more pixel information.

- Current: **640 × 640** (tiny cavities may be only 8-15 pixels)
- Target: **960 × 960** (with batch=4 to fit 4GB VRAM)
- Alternative: **800 × 800** (with batch=6)
- Expected impact: **mAP@50 +5-10%**, especially for Caries and Bone Resorbtion

### 🟡 Priority 3: Targeted Augmentation for Subtle Pathology

**Goal**: Teach the model to detect low-contrast lesions under varied imaging conditions.

| Augmentation | Current Value | Recommended Value | Rationale |
| :--- | :---: | :---: | :--- |
| **Rotation (degrees)** | **0.0** 🔴 | **10.0–15.0** | Dental X-rays have varied head tilt; rotation invariance is critical |
| **Mixup** | 0.0 | **0.15** | Blends images to create harder training examples |
| **Copy-Paste** | 0.0 | **0.3** | Pastes minority class boxes onto other images |
| **Mosaic** | 1.0 | 1.0 (keep) | Already active |
| **HSV Value** | 0.4 | **0.5** | Broader brightness variation simulates different exposure levels |
| **Scale** | 0.5 | **0.7** | Wider scale range captures multi-scale pathology |

### 🟢 Priority 4: Focal Loss / Class-Weighted Loss

**Goal**: Force the optimizer to pay more attention to hard/rare classes.

- Switch classification loss to **Focal Loss** (gamma=1.5, alpha=0.25)
- Or use **class frequency-weighted loss** where rare classes get higher loss multipliers

### 🟢 Priority 5: Hyperparameter Tuning

**Goal**: Find optimal operating configuration.

| Parameter | Current | Experiment Range |
| :--- | :---: | :--- |
| **lr0** | 0.01 | 0.001 – 0.02 |
| **box loss weight** | 7.5 | 5.0 – 10.0 |
| **cls loss weight** | 0.5 | 0.5 – 2.0 |
| **NMS IoU** | 0.7 (train) / 0.45 (inference) | 0.5 – 0.7 |
| **imgsz** | 640 | 640 / 800 / 960 |
| **batch** | 8 | 4 – 8 (constrained by 4GB VRAM) |

---

## 5. Realistic Target Expectations

| Metric | Current Batch 3 | After Priority 1+2+3 | After All Priorities |
| :--- | :---: | :---: | :---: |
| **Precision** | 58.3% | **≥65-70%** | **≥70-75%** |
| **Recall** | 42.4% | **≥55-60%** | **≥60-70%** |
| **F1-Score** | 49.1% | **≥60-65%** | **≥65-70%** |
| **mAP@50** | 42.4% | **≥55-60%** | **≥60-70%** |
| **mAP@50–95** | 19.1% | **≥25-30%** | **≥30-38%** |
| **FPS** | ~110 | ~60-80 (if 960px) | ~50-70 |

> [!IMPORTANT]
> These are honest, realistic projections. I am NOT guaranteeing 80%+ mAP. The actual gains depend on annotation quality, the visual difficulty of the pathology, and whether external caries/bone-loss data can be sourced.
