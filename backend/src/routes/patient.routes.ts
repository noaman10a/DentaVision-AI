import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import {
  createPatientController,
  getPatientsController,
  getPatientByIdController,
} from "../controllers/patient.controller";

const router = Router();

// Protect all patient endpoints: requires valid authentication
router.post(
  "/",
  requireAuth,
  requireRole("admin", "doctor", "reception"),
  createPatientController
);

router.get(
  "/",
  requireAuth,
  requireRole("admin", "doctor", "reception"),
  getPatientsController
);

router.get(
  "/:id",
  requireAuth,
  requireRole("admin", "doctor", "reception"),
  getPatientByIdController
);

export default router;