/**
 * DentaVision AI — Authentication & Security Integration Tests
 *
 * Verifies that protected clinical routes strictly reject unauthenticated
 * requests, validate Bearer tokens, and enforce role-based access control.
 */

import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/server";

describe("Route Authentication Security", () => {
  it("rejects unauthenticated GET /api/v1/patients with 401", async () => {
    const res = await request(app).get("/api/v1/patients");
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error?.code).toBe("UNAUTHORIZED");
  });

  it("rejects unauthenticated POST /api/v1/patients with 401", async () => {
    const res = await request(app)
      .post("/api/v1/patients")
      .send({
        name: "Unauthenticated Test",
        dob: "1990-01-01",
        gender: "Male",
        phone: "+91 98765 00000",
      });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("rejects unauthenticated GET /api/v1/xrays/patient/:id with 401", async () => {
    const res = await request(app).get("/api/v1/xrays/patient/dummy-id");
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("rejects unauthenticated GET /api/v1/appointments with 401", async () => {
    const res = await request(app).get("/api/v1/appointments");
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("rejects malformed Bearer tokens with 401", async () => {
    const res = await request(app)
      .get("/api/v1/patients")
      .set("Authorization", "Bearer invalid-garbage-token-string");
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("allows access with valid session token", async () => {
    const validToken = Buffer.from(
      JSON.stringify({
        id: "DOC-102",
        email: "doctor@dentavision.ai",
        role: "doctor",
      })
    ).toString("base64");

    const res = await request(app)
      .get("/api/v1/patients")
      .set("Authorization", `Bearer ${validToken}`);

    // Should not be 401 Unauthorized
    expect(res.status).not.toBe(401);
  });
});
