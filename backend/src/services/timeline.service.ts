import prisma from "../config/db";

export const getTimelineByPatient = async (patientId: string) => {
  return prisma.timeline.findMany({
    where: { patientId },
    orderBy: { timestamp: "desc" },
  });
};

export const addTimelineEvent = async (
  patientId: string,
  eventType: string,
  eventId: string,
  description: string
) => {
  return prisma.timeline.create({
    data: { patientId, eventType, eventId, description },
  });
};
