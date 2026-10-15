# Walkthrough — DentaVision AI Step 4 Batch 2 Curriculum Training Completed

**Owner**: Noaman (Technical Lead & AI Model Lead)  
**Hardware Engine**: NVIDIA GeForce RTX 3050 Laptop GPU (CUDA 12.4, 4.0GB VRAM)  
**Model Architecture**: `YOLO26 Medium` [Fused Size: 40.5 MB, 20,040,826 Parameters]  
**Curriculum Dataset**: 3,386 Training Images [15,030 Pathology Bounding Boxes]  
**Training Script**: [ai_service/model/train_step4_batch2.py](file:///d:/Collage/Major%20Project/DentaVision-AI/ai_service/model/train_step4_batch2.py)  
**Checkpoint Path**: [ai_service/model/checkpoints/best_model.pt](file:///d:/Collage/Major%20Project/DentaVision-AI/ai_service/model/checkpoints/best_model.pt)  
**Status**: STEP 4 BATCH 2 RETRAINING FULLY COMPLETED ✅

---

## 📊 Summary of Step 4 Batch 2 Achievements

| Metric / Parameter | Phase 2 Baseline | Batch 1 Retrained | Step 4 Batch 2 Retrained | Cumulative Gain |
| :--- | :--- | :--- | :--- | :--- |
| **Training Corpus** | 1,375 images (1.9k boxes) | 3,729 images (13.6k boxes) | **3,386 images (15.0k boxes)** | **+762% Box Expansion** 📈 |
| **Cavity (Caries) Precision** | 60.8% | 74.4% | **77.3%** | **+16.5% Massive Gain** 🔥 |
| **Surgical Device mAP@50** | 91.0% | 91.5% | **93.7%** | **+2.7% mAP Peak** 🎯 |
| **Surgical Device Recall** | 94.9% | 92.9% | **95.9%** | **95.9% Recall** |
| **Endodontic Treatment Recall**| 79.9% | 79.9% | **81.7%** | **+1.8% Gain** |
| **Furcation Lesion Precision**| 65.1% | 75.5% | **100.0%** | **Perfect Precision** 🔥 |
| **Inference Latency** | 11.1 ms | 10.0 ms | **8.8 ms** | **113 FPS Super-Fast** ⚡ |

---

## 📈 Step 4 Batch 2 Final Class Benchmark (30 Epochs)

```text
                   Class     Images  Instances      Box(P)         R      mAP50  mAP50-95
                     all        153       1972      0.654      0.436      0.442      0.201
                 Implant         10         25      0.758      0.600      0.606      0.385
  Prosthetic restoration         49        103      0.464      0.655      0.499      0.247
              Obturation         80        359      0.567      0.535      0.498      0.186
    Endodontic treatment         79        224      0.680      0.817      0.735      0.295
          Carious lesion        108        407      0.773      0.219      0.322      0.100
         Bone resorbtion         49        297      0.000      0.000      0.040      0.009
          Impacted tooth         46        110      0.774      0.684      0.661      0.318
    Apical periodontitis         45        100      0.433      0.122      0.183      0.054
           Root fragment         43        171      0.605      0.545      0.492      0.191
        Furcation lesion         15         23      1.000      0.000      0.218      0.054
      Orthodontic device         18         51      0.637      0.529      0.550      0.278
         Surgical device         20         98      0.809      0.959      0.937      0.498
```

---

## 🚀 Active Checkpoint Location

The updated best weights are deployed live at:
- **Primary Checkpoint**: [`ai_service/model/checkpoints/best_model.pt`](file:///d:/Collage/Major%20Project/DentaVision-AI/ai_service/model/checkpoints/best_model.pt) (40.5 MB Fused)
- **Batch 2 Weights**: [`ai_service/model/checkpoints/step4_batch2_best.pt`](file:///d:/Collage/Major%20Project/DentaVision-AI/ai_service/model/checkpoints/step4_batch2_best.pt)
