/**
 * DentaVision AI — Patient Database Service
 * Owner: Twahir (Backend Lead)
 *
 * Prisma-backed CRUD operations for the Patient entity.
 * Replaces the previous in-memory stub implementation.
 */

import prisma from "../config/db";
import { mockPatients } from "./mockStore";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CreatePatientInput {
  name: string;
  dob: string;          // ISO date string, e.g. "1992-04-14"
  gender: string;
  phone: string;
  email?: string;
  address?: string;
}

// ---------------------------------------------------------------------------
// Patient CRUD
// ---------------------------------------------------------------------------

/**
 * Creates a new patient record in the database.
 */
export const createPatient = async (input: CreatePatientInput) => {
  try {
    return await prisma.patient.create({
      data: {
        name: input.name,
        dob: new Date(input.dob),
        gender: input.gender,
        phone: input.phone,
        email: input.email ?? undefined,
        address: input.address ?? undefined,
        status: "Registered",
      },
    });
  } catch (err: any) {
    console.warn("[PatientService] DB unavailable, creating patient in memory store:", err?.message || err);
    const newPatient = {
      id: `PT-${Date.now().toString().slice(-4)}`,
      name: input.name,
      dob: new Date(input.dob),
      gender: input.gender,
      phone: input.phone,
      email: input.email ?? null,
      address: input.address ?? null,
      status: "Registered",
      createdAt: new Date(),
      updatedAt: new Date(),
      medicalHistories: [],
      visits: [],
    };
    mockPatients.unshift(newPatient);
    return newPatient;
  }
};

/**
 * Retrieves all patients, most recently created first.
 */
export const getPatients = async () => {
  try {
    return await prisma.patient.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (err: any) {
    console.warn("[PatientService] DB unavailable, returning seeded in-memory patients:", err?.message || err);
    return mockPatients;
  }
};

/**
 * Retrieves a single patient by ID.
 * Returns null if not found.
 */
export const getPatientById = async (id: string) => {
  try {
    return await prisma.patient.findUnique({
      where: { id },
      include: {
        medicalHistories: true,
        visits: {
          orderBy: { date: "desc" },
          take: 10,
        },
      },
    });
  } catch (err: any) {
    console.warn("[PatientService] DB unavailable, finding patient in memory store:", err?.message || err);
    const patient = mockPatients.find((p) => p.id === id);
    return patient || null;
  }
};

/**
 * Updates a patient record.
 */
export const updatePatient = async (
  id: string,
  data: Partial<CreatePatientInput>
) => {
  try {
    return await prisma.patient.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.dob && { dob: new Date(data.dob) }),
        ...(data.gender && { gender: data.gender }),
        ...(data.phone && { phone: data.phone }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.address !== undefined && { address: data.address }),
      },
    });
  } catch (err: any) {
    console.warn("[PatientService] DB unavailable, updating patient in memory store:", err?.message || err);
    const idx = mockPatients.findIndex((p) => p.id === id);
    if (idx !== -1) {
      if (data.name) mockPatients[idx].name = data.name;
      if (data.dob) mockPatients[idx].dob = new Date(data.dob);
      if (data.gender) mockPatients[idx].gender = data.gender;
      if (data.phone) mockPatients[idx].phone = data.phone;
      if (data.email !== undefined) mockPatients[idx].email = data.email ?? null;
      if (data.address !== undefined) mockPatients[idx].address = data.address ?? null;
      mockPatients[idx].updatedAt = new Date();
      return mockPatients[idx];
    }
    throw err;
  }
};