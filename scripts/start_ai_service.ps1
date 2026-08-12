# DentaVision AI - Local AI Service Startup Script (PowerShell)
# Target: Doctor Workstation PC

$ErrorActionPreference = "Stop"
$rootDir = Resolve-Path "$PSScriptRoot\.."
Set-Location $rootDir

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " 🦷 Starting DentaVision AI Service on Local Workstation" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$venvPath = "$rootDir\ai_service\.venv"
$pythonExe = "$venvPath\Scripts\python.exe"

if (-not (Test-Path $pythonExe)) {
    Write-Host "Creating Python virtual environment in $venvPath..." -ForegroundColor Yellow
    python -m venv "$venvPath"
    Write-Host "Installing dependencies from ai_service/requirements.txt..." -ForegroundColor Yellow
    & "$pythonExe" -m pip install --upgrade pip
    & "$pythonExe" -m pip install -r "$rootDir\ai_service\requirements.txt"
}

Write-Host "Starting REST API server on http://127.0.0.1:8000 ..." -ForegroundColor Green
& "$pythonExe" "$rootDir\ai_service\run_server.py"
