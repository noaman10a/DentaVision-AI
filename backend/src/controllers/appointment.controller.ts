import { Request, Response } from "express";

import {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
} from "../services/appointment.service";

export const createAppointmentController = (
  req: Request,
  res: Response
) => {
  try {
    const appointment = createAppointment(req.body);

    return res.status(201).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create appointment",
    });
  }
};

export const getAppointmentsController = (
  _req: Request,
  res: Response
) => {
  const appointments = getAppointments();

  return res.json({
    success: true,
    data: appointments,
  });
};

export const getAppointmentByIdController = (
  req: Request,
  res: Response
) => {
  const appointmentId = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;

  const appointment = getAppointmentById(appointmentId);

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: "Appointment not found",
    });
  }

  return res.json({
    success: true,
    data: appointment,
  });
};

export const updateAppointmentController = (
  req: Request,
  res: Response
) => {
  const appointmentId = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;

  const appointment = updateAppointment(
    appointmentId,
    req.body
  );

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: "Appointment not found",
    });
  }

  return res.json({
    success: true,
    data: appointment,
  });
};

export const deleteAppointmentController = (
  req: Request,
  res: Response
) => {
  const appointmentId = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;

  const deleted = deleteAppointment(appointmentId);

  if (!deleted) {
    return res.status(404).json({
      success: false,
      message: "Appointment not found",
    });
  }

  return res.json({
    success: true,
    message: "Appointment deleted successfully",
  });
};