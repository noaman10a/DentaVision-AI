import { Router } from "express";
import { getTimelineController } from "../controllers/timeline.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/patient/:patientId", requireAuth, getTimelineController);

export default router;
