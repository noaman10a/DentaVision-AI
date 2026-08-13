/**
 * DentaVision AI — Supabase Storage Service
 * Owner: Twahir (Backend Lead)
 *
 * Handles permanent X-ray file storage via Supabase Storage.
 * Bucket: "xrays" (create it in Supabase Dashboard → Storage)
 *
 * Storage path format: xrays/{patientId}/{xrayRecordId}.{format}
 *
 * Flow:
 *   1. After AI inference completes, call uploadXrayToStorage()
 *   2. Get back a permanent public URL
 *   3. Update XrayRecord.filePath with the permanent URL
 *   4. Delete the local temp file
 */

import fs from "fs";
import { getSupabaseAdmin } from "./supabase";

const BUCKET = "xrays";

// ---------------------------------------------------------------------------
// Ensure Bucket Exists (idempotent — safe to call on startup)
// ---------------------------------------------------------------------------

export const ensureXrayBucketExists = async (): Promise<void> => {
  const { data: buckets } = await getSupabaseAdmin().storage.listBuckets();
  const exists = buckets?.some((b) => b.name === BUCKET);

  if (!exists) {
    const { error } = await getSupabaseAdmin().storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 1024 * 1024 * 10, // 10MB per X-ray
      allowedMimeTypes: ["image/png", "image/jpeg", "image/jpg", "image/webp"],
    });
    if (error) {
      console.warn(`[Storage] Could not create '${BUCKET}' bucket: ${error.message}`);
    } else {
      console.log(`[Storage] Created Supabase Storage bucket: '${BUCKET}'`);
    }
  }
};

// ---------------------------------------------------------------------------
// Upload X-Ray to Supabase Storage
// ---------------------------------------------------------------------------

/**
 * Uploads a local temp X-ray file to Supabase Storage.
 * Returns the permanent public URL.
 *
 * @param localPath    - Absolute path to the temp file on disk
 * @param patientId    - Patient ID (used as storage folder name)
 * @param xrayRecordId - XrayRecord DB ID (used as the file name)
 * @param format       - File extension: "png" | "jpg" | "jpeg"
 */
export const uploadXrayToStorage = async (
  localPath: string,
  patientId: string,
  xrayRecordId: string,
  format: string
): Promise<string> => {
  const fileBuffer = fs.readFileSync(localPath);
  const storagePath = `${patientId}/${xrayRecordId}.${format}`;
  const mimeType = format === "png" ? "image/png" : "image/jpeg";

  const { error } = await getSupabaseAdmin()
    .storage.from(BUCKET)
    .upload(storagePath, fileBuffer, {
      contentType: mimeType,
      upsert: true, // Allow re-upload if retry needed
    });

  if (error) {
    throw new Error(`Supabase Storage upload failed: ${error.message}`);
  }

  // Get the public URL for permanent access
  const { data } = getSupabaseAdmin()
    .storage.from(BUCKET)
    .getPublicUrl(storagePath);

  return data.publicUrl;
};

// ---------------------------------------------------------------------------
// Delete X-Ray from Storage (e.g., on patient data deletion request)
// ---------------------------------------------------------------------------

export const deleteXrayFromStorage = async (
  patientId: string,
  xrayRecordId: string,
  format: string
): Promise<void> => {
  const storagePath = `${patientId}/${xrayRecordId}.${format}`;
  const { error } = await getSupabaseAdmin()
    .storage.from(BUCKET)
    .remove([storagePath]);

  if (error) {
    console.warn(`[Storage] Could not delete ${storagePath}: ${error.message}`);
  }
};
