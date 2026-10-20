# DentaVision AI — Version 1 (V1) Installation & Testing Guide
**Document Status:** Version 1 Frozen & Verified  
**Date:** October 2026  
**Audience:** Clinical Staff, Evaluators, Developers, System Administrators  

---

## 1. Project Overview & Architecture

**DentaVision AI** is an offline-first, clinical desktop workstation and diagnostic decision-support suite designed for dental surgeons and clinical front-desk staff. It combines local deep learning object detection with a high-performance clinical workspace, dental odontogram heat mapping, and an attestation workflow for human-in-the-loop validation.

```
                      ┌──────────────────────────────────────────────┐
                      │    DentaVision Desktop Client (Electron)     │
                      │       React 18 + Vite (Port 3000 / IPC)      │
                      └──────────────────────┬───────────────────────┘
                                             │
                      ┌──────────────────────┴───────────────────────┐
                      │                                              │
                      ▼                                              ▼
       ┌──────────────────────────────┐              ┌──────────────────────────────┐
       │   Express Backend Service    │              │   FastAPI AI Microservice    │
       │     Node.js (Port 5000)      │─────────────▶│      Python (Port 8000)      │
       │   Prisma + In-Memory Fallback│  (REST Proxy)│   YOLO Deep Neural Network   │
       └──────────────────────────────┘              └──────────────────────────────┘
                      │                                              │
                      ▼                                              ▼
       ┌──────────────────────────────┐              ┌──────────────────────────────┐
       │     PostgreSQL / SQLite      │              │  Checkpoints (best_model.pt) │
       │  (Clinical Records & Visits) │              │  (14-Class Dental Detection) │
       └──────────────────────────────┘              └──────────────────────────────┘
```

### Component Summary
1. **Desktop Client (`desktop/`)**: Electron app with React 18, Vite, and Lucide icons. Operates in dark clinical mode with glassmorphic styling.
2. **Backend Server (`backend/`)**: Node.js Express server providing RESTful endpoints (`/api/v1`) for patients, visits, prescriptions, reports, follow-ups, and X-ray records. Includes database persistence with Prisma and an automatic in-memory fallback.
3. **AI Inference Service (`ai_service/`)**: Local FastAPI Python microservice running a fine-tuned YOLO model (`best_model.pt`) providing sub-second dental lesion detection.
4. **Clinical Odontogram & Heat Chart (`desktop/src/components/clinical/TeethChart.jsx`)**: Interactive 32-tooth FDI dental arch situated below the radiograph viewer, dynamically synchronized with AI findings.

---

## 2. System Requirements

### Hardware Requirements
| Component | Minimum Specification | Recommended Specification |
| :--- | :--- | :--- |
| **Operating System** | Windows 10 (64-bit) | Windows 11 (64-bit) |
| **Processor (CPU)** | Intel Core i5 (8th Gen+) or AMD Ryzen 5 | Intel Core i7 / AMD Ryzen 7 |
| **Memory (RAM)** | 8 GB RAM | 16 GB RAM |
| **Storage** | 5 GB available disk space (SSD) | 10 GB available SSD space |
| **Graphics (GPU)** | Integrated Intel UHD / AMD Radeon | NVIDIA GTX 1650 / RTX 3050+ (CUDA) |
| **Display** | 1366 × 768 resolution | 1920 × 1080 Full HD or higher |

---

## 3. Software Prerequisites

Before installing DentaVision AI, ensure the following software tools are installed on your Windows machine:

### 1. Node.js (JavaScript Runtime)
* **Purpose:** Runs the Express backend server and compiles the React desktop client.
* **Compatible Version:** Node.js v18.x or v20.x LTS.
* **Download:** [https://nodejs.org/](https://nodejs.org/)
* **Verification Command:**
  ```powershell
  node -v
  npm -v
  ```
  *(Expected: `v18.x.x` or `v20.x.x`)*

### 2. Python (Machine Learning Runtime)
* **Purpose:** Runs the FastAPI AI microservice and PyTorch YOLO inference pipeline.
* **Compatible Version:** Python 3.10 to 3.12 (or 3.14).
* **Download:** [https://www.python.org/downloads/](https://www.python.org/downloads/)
* **Verification Command:**
  ```powershell
  python --version
  ```
  *(Expected: `Python 3.10.x` or higher)*

### 3. Git for Windows
* **Purpose:** Cloning the repository, synchronizing version control branches, and running scripts.
* **Download:** [https://git-scm.com/download/win](https://git-scm.com/download/win)
* **Verification Command:**
  ```powershell
  git --version
  ```

---

## 4. Downloading the Project

### Method A: Clone via Git (Recommended)
1. Open PowerShell or Command Prompt.
2. Navigate to your desired working directory:
   ```powershell
   cd D:\Collage\Major Project
   ```
3. Clone the official repository:
   ```powershell
   git clone https://github.com/noaman10a/DentaVision-AI.git
   ```
4. Enter the repository root:
   ```powershell
   cd DentaVision-AI
   ```

### Method B: Download ZIP File
1. Visit the GitHub repository: `https://github.com/noaman10a/DentaVision-AI`
2. Click the green **Code** button and select **Download ZIP**.
3. Extract the ZIP file to `D:\Collage\Major Project\DentaVision-AI`.
4. Open the folder in File Explorer or VS Code.

---

## 5. Complete Installation & Setup

Execute the setup steps in the exact sequence shown below.

### Step 1: Set Up the Python AI Microservice Environment
From the project root (`D:\Collage\Major Project\DentaVision-AI`):

```powershell
# 1. Create a dedicated Python virtual environment
python -m venv .venv

# 2. Activate the virtual environment
.venv\Scripts\activate

# 3. Upgrade pip package manager
python -m pip install --upgrade pip

# 4. Install AI service dependencies
pip install -r ai_service\requirements.txt
```

Verify that the model checkpoint exists at:
```
ai_service\model\checkpoints\best_model.pt
```
*(File size: ~40.5 MB. Bundled directly in the repository).*

---

### Step 2: Set Up the Backend Express Server
From the project root:

```powershell
# 1. Navigate to backend directory
cd backend

# 2. Install Node dependencies
npm install

# 3. Create your local .env configuration from example
copy .env.example .env

# 4. Return to root
cd ..
```

*Note on Database:* The backend includes an automated in-memory clinical fallback store. Even without an active PostgreSQL instance, all patient records, visits, and AI analyses will function in development and testing.

---

### Step 3: Set Up the Desktop Client
From the project root:

```powershell
# 1. Navigate to desktop directory
cd desktop

# 2. Install Node dependencies
npm install

# 3. Return to root
cd ..
```

---

## 6. Running the Application

### Option A: 1-Click Launch (Recommended for Demonstration)
Double-click the launcher script in the root directory:
```
start_all_services.bat
```
This batch script will automatically:
1. Start the FastAPI AI service on `http://127.0.0.1:8000`.
2. Start the Express API server on `http://localhost:5000`.
3. Launch the Vite dev server and open the Electron Workstation window.

---

### Option B: Manual Multi-Terminal Launch
If you prefer running services in separate terminal tabs:

**Terminal 1 — AI Inference Service:**
```powershell
cd "D:\Collage\Major Project\DentaVision-AI"
.venv\Scripts\python.exe ai_service\run_server.py
```
*Health Check:* Open `http://127.0.0.1:8000/docs` in your browser.

**Terminal 2 — Express Backend Server:**
```powershell
cd "D:\Collage\Major Project\DentaVision-AI\backend"
npm run dev
```
*Health Check:* Open `http://localhost:5000/api/v1/health` in your browser.

**Terminal 3 — Desktop Electron Client:**
```powershell
cd "D:\Collage\Major Project\DentaVision-AI\desktop"
npm run electron:dev
```

---

### Option C: Production Desktop Mode (No Web Server Needed)
To run the desktop application as a standalone production client loading compiled assets:

```powershell
cd "D:\Collage\Major Project\DentaVision-AI\desktop"
npm run build
npm run electron:prod
```

---

## 7. Login Credentials & Pre-Configured Accounts

DentaVision AI enforces role-based access control (RBAC). Three pre-configured clinical accounts are available out of the box:

| Role | Email Address | Password | Permissions & Views Accessible |
| :--- | :--- | :--- | :--- |
| **Senior Dental Surgeon** | `doctor@dentavision.ai` *(or `twahir.doctor@dentavision.ai`)* | `password123` | Doctor Dashboard, Patient Workspace, AI X-Ray Inference, Odontogram Heat Chart, Finding Modification, Clinical Visits, Prescriptions, Diagnostic Reports, Profile. |
| **Receptionist Lead** | `reception@dentavision.ai` *(or `sneha.reception@dentavision.ai`)* | `password123` | Reception Desk, New Patient Intake Registration, Patient Search, Clinic Queue, Radiograph Attachment, Profile. *(Doctor and Admin panels restricted).* |
| **System Administrator** | `noaman@batman.com` *(or `admin@dentavision.ai`)* | `imbatman` | Hardware & AI model telemetry, Database latency metrics, API Health Monitoring, System Audit logs. |

### Password Recovery (Forgot Password Workflow)
1. On the login screen, click **Forgot Password?**.
2. Enter any registered email address (e.g., `doctor@dentavision.ai`).
3. Click **Send Verification Code**. The system generates a 6-digit OTP (displayed in an instant preview card).
4. Enter the 6-digit OTP code and click **Verify Code**.
5. Set your new password and click **Confirm Password Reset**.
6. The account password updates immediately and allows instant login with the new credentials.

---

## 8. Complete Feature List & Audit Matrix

All features listed below have been verified on the Version 1 build:

| ID | Feature Domain | Specific Capability | Status |
| :---: | :--- | :--- | :---: |
| **F-01** | **Authentication** | Secure email and password authentication with clinical role routing | **PASS** |
| **F-02** | **Authentication** | 4-step OTP forgot-password recovery with dynamic credential update | **PASS** |
| **F-03** | **Authorization** | Strict role-based guard restricting Receptionists from clinical notes | **PASS** |
| **F-04** | **Reception Desk** | Patient registration with validation (Name, Phone, DOB, Emergency Contact) | **PASS** |
| **F-05** | **Reception Desk** | Instant intake radiograph attachment and auto-assigned Patient ID | **PASS** |
| **F-06** | **Patient Search** | Real-time patient directory search by name, phone, or patient ID | **PASS** |
| **F-07** | **Doctor Dashboard** | Real-time clinical queue, patient waiting count, and AI highlight preview | **PASS** |
| **F-08** | **Workspace** | High-resolution OPG radiograph viewport with pan and zoom controls | **PASS** |
| **F-09** | **Radiograph Tools** | Dental Caliper Measurement Ruler with scale calibration (~14.2 px/mm) | **PASS** |
| **F-10** | **Radiograph Tools** | Multi-spectral contrast presets: Standard (STD), Bone, Enamel, Negative | **PASS** |
| **F-11** | **AI Inference** | Sub-second YOLO neural network inference detecting dental pathologies | **PASS** |
| **F-12** | **AI Inference** | Live confidence threshold filtering (10%, 15% Rec, 25% Med, 40% High) | **PASS** |
| **F-13** | **Odontogram** | Interactive 32-tooth FDI heat chart situated directly below radiograph | **PASS** |
| **F-14** | **Odontogram** | Bidirectional finding synchronization (Radiograph Bounding Box ⟷ Tooth Crown) | **PASS** |
| **F-15** | **Doctor Attestation** | Selected finding drawer with Accept, Modify Modal, and Decline actions | **PASS** |
| **F-16** | **Clinical Visit** | SOAP clinical notes recording with Speech-to-Text voice dictation | **PASS** |
| **F-17** | **Prescriptions** | Dental pharmacopeia prescription builder with dosage, timing, and print layout | **PASS** |
| **F-18** | **Diagnostic Report** | Multi-finding automated report generation with print and PDF export | **PASS** |
| **F-19** | **System Telemetry** | Administrator live health screen measuring real backend and AI service latencies | **PASS** |

---

## 9. Feature-by-Feature Testing Manual

### Test Case 1: Application Launch & Authentication
* **Objective:** Verify user login with valid clinical credentials.
* **Steps:**
  1. Launch the application via `start_all_services.bat`.
  2. The window opens to the Login page (`#/login`).
  3. Enter email: `doctor@dentavision.ai`
  4. Enter password: `password123`
  5. Click **Sign In to Clinical Gateway**.
* **Expected Result:** Application transitions to the Doctor Dashboard (`#/doctor`) and displays user profile badge for "Dr. Twahir Mohammed".
* **Pass Criteria:** Doctor dashboard loads without errors.

---

### Test Case 2: Invalid Login Handling
* **Objective:** Verify security handling for incorrect credentials.
* **Steps:**
  1. Open Login page (`#/login`).
  2. Enter email: `doctor@dentavision.ai`
  3. Enter password: `wrongpassword`
  4. Click **Sign In**.
* **Expected Result:** Login is blocked. A red error banner appears: *"Invalid password. Please verify your credentials or use Forgot Password."*
* **Pass Criteria:** User is not authenticated; error banner is visible.

---

### Test Case 3: Reception Desk & Patient Registration
* **Objective:** Register a new patient and verify queue addition.
* **Steps:**
  1. Log in as `reception@dentavision.ai` / `password123`.
  2. Click **Register New Patient** (or navigate to `#/reception/register`).
  3. Fill in:
     * Full Name: `Kavita Nair`
     * Phone: `+91 98450 99887`
     * Email: `kavita.nair@example.com`
     * DOB: `1990-05-12`
     * Gender: `Female`
     * Address: `Indiranagar, Bangalore`
     * Emergency Contact: `Ravi Nair (+91 98450 99888)`
  4. Click **Register & Queue Patient**.
* **Expected Result:** Success card displays generated Patient ID (e.g., `PT-2026-XXXX`). Patient appears immediately in Reception Desk directory.
* **Pass Criteria:** Patient ID generated and added to search directory.

---

### Test Case 4: OPG Radiograph Inspection & Tools
* **Objective:** Verify pan, zoom, contrast presets, and measurement caliper.
* **Steps:**
  1. Log in as `doctor@dentavision.ai`.
  2. Click **Patient Workspace** in the sidebar.
  3. Under the **X-rays & AI Engine** tab:
     * Click **Zoom In (+)** and **Zoom Out (-)**. The radiograph scales smoothly.
     * Click **Pan**, then click and drag the image. Canvas pans smoothly.
     * Click **Scale Ruler**, then click two points on a tooth crown.
     * Click contrast presets: **STD**, **BONE**, **ENAM**, **NEG**.
* **Expected Result:** Caliper displays measured distance in millimeters (e.g., `12.4 mm`). Image contrast updates dynamically according to radiography preset.
* **Pass Criteria:** Measurements render with cyan dashed caliper line; presets apply correctly.

---

### Test Case 5: AI Inference & Lesion Detection
* **Objective:** Trigger neural net detection on an OPG radiograph.
* **Steps:**
  1. In the Patient Workspace, click **Upload OPG X-Ray**.
  2. Select any panoramic radiograph (e.g., `shared/sample_xray.png`).
  3. Observe status indicator: *"Analyzing..."*
* **Expected Result:** AI completes inference in <300ms. Overlaid bounding boxes appear highlighting detected pathologies (e.g., `Tooth #12 - Orthodontic device (45%)` or `Tooth #46 - Caries (92%)`).
* **Pass Criteria:** Bounding boxes render with color-coded labels and confidence percentages.

---

### Test Case 6: Interactive 32-Tooth Odontogram Heat Chart
* **Objective:** Verify heat chart placement and bidirectional synchronization.
* **Steps:**
  1. In the Patient Workspace, scroll directly below the radiograph image.
  2. Inspect the **Interactive AI Odontogram & Heat Chart (FDI System)**.
  3. Click on **Tooth #46** in the Lower Mandible arch.
* **Expected Result:**
  * Tooth #46 is highlighted with a cyan glowing border.
  * Tooth detail card appears below: *"#46 Lower Right First Molar — Periapical / Caries"*.
  * The corresponding bounding box on the radiograph viewport above is highlighted.
* **Pass Criteria:** The chart is situated directly below the X-ray viewer and synchronizes bidirectionally with the image.

---

### Test Case 7: Doctor Human-in-the-Loop Finding Attestation
* **Objective:** Modify an AI finding using the clinical modal.
* **Steps:**
  1. In the Selected Finding Drawer below the X-ray, click **Modify**.
  2. The **Modify Clinical Finding** modal appears.
  3. Change fields:
     * Tooth Location: Select `Tooth #46 - Lower Right 1st Molar`
     * Pathology Category: Select `Caries`
     * Clinical Severity: Select `Severe (Deep / Pulp)`
     * Diagnostic Confidence: Slide to `95%`
     * Notes: Enter `Extensive dentin cavitation with close pulpal proximity.`
  4. Click **Save Finding**.
* **Expected Result:** Modal closes. Finding badge updates to **Modified**. Teeth chart reflects updated severity and color.
* **Pass Criteria:** Modal fields save correctly; status changes to Modified in state.

---

### Test Case 8: Clinical SOAP Visit Documentation
* **Objective:** Record a clinical visit with voice dictation.
* **Steps:**
  1. In Patient Workspace, click the **Clinical Visits** tab.
  2. Click the microphone icon next to **Chief Complaint**.
  3. Speak or observe realistic clinical template population:
     *"Severe throbbing pain in lower right posterior quadrant..."*
  4. Click **Save Clinical Visit Record**.
* **Expected Result:** Green confirmation banner appears: *"Clinical visit record successfully saved & encrypted"*.
* **Pass Criteria:** Visit record is saved and persisted in patient timeline.

---

### Test Case 9: Dental Prescription Generation
* **Objective:** Add dental medications and generate a printable prescription.
* **Steps:**
  1. In Patient Workspace, click the **Prescriptions** tab.
  2. Select medicine `Amoxicillin`, strength `500mg`, dose `1 Capsule`, frequency `TDS (3x/day)`.
  3. Click **Add Medication**.
  4. Click **Print / Export Prescription**.
* **Expected Result:** Medication is appended to active list. Native print dialog opens with clinic header, doctor registration number, and prescription details.
* **Pass Criteria:** Prescription is printable with complete dosage and doctor signature block.

---

### Test Case 10: Diagnostic Report Generator
* **Objective:** Compile AI findings and doctor notes into an official diagnostic report.
* **Steps:**
  1. In Patient Workspace, click **Diagnostic Reports**.
  2. Review the auto-populated AI finding summary.
  3. Add customized clinical evaluation notes.
  4. Click **Save Draft Report**.
  5. Click **Print / Save as PDF**.
* **Expected Result:** Official report draft saves with timestamp and doctor ID. Print preview formats report for clinical handoff.
* **Pass Criteria:** Report generates with patient demographics, AI findings, and clinical notes.

---

## 10. Automated Testing Execution

To run the automated test suite across all subsystems:

### 1. Backend Automated Tests (Vitest)
```powershell
cd "D:\Collage\Major Project\DentaVision-AI\backend"
npm test
```
*Result:* **17 tests passed** across `health.test.ts`, `patient.test.ts`, and `validation.test.ts`.

### 2. AI Inference Microservice Tests (PyTest)
```powershell
cd "D:\Collage\Major Project\DentaVision-AI"
.venv\Scripts\python.exe -m pytest ai_service\tests\test_api.py ai_service\tests\test_inference_predictor.py ai_service\tests\test_preprocessing_pipeline.py
```
*Result:* **16 tests passed** across API validation, predictor inference, and image preprocessing.

### 3. Frontend Production Build Validation (Vite)
```powershell
cd "D:\Collage\Major Project\DentaVision-AI\desktop"
npm run build
```
*Result:* **Built in 2.29s with 0 errors** (`dist/assets/index-*.js`, `dist/assets/index-*.css`).

---

## 11. Troubleshooting & Common Errors

| Issue / Error | Root Cause | Solution |
| :--- | :--- | :--- |
| **Port 5000 Already in Use** | An existing Node process is holding the port. | Run `netstat -ano \| findstr :5000`, note the PID, and terminate it via `taskkill /F /PID <PID>`. |
| **Port 8000 Already in Use** | An existing Python Uvicorn process is active. | Run `netstat -ano \| findstr :8000`, note the PID, and terminate it via `taskkill /F /PID <PID>`. |
| **`No module named 'ai_service'`** | Python execution path does not include the project root. | Always run Python from the project root using `.venv\Scripts\python.exe` or execute with `-m` (e.g., `python -m pytest`). |
| **Electron Window Shows Blank Screen** | Dev server has not completed initial compilation. | Wait 3 seconds for Vite to compile or run in production mode via `npm run electron:prod`. |
| **`supabaseUrl is required` in Logs** | Local database development mode without remote Supabase configured. | Harmless warning. The backend automatically switches to its built-in in-memory clinical data store. |

---

## 12. Safe Application Shutdown Procedure

To cleanly terminate all running services without leaving orphaned background processes:

1. Close the Electron Desktop application window.
2. In the terminal running the Vite/Electron process, press `Ctrl + C` and type `Y`.
3. In the terminal running the Express backend server, press `Ctrl + C` and type `Y`.
4. In the terminal running the FastAPI AI microservice, press `Ctrl + C`.
5. *(Optional verification):*
   ```powershell
   Get-Process -Name node, python, electron -ErrorAction SilentlyContinue
   ```

---

## 13. Git Status & Version Control Summary

* **Active Working Branch:** `main` (fully synchronized with `develop`).
* **Version 1 Commit Hash:** `9a10e34` (and documentation commit).
* **Tracked State:** Clean working tree. No uncommitted modifications or tracked secrets.
* **To Push from Interactive Terminal:**
  ```powershell
  git push origin main develop
  ```

---

*DentaVision AI — Version 1 Release Freeze Complete.*
