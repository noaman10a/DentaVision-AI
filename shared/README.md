# DentaVision AI — Shared Assets & Common Utilities

This directory contains cross-cutting sample assets and common resources utilized across the DentaVision AI stack (Frontend, Backend, and AI Service).

---

## Contents

- **`sample_xray.png`**:
  A standardized sample dental panoramic radiograph (OPG) utilized for automated integration testing, local workstation offline demonstrations, and quick health-check verification.

---

## Usage in Workstation & Services

- **Integration Testing**:
  Automated tests in `ai_service/tests/` and `backend/tests/` utilize standardized test radiographs to ensure bounding-box geometry and API payloads conform to specification without requiring live clinical patient data.
- **Offline Demonstration**:
  Allows newly onboarded clinicians or developers to test radiograph analysis and report drafting without needing external database seed data.
