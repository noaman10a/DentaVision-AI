"""
DentaVision AI - Local REST API Server Launcher
Owner: Soha (AI Service Lead)

Launches the local FastAPI service on Doctor workstation PCs.
Default binding: http://127.0.0.1:8000
"""

import os
import uvicorn

if __name__ == "__main__":
    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", "8000"))
    
    print(f"🚀 Starting DentaVision AI Local REST Service on http://{host}:{port}")
    uvicorn.run(
        "ai_service.api.main:app",
        host=host,
        port=port,
        reload=False,
        log_level="info"
    )
