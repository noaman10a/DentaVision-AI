import { Request, Response, NextFunction } from "express";
import {
  createReport,
  getReportsByPatient,
  getReportById,
  finalizeReport,
} from "../services/report.service";
import { CreateReportSchema, FinalizeReportSchema } from "../validation/schemas";
import { badRequest, notFound } from "../middleware/errorHandler";

export const createReportController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parsed = CreateReportSchema.safeParse(req.body);
    if (!parsed.success) return next(badRequest(parsed.error.issues[0].message));
    const report = await createReport(parsed.data);
    res.status(201).json({ success: true, data: report });
  } catch (err) { next(err); }
};

export const getReportsByPatientController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const patientId = Array.isArray(req.params.patientId)
      ? req.params.patientId[0]
      : req.params.patientId;
    const reports = await getReportsByPatient(patientId);
    res.json({ success: true, data: reports });
  } catch (err) { next(err); }
};

export const getReportByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const report = await getReportById(id);
    if (!report) return next(notFound("Report"));
    res.json({ success: true, data: report });
  } catch (err) { next(err); }
};

export const finalizeReportController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const parsed = FinalizeReportSchema.safeParse(req.body);
    if (!parsed.success) return next(badRequest(parsed.error.issues[0].message));
    const report = await finalizeReport(id, parsed.data);
    res.json({ success: true, data: report });
  } catch (err) { next(err); }
};

