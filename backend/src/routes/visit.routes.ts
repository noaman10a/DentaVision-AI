/**
 * DentaVision AI — Visit Routes
 * Owner: Twahir (Backend Lead)
 */

import { Router } from "express";
import {
  createVisitController,
  getVisitsByPatientController,
  getVisitByIdController,
  updateVisitController,
} from "../controllers/visit.controller";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

// POST /api/v1/visits — Create a new clinical visit
router.post("/", requireAuth, requireRole("doctor", "admin"), createVisitController);

// GET /api/v1/visits/:id — Get a single visit with all related data
router.get("/:id", requireAuth, getVisitByIdController);

// PATCH /api/v1/visits/:id — Update visit notes/diagnosis/treatment
router.patch("/:id", requireAuth, requireRole("doctor", "admin"), updateVisitController);

// GET /api/v1/visits/patient/:patientId — All visits for a patient
router.get("/patient/:patientId", requireAuth, getVisitsByPatientController);

export default router;
