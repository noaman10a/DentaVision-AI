/**
 * DentaVision AI — Prescription Service
 * Owner: Twahir (Backend Lead)
 */

import prisma from "../config/db";
import type { CreatePrescriptionInput } from "../validation/schemas";

export const createPrescription = async (data: CreatePrescriptionInput) => {
  return prisma.prescription.create({ data });
};

export const getPrescriptionsByVisit = async (visitId: string) => {
  return prisma.prescription.findMany({
    where: { visitId },
    orderBy: { createdAt: "asc" },
  });
};

export const deletePrescription = async (id: string) => {
  return prisma.prescription.delete({ where: { id } });
};
