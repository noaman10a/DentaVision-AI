# 📜 DentaVision AI — Operational Scripts

Utility and startup scripts for running, testing, and managing DentaVision AI services on clinic workstations.

---

## 🚀 Available Scripts

### `start_ai_service.ps1` / `start_ai_service.bat`
Launches the local FastAPI AI Service on `http://127.0.0.1:8000`.
- Automatically provisions `ai_service/.venv` and installs dependencies if not already initialized.
- Starts `uvicorn` engine.

**Usage (PowerShell)**:
```powershell
.\scripts\start_ai_service.ps1
```

**Usage (Command Prompt / Double-click)**:
Double-click `scripts\start_ai_service.bat` in Windows File Explorer.
