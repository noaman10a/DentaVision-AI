# CHAPTER 8: RESULTS AND DISCUSSIONS

## 8.1 Application Results

The DentaVision AI clinical system was evaluated through an end-to-end deployment of its Electron desktop client, Node.js/Express orchestration backend, PostgreSQL database, and high-performance YOLO11m deep learning inference microservice. The following subsections present the actual application user interfaces captured during live clinical simulation workflows, illustrating how the software operationalizes artificial intelligence for dental radiology, patient triage, clinician validation, and diagnostic documentation.

---

### Figure 8.1: DentaVision AI Dashboard

![Figure 8.1: DentaVision AI Dashboard](file:///d:/Collage/Major%20Project/DentaVision-AI/docs/presentation/screen_1_doctor_dashboard.png)

*Figure 8.1: Doctor Clinical Workstation Dashboard displaying active patient queue metrics, consultation triage status, and real-time AI inference alerts.*

#### Explanation
The **DentaVision AI Dashboard** serves as the central command hub for attending dental surgeons. Designed with a high-contrast dark clinical theme, it organizes complex operatory operations into clear visual hierarchies:
1. **Clinical Workload & Queue KPI Cards:** Real-time counters immediately inform the clinician of operatory flow:
   - **Today's Clinical Queue (12):** Total consultations scheduled for the session, including completed visits.
   - **Patients Waiting (3):** Patients currently checked in at the consultation lounge.
   - **Awaiting Review (AI) (2):** Radiographs processed by the background neural network requiring attending doctor review and attestation.
   - **Reports Generated (9):** Completed diagnostic reports awaiting final electronic sign-off.
2. **Consultation Queue & Triage:** Patients (such as *Amina Rahmani*, *Rohan Sharma*, and *Vikramaditya V*) are listed alongside their medical alert tags (e.g., *Penicillin Allergy*, *Asthma*, *Type 2 Diabetes*) and workflow statuses (*Awaiting Review*, *Waiting*, *Registered*), providing rapid single-click entry into their full diagnostic workstation.
3. **AI Analysis Alert Card:** A prominent notification card alerts the doctor as soon as YOLO11m completes inference on an uploaded OPG (e.g., *"Caries Detected on Tooth #16 • Confidence: 92%"*), allowing the doctor to jump directly to the bounding box inspection interface.

---

### Figure 8.2: Patient Management Interface

![Figure 8.2: Patient Management Interface](file:///d:/Collage/Major%20Project/DentaVision-AI/docs/presentation/screen_2_reception_desk.png)

*Figure 8.2: Reception Management Interface providing intake queue tracking, appointment scheduling, and patient directory search.*

![Figure 8.2b: New Patient Registration Form](file:///d:/Collage/Major%20Project/DentaVision-AI/docs/presentation/verification/verify_5_patient_registration.png)

*Figure 8.2b: Patient Registration Terminal capturing legal demographics, critical medical alerts, and intake radiograph attachments.*

#### Explanation
The **Patient Management Interface** establishes patient record integrity and traceability across the clinical life cycle:
1. **Intake Queue & Reception Feed:** The Reception Desk tracks daily check-ins, scheduled appointments, and pending follow-ups. A real-time audit feed logs timestamps for each patient event (e.g., patient check-in, X-ray attachment, and billing).
2. **Standardized Patient Identification:** Each patient is assigned a deterministic alphanumeric identifier (e.g., `PT-2026-0705`), ensuring unambiguous record linkage between local client caches, PostgreSQL relational tables, and Supabase cloud storage buckets.
3. **Medical Alerts & Safety Flags:** Dedicated fields capture critical systemic conditions and pharmaceutical allergies (e.g., Penicillin, Latex, Local Anesthetics). These alerts automatically propagate to the doctor's workspace as high-visibility warning badges to prevent contraindications.
4. **Intake Radiograph Association:** Reception staff can directly upload panoramic OPG scans or doctor referral records at check-in, queuing them immediately for automated background neural network inference before the patient enters the operatory chair.

---

### Figure 8.3: Dental X-Ray Viewer

![Figure 8.3: Dental X-Ray Viewer](file:///d:/Collage/Major%20Project/DentaVision-AI/docs/presentation/screen_3_pacs_xray_viewer.png)

*Figure 8.3: Interactive PACS Radiograph Viewer displaying panoramic dental radiograph with contrast enhancement presets and digital measurement caliper.*

#### Explanation
The **Dental X-Ray Viewer** is a specialized Picture Archiving and Communication System (PACS) interface tailored for full-mouth panoramic radiographs (OPGs):
1. **Interactive Canvas Navigation:** Clinicians can fluidly pan, zoom (up to 400%), rotate, and reset high-resolution radiographs using mouse gestures or viewport hotkeys without pixel distortion.
2. **Hardware-Accelerated Contrast Presets:** The viewer includes four dedicated radiographic matrix filters designed to highlight specific dental structures:
   - **Standard (`STD`):** Preserves the natural grayscale gamma curve for general anatomical orientation.
   - **Bone Enhancement (`BONE`):** A high-pass filter optimizing the visibility of alveolar crest levels, cortical bone borders, and trabecular patterns to detect periodontal bone resorption.
   - **Enamel Sharpening (`ENAM`):** Enhances high-frequency edge gradients at the dentinoenamel junction (DEJ) to expose incipient interproximal caries.
   - **Negative Inversion (`NEG`):** Inverts radiographic grayscale values, rendering radiolucent lesions (cysts, apical granulomas, root resorptions) as bright luminous regions against a dark substrate.
3. **Digital Scale Ruler / Caliper:** An integrated digital caliper calibrated to ~14.2 px/mm enables precise millimeter measurements directly on the radiograph, assisting clinicians in measuring crown height, bone loss depth, and endodontic working lengths.

---

### Figure 8.4: AI-Based Dental Abnormality Detection

![Figure 8.4: AI-Based Dental Abnormality Detection](file:///d:/Collage/Major%20Project/DentaVision-AI/docs/presentation/screen_4_live_ai_xray_detection.png)

*Figure 8.4: AI inference overlay illustrating localized bounding boxes, pathology classification labels, and confidence metrics on a dental radiograph.*

#### Explanation
The **AI Abnormality Detection Engine** executes the trained YOLO11m deep learning model over the loaded radiograph:
1. **Tiled High-Resolution Inference:** Panoramic radiographs (often 2000×1000 pixels or larger) are divided into overlapping 640×640 tiles, processed independently by YOLO11m, and recombined using Weighted Box Fusion (WBF). This preserves micro-scale dental features such as incipient recurrent decay and marginal bone defects.
2. **Multiclass Pathology Recognition:** As illustrated, the model identifies multiple dental conditions simultaneously, such as:
   - *Tooth #16 — Caries (92% Confidence)*
   - *Tooth #46 — Bone Loss (78% Confidence)*
   - *Tooth #31 — Obturation (50% Confidence)*
   - *Tooth #15 — Carious Lesion (49% Confidence)*
3. **Real-Time Edge Execution:** Inference executes locally in under 50ms (or ~746ms when utilizing multi-tile WBF fusion), displaying bounding boxes with color-coded classification tags and confidence percentages directly on the radiographic canvas for immediate doctor review.

---

### Figure 8.5: Clinical Review Interface

![Figure 8.5: Clinical Review Interface](file:///d:/Collage/Major%20Project/DentaVision-AI/docs/presentation/screen_3b_odontogram_heat_chart.png)

*Figure 8.5: Interactive 32-Tooth FDI Odontogram Heat Chart linked to AI bounding boxes with Confirm, Modify, and Decline doctor validation actions.*

![Figure 8.5b: Doctor Attestation & Modification Modal](file:///d:/Collage/Major%20Project/DentaVision-AI/docs/presentation/screen_3c_modify_finding_modal.png)

*Figure 8.5b: Doctor Attestation Modal enabling clinical correction of tooth numbers, pathology classification, severity grading, and diagnostic notes.*

#### Explanation
The **Clinical Review Interface** embodies the Human-in-the-Loop (HITL) architectural paradigm, ensuring that artificial intelligence remains strictly an assistive clinical tool:
1. **32-Tooth FDI Odontogram Heat Chart:** Positioned directly below the radiograph viewer, the odontogram models the complete human permanent dentition using the World Dental Federation (FDI) two-digit numbering system (Upper Maxilla #18–#28, Lower Mandible #48–#38). Teeth with detected anomalies are dynamically highlighted with color-coded badges (*Caries: Red, Periapical Lesion: Purple, Restoration: Blue, Bone Loss: Yellow*).
2. **Three-Way Attestation Gateway:** Each AI prediction must be explicitly reviewed by the clinician through three standardized actions:
   - **Accept:** The doctor approves the finding, marking it verified and transferring it directly into the patient's permanent diagnostic record.
   - **Modify:** Opens the Doctor Attestation Modal (Figure 8.5b), allowing the clinician to adjust the tooth designation, alter the diagnostic class, rate clinical severity (*Incipient / Moderate / Severe*), or enter descriptive clinical notes.
   - **Decline:** Clinicians can discard false positives or clinically insignificant anomalies, permanently preventing unverified data from polluting the patient's medical history.

---

### Figure 8.6: Prescription and Clinical Documentation

![Figure 8.6: Prescription and Clinical Documentation](file:///d:/Collage/Major%20Project/DentaVision-AI/docs/presentation/screen_5_prescription_module.png)

*Figure 8.6: Rx Prescription Builder and Consultation Documentation interface featuring parameterized medication entry and voice dictation.*

#### Explanation
The **Prescription and Clinical Documentation Module** bridges radiographic diagnosis with outpatient patient care:
1. **Dental Pharmacopeia Integration:** Clinicians can rapidly compose multi-drug regimens using standard dental medications (e.g., Amoxicillin, Ibuprofen, Metronidazole, Augmentin, Chlorhexidine mouth rinse) with auto-suggest datalists.
2. **Structured Dosing Parameters:** Precise clinical dosing fields capture:
   - **Strength:** e.g., 500mg, 400mg, 0.2%
   - **Dose:** e.g., 1 Capsule, 1 Tablet, 10ml
   - **Frequency:** Standard clinical abbreviations (*OD: Once daily, BD: Twice daily, TDS: Thrice daily, QID: 4x daily, SOS: As needed for pain*)
   - **Timing & Duration:** Administration instructions (*After Food, Before Food*) and treatment length (*3 Days, 5 Days*).
3. **Voice-Assisted Clinical Dictation:** An integrated audio recording module allows practitioners to speak post-operative patient instructions or special dietary advisories hands-free, transcribing them directly into the consultation record.
4. **Instant Print/Export:** Formatted prescriptions can be printed immediately for the patient or archived into the digital chart.

---

### Figure 8.7: Generated Clinical Report

![Figure 8.7: Generated Clinical Report](file:///d:/Collage/Major%20Project/DentaVision-AI/docs/presentation/screen_6_diagnostic_report.png)

*Figure 8.7: Standardized Radiology Diagnostic Report integrating clinic branding, patient metadata, confirmed AI neural detections, doctor clinical directives, and electronic signature attestation.*

#### Explanation
The **Generated Clinical Report** represents the final synthesized output of the DentaVision AI diagnostic workflow:
1. **Institutional Letterhead & Exam Metadata:** Standardized clinical branding (*DentaVision AI Clinical Center, Department of Dental Radiology & AI Diagnostics*) accompanied by exam date, patient legal name, unique system ID (`PT-2026-0705`), attending surgeon identity, and model engine version.
2. **Neural Network Detection Summary:** A structured enumeration of all validated radiographic findings detailing tooth numbers, pathology categories, clinician verification status (*Confirmed / Modified*), and neural network confidence scores.
3. **Doctor Impression & Directives:** An editable clinical text section where the attending dentist records definitive diagnosis, operative treatment recommendations (e.g., *composite resin restoration, endodontic therapy*), and follow-up schedules.
4. **Human-in-the-Loop Attestation & Signature Block:** A formal medico-legal attestation clause stating that AI findings have been cross-examined by a licensed dental surgeon, accompanied by a cryptographically verifiable Digital Audit Hash (`DV-HITL-XR2026-STAMPED`) and the doctor's registration credentials (`DCI-KA-2021-08491`), ready for PDF export and patient delivery.
