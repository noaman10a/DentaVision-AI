import prisma from "../config/db";
import { mockTimelines } from "./mockStore";

export const getTimelineByPatient = async (patientId: string) => {
  try {
    return await prisma.timeline.findMany({
      where: { patientId },
      orderBy: { timestamp: "desc" },
    });
  } catch (err: any) {
    console.warn("[TimelineService] DB unavailable, returning in-memory timelines:", err?.message || err);
    return mockTimelines.filter((t) => t.patientId === patientId);
  }
};

export const addTimelineEvent = async (
  patientId: string,
  eventType: string,
  eventId: string,
  description: string
) => {
  try {
    return await prisma.timeline.create({
      data: { patientId, eventType, eventId, description },
    });
  } catch (err: any) {
    console.warn("[TimelineService] DB unavailable, creating timeline event in memory:", err?.message || err);
    const newEvent = {
      id: `tl-${Date.now()}`,
      patientId,
      eventType,
      eventId,
      description,
      timestamp: new Date(),
    };
    mockTimelines.unshift(newEvent);
    return newEvent;
  }
};
