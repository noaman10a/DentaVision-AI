/**
 * DentaVision AI — Authentication & Authorization Middleware
 * Owner: Twahir (Backend Lead)
 *
 * Validates Supabase Auth JWTs from the Authorization header.
 * Attaches the verified user object to req.user.
 *
 * Usage:
 *   router.get("/protected", requireAuth, requireRole("doctor"), handler)
 *
 * Dev bypass:
 *   If SUPABASE_URL or SUPABASE_ANON_KEY is not configured (local dev without
 *   auth set up), auth is skipped and a mock doctor user is injected.
 */

import { Request, Response, NextFunction } from "express";
import { getSupabaseAnon } from "../utils/supabase";
import { env, isDev } from "../config/env";
import { unauthorized, forbidden } from "./errorHandler";

// Extend Express Request type to include our user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: "admin" | "doctor" | "reception";
      };
    }
  }
}

const supabaseConfigured =
  env.SUPABASE_URL !== "" && env.SUPABASE_ANON_KEY !== "";

// ---------------------------------------------------------------------------
// requireAuth — Validates Supabase JWT
// ---------------------------------------------------------------------------

export const requireAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  // Dev bypass: if Supabase keys not configured, inject a mock doctor user
  if (isDev && !supabaseConfigured) {
    req.user = {
      id: "dev-doctor-id",
      email: "twahir.doctor@dentavision.ai",
      role: "doctor",
    };
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(unauthorized("No valid Bearer token provided"));
  }

  const token = authHeader.split(" ")[1];

  try {
    const { data, error } = await getSupabaseAnon().auth.getUser(token);
    if (error || !data.user) {
      return next(unauthorized("Invalid or expired token"));
    }

    // Extract role from user_metadata (set during Supabase user creation)
    const role = data.user.user_metadata?.role || "doctor";

    req.user = {
      id: data.user.id,
      email: data.user.email || "",
      role: role as "admin" | "doctor" | "reception",
    };

    next();
  } catch {
    return next(unauthorized("Token validation failed"));
  }
};

// ---------------------------------------------------------------------------
// requireRole — Role-Based Access Control
// ---------------------------------------------------------------------------

export const requireRole = (...roles: Array<"admin" | "doctor" | "reception">) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(unauthorized("Authentication required"));
    }
    if (!roles.includes(req.user.role)) {
      return next(
        forbidden(
          `Access denied. Required role: ${roles.join(" or ")}. Your role: ${req.user.role}`
        )
      );
    }
    next();
  };
