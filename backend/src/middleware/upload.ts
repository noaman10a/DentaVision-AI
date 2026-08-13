/**
 * DentaVision AI — Multer Upload Middleware
 * Owner: Twahir (Backend Lead)
 *
 * Configures multer for temporary X-ray image uploads.
 * Files are stored in uploads/temp/ and MUST be deleted after
 * AI inference is complete (handled by the xray controller).
 *
 * Allowed formats: PNG, JPEG, JPG
 * Max file size: 10 MB
 */

import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";

// ---------------------------------------------------------------------------
// Ensure temp upload directory exists
// ---------------------------------------------------------------------------

const TEMP_DIR = path.join(process.cwd(), "uploads", "temp");

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// ---------------------------------------------------------------------------
// Disk Storage — temp folder, preserve original extension
// ---------------------------------------------------------------------------

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, TEMP_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `xray-${uniqueSuffix}${ext}`);
  },
});

// ---------------------------------------------------------------------------
// File Filter — allow only dental image formats
// ---------------------------------------------------------------------------

const ALLOWED_MIMETYPES = ["image/png", "image/jpeg", "image/jpg"];

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (ALLOWED_MIMETYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type: ${file.mimetype}. Only PNG and JPEG X-ray images are accepted.`
      )
    );
  }
};

// ---------------------------------------------------------------------------
// Exported Multer Instance
// ---------------------------------------------------------------------------

export const xrayUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});
