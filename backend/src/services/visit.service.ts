/**
 * DentaVision AI — Patient Visit Service
 * Owner: Twahir (Backend Lead)
 *
 * Prisma-backed CRUD for PatientVisit (clinical appointments/consultations).
 */

import prisma from "../config/db";
import type { CreateVisitInput, UpdateVisitInput } from "../validation/schemas";

export const createVisit = async (data: CreateVisitInput) => {
  return prisma.patientVisit.create({
    data: {
      patientId: data.patientId,
      doctorId: data.doctorId,
      chiefComplaint: data.chiefComplaint,
      diagnosis: data.diagnosis,
      treatmentPlan: data.treatmentPlan,
      date: data.date ? new Date(data.date) : new Date(),
    },
    include: {
      patient: { select: { id: true, name: true, phone: true } },
      doctor: { select: { id: true, fullName: true, email: true } },
    },
  });
};

export const getVisitsByPatient = async (patientId: string) => {
  return prisma.patientVisit.findMany({
    where: { patientId },
    orderBy: { date: "desc" },
    include: {
      doctor: { select: { id: true, fullName: true } },
      prescriptions: true,
      clinicalExaminations: true,
      xrayRecords: { include: { aiAnalyses: true } },
    },
  });
};

export const getVisitById = async (id: string) => {
  return prisma.patientVisit.findUnique({
    where: { id },
    include: {
      patient: { select: { id: true, name: true, phone: true } },
      doctor: { select: { id: true, fullName: true } },
      prescriptions: true,
      clinicalExaminations: true,
      xrayRecords: { include: { aiAnalyses: true } },
      reports: true,
      followUps: true,
    },
  });
};

export const updateVisit = async (id: string, data: UpdateVisitInput) => {
  return prisma.patientVisit.update({
    where: { id },
    data: {
      ...(data.chiefComplaint && { chiefComplaint: data.chiefComplaint }),
      ...(data.diagnosis && { diagnosis: data.diagnosis }),
      ...(data.treatmentPlan && { treatmentPlan: data.treatmentPlan }),
      ...(data.date && { date: new Date(data.date) }),
    },
  });
};
