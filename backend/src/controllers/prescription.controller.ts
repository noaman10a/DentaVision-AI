/**
 * DentaVision AI — Prescription Controller
 * Owner: Twahir (Backend Lead)
 */

import { Request, Response, NextFunction } from "express";
import {
  createPrescription,
  getPrescriptionsByVisit,
  deletePrescription,
} from "../services/prescription.service";
import { CreatePrescriptionSchema } from "../validation/schemas";
import { badRequest, notFound } from "../middleware/errorHandler";

export const createPrescriptionController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parsed = CreatePrescriptionSchema.safeParse(req.body);
    if (!parsed.success) return next(badRequest(parsed.error.issues[0].message));
    const prescription = await createPrescription(parsed.data);
    res.status(201).json({ success: true, data: prescription });
  } catch (err) {
    next(err);
  }
};

export const getPrescriptionsByVisitController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const visitId = Array.isArray(req.params.visitId)
      ? req.params.visitId[0]
      : req.params.visitId;
    const prescriptions = await getPrescriptionsByVisit(visitId);
    res.json({ success: true, data: prescriptions });
  } catch (err) {
    next(err);
  }
};

export const deletePrescriptionController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await deletePrescription(id);
    res.json({ success: true, message: "Prescription deleted" });
  } catch (err) {
    next(err);
  }
};

