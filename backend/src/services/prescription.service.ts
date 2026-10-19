/**
 * DentaVision AI — Prescription Service
 * Owner: Twahir (Backend Lead)
 */

import prisma from "../config/db";
import type { CreatePrescriptionInput } from "../validation/schemas";
import { mockPrescriptions } from "./mockStore";

export const createPrescription = async (data: CreatePrescriptionInput) => {
  try {
    return await prisma.prescription.create({ data });
  } catch (err: any) {
    console.warn("[PrescriptionService] DB unavailable, creating prescription in memory:", err?.message || err);
    const newRx = {
      id: `rx-${Date.now()}`,
      visitId: data.visitId,
      medicine: data.medicine,
      strength: data.strength,
      dose: data.dose,
      frequency: data.frequency,
      timing: data.timing,
      duration: data.duration,
      instructions: data.instructions,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockPrescriptions.push(newRx);
    return newRx;
  }
};

export const getPrescriptionsByVisit = async (visitId: string) => {
  try {
    return await prisma.prescription.findMany({
      where: { visitId },
      orderBy: { createdAt: "asc" },
    });
  } catch (err: any) {
    console.warn("[PrescriptionService] DB unavailable, returning in-memory prescriptions:", err?.message || err);
    return mockPrescriptions.filter((p) => p.visitId === visitId);
  }
};

export const deletePrescription = async (id: string) => {
  try {
    return await prisma.prescription.delete({ where: { id } });
  } catch (err: any) {
    console.warn("[PrescriptionService] DB unavailable, deleting prescription in memory:", err?.message || err);
    const idx = mockPrescriptions.findIndex((p) => p.id === id);
    if (idx !== -1) {
      return mockPrescriptions.splice(idx, 1)[0];
    }
    return { id };
  }
};
