/**
 * DentaVision AI — Global Error Handling Middleware
 * Owner: Twahir (Backend Lead)
 *
 * Provides structured JSON error responses for all unhandled errors.
 * Express 5 natively propagates async errors — no wrapper needed.
 * Never exposes internal stack traces in production.
 */

import { Request, Response, NextFunction } from "express";
import { isDev } from "../config/env";

// ---------------------------------------------------------------------------
// Custom Error Class
// ---------------------------------------------------------------------------

export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number = 500,
    public readonly code: string = "INTERNAL_ERROR"
  ) {
    super(message);
    this.name = "AppError";
    // Maintain proper prototype chain
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// ---------------------------------------------------------------------------
// Common Error Factories
// ---------------------------------------------------------------------------

export const notFound = (resource: string) =>
  new AppError(`${resource} not found`, 404, "NOT_FOUND");

export const badRequest = (message: string) =>
  new AppError(message, 400, "BAD_REQUEST");

export const unauthorized = (message = "Authentication required") =>
  new AppError(message, 401, "UNAUTHORIZED");

export const forbidden = (message = "You do not have permission") =>
  new AppError(message, 403, "FORBIDDEN");

export const conflict = (message: string) =>
  new AppError(message, 409, "CONFLICT");

// ---------------------------------------------------------------------------
// 404 — Route Not Found
// ---------------------------------------------------------------------------

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `Route ${req.method} ${req.originalUrl} does not exist`,
    },
  });
};

// ---------------------------------------------------------------------------
// Global Error Handler
// ---------------------------------------------------------------------------

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;
  const code = isAppError ? err.code : "INTERNAL_ERROR";

  // Log error details server-side (never exposed to client in prod)
  if (statusCode >= 500) {
    console.error(`[ERROR] ${code}: ${err.message}`, isDev ? err.stack : "");
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message: err.message || "An unexpected error occurred",
      // Stack trace only in development
      ...(isDev && statusCode >= 500 && { stack: err.stack }),
    },
  });
};
