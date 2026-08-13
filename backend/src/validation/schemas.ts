/**
 * DentaVision AI — Zod Validation Schemas
 * Owner: Twahir (Backend Lead)
 *
 * Centralised request body validation for all API endpoints.
 * Use `schema.parse(req.body)` in controllers to get typed + validated data.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Patient
// ---------------------------------------------------------------------------

export const CreatePatientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  dob: z.string().refine((v) => !isNaN(Date.parse(v)), { message: "Invalid date of birth" }),
  gender: z.enum(["Male", "Female", "Other"]),
  phone: z.string().min(7, "Phone number too short"),
  email: z.string().email("Invalid email address").optional(),
  address: z.string().optional(),
  status: z.string().optional(),
});

export type CreatePatientInput = z.infer<typeof CreatePatientSchema>;

export const UpdatePatientSchema = CreatePatientSchema.partial();
export type UpdatePatientInput = z.infer<typeof UpdatePatientSchema>;

// ---------------------------------------------------------------------------
// Patient Visit
// ---------------------------------------------------------------------------

export const CreateVisitSchema = z.object({
  patientId: z.string().uuid("Invalid patient ID"),
  doctorId: z.string().uuid("Invalid doctor ID"),
  chiefComplaint: z.string().min(5, "Chief complaint must be at least 5 characters"),
  diagnosis: z.string().optional(),
  treatmentPlan: z.string().optional(),
  date: z.string().optional(),
});

export type CreateVisitInput = z.infer<typeof CreateVisitSchema>;

export const UpdateVisitSchema = CreateVisitSchema.partial();
export type UpdateVisitInput = z.infer<typeof UpdateVisitSchema>;

// ---------------------------------------------------------------------------
// Prescription
// ---------------------------------------------------------------------------

export const CreatePrescriptionSchema = z.object({
  visitId: z.string().uuid("Invalid visit ID"),
  medicine: z.string().min(1, "Medicine name is required"),
  strength: z.string().min(1, "Strength is required"),
  dose: z.string().min(1, "Dose is required"),
  frequency: z.string().min(1, "Frequency is required"),
  timing: z.string().min(1, "Timing is required"),
  duration: z.string().min(1, "Duration is required"),
  instructions: z.string().optional(),
});

export type CreatePrescriptionInput = z.infer<typeof CreatePrescriptionSchema>;

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

export const CreateReportSchema = z.object({
  patientId: z.string().uuid("Invalid patient ID"),
  visitId: z.string().uuid("Invalid visit ID"),
  aiAnalysisId: z.string().uuid().optional(),
  doctorNotes: z.string().optional(),
});

export type CreateReportInput = z.infer<typeof CreateReportSchema>;

export const FinalizeReportSchema = z.object({
  doctorNotes: z.string().min(1, "Doctor notes are required to finalise a report"),
});

export type FinalizeReportInput = z.infer<typeof FinalizeReportSchema>;

// ---------------------------------------------------------------------------
// Follow-Up
// ---------------------------------------------------------------------------

export const CreateFollowUpSchema = z.object({
  patientId: z.string().uuid("Invalid patient ID"),
  visitId: z.string().uuid().optional(),
  scheduledDate: z.string().refine((v) => !isNaN(Date.parse(v)), { message: "Invalid scheduled date" }),
  reason: z.string().min(3, "Reason is required"),
  notes: z.string().optional(),
  status: z.enum(["Scheduled", "Completed", "Missed", "Cancelled"]).optional(),
});

export type CreateFollowUpInput = z.infer<typeof CreateFollowUpSchema>;

export const UpdateFollowUpSchema = CreateFollowUpSchema.partial();
export type UpdateFollowUpInput = z.infer<typeof UpdateFollowUpSchema>;
