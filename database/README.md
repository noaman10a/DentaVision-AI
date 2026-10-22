# DentaVision AI — Database & Schema Architecture

DentaVision AI uses PostgreSQL as its primary relational store, managed via the **Prisma ORM** schema in `backend/prisma/schema.prisma`.

---

## Entity Relational Diagram (ERD)

```
       +-------------------+
       |       User        | (Doctors, Staff, Admins)
       | id, email, role   |
       +---------+---------+
                 | 1:N
                 v
       +-------------------+           1:N         +-----------------------+
       |   PatientVisit    | <--------------------+|        Patient        |
       | id, date, notes   |                       | id, name, dob, phone  |
       +----+----------+---+                       +---+-------+-------+---+
            |          |                               |       |       |
        1:N |          | 1:N                       1:N |   1:N |   1:N |
            v          v                               v       v       v
      +-----+--+   +---+--------+                 +----+  +----+  +----+----+
      |Prescr. |   |Diagnostic  |                 |X-Ray| |Docu|  |FollowUp |
      |Record  |   |Report      |                 |Recs | |ment|  |Reminders|
      +--------+   +------------+                 +-----+ +----+  +---------+
```

---

## Core Entities & Models

1. **`User`**:
   - Stores credential identity, role (`admin`, `doctor`, `reception`), and activity logs.
2. **`Patient`**:
   - Master record for clinical demographics, contacts, medical alerts, and registration status.
3. **`PatientVisit`**:
   - Clinical consultation episodes linked to an attending doctor, chief complaint, intraoral findings, and treatment plans.
4. **`XrayRecord`**:
   - Radiograph metadata, storage URLs, quality scores, and linked findings detected by the deep-learning model.
5. **`DiagnosticFinding`**:
   - Specific pathological lesion detections (class ID, label, confidence, bounding box coordinates, and FDI tooth notation).
6. **`Prescription`**:
   - Itemized medications, dosing regimens, timing, frequency, and instructions.
7. **`Report`**:
   - Finalized or drafted clinical diagnostic summaries with doctor signatures and attestation timestamps.
8. **`AuditLog`**:
   - Tamper-evident logging of authentication events, patient updates, and record access.

---

## Database Management Commands

Commands should be executed from within the `backend/` directory:

```bash
# Generate Prisma Client types
npx prisma generate

# Synchronize schema directly with PostgreSQL database
npx prisma db push

# Create and apply migrations
npx prisma migrate dev --name <migration_name>

# Inspect and manage records via GUI
npx prisma studio
```
