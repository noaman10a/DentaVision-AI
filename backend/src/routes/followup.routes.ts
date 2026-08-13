import { Router } from "express";
import {
  createFollowUpController,
  getFollowUpsByPatientController,
  updateFollowUpController,
  deleteFollowUpController,
} from "../controllers/followup.controller";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

router.post("/", requireAuth, requireRole("doctor", "admin", "reception"), createFollowUpController);
router.get("/patient/:patientId", requireAuth, getFollowUpsByPatientController);
router.patch("/:id", requireAuth, requireRole("doctor", "admin", "reception"), updateFollowUpController);
router.delete("/:id", requireAuth, requireRole("doctor", "admin"), deleteFollowUpController);

export default router;
