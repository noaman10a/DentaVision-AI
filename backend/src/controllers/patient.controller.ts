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
    const { name, dob, gender, phone, email, address } = req.body as {
      name?: string;
      dob?: string;
      gender?: string;
      phone?: string;
      email?: string;
      address?: string;
    };

    if (!name) return next(badRequest("Patient name is required"));
    if (!dob) return next(badRequest("Date of birth (dob) is required"));
    if (!gender) return next(badRequest("Gender is required"));
    if (!phone) return next(badRequest("Phone number is required"));

    const patient = await createPatient({ name, dob, gender, phone, email, address });

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