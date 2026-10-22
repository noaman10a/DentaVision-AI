/**
 * DentaVision AI — Patient Database Service
 * Owner: Twahir (Backend Lead)
 *
 * Prisma-backed CRUD operations for the Patient entity.
 * Directly interacts with PostgreSQL without masking database failures.
 */

import prisma from "../config/db";

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
};

/**
 * Retrieves all patients, most recently created first.
 */
export const getPatients = async () => {
  return await prisma.patient.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      medicalHistories: true,
      visits: {
        orderBy: { date: "desc" },
        take: 5,
      },
      xrayRecords: true,
    },
  });
};

/**
 * Retrieves a single patient by ID.
 * Returns null if not found.
 */
export const getPatientById = async (id: string) => {
  return await prisma.patient.findUnique({
    where: { id },
    include: {
      medicalHistories: true,
      visits: {
        orderBy: { date: "desc" },
        take: 10,
      },
      xrayRecords: true,
      reports: true,
    },
  });
};

/**
 * Updates a patient record.
 */
export const updatePatient = async (
  id: string,
  data: Partial<CreatePatientInput>
) => {
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
};