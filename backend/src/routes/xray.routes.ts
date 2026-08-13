/**
 * DentaVision AI — X-Ray Routes
 * Owner: Twahir (Backend Lead)
 *
 * Registered at: /api/v1/xrays
 *
 * Routes:
 *   POST /analyze              → Upload X-ray, forward to AI service, persist findings
 *   GET  /patient/:patientId   → Retrieve X-ray history for a patient
 */

import { Router } from "express";
import { xrayUpload } from "../middleware/upload";
import {
  analyzeXrayController,
  getXraysByPatientController,
} from "../controllers/xray.controller";

const router = Router();

/**
 * POST /api/v1/xrays/analyze
 *
 * Body: multipart/form-data
 *   - file        {File}    Required. X-ray image (PNG/JPEG, max 10MB)
 *   - patient_id  {string}  Required. Patient UUID
 *   - visit_id    {string}  Optional. Visit UUID to link to
 */
router.post(
  "/analyze",
  xrayUpload.single("file"),
  analyzeXrayController
);

/**
 * GET /api/v1/xrays/patient/:patientId
 *
 * Returns all X-ray records + AI analyses for a given patient.
 */
router.get("/patient/:patientId", getXraysByPatientController);

export default router;
