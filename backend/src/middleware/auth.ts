/**
 * DentaVision AI — Authentication & Authorization Middleware
 * Owner: Twahir (Backend Lead)
 *
 * Validates clinical Bearer tokens from the Authorization header.
 * Attaches the verified user object to req.user.
 *
 * Usage:
 *   router.get("/protected", requireAuth, requireRole("doctor"), handler)
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
// requireAuth — Validates Bearer Token
// ---------------------------------------------------------------------------

export const requireAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(unauthorized("Authentication required. No valid Bearer token provided."));
  }

  const token = authHeader.split(" ")[1]?.trim();
  if (!token) {
    return next(unauthorized("Authentication required. Bearer token is empty."));
  }

  // 1. Explicit development tokens (only active in development environment)
  if (isDev && token.startsWith("dev-")) {
    const role: "admin" | "doctor" | "reception" = token.includes("reception")
      ? "reception"
      : token.includes("admin")
      ? "admin"
      : "doctor";

    req.user = {
      id: `${token}-id`,
      email: `${role}@dentavision.ai`,
      role,
    };
    return next();
  }

  // 2. Supabase Auth Verification (when Supabase credentials are configured)
  if (supabaseConfigured) {
    try {
      const { data, error } = await getSupabaseAnon().auth.getUser(token);
      if (error || !data.user) {
        return next(unauthorized("Invalid or expired session token"));
      }

      const role = data.user.user_metadata?.role || "doctor";
      req.user = {
        id: data.user.id,
        email: data.user.email || "",
        role: role as "admin" | "doctor" | "reception",
      };
      return next();
    } catch {
      return next(unauthorized("Session token verification failed"));
    }
  }

  // 3. Clinical Workstation Session Token (Base64 JSON payload issued upon desktop login)
  try {
    const jsonStr = Buffer.from(token, "base64").toString("utf-8");
    const payload = JSON.parse(jsonStr);

    if (
      payload &&
      typeof payload.id === "string" &&
      typeof payload.role === "string" &&
      ["admin", "doctor", "reception"].includes(payload.role)
    ) {
      req.user = {
        id: payload.id,
        email: payload.email || `${payload.role}@dentavision.ai`,
        role: payload.role as "admin" | "doctor" | "reception",
      };
      return next();
    }
  } catch {
    // Token is not a valid base64 JSON token
  }

  return next(unauthorized("Invalid or unrecognized authentication token"));
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
