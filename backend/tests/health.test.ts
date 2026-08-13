/**
 * DentaVision AI — Health Check Integration Test
 * Owner: Twahir (Backend Lead)
 */

import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/server";

describe("GET /api/v1/health", () => {
  it("returns 200 with service status ok", async () => {
    const res = await request(app).get("/api/v1/health");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.service).toBe("dentavision-backend");
    expect(res.body.status).toBe("ok");
    expect(res.body.environment).toBeDefined();
    expect(res.body.uptime).toBeGreaterThanOrEqual(0);
  });

  it("returns a valid ISO timestamp", async () => {
    const res = await request(app).get("/api/v1/health");
    expect(new Date(res.body.timestamp).toISOString()).toBe(res.body.timestamp);
  });
});

describe("404 handler", () => {
  it("returns 404 for unknown routes", async () => {
    const res = await request(app).get("/api/v1/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });
});
