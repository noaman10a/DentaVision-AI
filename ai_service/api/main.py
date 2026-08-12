"""
DentaVision AI - Local REST API Engine (FastAPI)
Owner: Soha (AI Service Lead)

Local REST API service installed on Doctor PCs.
Provides endpoints for health check, versioning, and X-ray analysis inference.
Complies with frozen V1 architecture: Local REST API only, human-in-the-loop, no DB/Cloud access.
"""

import io
import os
import time
import logging
from typing import Optional, Union, Dict, Any
import numpy as np

from fastapi import FastAPI, File, UploadFile, Form, Query, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from ai_service.inference.predictor import XRayPredictor
from ai_service.model.architecture import MODEL_VERSION
from ai_service.api.schemas import (
    HealthResponse,
    VersionResponse,
    AnalyzeResponse,
    ErrorResponse
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("AIServiceAPI")

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Warm up the model instance on service startup."""
    try:
        get_predictor()
        logger.info("DentaVision AI Service startup complete. Model loaded.")
    except Exception as e:
        logger.error(f"Error initializing predictor during startup: {e}")
    yield

# Initialize FastAPI Application
app = FastAPI(
    title="DentaVision AI Local REST Service",
    description="Local dental pathology detection & analysis service for doctor workstations.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Enable CORS for local Desktop Application (Electron/React)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restricted to local IPC/workstation clients
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Predictor instance (loaded on startup)
_predictor: Optional[XRayPredictor] = None


def get_predictor() -> XRayPredictor:
    """Singleton getter for XRayPredictor model pipeline."""
    global _predictor
    if _predictor is None:
        checkpoint_path = "ai_service/model/checkpoints/best_model.pt"
        weights_to_load = checkpoint_path if os.path.exists(checkpoint_path) else None
        logger.info(f"Initializing XRayPredictor model instance (weights: {weights_to_load})...")
        _predictor = XRayPredictor(weights_path=weights_to_load, device="cpu", confidence_threshold=0.5)
    return _predictor





# Custom Exception Handlers for structured JSON error reporting
@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    """Handle invalid/corrupt image inputs."""
    logger.warning(f"Validation error on {request.url}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "status": "error",
            "error_code": "INVALID_IMAGE",
            "message": str(exc)
        }
    )


@app.exception_handler(FileNotFoundError)
async def file_not_found_handler(request: Request, exc: FileNotFoundError):
    """Handle missing image file errors."""
    logger.warning(f"File not found on {request.url}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={
            "status": "error",
            "error_code": "IMAGE_NOT_FOUND",
            "message": str(exc)
        }
    )


@app.exception_handler(RuntimeError)
async def runtime_error_handler(request: Request, exc: RuntimeError):
    """Handle model loading / inference availability errors."""
    logger.error(f"Runtime error on {request.url}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        content={
            "status": "error",
            "error_code": "MODEL_UNAVAILABLE",
            "message": str(exc)
        }
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    """Fallback handler for unexpected internal failures."""
    logger.error(f"Unhandled exception on {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "status": "error",
            "error_code": "INTERNAL_ERROR",
            "message": "An unexpected error occurred during processing."
        }
    )


# --- API ENDPOINTS ---

@app.get("/health", response_model=HealthResponse, tags=["Health"])
@app.get("/api/v1/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """
    Health check endpoint.
    Verifies service availability and model readiness.
    """
    predictor_ready = False
    try:
        pred = get_predictor()
        predictor_ready = pred is not None and pred.model is not None
    except Exception as e:
        logger.warning(f"Health check model inspection: {e}")

    return HealthResponse(
        status="ok",
        service="dentavision-ai",
        model_loaded=predictor_ready
    )


@app.get("/version", response_model=VersionResponse, tags=["System"])
@app.get("/api/v1/version", response_model=VersionResponse, tags=["System"])
async def version_check():
    """
    Version check endpoint.
    Returns API version, service version, and AI model checkpoint version.
    """
    return VersionResponse(
        api_version="v1",
        service_version="1.0.0",
        model_version=MODEL_VERSION
    )


@app.post("/analyze", response_model=AnalyzeResponse, tags=["Inference"])
@app.post("/api/v1/analyze", response_model=AnalyzeResponse, tags=["Inference"])
async def analyze_xray(
    file: Optional[UploadFile] = File(None),
    image_path: Optional[str] = Form(None),
    patient_id: Optional[str] = Form(None),
    xray_id: Optional[str] = Form(None)
):
    """
    X-Ray Analysis & Pathology Detection Endpoint.
    Accepts image file upload (multipart) or temporary local image file path.
    Preprocesses X-ray, runs AI inference, and returns structured JSON findings.
    """
    image_array: Optional[np.ndarray] = None

    # Option 1: File Upload (Multipart)
    if file is not None:
        contents = await file.read()
        if not contents or len(contents) == 0:
            raise ValueError("Uploaded image file is empty")

        try:
            import cv2
            nparr = np.frombuffer(contents, np.uint8)
            image_array = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        except ImportError:
            from PIL import Image
            image_pil = Image.open(io.BytesIO(contents)).convert("RGB")
            image_array = np.array(image_pil)

        if image_array is None or image_array.size == 0:
            raise ValueError("Could not decode input image format")

    # Option 2: Local File Path
    elif image_path is not None:
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image path does not exist: {image_path}")

        try:
            import cv2
            image_array = cv2.imread(image_path, cv2.IMREAD_COLOR)
        except ImportError:
            from PIL import Image
            image_pil = Image.open(image_path).convert("RGB")
            image_array = np.array(image_pil)

        if image_array is None or image_array.size == 0:
            raise ValueError(f"Could not read or decode image at {image_path}")

    else:
        raise ValueError("Either an image file upload or image_path must be provided")

    # Execute Prediction Pipeline
    predictor = get_predictor()
    result = predictor.predict(
        image=image_array,
        patient_id=patient_id,
        xray_id=xray_id
    )

    return result
