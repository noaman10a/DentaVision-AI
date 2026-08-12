"""
DentaVision AI - REST API Unit & Integration Tests
Owner: Soha (AI Service Lead)

Tests FastAPI endpoints (/health, /version, /analyze) and error handling schemas.
"""

import os
import io
import tempfile
import numpy as np
import pytest
from PIL import Image
from fastapi.testclient import TestClient

from ai_service.api.main import app

client = TestClient(app)


def create_synthetic_image_file() -> str:
    """Creates a temporary synthetic grayscale X-ray PNG image on disk."""
    img_array = np.random.randint(50, 200, (640, 640), dtype=np.uint8)
    img = Image.fromarray(img_array)
    temp_file = tempfile.NamedTemporaryFile(suffix=".png", delete=False)
    img.save(temp_file.name)
    temp_file.close()
    return temp_file.name


def create_synthetic_image_bytes() -> bytes:
    """Creates synthetic PNG image bytes."""
    img_array = np.random.randint(50, 200, (640, 640), dtype=np.uint8)
    img = Image.fromarray(img_array)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def test_health_endpoint():
    """Test GET /health and GET /api/v1/health."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "dentavision-ai"
    assert data["model_loaded"] is True

    # Test v1 prefixed route
    response_v1 = client.get("/api/v1/health")
    assert response_v1.status_code == 200
    assert response_v1.json()["status"] == "ok"


def test_version_endpoint():
    """Test GET /version and GET /api/v1/version."""
    response = client.get("/version")
    assert response.status_code == 200
    data = response.json()
    assert data["api_version"] == "v1"
    assert data["service_version"] == "1.0.0"
    assert data["model_version"] == "v1.0.0"

    response_v1 = client.get("/api/v1/version")
    assert response_v1.status_code == 200
    assert response_v1.json()["model_version"] == "v1.0.0"


def test_analyze_multipart_upload():
    """Test POST /analyze with valid multipart image file upload."""
    img_bytes = create_synthetic_image_bytes()
    files = {"file": ("test_xray.png", img_bytes, "image/png")}
    data = {"patient_id": "2026/0705", "xray_id": "xray_uuid_999"}

    response = client.post("/analyze", files=files, data=data)
    assert response.status_code == 200
    res = response.json()
    assert res["status"] == "success"
    assert res["patient_id"] == "2026/0705"
    assert res["xray_id"] == "xray_uuid_999"
    assert res["model_version"] == "v1.0.0"
    assert "findings" in res
    assert "inference_time_ms" in res


def test_analyze_local_file_path():
    """Test POST /analyze with valid local image file path."""
    temp_path = create_synthetic_image_file()
    try:
        data = {"image_path": temp_path, "patient_id": "2026/0705"}
        response = client.post("/analyze", data=data)
        assert response.status_code == 200
        res = response.json()
        assert res["status"] == "success"
        assert res["patient_id"] == "2026/0705"
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


def test_analyze_missing_input():
    """Test POST /analyze with missing image inputs returns 400 Bad Request."""
    response = client.post("/analyze", data={})
    assert response.status_code == 400
    res = response.json()
    assert res["status"] == "error"
    assert res["error_code"] == "INVALID_IMAGE"


def test_analyze_nonexistent_file_path():
    """Test POST /analyze with invalid file path returns 404 Not Found."""
    data = {"image_path": "non_existent_xray_file_path_12345.png"}
    response = client.post("/analyze", data=data)
    assert response.status_code == 404
    res = response.json()
    assert res["status"] == "error"
    assert res["error_code"] == "IMAGE_NOT_FOUND"


def test_analyze_empty_file_upload():
    """Test POST /analyze with empty bytes file upload returns 400 Bad Request."""
    files = {"file": ("empty.png", b"", "image/png")}
    response = client.post("/analyze", files=files)
    assert response.status_code == 400
    res = response.json()
    assert res["status"] == "error"
    assert res["error_code"] == "INVALID_IMAGE"
