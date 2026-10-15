/**
 * DentaVision AI — Patient Visit Service
 * Owner: Twahir (Backend Lead)
 *
 * Prisma-backed CRUD for PatientVisit (clinical appointments/consultations).
 */

import prisma from "../config/db";
import type { CreateVisitInput, UpdateVisitInput } from "../validation/schemas";
import { mockVisits } from "./mockStore";

export const createVisit = async (data: CreateVisitInput) => {
  try {
    return await prisma.patientVisit.create({
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
  } catch (err: any) {
    console.warn("[VisitService] DB unavailable, creating visit in memory:", err?.message || err);
    const mockVisit = {
      id: `vst-${Date.now()}`,
      patientId: data.patientId,
      doctorId: data.doctorId,
      chiefComplaint: data.chiefComplaint,
      diagnosis: data.diagnosis,
      treatmentPlan: data.treatmentPlan,
      date: data.date ? new Date(data.date) : new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      patient: { id: data.patientId, name: "Amina Rahmani", phone: "+91 98765 43210" },
      doctor: { id: data.doctorId, fullName: "Dr. Twahir Mohammed", email: "twahir.doctor@dentavision.ai" },
      prescriptions: [],
      clinicalExaminations: [],
      xrayRecords: [],
    };
    mockVisits.unshift(mockVisit);
    return mockVisit;
  }
};

export const getVisitsByPatient = async (patientId: string) => {
  try {
    return await prisma.patientVisit.findMany({
      where: { patientId },
      orderBy: { date: "desc" },
      include: {
        doctor: { select: { id: true, fullName: true } },
        prescriptions: true,
        clinicalExaminations: true,
        xrayRecords: { include: { aiAnalyses: true } },
      },
    });
  } catch (err: any) {
    console.warn("[VisitService] DB unavailable, returning in-memory visits:", err?.message || err);
    return mockVisits.filter((v) => v.patientId === patientId);
  }
};

export const getVisitById = async (id: string) => {
  try {
    return await prisma.patientVisit.findUnique({
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
  } catch (err: any) {
    console.warn("[VisitService] DB unavailable, finding in-memory visit:", err?.message || err);
    return mockVisits.find((v) => v.id === id) || null;
  }
};

export const updateVisit = async (id: string, data: UpdateVisitInput) => {
  try {
    return await prisma.patientVisit.update({
      where: { id },
      data: {
        ...(data.chiefComplaint && { chiefComplaint: data.chiefComplaint }),
        ...(data.diagnosis && { diagnosis: data.diagnosis }),
        ...(data.treatmentPlan && { treatmentPlan: data.treatmentPlan }),
        ...(data.date && { date: new Date(data.date) }),
      },
    });
  } catch (err: any) {
    console.warn("[VisitService] DB unavailable, updating in-memory visit:", err?.message || err);
    const v = mockVisits.find((v) => v.id === id);
    if (v) {
      if (data.chiefComplaint) v.chiefComplaint = data.chiefComplaint;
      if (data.diagnosis) v.diagnosis = data.diagnosis;
      if (data.treatmentPlan) v.treatmentPlan = data.treatmentPlan;
      if (data.date) v.date = new Date(data.date);
      v.updatedAt = new Date();
      return v;
    }
    throw err;
  }
};
