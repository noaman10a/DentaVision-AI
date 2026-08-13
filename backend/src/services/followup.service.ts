import prisma from "../config/db";
import type { CreateFollowUpInput, UpdateFollowUpInput } from "../validation/schemas";

export const createFollowUp = async (data: CreateFollowUpInput) => {
  return prisma.followUp.create({
    data: {
      patientId: data.patientId,
      visitId: data.visitId,
      followUpDate: new Date(data.scheduledDate),
      notes: data.notes,
      status: data.status || "scheduled",
    },
  });
};

export const getFollowUpsByPatient = async (patientId: string) => {
  return prisma.followUp.findMany({
    where: { patientId },
    orderBy: { followUpDate: "asc" },
  });
};

export const updateFollowUp = async (id: string, data: UpdateFollowUpInput) => {
  return prisma.followUp.update({
    where: { id },
    data: {
      ...(data.scheduledDate && { followUpDate: new Date(data.scheduledDate) }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.status && { status: data.status.toLowerCase() }),
    },
  });
};

export const deleteFollowUp = async (id: string) => {
  return prisma.followUp.delete({ where: { id } });
};
