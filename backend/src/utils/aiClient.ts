/**
 * DentaVision AI — AI Service HTTP Client
 * Owner: Twahir (Backend Lead)
 *
 * Utility for forwarding X-ray images to Soha's local FastAPI service
 * at http://127.0.0.1:8000/api/v1/analyze.
 *
 * Sends multipart/form-data (file + patient_id + xray_id) and returns
 * the structured JSON analysis response.
 *
 * NOTE: This module does NOT delete temp files — that is the controller's
 * responsibility, ensuring cleanup happens even on errors.
 */

import fetch from "node-fetch";
import FormData from "form-data";
import fs from "fs";
import { env } from "../config/env";

// ---------------------------------------------------------------------------
// Types — mirrors Soha's AnalyzeResponse schema (ai_service/api/schemas.py)
// ---------------------------------------------------------------------------

export interface AiBoundingBox {
  x_min: number;
  y_min: number;
  x_max: number;
  y_max: number;
}

export interface AiFinding {
  id: string;
  finding_type: string;
  confidence: number;
  bounding_box: AiBoundingBox;
  tooth_number: string | null;
  severity: string;
}

export interface AiAnalyzeResponse {
  status: "success" | "error";
  patient_id: string | null;
  xray_id: string | null;
  model_version: string;
  inference_time_ms: number;
  findings_count: number;
  findings: AiFinding[];
  timestamp: string;
}

// ---------------------------------------------------------------------------
// AI Service Client
// ---------------------------------------------------------------------------

/**
 * Forwards a temporary X-ray image file to the local AI FastAPI service.
 *
 * @param tempFilePath  Absolute path to the locally saved temp X-ray image.
 * @param patientId     Patient identifier to pass along to the AI service.
 * @param xrayId        X-ray record identifier to pass along.
 * @returns             Structured AI analysis response JSON.
 * @throws              Error with descriptive message on HTTP or network failure.
 */
export const analyzeXrayWithAiService = async (
  tempFilePath: string,
  patientId: string,
  xrayId: string
): Promise<AiAnalyzeResponse> => {
  const aiServiceUrl = `${env.AI_SERVICE_URL}/api/v1/analyze`;

  // Build multipart form payload
  const form = new FormData();
  form.append("file", fs.createReadStream(tempFilePath));
  form.append("patient_id", patientId);
  form.append("xray_id", xrayId);

  let response;
  try {
    response = await fetch(aiServiceUrl, {
      method: "POST",
      body: form,
      headers: form.getHeaders(),
    });
  } catch (networkError: unknown) {
    const msg =
      networkError instanceof Error ? networkError.message : String(networkError);
    throw new Error(
      `AI Service unreachable at ${aiServiceUrl}. Is the AI service running? (${msg})`
    );
  }

  if (!response.ok) {
    let errBody: string;
    try {
      errBody = await response.text();
    } catch {
      errBody = "unknown error body";
    }
    throw new Error(
      `AI Service returned HTTP ${response.status}: ${errBody}`
    );
  }

  const result = (await response.json()) as AiAnalyzeResponse;
  return result;
};
