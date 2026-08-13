/**
 * DentaVision AI — Visit Controller
 * Owner: Twahir (Backend Lead)
 */

import { Request, Response, NextFunction } from "express";
import {
  createVisit,
  getVisitsByPatient,
  getVisitById,
  updateVisit,
} from "../services/visit.service";
import { CreateVisitSchema, UpdateVisitSchema } from "../validation/schemas";
import { notFound, badRequest } from "../middleware/errorHandler";

export const createVisitController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parsed = CreateVisitSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(badRequest(parsed.error.issues[0].message));
    }
    const visit = await createVisit(parsed.data);
    res.status(201).json({ success: true, data: visit });
  } catch (err) {
    next(err);
  }
};

export const getVisitsByPatientController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const patientId = Array.isArray(req.params.patientId)
      ? req.params.patientId[0]
      : req.params.patientId;
    const visits = await getVisitsByPatient(patientId);
    res.json({ success: true, data: visits });
  } catch (err) {
    next(err);
  }
};

export const getVisitByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const visit = await getVisitById(id);
    if (!visit) return next(notFound("Visit"));
    res.json({ success: true, data: visit });
  } catch (err) {
    next(err);
  }
};

export const updateVisitController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const parsed = UpdateVisitSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(badRequest(parsed.error.issues[0].message));
    }
    const visit = await updateVisit(id, parsed.data);
    res.json({ success: true, data: visit });
  } catch (err) {
    next(err);
  }
};

