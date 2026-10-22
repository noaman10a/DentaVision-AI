/**
 * DentaVision AI — Environment Configuration
 * Owner: Twahir (Backend Lead)
 *
 * Centralises all environment variable access with type safety and validation.
 * Import this module everywhere instead of accessing process.env directly.
 */

import dotenv from "dotenv";

// Load .env file (no-op if already loaded or running in production via host env)
dotenv.config();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const optional = (key: string, fallback: string): string =>
  process.env[key] || fallback;

// ---------------------------------------------------------------------------
// Typed Environment Configuration
// ---------------------------------------------------------------------------

export const env = {
  // Server
  NODE_ENV: optional("NODE_ENV", "development"),
  PORT: parseInt(optional("PORT", "5000"), 10),

  // Supabase
  SUPABASE_URL: optional("SUPABASE_URL", ""),
  SUPABASE_ANON_KEY: optional("SUPABASE_ANON_KEY", ""),
  SUPABASE_SERVICE_ROLE_KEY: optional("SUPABASE_SERVICE_ROLE_KEY", ""),

  // Database (Prisma)
  DATABASE_URL: optional("DATABASE_URL", ""),

  // AI Service (Soha's FastAPI — default port 8000)
  AI_SERVICE_URL: optional("AI_SERVICE_URL", "http://localhost:8000"),

  // CORS
  CORS_ORIGIN: optional(
    "CORS_ORIGIN",
    "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000"
  ),
} as const;

export const isDev = env.NODE_ENV === "development";
export const isProd = env.NODE_ENV === "production";
