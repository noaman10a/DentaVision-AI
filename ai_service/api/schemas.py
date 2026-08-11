"""
DentaVision AI - API Data Schemas & Pydantic Validation Models
Owner: Soha (AI Service Lead)

Defines request/response payload schemas and validation models for the local REST API.
Fully compliant with the approved DentaVision AI Master Design Specification (MDS).
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    """Schema for GET /health endpoint."""
    status: str = Field("ok", description="Service readiness status")
    service: str = Field("dentavision-ai", description="AI Service identifier")
    model_loaded: bool = Field(True, description="Indicates if PyTorch model is loaded and ready")


class VersionResponse(BaseModel):
    """Schema for GET /version endpoint."""
    api_version: str = Field("v1", description="REST API version")
    service_version: str = Field("1.0.0", description="AI Service application version")
    model_version: str = Field("v1.0.0", description="Trained AI model checkpoint version")


class BoundingBox(BaseModel):
    """Normalized bounding box coordinates (0.0 to 1.0 range)."""
    x_min: float = Field(..., ge=0.0, le=1.0, description="Normalized minimum X coordinate")
    y_min: float = Field(..., ge=0.0, le=1.0, description="Normalized minimum Y coordinate")
    x_max: float = Field(..., ge=0.0, le=1.0, description="Normalized maximum X coordinate")
    y_max: float = Field(..., ge=0.0, le=1.0, description="Normalized maximum Y coordinate")


class FindingItem(BaseModel):
    """Individual pathology finding item detected by the AI model."""
    id: str = Field(..., description="Unique UUID for finding instance")
    finding_type: str = Field(..., description="Pathology classification label (e.g. Caries, Bone Loss)")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Model prediction confidence score")
    bounding_box: BoundingBox = Field(..., description="Bounding box region on input image")
    tooth_number: Optional[str] = Field(None, description="FDI tooth designation number if identified")
    severity: str = Field("Pending Review", description="Finding severity status for doctor review")


class AnalyzeResponse(BaseModel):
    """Schema for successful POST /analyze inference response."""
    status: str = Field("success", description="Response status indicator")
    patient_id: Optional[str] = Field(None, description="Optional patient reference ID")
    xray_id: Optional[str] = Field(None, description="Optional X-ray image reference ID")
    model_version: str = Field("v1.0.0", description="Model version used for analysis")
    inference_time_ms: float = Field(..., ge=0.0, description="Total execution time in milliseconds")
    findings_count: int = Field(..., ge=0, description="Total number of detected pathology findings")
    findings: List[FindingItem] = Field(default_factory=list, description="List of detected findings")
    timestamp: str = Field(..., description="ISO 8601 UTC execution timestamp")


class ErrorResponse(BaseModel):
    """Schema for API error responses."""
    status: str = Field("error", description="Error status indicator")
    error_code: str = Field(..., description="Standardized machine-readable error code")
    message: str = Field(..., description="Human-readable description of error cause")
