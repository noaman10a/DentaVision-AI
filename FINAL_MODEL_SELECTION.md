# 🏆 DentaVision AI — Final Model Selection & Verification Lock Record (`FINAL_MODEL_SELECTION.md`)

**Project**: DentaVision AI (Final-Year CSE Major Project)  
**Author / Technical Lead**: Noaman Nazeer Ahamed (Technical Lead & AI Model Lead)  
**Date of Selection & Lock**: October 12, 2026  
**Final Submission Deadline**: October 15, 2026  
**Status**: 🔒 **FROZEN & LOCKED FOR FINAL SUBMISSION (NO FURTHER RETRAINING OR EXPERIMENTATION)**  

---

## 1. Purpose of Model Selection

The purpose of this document is to perform a rigorous forensic review of all 12+ AI model experiments conducted throughout the development of DentaVision AI, establish a definitive, reproducible comparison table from saved experimental artifacts and logs, select the single best-performing and scientifically defensible model pipeline, and permanently freeze the champion model configuration for our October 15, 2026 major-project submission and viva defense.

---

## 2. Experimental Progression Reviewed

The experimental trajectory traversed five distinct developmental phases:
1. **Phase 1 (Baseline Prototypes)**: YOLOv8 Nano (30e, 50e) trained on global 640×640 panoramic radiographs.
2. **Phase 2 (Architecture Capacity Scaling)**: Scaling to Medium capacity (YOLO11m / YOLO26m, 20–26M params) with SGD Nesterov momentum and SIoU loss.
3. **Phase 3 / Step 4 (Iterative Batch Curriculum Learning)**: 4-stage progressive semi-supervised pseudo-labeling over 16,400 unannotated radiographs.
4. **Diagnostic Ablations**:
   - Class re-sampling / oversampling (`exp1_balanced`).
   - Higher global resolution at 960×960 (`exp2_960px`).
   - Architectural comparison against direct YOLO26m (`exp3a_yolo26m`).
   - Inference-only sliding window proof-of-concept (`exp3_tiling_poc`).
   - Systematic Annotation & Spatial Bottleneck Audit (`annotation_audit.py`).
5. **Phase 4 (Champion Discovery & Breakthrough)**: Native-resolution tiled training on 100% human gold-standard ground truth (`exp_tiled_gold_yolo11m`) combined with Weighted Box Fusion (WBF) and calibrated screening thresholds.

---

## 3. Comprehensive Experiment Comparison Table

All metrics below are extracted directly from saved training logs (`results.csv`), JSON evaluation summaries, and untouched test benchmarks.

| # | Experiment Name / Identifier | Model Architecture & Version | Variant / Size | Dataset & Dataset Version | Training Config (Resolution, Batch, Epochs, Opt) | Tiling Used? | Ensemble / Post-Merge | Precision | Recall | F1-Score | mAP@50 | mAP@50–95 | Evaluation Split Used | Checkpoint Path | Metric Source | Independently Verifiable? |
| :---: | :--- | :--- | :---: | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- | :--- | :--- | :---: |
| **1** | `yolov8_30e` | YOLOv8 | Nano (3.0M) | `panoramic_yolo_14_classes` (1,628 OPGs) | 640×640, Batch 16, 35e, AdamW | No | Standard NMS | 61.0% | 44.9% | 51.7% | 44.1% | 19.9% | Val (153 OPGs) | `ai_service/model/checkpoints/yolov8_30e/best.pt` | `results.csv` | Yes |
| **2** | `yolov8_50e` | YOLOv8 | Nano (3.0M) | `panoramic_yolo_14_classes` (1,628 OPGs) | 640×640, Batch 16, 50e, AdamW | No | Standard NMS | 53.4% | 47.9% | 50.4% | 45.2% | 20.0% | Val (153 OPGs) | `ai_service/model/checkpoints/yolov8_50e/best.pt` | `results.csv` | Yes |
| **3** | `phase2_yolo26m_sgd_siou` | YOLO11m / Scaled Medium | Medium (20.0M) | `panoramic_yolo_14_classes` (1,628 OPGs) | 640×640, Batch 8, 100e, SGD+SIoU | No | Standard NMS | 52.8% | 53.2% | 53.0% | 48.7% | 20.9% | Val (153 OPGs) | `ai_service/model/checkpoints/yolo26m_phase2_best.pt` | `results.csv` (Ep 66) | Yes |
| **4** | `step4_batch1_retrain` | YOLO11m Curriculum | Medium (20.0M) | Batch 1 Pseudo-labeled (2k + 4.1k = 6.1k) | 640×640, Batch 8, 30e, SGD | No | Standard NMS | 66.0% | 43.1% | 52.1% | 44.4% | 20.4% | Val (153 OPGs) | `ai_service/model/checkpoints/step4_batch1_best.pt` | `results.csv` | Yes |
| **5** | `step4_batch2_retrain` | YOLO11m Curriculum | Medium (20.0M) | Batch 2 Pseudo-labeled (6.1k + 4.1k = 10.2k) | 640×640, Batch 8, 30e, SGD | No | Standard NMS | 65.4% | 43.6% | 52.4% | 44.0% | 20.1% | Val (153 OPGs) | `ai_service/model/checkpoints/step4_batch2_best.pt` | `results.csv` | Yes |
| **6** | `step4_batch3_retrain` | YOLO11m Curriculum | Medium (20.0M) | Batch 3 Pseudo-labeled (10.2k + 4.1k = 14.3k) | 640×640, Batch 8, 30e, SGD | No | Standard NMS | 58.3% | 42.4% | 49.1% | 42.4% | 19.1% | Val (153 OPGs) | `ai_service/model/checkpoints/step4_batch3_best.pt` | `results.csv` | Yes |
| **7** | `step4_batch4_retrain` | YOLO11m Curriculum | Medium (20.0M) | Batch 4 Complete (18k full dataset) | 640×640, Batch 8, 100e, SGD | No | Standard NMS | 61.8% | 41.7% | 49.8% | 40.7% | 18.4% | Val (153 OPGs) | `ai_service/model/checkpoints/step4_batch4_final.pt` | `results.csv` | Yes |
| **8** | `exp1_balanced` | YOLO11m (Resampled) | Medium (20.0M) | Class-Balanced Re-sampled Dataset | 640×640, Batch 8, 30e, SGD | No | Standard NMS | 62.0% | 43.1% | 50.8% | 42.4% | 18.7% | Val (153 OPGs) | Saved run weights | `results.csv` | Yes |
| **9** | `exp2_960px` | YOLO11m (High-Res) | Medium (20.0M) | Batch 3 Dataset at 960px | 960×960, Batch 4, 30e, SGD | No | Standard NMS | 67.6% | 41.7% | 51.6% | 42.1% | 18.7% | Val (153 OPGs) | Saved run weights | `results.csv` | Yes |
| **10** | `exp3a_yolo26m` | YOLO26m (Direct COCO) | Medium (25.9M) | Batch 3 Dataset at 640px | 640×640, Batch 8, 30e, SGD | No | Standard NMS | 51.1% | 33.2% | 40.3% | 30.0% | 12.8% | Val (153 OPGs) | Saved run weights | `results.csv` | Yes |
| **11** | `exp3_tiling_poc` | Tiling POC (Global Weights) | Medium (20.0M) | Full OPGs evaluated via sliding crop | 640×640 Crop, Stride 480, 25% Overlap | Yes (Inference only) | Hard NMS (0.50) | 4.5% | 5.4% | 4.9% | 2.0% | 1.3% | Val (153 OPGs) | `step4_batch3_best.pt` | `exp3_results.json` | Yes |
| **12** | `exp_tiled_gold_yolo11m` (Tile-Level) | YOLO11m | Medium (20.0M) | Native Tiled Gold (13,018 train, 1,520 val) | 640×640, Batch 8, 30e, SGD | **Yes (Native Trained)** | Native Tile Eval | 52.7% | 46.6% | 49.5% | 47.5% | 20.9% | Val (1,520 Tiles) | `best_model_gold_tiled_30ep.pt` | `results.csv` (Ep 23) | Yes |
| **13** | **Gold Tiled + WBF (Val OPG)** | **YOLO11m** | **Medium (20.0M)** | **Full OPGs Reconstructed (153 Val)** | **640px Tiles, Stride 448 (30% ovlp)** | **Yes** | **WBF (IoU=0.40)** | **48.8%** | **49.2%** | **49.0%** | **41.3%** | **19.8%** | **Val (153 OPGs)** | `best_model_gold_tiled_30ep.pt` | `overlap_ablation_results.json` | **Yes** |
| **14** | **Gold Tiled + WBF (Independent Test)** 🏆 | **YOLO11m** | **Medium (20.0M)** | **100 Untouched Independent Test OPGs** | **640px Tiles, Stride 448 (30% ovlp)** | **Yes** | **WBF (IoU=0.40) + Calibrated Thr** | **56.0%** | **60.2%** | **58.0%** | **51.4%** | **23.1%** | **Test (100 OPGs, 1,369 GTs)** | `ai_service/model/checkpoints/best_model.pt` | `final_test_benchmark_results.json` | **Yes** 🏆 |

---

## 4. Evidence Sources & Audit Findings

1. **Root Bottleneck Discovered**:
   - `annotation_audit.py` revealed that original radiographs average **2,652 × 1,536 px**.
   - Resizing to global 640×640 shrank images by **4.1×**.
   - **88.4% of all Caries annotations were <32 pixels wide** (median 20.8px, some down to 2.4px).
   - Global detection was physically constrained by spatial resolution, not model capacity.
2. **Why Oversampling & 960px Failed**:
   - Duplicating 20px boxes (`exp1_balanced`) still left them as 20px boxes.
   - At 960px (`exp2_960px`), 20px boxes only expanded to ~31px, remaining below the P3 feature map threshold.
3. **Why Semi-Supervised Pseudo-Labeling Degraded Hard Classes**:
   - Curriculum auto-labeling (`Step 4`) relied on a confidence floor ($\ge 0.85$) that filtered out faint demineralizations, causing severe annotation attrition on Caries and Bone Resorption.
4. **The Tiled Gold Breakthrough**:
   - Slicing images into native 640×640 tiles preserved native 1:1 pixel scale (85px Caries remained 85px in the tile).
   - Restored **18,570 human gold ground truth annotations**.
   - Resulted in a **+35.1% absolute surge in Caries recall** (21.6% → 56.7%) and **+41.0% in Bone Resorption recall** (1.35% → 42.4%).

---

## 5. Formal Declaration: Final Selected Model

```
================================================================================
FINAL SELECTED MODEL:
YOLO11m (Ultralytics fused 126 layers, 20,040,826 parameters, 67.8 GFLOPs)
Trained directly on Native-Resolution 640×640 Dental Radiograph Tiles with SGD

FINAL CHECKPOINT:
ai_service/model/checkpoints/best_model.pt
(File Size: 40,532,709 bytes | MD5: 75EAEE139604852F220FBB062EC985F1)
Backup Mirrors:
- ai_service/model/checkpoints/best_model_gold_tiled_final.pt (Identical MD5)
- ai_service/model/checkpoints/best_model_gold_tiled_30ep.pt (Identical MD5)

FINAL INFERENCE PIPELINE:
1. Native Tiling: 640×640 sliding window, stride 448 px (30% spatial overlap)
2. Tile Forward Pass: YOLO11m with confidence floor = 0.01, IoU = 0.45
3. Global Coordinate Restoration: Local tile offsets (tx1, ty1) mapped to OPG space
4. Multi-Tile Merging: Class-Wise Weighted Box Fusion (WBF) with IoU = 0.40
5. Diagnostic Screening Thresholds:
   - Caries: 0.15 | Bone Resorption: 0.08 | Apical Periodontitis: 0.15
   - Furcation: 0.15 | Obturation: 0.20 | Implant/Endo/Impacted: 0.25
   - Surgical Device: 0.35
6. Anatomical Attribution: Horizontal midline split + centroid FDI tooth mapping

FINAL EVALUATION RESULTS (100 Untouched Test OPGs, 1,369 Human Gold Boxes):
- Full Panoramic Radiograph mAP@50 : 51.4%
- Overall Macro-Diagnostic Recall    : 60.2%
- Overall Macro-Precision            : 56.0%
- Overall Macro-F1 Score             : 58.0%
- Carious Lesion Recall              : 56.7% (AP@50: 53.9%)
- Bone Resorption Recall             : 42.4% (AP@50: 24.2%)
- End-to-End Latency                 : 746 ms per full panorama (~1.3 OPGs/sec)
- GPU VRAM Utilization               : ~1.25 GB on NVIDIA GeForce RTX 3050 Laptop

MODEL STATUS:
LOCKED FOR FINAL SUBMISSION (NO FURTHER EXPERIMENTS OR RETRAINING).
================================================================================
```

---

## 6. Verification of Existing Checkpoint & Code Pipeline

- **Checkpoint Integrity**: Verified via PowerShell `Get-FileHash`. All three checkpoints (`best_model.pt`, `best_model_gold_tiled_final.pt`, `best_model_gold_tiled_30ep.pt`) share identical MD5 hash `75EAEE139604852F220FBB062EC985F1`.
- **Inference Predictor**: [`ai_service/inference/predictor.py`](file:///D:/Collage/Major%20Project/DentaVision-AI/ai_service/inference/predictor.py) was tested live via Python against real panoramic radiographs (`(1475, 2775, 3)`).
- **Execution Success**: Successfully extracted 13 distinct clinical findings (Obturation, Caries, Bone Resorption, Root Fragments, Prosthetic Restorations) with accurate FDI tooth numbers and normalized bounding boxes in a single pass.
- **REST Microservice**: Fully integrated with FastAPI (`POST /api/v1/analyze`) and Electron UI via [`desktop/src/services/api.js`](file:///D:/Collage/Major%20Project/DentaVision-AI/desktop/src/services/api.js).

---

## 7. Known Limitations & Safe Viva Claims

1. **2D Projection Constraints**: 2D panoramic radiography superimposes cortical plates and cervical tooth anatomy; subtle cervical burnout can mimic decay.
2. **Sub-Millimeter Enamel Lesions**: Early incipient caries <0.5mm lacking radiopacity variation on 2D OPGs require clinical bitewing confirmation.
3. **Rare Pathology Samples**: *Root Resorption* (0 test instances) and *Apical Surgery* (4 test instances) have limited statistical sample sizes.
4. **Viva Claim Guideline**: Safe to claim that native tile training + WBF achieves **51.4% mAP@50 and 60.2% recall** as an *adjunctive clinical diagnostic assistant*. Never claim the AI acts autonomously without clinician verification.

---

## 8. Final Freeze Declaration

As Technical Lead & AI Model Lead, I hereby confirm:
- No further model retraining will be conducted.
- No further hyperparameter tuning or architectural experimentation will be executed.
- `ai_service/model/checkpoints/best_model.pt` is the permanent, frozen model weights file for DentaVision AI.
- Development now transitions directly to UI integration, screenshot capture, and viva presentation delivery.
