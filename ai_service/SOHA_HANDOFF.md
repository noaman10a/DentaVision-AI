# 🤝 AI Model ↔ AI Service Handoff Specification (Noaman ➔ Soha)

**Author**: Noaman (Technical Lead + AI Model Lead)  
**Recipient**: Soha (AI Service Lead)  
**Model Version**: `v1.0.0`  
**Status**: Ready for FastAPI Integration  

---

## 1. Model Overview & Checkpoint
* **Model Class**: `DentaVisionNet` (`ai_service.model.architecture.DentaVisionNet`)
* **Default Weights**: Built-in architecture default / trainable PyTorch state dict.
* **Target Device**: `CPU` (optimized for dental clinic workstations).

---

## 2. Required Dependencies
Refer to `ai_service/requirements.txt`:
* `torch >= 2.0.0`
* `torchvision >= 0.15.0`
* `opencv-python-headless >= 4.8.0`
* `pillow >= 9.5.0`
* `numpy >= 1.24.0`

---

## 3. Input Image Requirements
* **Formats**: PNG, JPEG, JPG, DICOM (converted to 2D uint8 numpy array)
* **Channels**: Grayscale (1-channel) or RGB (3-channel)
* **Dimensions**: Any input resolution (auto-resized by preprocessor to 640x640 with aspect padding).

---

## 4. How to Load and Execute the Pipeline in FastAPI

Soha can initialize the predictor once on app startup and call `.predict()` inside the `/api/v1/analyze` endpoint:

```python
from ai_service.inference.predictor import XRayPredictor
import numpy as np

# 1. Initialize Predictor (Load once at FastAPI startup)
predictor = XRayPredictor(weights_path=None, device="cpu", confidence_threshold=0.5)

# 2. Run Inference on Input X-Ray (numpy array uint8)
# image_np: np.ndarray shape (H, W) or (H, W, 3)
result_json = predictor.predict(
    image=image_np,
    patient_id="2026/0705",
    xray_id="xray_uuid_123"
)
```

---

## 5. Output JSON Schema & Example

### Example Response (`POST /api/v1/analyze`):
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
  "timestamp": "2026-08-11T10:03:00Z"
}
```

---

## 6. Expected Performance & Benchmarks
* **CPU Inference Time**: ~35ms – 80ms per image.
* **Memory Footprint**: ~180MB RAM.

---

## 7. Error Handling
* `ValueError`: Raised if the input image array is empty, corrupt, or invalid format.
* Soha should catch `ValueError` and return HTTP 400 Bad Request:
  ```json
  {
    "status": "error",
    "error_code": "INVALID_IMAGE",
    "message": "Preprocessing validation failed: Input image array is empty (0 size)"
  }
  ```
