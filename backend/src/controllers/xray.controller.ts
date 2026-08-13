/**
 * DentaVision AI — X-Ray Analysis Controller
 * Owner: Twahir (Backend Lead)
 *
 * Handles POST /api/v1/xrays/analyze — the core AI proxy endpoint.
 *
 * Full pipeline (with Supabase Storage):
 *   1. Receive multipart upload (X-ray image + patient_id + visit_id?)
 *   2. Create XrayRecord in DB (status: pending, filePath: temp)
 *   3. Forward temp file to Soha's FastAPI AI service → get findings
 *   4. Upload temp file to Supabase Storage → get permanent URL
 *   5. Update XrayRecord.filePath with permanent Supabase URL
 *   6. Delete temp file from disk — ALWAYS (success or failure)
 *   7. Persist AI findings into AiAnalysis table (status: analyzed)
 *   8. Return structured findings JSON to the Desktop client
 *
 * Error contract (per Noaman's work request):
 *   - Temp files are NEVER left on disk after inference
 *   - AI service errors are surfaced as 502 Bad Gateway
 *   - Storage errors are logged but do NOT block the response
 *   - DB errors are surfaced as 500 Internal Error
 */

import { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";

import { analyzeXrayWithAiService } from "../utils/aiClient";
import { uploadXrayToStorage } from "../utils/storage.service";
import {
  createXrayRecord,
  saveAiAnalysis,
  updateXrayStatus,
  updateXrayFilePath,
  getXraysByPatient,
} from "../services/xray.service";
import { AppError, badRequest } from "../middleware/errorHandler";

// ---------------------------------------------------------------------------
// Helper — safely delete a temp file without throwing
// ---------------------------------------------------------------------------

const deleteTempFile = (filePath: string): void => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️  Temp file deleted: ${path.basename(filePath)}`);
    }
  } catch (err) {
    // Log but don't throw — cleanup failure must not mask the original error
    console.error(`⚠️  Failed to delete temp file: ${filePath}`, err);
  }
};

// ---------------------------------------------------------------------------
// POST /api/v1/xrays/analyze
// ---------------------------------------------------------------------------

export const analyzeXrayController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const tempFile = req.file;

  // Guard: multer must have attached a file
  if (!tempFile) {
    return next(badRequest("X-ray image file is required (multipart field: file)"));
  }

  const tempFilePath = tempFile.path;
  const fileFormat = path.extname(tempFile.originalname).replace(".", "").toLowerCase();
  const { patient_id, visit_id } = req.body as {
    patient_id?: string;
    visit_id?: string;
  };

  if (!patient_id) {
    deleteTempFile(tempFilePath);
    return next(badRequest("patient_id is required"));
  }

  // --- Step 1: Create XrayRecord in DB (status: pending) ---
  let xrayRecord;
  try {
    xrayRecord = await createXrayRecord(
      patient_id,
      visit_id ?? null,
      tempFilePath, // temporary path — will be updated to Storage URL below
      tempFile.size,
      fileFormat
    );
  } catch (dbError) {
    deleteTempFile(tempFilePath);
    return next(dbError);
  }

  const xrayRecordId = xrayRecord.id;

  // --- Step 2: Forward to AI Service ---
  let aiResult;
  try {
    aiResult = await analyzeXrayWithAiService(
      tempFilePath,
      patient_id,
      xrayRecordId
    );
  } catch (aiError: unknown) {
    // Always clean up temp file before propagating
    deleteTempFile(tempFilePath);

    // Mark X-ray as failed in DB
    try { await updateXrayStatus(xrayRecordId, "failed"); } catch { /* best-effort */ }

    const msg = aiError instanceof Error ? aiError.message : String(aiError);
    return next(new AppError(msg, 502, "AI_SERVICE_ERROR"));
  }

  // --- Step 3: Upload to Supabase Storage (permanent URL) ---
  let permanentUrl: string | null = null;
  try {
    permanentUrl = await uploadXrayToStorage(
      tempFilePath,
      patient_id,
      xrayRecordId,
      fileFormat
    );
    // Update DB record with permanent URL
    await updateXrayFilePath(xrayRecordId, permanentUrl);
    console.log(`[Storage] X-ray uploaded: ${permanentUrl}`);
  } catch (storageError) {
    // Storage failure is non-blocking — findings are still saved to DB
    console.warn(
      `[Storage] Upload failed for xray ${xrayRecordId}:`,
      storageError instanceof Error ? storageError.message : storageError
    );
  }

  // --- Step 4: Delete temp file (ALWAYS after inference + storage) ---
  deleteTempFile(tempFilePath);

  // --- Step 5: Persist AI Analysis to DB ---
  let aiAnalysis;
  try {
    aiAnalysis = await saveAiAnalysis(xrayRecordId, aiResult);
  } catch (dbError) {
    return next(dbError);
  }

  // --- Step 6: Return structured response ---
  res.status(200).json({
    success: true,
    data: {
      xray_record_id: xrayRecordId,
      ai_analysis_id: aiAnalysis.id,
      patient_id,
      storage_url: permanentUrl,
      model_version: aiResult.model_version,
      inference_time_ms: aiResult.inference_time_ms,
      findings_count: aiResult.findings_count,
      findings: aiResult.findings,
      timestamp: aiResult.timestamp,
    },
  });
};

// ---------------------------------------------------------------------------
// GET /api/v1/xrays/patient/:patientId
// ---------------------------------------------------------------------------

export const getXraysByPatientController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const patientId = Array.isArray(req.params.patientId)
    ? req.params.patientId[0]
    : req.params.patientId;

  try {
    const xrays = await getXraysByPatient(patientId);
    res.json({ success: true, data: xrays });
  } catch (error) {
    next(error);
  }
};
