/**
 * DentaVision AI — Backend Server Entry Point
 * Owner: Twahir (Backend Lead)
 *
 * Bootstraps the Express application with:
 *   - Environment configuration (dotenv)
 *   - Security middleware (helmet, CORS)
 *   - Body parsing
 *   - API v1 routing (patients, visits, prescriptions, reports,
 *                     timeline, follow-ups, xrays/AI proxy)
 *   - Health check endpoint
 *   - Global error handling
 */

import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";

import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

// --- Route Modules ---
import patientRoutes      from "./routes/patient.routes";
import visitRoutes        from "./routes/visit.routes";
import prescriptionRoutes from "./routes/prescription.routes";
import reportRoutes       from "./routes/report.routes";
import timelineRoutes     from "./routes/timeline.routes";
import followupRoutes     from "./routes/followup.routes";
import xrayRoutes         from "./routes/xray.routes";
import { ensureXrayBucketExists } from "./utils/storage.service";

// ---------------------------------------------------------------------------
// Application Setup
// ---------------------------------------------------------------------------

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: env.CORS_ORIGIN === "*" ? "*" : env.CORS_ORIGIN.split(","),
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ---------------------------------------------------------------------------
// Health Check — GET /api/v1/health
// ---------------------------------------------------------------------------

app.get("/api/v1/health", (_req, res) => {
  res.json({
    success: true,
    service: "dentavision-backend",
    version: "1.0.0",
    status: "ok",
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  });
});

// ---------------------------------------------------------------------------
// API v1 Routes
// ---------------------------------------------------------------------------

app.use("/api/v1/patients",      patientRoutes);
app.use("/api/v1/visits",        visitRoutes);
app.use("/api/v1/prescriptions", prescriptionRoutes);
app.use("/api/v1/reports",       reportRoutes);
app.use("/api/v1/timeline",      timelineRoutes);
app.use("/api/v1/followups",     followupRoutes);
app.use("/api/v1/xrays",         xrayRoutes);

// ---------------------------------------------------------------------------
// Error Handling (must be last)
// ---------------------------------------------------------------------------

app.use(notFoundHandler);
app.use(errorHandler);

// ---------------------------------------------------------------------------
// Start Server
// ---------------------------------------------------------------------------

app.listen(env.PORT, () => {
  console.log(`\n✅ DentaVision AI Backend`);
  console.log(`   Listening  : http://localhost:${env.PORT}`);
  console.log(`   Environment: ${env.NODE_ENV}`);
  console.log(`   Health     : http://localhost:${env.PORT}/api/v1/health`);
  console.log(`   AI Service : ${env.AI_SERVICE_URL}`);
  console.log(`   Routes     : patients | visits | prescriptions | reports | timeline | followups | xrays`);
  console.log(``);

  // Ensure Supabase Storage bucket exists (idempotent)
  ensureXrayBucketExists().catch((err) =>
    console.warn("[Storage] Bucket check failed:", err?.message)
  );
});

export default app;