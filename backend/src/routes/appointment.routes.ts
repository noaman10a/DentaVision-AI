import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import {
  createAppointmentController,
  getAppointmentsController,
  getAppointmentByIdController,
  updateAppointmentController,
  deleteAppointmentController,
} from "../controllers/appointment.controller";

const router = Router();

router.post(
  "/",
  requireAuth,
  requireRole("admin", "doctor", "reception"),
  createAppointmentController
);

router.get(
  "/",
  requireAuth,
  requireRole("admin", "doctor", "reception"),
  getAppointmentsController
);

router.get(
  "/:id",
  requireAuth,
  requireRole("admin", "doctor", "reception"),
  getAppointmentByIdController
);

router.put(
  "/:id",
  requireAuth,
  requireRole("admin", "doctor", "reception"),
  updateAppointmentController
);

router.delete(
  "/:id",
  requireAuth,
  requireRole("admin", "doctor", "reception"),
  deleteAppointmentController
);

export default router;