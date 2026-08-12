import { Router } from "express";

import {
  createPatientController,
  getPatientsController,
  getPatientByIdController,
} from "../controllers/patient.controller";

const router = Router();

router.post("/", createPatientController);

router.get("/", getPatientsController);

router.get("/:id", getPatientByIdController);

export default router;