/**
 * DentaVision AI — Database Seeding Script
 * Owner: Twahir (Backend Lead)
 *
 * Populates the database with realistic sample clinical records to test database
 * relations, constraints, and provide seed data for developers.
 */

import { PrismaClient, Role } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. Clean existing records (in reverse relation order)
  console.log("🧹 Cleaning old database records...");
  await prisma.applicationSetting.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.followUp.deleteMany();
  await prisma.timeline.deleteMany();
  await prisma.document.deleteMany();
  await prisma.report.deleteMany();
  await prisma.aiAnalysis.deleteMany();
  await prisma.xrayRecord.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.clinicalExamination.deleteMany();
  await prisma.medicalHistory.deleteMany();
  await prisma.patientVisit.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Users (Staff/Clinicians)
  console.log("👥 Creating users...");
  const doctor = await prisma.user.create({
    data: {
      email: "twahir.doctor@dentavision.ai",
      fullName: "Dr. Twahir Mohammed",
      role: Role.doctor,
    },
  });

  const reception = await prisma.user.create({
    data: {
      email: "sneha.reception@dentavision.ai",
      fullName: "Sneha Sahadevan",
      role: Role.reception,
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: "admin@dentavision.ai",
      fullName: "Administrator",
      role: Role.admin,
    },
  });

  // 3. Create Patient
  console.log("👤 Creating patient...");
  const patient = await prisma.patient.create({
    data: {
      id: "PT-2026-0705", // Matching Sneha's mock patient ID
      name: "Amina Rahmani",
      dob: new Date("1992-04-14"),
      gender: "Female",
      phone: "+91 98765 43210",
      email: "amina.r@example.com",
      address: "42 MG Road, Suite 3, Bengaluru, KA",
      status: "Awaiting Review",
    },
  });

  // 4. Create Medical History
  console.log("🏥 Creating medical history...");
  await prisma.medicalHistory.createMany({
    data: [
      {
        patientId: patient.id,
        condition: "Penicillin Allergy",
        notes: "Severe rash and swelling if administered.",
      },
      {
        patientId: patient.id,
        condition: "Mild Hypertension",
        notes: "Diagnosed in 2024. Monitored, non-medicated.",
      },
    ],
  });

  // 5. Create Patient Visit
  console.log("📅 Creating patient visit...");
  const visit = await prisma.patientVisit.create({
    data: {
      patientId: patient.id,
      doctorId: doctor.id,
      chiefComplaint: "Sharp pain in lower right molar (Tooth 46) during mastication.",
      diagnosis: "Dentin Caries / Suspected Reversible Pulpitis on #46.",
      treatmentPlan: "Composite restoration or indirect pulp cap following AI X-ray verification.",
      date: new Date("2026-08-10"),
    },
  });

  // 6. Create Clinical Examination
  console.log("🦷 Creating clinical examination...");
  await prisma.clinicalExamination.create({
    data: {
      visitId: visit.id,
      notes: "Localized deep occlusal caries on tooth 46.",
      observations: "Percussion test sensitive. Cold test response lingering.",
    },
  });

  // 7. Create Prescriptions
  console.log("💊 Creating prescriptions...");
  await prisma.prescription.createMany({
    data: [
      {
        visitId: visit.id,
        medicine: "Amoxicillin",
        strength: "500mg",
        dose: "1 Capsule",
        frequency: "TDS (3x/day)",
        timing: "After Food",
        duration: "5 Days",
        instructions: "Complete full course.",
      },
      {
        visitId: visit.id,
        medicine: "Ibuprofen",
        strength: "400mg",
        dose: "1 Tablet",
        frequency: "BD (2x/day)",
        timing: "After Food",
        duration: "3 Days",
        instructions: "Take as needed for pain.",
      },
    ],
  });

  // 8. Create Xray Record
  console.log("🩻 Creating X-ray record...");
  const xray = await prisma.xrayRecord.create({
    data: {
      patientId: patient.id,
      visitId: visit.id,
      filePath: "/uploads/xrays/pt_2026_0705_46.png",
      fileSize: 2048576, // 1.95MB
      format: "png",
      status: "analyzed",
    },
  });

  // 9. Create AI Analysis
  console.log("🤖 Creating AI analysis record...");
  const aiAnalysis = await prisma.aiAnalysis.create({
    data: {
      xrayId: xray.id,
      status: "success",
      modelVersion: "DentaVisionNet v1.0.0",
      inferenceTimeMs: 42.15,
      findingsCount: 2,
      findings: [
        {
          id: "f-e4b6b7a2-1111-4444-8888-abcdef123456",
          finding_type: "Caries",
          confidence: 0.92,
          bounding_box: { x_min: 0.42, y_min: 0.35, x_max: 0.58, y_max: 0.52 },
          tooth_number: "16",
          status: "Pending Review",
          notes: "Deep occlusal radiolucency observed extending into dentin layer.",
        },
        {
          id: "f-8899aabb-2222-3333-4444-555566667777",
          finding_type: "Bone Loss",
          confidence: 0.78,
          bounding_box: { x_min: 0.20, y_min: 0.60, x_max: 0.38, y_max: 0.75 },
          tooth_number: "46",
          status: "Pending Review",
          notes: "Moderate horizontal alveolar crest reduction.",
        },
      ],
    },
  });

  // 10. Create Report
  console.log("📝 Creating clinical report...");
  await prisma.report.create({
    data: {
      patientId: patient.id,
      visitId: visit.id,
      aiAnalysisId: aiAnalysis.id,
      doctorNotes: "Confirmed occlusal caries on 46. Caries on 16 noted for observation next visit.",
      isFinalized: false,
    },
  });

  // 11. Create Document
  console.log("📁 Creating patient documents...");
  await prisma.document.create({
    data: {
      patientId: patient.id,
      visitId: visit.id,
      fileName: "medical_history_declaration.pdf",
      filePath: "/uploads/documents/pt_2026_0705_history.pdf",
      fileType: "pdf",
      fileSize: 450320,
    },
  });

  // 12. Create Timeline Events
  console.log("⏳ Creating timelines...");
  await prisma.timeline.createMany({
    data: [
      {
        patientId: patient.id,
        eventType: "registration",
        eventId: patient.id,
        description: "Patient Amina Rahmani registered by Sneha Sahadevan.",
        timestamp: new Date("2026-08-10T09:00:00Z"),
      },
      {
        patientId: patient.id,
        eventType: "visit",
        eventId: visit.id,
        description: "Clinical visit check-in for tooth pain with Dr. Twahir Mohammed.",
        timestamp: new Date("2026-08-10T09:15:00Z"),
      },
      {
        patientId: patient.id,
        eventType: "xray",
        eventId: xray.id,
        description: "Dental X-ray radiograph taken and uploaded.",
        timestamp: new Date("2026-08-10T09:30:00Z"),
      },
      {
        patientId: patient.id,
        eventType: "analysis",
        eventId: aiAnalysis.id,
        description: "AI Pathology Analysis completed on X-ray: 2 findings detected.",
        timestamp: new Date("2026-08-10T09:31:00Z"),
      },
    ],
  });

  // 13. Create FollowUp
  console.log("📆 Creating follow-up schedule...");
  await prisma.followUp.create({
    data: {
      patientId: patient.id,
      visitId: visit.id,
      followUpDate: new Date("2026-08-17"),
      status: "scheduled",
      notes: "Follow-up for evaluation of restoration sensitivity.",
    },
  });

  // 14. Create Audit Log
  console.log("🛡️ Creating security audit log...");
  await prisma.auditLog.create({
    data: {
      userId: reception.id,
      action: "REGISTER_PATIENT",
      target: `Patient: ${patient.id}`,
      ipAddress: "192.168.1.10",
      timestamp: new Date("2026-08-10T09:00:00Z"),
    },
  });

  // 15. Create App Settings
  console.log("⚙️ Creating application settings...");
  await prisma.applicationSetting.createMany({
    data: [
      {
        key: "ai_min_confidence",
        value: "0.50",
        description: "Minimum confidence score for displaying model findings in the UI.",
      },
      {
        key: "sync_interval_mins",
        value: "15",
        description: "Frequency of background cloud synchronization operations.",
      },
    ],
  });

  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
