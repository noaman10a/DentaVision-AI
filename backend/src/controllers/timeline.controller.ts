import { Request, Response, NextFunction } from "express";
import { getTimelineByPatient } from "../services/timeline.service";

export const getTimelineController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const patientId = Array.isArray(req.params.patientId)
      ? req.params.patientId[0]
      : req.params.patientId;
    const events = await getTimelineByPatient(patientId);
    res.json({ success: true, data: events });
  } catch (err) { next(err); }
};

