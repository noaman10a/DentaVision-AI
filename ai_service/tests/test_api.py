"""
DentaVision AI - REST API Unit & Integration Tests
Owner: Soha (AI Service Lead)

Tests FastAPI endpoints (/health, /version, /analyze) and error handling schemas.
Compatible with both pytest and unittest test runners.
"""

import os
import io
import tempfile
import unittest
import numpy as np
from PIL import Image

try:
    from fastapi.testclient import TestClient
    from ai_service.api.main import app
    client = TestClient(app)
    HAS_FASTAPI_TESTCLIENT = True
except Exception:
    client = None
    HAS_FASTAPI_TESTCLIENT = False


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


class TestAPIService(unittest.TestCase):
    def setUp(self):
        if not HAS_FASTAPI_TESTCLIENT:
            self.skipTest("FastAPI TestClient not available")

    def test_health_endpoint(self):
        """Test GET /health and GET /api/v1/health."""
        response = client.get("/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "ok")
        self.assertEqual(data["service"], "dentavision-ai")
        self.assertTrue(data["model_loaded"])

        response_v1 = client.get("/api/v1/health")
        self.assertEqual(response_v1.status_code, 200)
        self.assertEqual(response_v1.json()["status"], "ok")

    def test_version_endpoint(self):
        """Test GET /version and GET /api/v1/version."""
        response = client.get("/version")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["api_version"], "v1")
        self.assertEqual(data["service_version"], "1.0.0")
        self.assertEqual(data["model_version"], "v1.0.0")

        response_v1 = client.get("/api/v1/version")
        self.assertEqual(response_v1.status_code, 200)
        self.assertEqual(response_v1.json()["model_version"], "v1.0.0")

    def test_analyze_multipart_upload(self):
        """Test POST /analyze with valid multipart image file upload."""
        img_bytes = create_synthetic_image_bytes()
        files = {"file": ("test_xray.png", img_bytes, "image/png")}
        data = {"patient_id": "2026/0705", "xray_id": "xray_uuid_999"}

        response = client.post("/analyze", files=files, data=data)
        self.assertEqual(response.status_code, 200)
        res = response.json()
        self.assertEqual(res["status"], "success")
        self.assertEqual(res["patient_id"], "2026/0705")
        self.assertEqual(res["xray_id"], "xray_uuid_999")
        self.assertEqual(res["model_version"], "v1.0.0")
        self.assertIn("findings", res)
        self.assertIn("inference_time_ms", res)

    def test_analyze_local_file_path(self):
        """Test POST /analyze with valid local image file path."""
        temp_path = create_synthetic_image_file()
        try:
            data = {"image_path": temp_path, "patient_id": "2026/0705"}
            response = client.post("/analyze", data=data)
            self.assertEqual(response.status_code, 200)
            res = response.json()
            self.assertEqual(res["status"], "success")
            self.assertEqual(res["patient_id"], "2026/0705")
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

    def test_analyze_missing_input(self):
        """Test POST /analyze with missing image inputs returns 400 Bad Request."""
        response = client.post("/analyze", data={})
        self.assertEqual(response.status_code, 400)
        res = response.json()
        self.assertEqual(res["status"], "error")
        self.assertEqual(res["error_code"], "INVALID_IMAGE")

    def test_analyze_nonexistent_file_path(self):
        """Test POST /analyze with invalid file path returns 404 Not Found."""
        data = {"image_path": "non_existent_xray_file_path_12345.png"}
        response = client.post("/analyze", data=data)
        self.assertEqual(response.status_code, 404)
        res = response.json()
        self.assertEqual(res["status"], "error")
        self.assertEqual(res["error_code"], "IMAGE_NOT_FOUND")

    def test_analyze_empty_file_upload(self):
        """Test POST /analyze with empty bytes file upload returns 400 Bad Request."""
        files = {"file": ("empty.png", b"", "image/png")}
        response = client.post("/analyze", files=files)
        self.assertEqual(response.status_code, 400)
        res = response.json()
        self.assertEqual(res["status"], "error")
        self.assertEqual(res["error_code"], "INVALID_IMAGE")


if __name__ == "__main__":
    unittest.main()
