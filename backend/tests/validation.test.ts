/**
 * DentaVision AI — Zod Validation Unit Tests
 * Owner: Twahir (Backend Lead)
 *
 * Pure unit tests for all Zod schemas — no DB or network calls.
 */

import { describe, it, expect } from "vitest";
import {
  CreatePatientSchema,
  CreateVisitSchema,
  CreatePrescriptionSchema,
  CreateReportSchema,
  CreateFollowUpSchema,
} from "../src/validation/schemas";

describe("CreatePatientSchema", () => {
  it("accepts valid patient data", () => {
    const result = CreatePatientSchema.safeParse({
      name: "Amina Rahmani",
      dob: "1992-04-14",
      gender: "Female",
      phone: "+91 98765 43210",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid gender", () => {
    const result = CreatePatientSchema.safeParse({
      name: "Test",
      dob: "1990-01-01",
      gender: "Robot",
      phone: "1234567",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid date of birth", () => {
    const result = CreatePatientSchema.safeParse({
      name: "Test",
      dob: "not-a-date",
      gender: "Male",
      phone: "1234567",
    });
    expect(result.success).toBe(false);
  });
});

describe("CreateVisitSchema", () => {
  it("accepts valid visit data", () => {
    const result = CreateVisitSchema.safeParse({
      patientId: "550e8400-e29b-41d4-a716-446655440000",
      doctorId: "550e8400-e29b-41d4-a716-446655440001",
      chiefComplaint: "Sharp pain in lower right molar",
    });
    expect(result.success).toBe(true);
  });

  it("rejects too-short chief complaint", () => {
    const result = CreateVisitSchema.safeParse({
      patientId: "550e8400-e29b-41d4-a716-446655440000",
      doctorId: "550e8400-e29b-41d4-a716-446655440001",
      chiefComplaint: "Pain",  // less than 5 chars
    });
    expect(result.success).toBe(false);
  });
});

describe("CreatePrescriptionSchema", () => {
  it("accepts valid prescription", () => {
    const result = CreatePrescriptionSchema.safeParse({
      visitId: "550e8400-e29b-41d4-a716-446655440000",
      medicine: "Amoxicillin",
      strength: "500mg",
      dose: "1 tablet",
      frequency: "3 times daily",
      timing: "After meals",
      duration: "5 days",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing medicine name", () => {
    const result = CreatePrescriptionSchema.safeParse({
      visitId: "550e8400-e29b-41d4-a716-446655440000",
      strength: "500mg",
      dose: "1 tablet",
      frequency: "3 times daily",
      timing: "After meals",
      duration: "5 days",
    });
    expect(result.success).toBe(false);
  });
});

describe("CreateFollowUpSchema", () => {
  it("accepts valid follow-up", () => {
    const result = CreateFollowUpSchema.safeParse({
      patientId: "550e8400-e29b-41d4-a716-446655440000",
      scheduledDate: "2026-09-01",
      reason: "Review X-ray results",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid scheduled date", () => {
    const result = CreateFollowUpSchema.safeParse({
      patientId: "550e8400-e29b-41d4-a716-446655440000",
      scheduledDate: "not-a-date",
      reason: "Review",
    });
    expect(result.success).toBe(false);
  });
});
