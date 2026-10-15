/**
 * DentaVision AI — Patient Controller
 * Owner: Twahir (Backend Lead)
 *
 * Handles HTTP request/response for patient operations.
 * All service calls are async (Prisma DB).
 */

import { Request, Response, NextFunction } from "express";
import {
  createPatient,
  getPatients,
  getPatientById,
} from "../services/patient.service";
import { CreatePatientSchema } from "../validation/schemas";
import { badRequest, notFound } from "../middleware/errorHandler";

// ---------------------------------------------------------------------------
// POST /api/v1/patients
// ---------------------------------------------------------------------------

export const createPatientController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parseResult = CreatePatientSchema.safeParse(req.body);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      return next(badRequest(issue?.message || "Invalid patient data"));
    }

    const patient = await createPatient(parseResult.data);

    res.status(201).json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// GET /api/v1/patients
// ---------------------------------------------------------------------------

export const getPatientsController = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const patients = await getPatients();
    res.json({ success: true, data: patients });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// GET /api/v1/patients/:id
// ---------------------------------------------------------------------------

export const getPatientByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const patientId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const patient = await getPatientById(patientId);

    if (!patient) {
      return next(notFound(`Patient ${patientId}`));
    }

    res.json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
};
