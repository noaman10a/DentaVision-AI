import { PGlite } from "@electric-sql/pglite";
import path from "path";

async function seed() {
  const dbPath = path.join(__dirname, "dev.db");
  console.log(`🌱 Connecting to local PGlite workstation database at ${dbPath}...`);
  const db = new PGlite(dbPath);

  console.log("🧹 Cleaning old database records...");
  await db.exec(`
    DELETE FROM "application_settings";
    DELETE FROM "audit_logs";
    DELETE FROM "follow_ups";
    DELETE FROM "timelines";
    DELETE FROM "documents";
    DELETE FROM "reports";
    DELETE FROM "ai_analyses";
    DELETE FROM "xray_records";
    DELETE FROM "prescriptions";
    DELETE FROM "clinical_examinations";
    DELETE FROM "medical_history";
    DELETE FROM "patient_visits";
    DELETE FROM "patients";
    DELETE FROM "users";
  `);

  console.log("👥 Creating users...");
  const docId = "usr-doc-102";
  const recId = "usr-stf-001";
  const admId = "usr-adm-000";

  await db.query(`
    INSERT INTO "users" ("id", "email", "full_name", "role", "created_at", "updated_at")
    VALUES 
      ('${docId}', 'twahir.doctor@dentavision.ai', 'Dr. Twahir Mohammed', 'doctor', NOW(), NOW()),
      ('${recId}', 'sneha.reception@dentavision.ai', 'Sneha Sahadevan', 'reception', NOW(), NOW()),
      ('${admId}', 'admin@dentavision.ai', 'Administrator', 'admin', NOW(), NOW());
  `);

  console.log("👤 Creating patient (Amina Rahmani PT-2026-0705)...");
  const patId = "PT-2026-0705";
  await db.query(`
    INSERT INTO "patients" ("id", "name", "dob", "gender", "phone", "email", "address", "status", "created_at", "updated_at")
    VALUES 
      ('${patId}', 'Amina Rahmani', '1992-04-14 00:00:00', 'Female', '+91 98765 43210', 'amina.r@example.com', '42 MG Road, Suite 3, Bengaluru, KA', 'Awaiting Review', NOW(), NOW());
  `);

  console.log("🏥 Creating medical history...");
  await db.query(`
    INSERT INTO "medical_history" ("id", "patient_id", "condition", "notes", "created_at", "updated_at")
    VALUES 
      ('med-1', '${patId}', 'Penicillin Allergy', 'Severe rash and swelling if administered.', NOW(), NOW()),
      ('med-2', '${patId}', 'Mild Hypertension', 'Diagnosed in 2024. Monitored, non-medicated.', NOW(), NOW());
  `);

  console.log("📅 Creating patient visit...");
  const visitId = "vst-2026-001";
  await db.query(`
    INSERT INTO "patient_visits" ("id", "patient_id", "doctor_id", "chief_complaint", "diagnosis", "treatment_plan", "date", "created_at", "updated_at")
    VALUES 
      ('${visitId}', '${patId}', '${docId}', 'Sharp pain in lower right molar (Tooth 46) during mastication.', 'Dentin Caries / Suspected Reversible Pulpitis on #46.', 'Composite restoration or indirect pulp cap following AI X-ray verification.', '2026-08-10 00:00:00', NOW(), NOW());
  `);

  console.log("🦷 Creating clinical examination...");
  await db.query(`
    INSERT INTO "clinical_examinations" ("id", "visit_id", "notes", "observations", "created_at", "updated_at")
    VALUES 
      ('exam-1', '${visitId}', 'Localized deep occlusal caries on tooth 46.', 'Percussion test sensitive. Cold test response lingering.', NOW(), NOW());
  `);

  console.log("💊 Creating prescriptions...");
  await db.query(`
    INSERT INTO "prescriptions" ("id", "visit_id", "medicine", "strength", "dose", "frequency", "timing", "duration", "instructions", "created_at", "updated_at")
    VALUES 
      ('rx-1', '${visitId}', 'Amoxicillin', '500mg', '1 Capsule', 'TDS (3x/day)', 'After Food', '5 Days', 'Complete full course.', NOW(), NOW()),
      ('rx-2', '${visitId}', 'Ibuprofen', '400mg', '1 Tablet', 'BD (2x/day)', 'After Food', '3 Days', 'Take as needed for pain.', NOW(), NOW());
  `);

  console.log("🩻 Creating X-ray record...");
  const xrayId = "xray-2026-0705";
  await db.query(`
    INSERT INTO "xray_records" ("id", "patient_id", "visit_id", "file_path", "file_size", "format", "status", "uploaded_at")
    VALUES 
      ('${xrayId}', '${patId}', '${visitId}', '/uploads/xrays/pt_2026_0705_46.png', 2048576, 'png', 'analyzed', NOW());
  `);

  console.log("🤖 Creating AI analysis record...");
  const aiId = "ai-analysis-2026-001";
  const findingsJson = JSON.stringify([
    {
      id: "f-e4b6b7a2-1111-4444-8888-abcdef123456",
      finding_type: "Caries",
      confidence: 0.92,
      bounding_box: { x_min: 0.42, y_min: 0.35, x_max: 0.58, y_max: 0.52 },
      tooth_number: "16",
      status: "Pending Review",
      notes: "Deep occlusal radiolucency observed extending into dentin layer."
    },
    {
      id: "f-8899aabb-2222-3333-4444-555566667777",
      finding_type: "Bone Loss",
      confidence: 0.78,
      bounding_box: { x_min: 0.20, y_min: 0.60, x_max: 0.38, y_max: 0.75 },
      tooth_number: "46",
      status: "Pending Review",
      notes: "Moderate horizontal alveolar crest reduction."
    }
  ]);

  await db.query(`
    INSERT INTO "ai_analyses" ("id", "xray_id", "status", "model_version", "inference_time_ms", "findings_count", "findings", "created_at")
    VALUES 
      ('${aiId}', '${xrayId}', 'success', 'DentaVisionNet v1.0.0', 42.15, 2, '${findingsJson}'::jsonb, NOW());
  `);

  console.log("📝 Creating clinical report...");
  await db.query(`
    INSERT INTO "reports" ("id", "patient_id", "visit_id", "ai_analysis_id", "doctor_notes", "is_finalized", "created_at", "updated_at")
    VALUES 
      ('rep-2026-904', '${patId}', '${visitId}', '${aiId}', 'Confirmed occlusal caries on 46. Caries on 16 noted for observation next visit.', false, NOW(), NOW());
  `);

  console.log("📁 Creating patient documents...");
  await db.query(`
    INSERT INTO "documents" ("id", "patient_id", "visit_id", "file_name", "file_path", "file_type", "file_size", "uploaded_at")
    VALUES 
      ('doc-1', '${patId}', '${visitId}', 'medical_history_declaration.pdf', '/uploads/documents/pt_2026_0705_history.pdf', 'pdf', 450320, NOW());
  `);

  console.log("⏳ Creating timelines...");
  await db.query(`
    INSERT INTO "timelines" ("id", "patient_id", "event_type", "event_id", "description", "timestamp")
    VALUES 
      ('tl-1', '${patId}', 'registration', '${patId}', 'Patient Amina Rahmani registered by Sneha Sahadevan.', '2026-08-10 09:00:00'),
      ('tl-2', '${patId}', 'visit', '${visitId}', 'Clinical visit check-in for tooth pain with Dr. Twahir Mohammed.', '2026-08-10 09:15:00'),
      ('tl-3', '${patId}', 'xray', '${xrayId}', 'Dental X-ray radiograph taken and uploaded.', '2026-08-10 09:30:00'),
      ('tl-4', '${patId}', 'analysis', '${aiId}', 'AI Pathology Analysis completed on X-ray: 2 findings detected.', '2026-08-10 09:31:00');
  `);

  console.log("📆 Creating follow-up schedule...");
  await db.query(`
    INSERT INTO "follow_ups" ("id", "patient_id", "visit_id", "follow_up_date", "status", "notes", "created_at", "updated_at")
    VALUES 
      ('flw-1', '${patId}', '${visitId}', '2026-08-17 00:00:00', 'scheduled', 'Follow-up for evaluation of restoration sensitivity.', NOW(), NOW());
  `);

  console.log("🛡️ Creating security audit log...");
  await db.query(`
    INSERT INTO "audit_logs" ("id", "user_id", "action", "target", "ip_address", "timestamp")
    VALUES 
      ('aud-1', '${recId}', 'REGISTER_PATIENT', 'Patient: PT-2026-0705', '192.168.1.10', '2026-08-10 09:00:00');
  `);

  console.log("⚙️ Creating application settings...");
  await db.query(`
    INSERT INTO "application_settings" ("key", "value", "description", "updated_at")
    VALUES 
      ('ai_min_confidence', '0.50', 'Minimum confidence score for displaying model findings in the UI.', NOW()),
      ('sync_interval_mins', '15', 'Frequency of background cloud synchronization operations.', NOW());
  `);

  console.log("\n🎉 Database seeding completed successfully!");

  // Verify counts in all 14 tables
  const tables = [
    "users", "patients", "patient_visits", "medical_history",
    "clinical_examinations", "prescriptions", "xray_records",
    "ai_analyses", "reports", "documents", "timelines",
    "follow_ups", "audit_logs", "application_settings"
  ];

  console.log("\n📊 Verification Table Row Counts:");
  for (const t of tables) {
    const res = await db.query(`SELECT COUNT(*) as count FROM "${t}"`);
    console.log(`  ✓ Table '${t}': ${res.rows[0].count} records`);
  }

  await db.close();
}

seed().catch(console.error);
