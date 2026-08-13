/**
 * DentaVision AI — Report Service
 * Owner: Twahir (Backend Lead)
 */

import prisma from "../config/db";
import type { CreateReportInput, FinalizeReportInput } from "../validation/schemas";

export const createReport = async (data: CreateReportInput) => {
  return prisma.report.create({
    data: {
      patientId: data.patientId,
      visitId: data.visitId,
      aiAnalysisId: data.aiAnalysisId,
      doctorNotes: data.doctorNotes,
      isFinalized: false,
    },
  });
};

export const getReportsByPatient = async (patientId: string) => {
  return prisma.report.findMany({
    where: { patientId },
    orderBy: { createdAt: "desc" },
    include: { aiAnalysis: true },
  });
};

export const getReportById = async (id: string) => {
  return prisma.report.findUnique({
    where: { id },
    include: {
      aiAnalysis: true,
      patient: { select: { id: true, name: true } },
    },
  });
};

export const finalizeReport = async (id: string, data: FinalizeReportInput) => {
  return prisma.report.update({
    where: { id },
    data: {
      doctorNotes: data.doctorNotes,
      isFinalized: true,
    },
  });
};
