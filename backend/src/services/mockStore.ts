/**
 * DentaVision AI — Resilient Fallback Clinical Data Store
 * Provides offline / zero-network fallback for the Express backend
 * so that live demonstrations and integrations run without database downtime.
 * Matches Twahir's seed data schema (Amina Rahmani PT-2026-0705).
 */

export interface MockPatient {
  id: string;
  name: string;
  dob: Date;
  gender: string;
  phone: string;
  email: string | null;
  address: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  medicalHistories?: any[];
  visits?: any[];
}

export const mockPatients: MockPatient[] = [
  {
    id: "PT-2026-0705",
    name: "Amina Rahmani",
    dob: new Date("1992-04-14"),
    gender: "Female",
    phone: "+91 98765 43210",
    email: "amina.r@example.com",
    address: "42 MG Road, Suite 3, Bengaluru, KA",
    status: "Awaiting Review",
    createdAt: new Date("2026-08-10T09:00:00Z"),
    updatedAt: new Date("2026-08-10T09:00:00Z"),
    medicalHistories: [
      { id: "med-1", condition: "Penicillin Allergy", notes: "Severe rash and swelling if administered." },
      { id: "med-2", condition: "Mild Hypertension", notes: "Diagnosed in 2024. Monitored, non-medicated." },
    ],
    visits: [
      {
        id: "vst-2026-001",
        date: new Date("2026-08-10T09:15:00Z"),
        chiefComplaint: "Sharp pain in lower right molar (Tooth 46) during mastication.",
        diagnosis: "Dentin Caries / Suspected Reversible Pulpitis on #46.",
        treatmentPlan: "Composite restoration or indirect pulp cap following AI X-ray verification.",
        doctor: { id: "usr-doc-102", fullName: "Dr. Twahir Mohammed" },
      },
    ],
  },
  {
    id: "PT-2026-0708",
    name: "Rohan Sharma",
    dob: new Date("1988-11-22"),
    gender: "Male",
    phone: "+91 91234 56789",
    email: "rohan.s@example.com",
    address: "108 Indiranagar 10th Main, Bengaluru",
    status: "Waiting",
    createdAt: new Date("2026-08-11T10:00:00Z"),
    updatedAt: new Date("2026-08-11T10:00:00Z"),
    medicalHistories: [
      { id: "med-3", condition: "Asthma (Inhaler)", notes: "Carries salbutamol inhaler." },
    ],
    visits: [],
  },
  {
    id: "PT-2026-0712",
    name: "Vikramaditya V",
    dob: new Date("1975-02-08"),
    gender: "Male",
    phone: "+91 99887 76655",
    email: "vikram.v@example.com",
    address: "15 Koramangala 4th Block, Bengaluru",
    status: "Registered",
    createdAt: new Date("2026-08-12T11:00:00Z"),
    updatedAt: new Date("2026-08-12T11:00:00Z"),
    medicalHistories: [
      { id: "med-4", condition: "Type 2 Diabetes", notes: "HbA1c monitored quarterly." },
    ],
    visits: [],
  },
];

export const mockVisits: any[] = [
  {
    id: "vst-2026-001",
    patientId: "PT-2026-0705",
    doctorId: "usr-doc-102",
    chiefComplaint: "Sharp pain in lower right molar (Tooth 46) during mastication.",
    diagnosis: "Dentin Caries / Suspected Reversible Pulpitis on #46.",
    treatmentPlan: "Composite restoration or indirect pulp cap following AI X-ray verification.",
    date: new Date("2026-08-10T09:15:00Z"),
    createdAt: new Date("2026-08-10T09:15:00Z"),
    updatedAt: new Date("2026-08-10T09:15:00Z"),
    patient: { id: "PT-2026-0705", name: "Amina Rahmani", phone: "+91 98765 43210" },
    doctor: { id: "usr-doc-102", fullName: "Dr. Twahir Mohammed", email: "twahir.doctor@dentavision.ai" },
    prescriptions: [
      { id: "rx-1", visitId: "vst-2026-001", medicine: "Amoxicillin", strength: "500mg", dose: "1 Capsule", frequency: "TDS (3x/day)", timing: "After Food", duration: "5 Days", instructions: "Complete full course." },
      { id: "rx-2", visitId: "vst-2026-001", medicine: "Ibuprofen", strength: "400mg", dose: "1 Tablet", frequency: "BD (2x/day)", timing: "After Food", duration: "3 Days", instructions: "Take as needed for pain." },
    ],
    clinicalExaminations: [
      { id: "exam-1", visitId: "vst-2026-001", notes: "Localized deep occlusal caries on tooth 46.", observations: "Percussion test sensitive. Cold test response lingering." }
    ],
    xrayRecords: [],
  },
];

export const mockPrescriptions: any[] = [
  { id: "rx-1", visitId: "vst-2026-001", medicine: "Amoxicillin", strength: "500mg", dose: "1 Capsule", frequency: "TDS (3x/day)", timing: "After Food", duration: "5 Days", instructions: "Complete full course." },
  { id: "rx-2", visitId: "vst-2026-001", medicine: "Ibuprofen", strength: "400mg", dose: "1 Tablet", frequency: "BD (2x/day)", timing: "After Food", duration: "3 Days", instructions: "Take as needed for pain." },
];

export const mockXrays: any[] = [];
export const mockAiAnalyses: any[] = [];

export const mockReports: any[] = [
  {
    id: "rep-2026-904",
    patientId: "PT-2026-0705",
    visitId: "vst-2026-001",
    aiAnalysisId: "ai-analysis-2026-001",
    doctorNotes: "Confirmed occlusal caries on 46. Caries on 16 noted for observation next visit.",
    isFinalized: false,
    createdAt: new Date("2026-08-10T09:35:00Z"),
    updatedAt: new Date("2026-08-10T09:35:00Z"),
    aiAnalysis: {
      id: "ai-analysis-2026-001",
      status: "success",
      modelVersion: "v1.0.0",
      findingsCount: 2,
    },
    patient: { id: "PT-2026-0705", name: "Amina Rahmani" },
  },
];

export const mockTimelines: any[] = [
  { id: "tl-1", patientId: "PT-2026-0705", eventType: "registration", eventId: "PT-2026-0705", description: "Patient Amina Rahmani registered by Sneha Sahadevan.", timestamp: new Date("2026-08-10T09:00:00Z") },
  { id: "tl-2", patientId: "PT-2026-0705", eventType: "visit", eventId: "vst-2026-001", description: "Clinical visit check-in for tooth pain with Dr. Twahir Mohammed.", timestamp: new Date("2026-08-10T09:15:00Z") },
  { id: "tl-3", patientId: "PT-2026-0705", eventType: "xray", eventId: "xray-2026-0705", description: "Dental X-ray radiograph taken and uploaded.", timestamp: new Date("2026-08-10T09:30:00Z") },
  { id: "tl-4", patientId: "PT-2026-0705", eventType: "analysis", eventId: "ai-analysis-2026-001", description: "AI Pathology Analysis completed on X-ray: 2 findings detected.", timestamp: new Date("2026-08-10T09:31:00Z") },
];

export const mockFollowUps: any[] = [
  { id: "flw-1", patientId: "PT-2026-0705", visitId: "vst-2026-001", followUpDate: new Date("2026-08-17T00:00:00Z"), status: "scheduled", notes: "Follow-up for evaluation of restoration sensitivity.", createdAt: new Date("2026-08-10T09:40:00Z"), updatedAt: new Date("2026-08-10T09:40:00Z") },
];
