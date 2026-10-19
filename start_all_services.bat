@echo off
TITLE DentaVision AI — Complete System Launcher
COLOR 0B

echo ======================================================================
echo    🦷 DENTAVISION AI — 1-CLICK CLINICAL SUITE LAUNCHER
echo    Technical Lead: Noaman  ^|  Final Year Major Project
echo ======================================================================
echo.

set ROOT_DIR=%~dp0
cd /d "%ROOT_DIR%"

echo [1/3] Starting Local AI Service (FastAPI on Port 8000)...
start "DentaVision AI Service (Port 8000)" cmd /k "cd /d "%ROOT_DIR%" && .venv\Scripts\python.exe ai_service\run_server.py"

timeout /t 3 /nobreak >nul

echo [2/3] Starting Backend API Server (Express on Port 5000)...
start "DentaVision Backend (Port 5000)" cmd /k "cd /d "%ROOT_DIR%backend" && npm run dev"

timeout /t 3 /nobreak >nul

echo [3/3] Starting Desktop Application (Electron + React)...
start "DentaVision Desktop Client" cmd /k "cd /d "%ROOT_DIR%desktop" && npm run electron:dev"

echo.
echo ======================================================================
echo  All 3 services launched successfully!
echo  - AI Service  : http://127.0.0.1:8000/docs
echo  - Backend API : http://localhost:5000/api/v1/health
echo  - Desktop UI  : Electron Desktop Workstation Window
echo ======================================================================
echo.
pause
