import { Request, Response } from "express";
import {
  createPatient,
  getPatients,
  getPatientById,
} from "../services/patient.service";

export const createPatientController = (
  req: Request,
  res: Response
) => {
  try {
    const { name, age, gender, phone } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Patient name is required",
      });
    }

    const patient = createPatient(
      name,
      age,
      gender,
      phone
    );

    return res.status(201).json({
      success: true,
      data: patient,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create patient",
    });
  }
};

export const getPatientsController = (
  _req: Request,
  res: Response
) => {
  return res.json({
    success: true,
    data: getPatients(),
  });
};

export const getPatientByIdController = (
  req: Request,
  res: Response
) => {
  const patientId = Array.isArray(req.params.id)
  ? req.params.id[0]
  : req.params.id;

const patient = getPatientById(patientId);
  if (!patient) {
    return res.status(404).json({
      success: false,
      message: "Patient not found",
    });
  }

  return res.json({
    success: true,
    data: patient,
  });
};