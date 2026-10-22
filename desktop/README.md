# DentaVision AI — Desktop Clinical Workstation

The desktop application is an interactive clinical workstation built with **React**, **Vite**, and **Vanilla CSS**. It provides dental surgeons and clinic staff with real-time AI-assisted panoramic radiograph interpretation, patient EHR workflows, voice-driven prescriptions, and report generation.

---

## Key Features

1. **Role-Based Clinical Portals**:
   - **Doctor Portal**: Diagnostic radiograph workspace, interactive odontogram tooth chart, EHR timeline, and report generator.
   - **Reception Portal**: Real-time patient intake queue, appointment scheduling, and registration search.
   - **Admin Portal**: System diagnostics, service health status, audit logs, and clinician accounts.

2. **Interactive Radiograph Viewer**:
   - Hardware-accelerated HTML5 canvas supporting zoom, pan, brightness/contrast adjustments, and invert controls.
   - Live bounding-box overlays with confidence scores, pathological labels, and FDI tooth designations.
   - Ability for clinicians to review, confirm, edit, or reject AI-detected findings.

3. **Interactive Odontogram Chart**:
   - Color-coded dental arch visualization displaying health status across all 32 adult teeth using FDI 2-digit notation.
   - Pathology heat mapping (caries, apical lesions, bone resorption, impacted teeth).

4. **Clinical Documentation & Reports**:
   - Draft and finalized diagnostic reports with clinician attestation and signatures.
   - Clean printable/exportable PDF layout for patient records and referral slips.
   - Voice-assisted prescription drafting with pre-configured dental pharmacopeia.

---

## Directory Structure

```
desktop/
├── public/              # Static assets and sample radiographs
├── src/
│   ├── assets/          # Application graphics and branding
│   ├── components/      # Reusable UI widgets, header, navbar, modals
│   ├── context/         # React Contexts (AuthContext, PatientContext, AIContext)
│   ├── pages/
│   │   ├── admin/       # Admin dashboards and health diagnostics
│   │   ├── doctor/      # Doctor workstation, workspace, reports, prescriptions
│   │   ├── reception/   # Reception queue, patient registration, search
│   │   └── shared/      # Profile, settings, shared clinical views
│   ├── services/        # API client for backend and AI microservice
│   └── styles/          # Design system tokens and global styling
└── vite.config.js       # Vite configuration
```

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```
The workstation will be available at `http://localhost:5173`.

### 3. Production Build
```bash
npm run build
```
The production bundle will be generated in `desktop/dist/`.
