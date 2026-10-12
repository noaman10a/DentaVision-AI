"""
DentaVision AI - Local REST API Server Launcher
Owner: Soha (AI Service Lead)

Launches the local FastAPI service on Doctor workstation PCs.
Default binding: http://127.0.0.1:8000
"""

import os
import sys
from pathlib import Path

# Ensure the project root (parent of ai_service/) is on sys.path
# so that `ai_service` is importable as a package regardless of CWD.
_project_root = str(Path(__file__).resolve().parents[1])
if _project_root not in sys.path:
    sys.path.insert(0, _project_root)

import uvicorn

if __name__ == "__main__":
    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", "8000"))
    print(f"[*] Starting DentaVision AI Local REST Service on http://{host}:{port}")
    uvicorn.run(
        "ai_service.api.main:app",
        host=host,
        port=port,
        reload=False,
        log_level="info"
    )
