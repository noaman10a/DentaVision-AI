import prisma from "../config/db";
import type { CreateFollowUpInput, UpdateFollowUpInput } from "../validation/schemas";
import { mockFollowUps } from "./mockStore";

export const createFollowUp = async (data: CreateFollowUpInput) => {
  try {
    return await prisma.followUp.create({
      data: {
        patientId: data.patientId,
        visitId: data.visitId,
        followUpDate: new Date(data.scheduledDate),
        notes: data.notes,
        status: data.status || "scheduled",
      },
    });
  } catch (err: any) {
    console.warn("[FollowupService] DB unavailable, creating followup in memory:", err?.message || err);
    const newFollowup = {
      id: `flw-${Date.now()}`,
      patientId: data.patientId,
      visitId: data.visitId,
      followUpDate: new Date(data.scheduledDate),
      notes: data.notes,
      status: data.status || "scheduled",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockFollowUps.push(newFollowup);
    return newFollowup;
  }
};

export const getFollowUpsByPatient = async (patientId: string) => {
  try {
    return await prisma.followUp.findMany({
      where: { patientId },
      orderBy: { followUpDate: "asc" },
    });
  } catch (err: any) {
    console.warn("[FollowupService] DB unavailable, returning in-memory followups:", err?.message || err);
    return mockFollowUps.filter((f) => f.patientId === patientId);
  }
};

export const updateFollowUp = async (id: string, data: UpdateFollowUpInput) => {
  try {
    return await prisma.followUp.update({
      where: { id },
      data: {
        ...(data.scheduledDate && { followUpDate: new Date(data.scheduledDate) }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.status && { status: data.status.toLowerCase() }),
      },
    });
  } catch (err: any) {
    console.warn("[FollowupService] DB unavailable, updating in-memory followup:", err?.message || err);
    const f = mockFollowUps.find((flw) => flw.id === id);
    if (f) {
      if (data.scheduledDate) f.followUpDate = new Date(data.scheduledDate);
      if (data.notes !== undefined) f.notes = data.notes;
      if (data.status) f.status = data.status.toLowerCase();
      f.updatedAt = new Date();
      return f;
    }
    throw err;
  }
};

export const deleteFollowUp = async (id: string) => {
  try {
    return await prisma.followUp.delete({ where: { id } });
  } catch (err: any) {
    console.warn("[FollowupService] DB unavailable, deleting in-memory followup:", err?.message || err);
    const idx = mockFollowUps.findIndex((f) => f.id === id);
    if (idx !== -1) {
      return mockFollowUps.splice(idx, 1)[0];
    }
    return { id };
  }
};
