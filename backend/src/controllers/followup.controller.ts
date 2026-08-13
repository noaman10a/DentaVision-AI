import { Request, Response, NextFunction } from "express";
import {
  createFollowUp,
  getFollowUpsByPatient,
  updateFollowUp,
  deleteFollowUp,
} from "../services/followup.service";
import { CreateFollowUpSchema, UpdateFollowUpSchema } from "../validation/schemas";
import { badRequest } from "../middleware/errorHandler";

export const createFollowUpController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = CreateFollowUpSchema.safeParse(req.body);
    if (!parsed.success) return next(badRequest(parsed.error.issues[0].message));
    const fu = await createFollowUp(parsed.data);
    res.status(201).json({ success: true, data: fu });
  } catch (err) { next(err); }
};

export const getFollowUpsByPatientController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const patientId = Array.isArray(req.params.patientId) ? req.params.patientId[0] : req.params.patientId;
    const fus = await getFollowUpsByPatient(patientId);
    res.json({ success: true, data: fus });
  } catch (err) { next(err); }
};

export const updateFollowUpController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const parsed = UpdateFollowUpSchema.safeParse(req.body);
    if (!parsed.success) return next(badRequest(parsed.error.issues[0].message));
    const fu = await updateFollowUp(id, parsed.data);
    res.json({ success: true, data: fu });
  } catch (err) { next(err); }
};

export const deleteFollowUpController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await deleteFollowUp(id);
    res.json({ success: true, message: "Follow-up deleted" });
  } catch (err) { next(err); }
};

