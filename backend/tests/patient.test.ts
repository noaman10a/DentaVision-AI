/**
 * DentaVision AI — Patient API Integration Tests
 * Owner: Twahir (Backend Lead)
 *
 * Tests the real Prisma-backed patient endpoints against Supabase DB.
 * Requires DATABASE_URL to be set in .env.
 */

import { describe, it, expect, afterAll } from "vitest";
import request from "supertest";
import app from "../src/server";
import prisma from "../src/config/db";

// Track created patient IDs for cleanup
const createdPatientIds: string[] = [];

afterAll(async () => {
  // Clean up test records from DB
  if (createdPatientIds.length > 0) {
    await prisma.patient.deleteMany({
      where: { id: { in: createdPatientIds } },
    });
  }
});

describe("POST /api/v1/patients", () => {
  it("creates a new patient with valid data", async () => {
    const res = await request(app)
      .post("/api/v1/patients")
      .send({
        name: "Test Patient Vitest",
        dob: "1990-01-01",
        gender: "Male",
        phone: "+91 99999 00001",
        email: "test.vitest@dentavision.ai",
        address: "Test Address, Bengaluru",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe("Test Patient Vitest");
    expect(res.body.data.id).toBeDefined();

    createdPatientIds.push(res.body.data.id);
  });

  it("rejects missing required fields", async () => {
    const res = await request(app)
      .post("/api/v1/patients")
      .send({ name: "No Phone Patient" }); // missing dob, gender, phone

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("rejects invalid gender value", async () => {
    const res = await request(app)
      .post("/api/v1/patients")
      .send({
        name: "Bad Gender",
        dob: "1990-01-01",
        gender: "Unknown", // must be Male/Female/Other
        phone: "+91 99999 00002",
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe("GET /api/v1/patients", () => {
  it("returns an array of patients", async () => {
    const res = await request(app).get("/api/v1/patients");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe("GET /api/v1/patients/:id", () => {
  it("returns 404 for non-existent patient", async () => {
    const res = await request(app).get(
      "/api/v1/patients/00000000-0000-0000-0000-000000000000"
    );

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });
});
