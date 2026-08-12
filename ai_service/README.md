# 🦷 DentaVision AI — Local AI Service & REST API

**Subsystem**: `ai_service/`  
**Owner**: Soha (AI Service Lead) & Noaman (AI Model Lead)  
**Architecture**: Local REST API installed on Doctor Workstation PCs  
**Model Version**: `v1.0.0`  

---

## 📌 Subsystem Architecture & Responsibilities

The `ai_service` is an isolated, local computational engine running on clinic workstation PCs.

### Key Architectural Constraints:
- **Local REST API**: Communicates with the Desktop Application (Electron/React) over local HTTP (`http://127.0.0.1:8000`).
- **No Direct Cloud / DB Access**: Does NOT connect directly to PostgreSQL, Supabase, or Cloud Storage.
- **Human-in-the-Loop**: Output findings are clinical suggestions for doctor review. No automated diagnostic finalization.
- **Temporary Image Processing**: Processes temporary local X-ray images and discards them after analysis.

---

## 📁 Package Structure

```text
ai_service/
├── api/
│   ├── __init__.py
│   ├── main.py          # FastAPI engine, routes (/health, /version, /analyze) & exception handlers
│   └── schemas.py       # Pydantic validation models & JSON response schemas
├── inference/
│   ├── __init__.py
│   └── predictor.py     # End-to-end XRayPredictor (Preprocessing -> Model -> Postprocessing)
├── model/
│   ├── __init__.py
│   ├── architecture.py  # DentaVisionNet PyTorch model architecture
│   ├── dataset.py       # PyTorch dataset loader
│   ├── evaluator.py     # Evaluation & metrics engine
│   └── trainer.py       # PyTorch training module
├── postprocessing/
│   ├── __init__.py
│   └── formatter.py     # Structured findings JSON formatter
├── preprocessing/
│   ├── __init__.py
│   └── pipeline.py      # XRayPreprocessor (Validation, CLAHE, Resizing, Normalization)
├── tests/
│   ├── test_api.py      # REST API unit & integration test suite
│   ├── test_dataset_organization.py
│   ├── test_dataset_verifier.py
│   ├── test_inference_predictor.py
│   ├── test_preprocessing_pipeline.py
│   └── test_trainer_evaluator.py
├── utils/
│   ├── dataset_organizer.py
│   └── dataset_verifier.py
├── requirements.txt     # Python dependencies
├── run_server.py        # Server runner launcher script
└── SOHA_HANDOFF.md      # Model ↔ API handoff specifications
```

---

## ⚙️ Quickstart & Setup Guide

### 1. Environment Setup
```powershell
# Create virtual environment
python -m venv ai_service/.venv

# Activate environment
ai_service\.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r ai_service/requirements.txt
```

### 2. Launch Local REST API Service
```powershell
python ai_service/run_server.py
```
The REST API will start at: **`http://127.0.0.1:8000`**  
OpenAPI Interactive Docs: **`http://127.0.0.1:8000/docs`**

---

## 📡 API Reference & Endpoints

### 1. `GET /health` (or `/api/v1/health`)
Verifies service readiness and PyTorch model state.
- **Response `200 OK`**:
  ```json
  {
    "status": "ok",
    "service": "dentavision-ai",
    "model_loaded": true
  }
  ```

### 2. `GET /version` (or `/api/v1/version`)
Returns API, service, and trained model checkpoint version.
- **Response `200 OK`**:
  ```json
  {
    "api_version": "v1",
    "service_version": "1.0.0",
    "model_version": "v1.0.0"
  }
  ```

### 3. `POST /analyze` (or `/api/v1/analyze`)
Performs pathology detection & analysis on uploaded X-ray image.
- **Content-Type**: `multipart/form-data`
- **Body Parameters**:
  - `file`: X-ray image file (`PNG`, `JPEG`, or `DICOM`).
  - `patient_id` *(optional)*: Patient reference string.
  - `xray_id` *(optional)*: X-ray record UUID.
- **Response `200 OK`**:
  ```json
  {
    "status": "success",
    "patient_id": "2026/0705",
    "xray_id": "xray_uuid_123",
    "model_version": "v1.0.0",
    "inference_time_ms": 42.15,
    "findings_count": 1,
    "findings": [
      {
        "id": "e4b6b7a2-1111-4444-8888-abcdef123456",
        "finding_type": "Caries",
        "confidence": 0.88,
        "bounding_box": {
          "x_min": 0.25,
          "y_min": 0.30,
          "x_max": 0.45,
          "y_max": 0.55
        },
        "tooth_number": "16",
        "severity": "Pending Review"
      }
    ],
    "timestamp": "2026-08-11T12:00:00Z"
  }
  ```

---

## 🧪 Automated Testing

Run the full pytest suite (including preprocessing, PyTorch predictor, and FastAPI endpoints):
```powershell
python -m pytest ai_service/tests/
```
*(Expected: 21 passing test cases).*
