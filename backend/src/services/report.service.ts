/**
 * DentaVision AI — Report Service
 * Owner: Twahir (Backend Lead)
 */

import prisma from "../config/db";
import type { CreateReportInput, FinalizeReportInput } from "../validation/schemas";
import { mockReports } from "./mockStore";

export const createReport = async (data: CreateReportInput) => {
  try {
    return await prisma.report.create({
      data: {
        patientId: data.patientId,
        visitId: data.visitId,
        aiAnalysisId: data.aiAnalysisId,
        doctorNotes: data.doctorNotes,
        isFinalized: false,
      },
    });
  } catch (err: any) {
    console.warn("[ReportService] DB unavailable, creating report in memory:", err?.message || err);
    const newReport = {
      id: `rep-${Date.now()}`,
      patientId: data.patientId,
      visitId: data.visitId,
      aiAnalysisId: data.aiAnalysisId,
      doctorNotes: data.doctorNotes,
      isFinalized: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockReports.unshift(newReport);
    return newReport;
  }
};

export const getReportsByPatient = async (patientId: string) => {
  try {
    return await prisma.report.findMany({
      where: { patientId },
      orderBy: { createdAt: "desc" },
      include: { aiAnalysis: true },
    });
  } catch (err: any) {
    console.warn("[ReportService] DB unavailable, returning in-memory reports:", err?.message || err);
    return mockReports.filter((r) => r.patientId === patientId);
  }
};

export const getReportById = async (id: string) => {
  try {
    return await prisma.report.findUnique({
      where: { id },
      include: {
        aiAnalysis: true,
        patient: { select: { id: true, name: true } },
      },
    });
  } catch (err: any) {
    console.warn("[ReportService] DB unavailable, finding report in memory:", err?.message || err);
    return mockReports.find((r) => r.id === id) || null;
  }
};

export const finalizeReport = async (id: string, data: FinalizeReportInput) => {
  try {
    return await prisma.report.update({
      where: { id },
      data: {
        doctorNotes: data.doctorNotes,
        isFinalized: true,
      },
    });
  } catch (err: any) {
    console.warn("[ReportService] DB unavailable, finalizing report in memory:", err?.message || err);
    const r = mockReports.find((rep) => rep.id === id);
    if (r) {
      r.doctorNotes = data.doctorNotes;
      r.isFinalized = true;
      r.updatedAt = new Date();
      return r;
    }
    throw err;
  }
};
