# DentaVision AI — Clinical Backend Service

The backend service is an Express & TypeScript clinical API service that powers electronic health records (EHR), patient visit histories, prescription management, role-based authentication, and AI inference proxying.

---

## Architecture Overview

```
                      +-----------------------------+
                      |   Desktop React / Electron  |
                      |   Workstation (:5173/:3000) |
                      +--------------+--------------+
                                     |
                          REST API + Bearer Token
                                     v
                      +-----------------------------+
                      |    Node.js / Express API    |
                      |      Service (:5000)        |
                      +-------+-------------+-------+
                              |             |
           Prisma ORM Queries |             | Proxied Multipart X-Rays
                              v             v
             +--------------------+    +--------------------+
             | PostgreSQL DB /    |    |  FastAPI AI Micro- |
             | Supabase PACS EHR  |    |  Service (:8000)   |
             +--------------------+    +--------------------+
```

---

## Key Modules & Responsibilities

1. **Authentication & Authorization (`src/middleware/auth.ts`)**:
   - Validates Bearer tokens and extracts clinical role metadata (`admin`, `doctor`, `reception`).
   - Enforces RBAC permissions on protected clinical endpoints.

2. **Patient Records Management (`src/routes/patient.routes.ts`)**:
   - CRUD operations for demographic information, allergies, contact numbers, and patient emergency profiles.
   - Enforces structured schema validation via Zod (`src/validation/schemas.ts`).

3. **Clinical Visits & EHR Timeline (`src/routes/visit.routes.ts`, `timeline.routes.ts`)**:
   - Records consultation notes, chief complaints, intraoral diagnoses, and treatment plans.
   - Generates unified chronological timelines combining visits, radiograph findings, and prescriptions.

4. **Radiograph Processing Proxy (`src/routes/xray.routes.ts`)**:
   - Handles multi-part file uploads (PNG/JPEG panoramic radiographs).
   - Validates file constraints and forwards requests to the local Python AI inference service (`:8000/api/v1/analyze`).
   - Persists bounding boxes, confidence scores, and FDI tooth numbers in the database.

5. **Diagnostic Reports & Prescriptions (`src/routes/report.routes.ts`, `prescription.routes.ts`)**:
   - Facilitates doctor attestation, digital signatures, structured pharmaceutical regimens, and PDF print formatting.

---

## Environment Configuration

Create a `.env` file in `backend/` with the following variables:

```bash
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:password@localhost:5432/dentavision"
AI_SERVICE_URL="http://localhost:8000"
CORS_ORIGIN="http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000"
SUPABASE_URL=""
SUPABASE_ANON_KEY=""
```

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Database Migrations
```bash
npx prisma generate
npx prisma db push
```

### 3. Run Development Server
```bash
npm run dev
```
The server will start on `http://localhost:5000`.

### 4. Run Automated Tests
```bash
npm test
```
