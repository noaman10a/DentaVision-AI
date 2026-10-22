# 🦷 DentaVision AI
> **AI-Assisted Dental Clinic Management & Radiograph Pathology Detection System**  
> *Final-Year Computer Science & Engineering Major Project (2026)*

[![AI Service](https://img.shields.io/badge/FastAPI-v0.110.0-009688?logo=fastapi)](http://127.0.0.1:8000)
[![Backend](https://img.shields.io/badge/Node.js%20%2F%20Express-v5.0-68a063?logo=nodedotjs)](http://localhost:5000)
[![Desktop Workstation](https://img.shields.io/badge/Electron%20%2B%20React-v18.3-61dafb?logo=react)](http://localhost:3000)
[![PyTorch YOLO](https://img.shields.io/badge/YOLO11m-Native%20Tiled%20%2B%20WBF-ee4c2c?logo=pytorch)](https://github.com/ultralytics)
[![License](https://img.shields.io/badge/License-Proprietary%20Academic-blue)]()

---
## 📌 Executive Summary

**DentaVision AI** is a clinical workstation and diagnostic decision-support system designed for dental clinics. It unifies patient registration, electronic health records (EHR), clinical visit documentation, voice-assisted prescriptions, and local deep-learning radiographic analysis into a single, seamless platform.

Built around a strict **Human-in-the-Loop (HITL)** architecture, the system guarantees that AI never acts autonomously; instead, every AI observation must be explicitly verified (**Confirm**, **Modify**, or **Reject**) by the attending dental surgeon before being recorded into the official clinical diagnostic report.

---

## 🏛️ System Architecture

DentaVision AI uses a 3-tier hybrid topology designed for clinical responsiveness and data locality:

```
                          ┌─────────────────────────────────────┐
                          │     Electron Desktop Application    │
                          │   (React 18 + Vite + HTML5 Canvas)  │
                          │            Port :5173 / :3000       │
                          └──────────────┬──────────────────────┘
                                         │
                    ┌─────────────────────┴─────────────────────┐
                    │ Client-Side API Gateway                   │
                    ▼                                           ▼
┌─────────────────────────────────────┐     ┌─────────────────────────────────────┐
│       Local AI Microservice         │     │         Express.js Backend          │
│   (Python 3.10+ / FastAPI / PyTorch)│     │      (TypeScript / Prisma ORM)      │
│            Port :8000               │     │             Port :5000              │
└──────────────────┬──────────────────┘     └──────────────────┬──────────────────┘
                   │                                           │
                   │ Native 640px Tiles                        │ PostgreSQL / Supabase
                   │ Class-Wise WBF Merging                    │ Relational Store
                   ▼                                           ▼
      [ YOLO11m Dental Model ]                    [ Relational EHR Models ]
```

### Key Architectural Tenets
1. **Local Radiograph Processing**: Full panoramic dental radiographs are processed locally on the workstation via the FastAPI microservice (`:8000`), keeping patient imaging data on-premise without third-party cloud data transfer.
2. **Direct AI Service Support**: The desktop workstation can query the local AI service directly or through the authenticated backend proxy.

---

## 🔬 AI Modeling & Pipeline Optimization

### The Downscaling Bottleneck Discovery
Initial baselines trained on globally downscaled $640 \times 640$ radiographs achieved poor sensitivity on subtle dental pathologies (e.g. Caries: 21.6%, Bone Loss: 1.35%). A mathematical audit of 1,972 ground-truth annotations revealed why:
* Panoramic dental radiographs average **$2,652 \times 1,536$ pixels**.
* Resizing globally to $640 \times 640$ shrinks image area by **$16.8\times$**.
* **$88.4\%$ of all carious lesions were $<32$ pixels wide** on the resized image (median width: 20.8 px), vanishing completely in the deep feature pyramid.

### The Solution: Native Tiling + Class-Wise Weighted Box Fusion (WBF)
To resolve the bottleneck without exceeding GPU memory limits:
1. **Native Pixel Tiling**: Panoramic images are partitioned into native $640 \times 640$ pixel crops using a **448-pixel stride** (30% spatial overlap).
2. **Class-Wise Weighted Box Fusion (WBF)**: Tile detections are projected back into global coordinate space and fused using confidence-weighted coordinate averaging (IoU threshold = 0.40).
3. **Spatial Quadrant Midline FDI Tooth Numbering**: Centroid spatial clustering sorts findings across upper and lower jaw arches, automatically assigning international **FDI 2-digit tooth codes** (`Tooth #11` to `Tooth #48`).

### Verified Benchmark Results

> **Evaluation Notes:**
> * The baseline YOLOv8 Nano model was evaluated on the 153-image validation split at standard default confidence thresholds.
> * The champion YOLO11m pipeline was evaluated on both the validation split (153 OPGs) and a held-out test split of 100 radiographs.
> * Recall gains on challenging pathologies (e.g. Caries and Bone Resorption) incorporate calibrated confidence thresholds (e.g. 0.15 for caries, 0.08 for bone resorption) designed for high clinical sensitivity.
> * The 746 ms inference latency was measured on an NVIDIA RTX 3050 GPU (tiled inference pipeline). On CPU hardware, full radiograph inference typically requires 1.5–3.5 seconds.

| Metric | Baseline YOLOv8 Nano (Val 153) | Champion YOLO11m Tiled + WBF (Val 153) | Champion YOLO11m Tiled + WBF (Test 100) |
| :--- | :---: | :---: | :---: |
| **Full Radiograph mAP@50** | 44.1% | 41.3% | **51.4%** |
| **Macro-Recall (Sensitivity)** | 44.9% | 49.2% | **60.2%** |
| **Macro-Precision** | 61.0% | 48.8% | **56.0%** |
| **Macro-F1 Score** | 51.7% | 49.0% | **58.0%** |
| **Caries Detection Sensitivity** | 21.6% | — | **56.7%** (2.6× Gain) |
| **Bone Resorption Sensitivity** | 1.35% | — | **42.4%** (31× Gain) |
| **Inference Latency** | 30.7 ms | 746 ms (RTX 3050) | **746 ms (RTX 3050)** |

---

## 💻 Subsystem Features

### 1. Receptionist Desk Module
* **Patient Registration**: Full demographic intake with automated clinical ID generation (`PT-YYYY-NNNN`).
* **Instant Search & Queue**: Multi-attribute query by Patient ID, Name, or Contact Number.
* **Appointment Tracking**: Real-time status badges (*Waiting*, *In Consultation*, *X-Ray Ready*).

### 2. Senior Dental Surgeon Workspace
* **Interactive Radiograph/OPG Canvas**: HTML5 canvas supporting high-resolution dental panoramic radiographs (PNG and JPEG) with zoom, pan, brightness, contrast adjustment, and toggleable AI bounding box overlays.
* **Doctor Review Drawer**: Clinician must explicitly **Confirm**, **Modify** (FDI tooth number or condition), or **Reject** each finding.
* **Clinical Consultation Entry**: Structured capture of Chief Complaint, Clinical Examination, Diagnosis, and Treatment Plan.
* **Voice-to-Text Prescriptions**: Structured medication builder (Medicine, Strength, Dose, Frequency, Duration) with integrated voice dictation.
* **Diagnostic Report Generator**: One-click generation of patient-facing diagnostic reports combining radiograph findings, surgeon impressions, and treatment directives.

### 3. Clinic Administration & System Health
* **Live Microservice Health Monitor**: Continuous ping latency monitor for Desktop, FastAPI, Express API, and Database.
* **Audit Trail**: Security and activity logging of clinical edits and AI predictions.

---

## 🚀 Quick Start Guide

### Prerequisites
* **Windows 10/11** (64-bit)
* **Node.js** v18+ and **npm** v9+
* **Python** 3.10+ (with `.venv` configured)

### 1-Click Launch (All Services)
Double-click `start_all_services.bat` in the project root, or execute:

```cmd
start_all_services.bat
```

This single command launches:
1. **AI Microservice**: `http://127.0.0.1:8000` (FastAPI / YOLO11m)
2. **Backend API**: `http://localhost:5000` (Express / Prisma fallback)
3. **Desktop Workstation**: `http://localhost:3000` (Vite dev server)

---

## 🧪 Automated Test Verification

Both test suites run independently and are verified clean:

```bash
# 1. Run AI Service Tests (23 automated tests)
.venv\Scripts\python.exe -m pytest ai_service/tests

# 2. Run Backend API Tests (17 automated tests)
cd backend && npm test

# 3. Build Desktop Application
cd desktop && npm run build
```

---

## 👥 Engineering Team Roster

* **Noaman Nazeer Ahamed** — *Technical Lead & AI Model Lead*  
  Architecture design, computer vision pipeline, native tiling algorithm, model training, ablation audits, WBF post-merging, and defense lead.
* **Soha** — *AI Microservice Lead*  
  FastAPI service layer, REST contracts, Pydantic validation, CORS middleware, Uvicorn launcher, and latency benchmarking.
* **Twahir Mohammed** — *Backend & Cloud Lead*  
  Express TypeScript backend, Prisma ORM (14 relational models), PostgreSQL/Supabase schema, multi-part upload handlers.
* **Sneha** — *Frontend & Desktop UI Lead*  
  Electron desktop shell, React 18 workstation UI, interactive X-ray canvas (`XRayViewer.jsx`), Doctor Review Drawer, and Diagnostic Report generator.

---

## 📜 Academic Declaration
This project was conceived, designed, trained, and implemented by the team for the **Final-Year Bachelor of Engineering (CSE) Degree**. All model weights, code, and clinical schemas are frozen and locked for presentation defense.