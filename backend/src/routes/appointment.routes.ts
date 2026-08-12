import { Router } from "express";

import {
  createAppointmentController,
  getAppointmentsController,
  getAppointmentByIdController,
  updateAppointmentController,
  deleteAppointmentController,
} from "../controllers/appointment.controller";

const router = Router();

router.post("/", createAppointmentController);
router.get("/", getAppointmentsController);
router.get("/:id", getAppointmentByIdController);
router.put("/:id", updateAppointmentController);
router.delete("/:id", deleteAppointmentController);

export default router;