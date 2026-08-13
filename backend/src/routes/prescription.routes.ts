import { Router } from "express";
import {
  createPrescriptionController,
  getPrescriptionsByVisitController,
  deletePrescriptionController,
} from "../controllers/prescription.controller";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

router.post("/", requireAuth, requireRole("doctor", "admin"), createPrescriptionController);
router.get("/visit/:visitId", requireAuth, getPrescriptionsByVisitController);
router.delete("/:id", requireAuth, requireRole("doctor", "admin"), deletePrescriptionController);

export default router;
