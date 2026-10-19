/**
 * DentaVision AI — X-Ray & AI Analysis Database Service
 * Owner: Twahir (Backend Lead)
 *
 * Prisma-backed service for persisting X-ray records and AI analysis
 * findings into the PostgreSQL/Supabase database.
 *
 * Responsibilities:
 *   - createXrayRecord()  → Insert a new XrayRecord row
 *   - updateXrayStatus()  → Update status after inference
 *   - saveAiAnalysis()    → Persist AI findings into AiAnalysis table
 *   - getXraysByPatient() → Retrieve X-ray history for a patient
 */

import prisma from "../config/db";
import type { AiAnalyzeResponse } from "../utils/aiClient";
import { mockXrays, mockAiAnalyses } from "./mockStore";

// ---------------------------------------------------------------------------
// X-Ray Record Operations
// ---------------------------------------------------------------------------

/**
 * Creates a new X-ray record in the database (status: pending).
 * Called BEFORE forwarding to AI service.
 */
export const createXrayRecord = async (
  patientId: string,
  visitId: string | null,
  filePath: string,
  fileSize: number,
  format: string
) => {
  try {
    return await prisma.xrayRecord.create({
      data: {
        patientId,
        visitId: visitId ?? undefined,
        filePath,
        fileSize,
        format,
        status: "pending",
      },
    });
  } catch (err: any) {
    console.warn("[XrayService] DB unavailable, creating record in memory:", err?.message || err);
    const mockRecord = {
      id: `xray-${Date.now()}`,
      patientId,
      visitId: visitId ?? null,
      filePath,
      fileSize,
      format,
      status: "pending",
      uploadedAt: new Date(),
    };
    mockXrays.push(mockRecord);
    return mockRecord;
  }
};

/**
 * Updates the status of an X-ray record (e.g., "analyzed" or "failed").
 */
export const updateXrayStatus = async (
  xrayRecordId: string,
  status: string
) => {
  try {
    return await prisma.xrayRecord.update({
      where: { id: xrayRecordId },
      data: { status },
    });
  } catch (err: any) {
    console.warn("[XrayService] DB unavailable, updating status in memory:", err?.message || err);
    const rec = mockXrays.find((x) => x.id === xrayRecordId);
    if (rec) rec.status = status;
    return rec;
  }
};

/**
 * Updates the filePath of an X-ray record to a permanent Supabase Storage URL.
 * Called after the file is uploaded to cloud storage.
 */
export const updateXrayFilePath = async (
  xrayRecordId: string,
  permanentUrl: string
) => {
  try {
    return await prisma.xrayRecord.update({
      where: { id: xrayRecordId },
      data: { filePath: permanentUrl },
    });
  } catch (err: any) {
    console.warn("[XrayService] DB unavailable, updating filePath in memory:", err?.message || err);
    const rec = mockXrays.find((x) => x.id === xrayRecordId);
    if (rec) rec.filePath = permanentUrl;
    return rec;
  }
};


/**
 * Retrieves all X-ray records for a patient, most recent first.
 */
export const getXraysByPatient = async (patientId: string) => {
  try {
    return await prisma.xrayRecord.findMany({
      where: { patientId },
      include: { aiAnalyses: true },
      orderBy: { uploadedAt: "desc" },
    });
  } catch (err: any) {
    console.warn("[XrayService] DB unavailable, returning in-memory xrays for patient:", err?.message || err);
    return mockXrays.filter((x) => x.patientId === patientId);
  }
};

// ---------------------------------------------------------------------------
// AI Analysis Persistence
// ---------------------------------------------------------------------------

/**
 * Persists structured AI analysis findings from Soha's FastAPI service
 * into the AiAnalysis table. Findings are stored as JSON (Prisma Json type).
 *
 * Called AFTER a successful AI service response.
 * Updates the parent XrayRecord status to "analyzed".
 */
export const saveAiAnalysis = async (
  xrayRecordId: string,
  result: AiAnalyzeResponse
) => {
  try {
    const aiAnalysis = await prisma.aiAnalysis.create({
      data: {
        xrayId: xrayRecordId,
        status: result.status,
        modelVersion: result.model_version,
        inferenceTimeMs: result.inference_time_ms,
        findingsCount: result.findings_count,
        findings: result.findings as object[],
      },
    });

    await updateXrayStatus(xrayRecordId, "analyzed");
    return aiAnalysis;
  } catch (err: any) {
    console.warn("[XrayService] DB unavailable, persisting AI analysis in memory:", err?.message || err);
    const mockAnalysis = {
      id: `ai-analysis-${Date.now()}`,
      xrayId: xrayRecordId,
      status: result.status,
      modelVersion: result.model_version,
      inferenceTimeMs: result.inference_time_ms,
      findingsCount: result.findings_count,
      findings: result.findings,
      createdAt: new Date(),
    };
    mockAiAnalyses.push(mockAnalysis);
    await updateXrayStatus(xrayRecordId, "analyzed");
    return mockAnalysis;
  }
};
