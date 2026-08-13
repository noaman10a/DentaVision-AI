import { Router } from "express";
import {
  createReportController,
  getReportsByPatientController,
  getReportByIdController,
  finalizeReportController,
} from "../controllers/report.controller";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

router.post("/", requireAuth, requireRole("doctor", "admin"), createReportController);
router.get("/patient/:patientId", requireAuth, getReportsByPatientController);
router.get("/:id", requireAuth, getReportByIdController);
router.patch("/:id/finalize", requireAuth, requireRole("doctor", "admin"), finalizeReportController);

export default router;
