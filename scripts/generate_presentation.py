"""
DentaVision AI — Final Major Project Presentation Generator
Owner: Noaman (Technical Lead & AI Model Lead)
Generates: docs/presentation/DentaVision_AI_Final_Presentation.pptx
"""

import os
from pathlib import Path
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def create_deck():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Theme Colors
    BG_DARK = RGBColor(15, 23, 42)        # Slate 900 #0f172a
    CARD_BG = RGBColor(30, 41, 59)        # Slate 800 #1e293b
    TEAL = RGBColor(20, 184, 166)         # Teal 500 #14b8a6
    CYAN = RGBColor(6, 182, 212)          # Cyan 500 #06b6d4
    WHITE = RGBColor(255, 255, 255)
    TEXT_MUTED = RGBColor(148, 163, 184)  # Slate 400 #94a3b8
    GREEN = RGBColor(34, 197, 94)
    ACCENT_BORDER = RGBColor(51, 65, 85)

    def set_slide_background(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = BG_DARK
        bg.line.color.rgb = BG_DARK
        return bg

    def add_header(slide, title_text, category="DENTAVISION AI — FINAL YEAR MAJOR PROJECT"):
        # Category tag
        cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.5), Inches(0.4))
        tf_cat = cat_box.text_frame
        tf_cat.word_wrap = True
        p_cat = tf_cat.paragraphs[0]
        p_cat.text = category.upper()
        p_cat.font.size = Pt(11)
        p_cat.font.bold = True
        p_cat.font.color.rgb = TEAL

        # Title
        t_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.7), Inches(11.5), Inches(0.8))
        tf = t_box.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title_text
        p.font.size = Pt(24)
        p.font.bold = True
        p.font.color.rgb = WHITE

    def add_card(slide, left, top, width, height, title, content_bullets):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(top), Inches(width), Inches(height))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = ACCENT_BORDER
        card.line.width = Pt(1)

        tx_box = slide.shapes.add_textbox(Inches(left + 0.25), Inches(top + 0.2), Inches(width - 0.5), Inches(height - 0.4))
        tf = tx_box.text_frame
        tf.word_wrap = True
        
        p_title = tf.paragraphs[0]
        p_title.text = title
        p_title.font.size = Pt(16)
        p_title.font.bold = True
        p_title.font.color.rgb = CYAN
        p_title.space_after = Pt(10)

        for b in content_bullets:
            p_b = tf.add_paragraph()
            p_b.text = f"•  {b}"
            p_b.font.size = Pt(12)
            p_b.font.color.rgb = WHITE
            p_b.space_after = Pt(6)

    # -------------------------------------------------------------
    # SLIDE 1: Title Slide
    # -------------------------------------------------------------
    s1 = prs.slides.add_slide(blank_layout)
    set_slide_background(s1)

    tbox = s1.shapes.add_textbox(Inches(1.0), Inches(1.8), Inches(11.3), Inches(3.5))
    tf1 = tbox.text_frame
    tf1.word_wrap = True

    p0 = tf1.paragraphs[0]
    p0.text = "FINAL YEAR MAJOR PROJECT PRESENTATION"
    p0.font.size = Pt(14)
    p0.font.bold = True
    p0.font.color.rgb = TEAL
    p0.space_after = Pt(12)

    p1 = tf1.add_paragraph()
    p1.text = "DentaVision AI"
    p1.font.size = Pt(44)
    p1.font.bold = True
    p1.font.color.rgb = WHITE

    p2 = tf1.add_paragraph()
    p2.text = "AI-Assisted Dental Clinic Management & Radiograph Pathology Detection System"
    p2.font.size = Pt(20)
    p2.font.color.rgb = CYAN
    p2.space_after = Pt(28)

    p3 = tf1.add_paragraph()
    p3.text = "Department of Computer Science & Engineering"
    p3.font.size = Pt(14)
    p3.font.color.rgb = TEXT_MUTED

    # Team Box
    team_card = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.0), Inches(5.2), Inches(11.3), Inches(1.5))
    team_card.fill.solid()
    team_card.fill.fore_color.rgb = CARD_BG
    team_card.line.color.rgb = TEAL
    team_card.line.width = Pt(1.5)

    tt_box = s1.shapes.add_textbox(Inches(1.2), Inches(5.3), Inches(10.9), Inches(1.3))
    ttf = tt_box.text_frame
    tp = ttf.paragraphs[0]
    tp.text = "PROJECT TEAM & CORE RESPONSIBILITIES"
    tp.font.size = Pt(12)
    tp.font.bold = True
    tp.font.color.rgb = TEAL
    tp.space_after = Pt(6)

    tp_members = ttf.add_paragraph()
    tp_members.text = "• Noaman (Technical Lead & AI Model Lead)   • Twahir (Backend & Cloud Lead)   • Sneha (Frontend & Electron Lead)   • Soha (AI Service Lead)"
    tp_members.font.size = Pt(13)
    tp_members.font.bold = True
    tp_members.font.color.rgb = WHITE

    # -------------------------------------------------------------
    # SLIDE 2: Problem Statement & Motivation
    # -------------------------------------------------------------
    s2 = prs.slides.add_slide(blank_layout)
    set_slide_background(s2)
    add_header(s2, "Problem Statement & Clinical Motivation")

    add_card(s2, 0.8, 1.8, 5.6, 5.0, "Clinical Diagnostic Challenges", [
        "High Radiographic Workload: General dental clinics evaluate dozens of full-mouth Panoramic Radiographs (OPGs) daily.",
        "Diagnostic Fatigue & Subtle Lesions: Early-stage interproximal dental caries and periapical radiolucencies are notoriously easy to overlook.",
        "Severe Class Imbalance: Critical pathologies (furcation, bone loss) occur far less frequently than common restorations, complicating automated detection.",
        "High stakes: Delayed diagnosis of dental infections leads to avoidable extractions, systemic complications, and invasive endodontic procedures."
    ])

    add_card(s2, 6.8, 1.8, 5.7, 5.0, "Systemic Workflow Gaps", [
        "Fragmented Software Systems: Imaging software and patient Electronic Medical Records (EMR) are isolated into separate silos.",
        "Lack of Decision Support: Most dental software only displays static image files without localized diagnostic assistance.",
        "Need for Human-in-the-Loop Authority: AI cannot legally diagnose; clinicians must retain complete authority to confirm, modify, or reject proposals.",
        "Goal: An integrated workstation bridging automated high-recall neural detection with verified clinical record keeping."
    ])

    # -------------------------------------------------------------
    # SLIDE 3: System Architecture (Approved V1)
    # -------------------------------------------------------------
    s3 = prs.slides.add_slide(blank_layout)
    set_slide_background(s3)
    add_header(s3, "System Architecture & End-to-End Pipeline")

    add_card(s3, 0.8, 1.8, 3.6, 5.0, "1. Desktop Application", [
        "Technology: Electron + React + Vite.",
        "Workstation Shell: Role-based clinical layout (Doctor, Reception, Admin).",
        "Interactive Canvas: Deep zoom, contrast adjustment, bounding box toggles.",
        "Doctor Review: Confirm, Modify, or Reject AI findings before report generation."
    ])

    add_card(s3, 4.8, 1.8, 3.7, 5.0, "2. Node.js Backend & Cloud", [
        "Framework: Express + TypeScript.",
        "Database: PostgreSQL via Prisma ORM (14 normalized relational tables).",
        "Cloud Services: Supabase Storage for secure long-term X-ray hosting.",
        "AI Proxy Controller: Forwards images, enforces guaranteed temp-file deletion."
    ])

    add_card(s3, 8.8, 1.8, 3.7, 5.0, "3. Local AI Service", [
        "Framework: Python + FastAPI + PyTorch.",
        "SOTA Model: YOLO11m Gold Tiled checkpoint.",
        "Sliding Window Tiling: 640x640 patches at native resolution (stride 448).",
        "Ensemble Postprocessing: Class-wise Weighted Box Fusion (WBF IoU 0.40)."
    ])

    # -------------------------------------------------------------
    # SLIDE 4: Technology Stack
    # -------------------------------------------------------------
    s4 = prs.slides.add_slide(blank_layout)
    set_slide_background(s4)
    add_header(s4, "Approved Technology Stack")

    add_card(s4, 0.8, 1.8, 5.6, 5.0, "Client & Backend Stack", [
        "Frontend: React 18, Vite 5, Lucide Icons.",
        "Desktop Framework: Electron 29 (Isolated Context, secure IPC).",
        "Backend Engine: Node.js 24, Express 5, TypeScript 7.",
        "Database Layer: PostgreSQL + Prisma ORM 7 (Migrations & Seeders).",
        "Storage & Security: Supabase Storage, Helmet, CORS, Zod validation."
    ])

    add_card(s4, 6.8, 1.8, 5.7, 5.0, "Artificial Intelligence & Vision", [
        "Deep Learning: PyTorch 2.6 (CUDA 12.4 support) + Ultralytics YOLO11m.",
        "REST API Server: FastAPI 0.141, Uvicorn, Pydantic schemas.",
        "Image Processing: OpenCV (CLAHE, Otsu contour extraction), NumPy.",
        "Post-processing: Weighted Box Fusion (WBF), NMS suppression.",
        "Testing Suite: Pytest (23/23 tests pass), Vitest for backend APIs."
    ])

    # -------------------------------------------------------------
    # SLIDE 5: Dataset & Native Resolution Tiling
    # -------------------------------------------------------------
    s5 = prs.slides.add_slide(blank_layout)
    set_slide_background(s5)
    add_header(s5, "Dataset Methodology & Native Resolution Tiling")

    add_card(s5, 0.8, 1.8, 5.6, 5.0, "Pristine Gold-Standard Dataset", [
        "Source Data: 1,375 training and 153 validation clinical Panoramic Radiographs.",
        "Restored Human Annotations: 18,570 expert bounding boxes restored.",
        "Pathology Coverage: 2,745 Caries, 2,763 Bone Loss, 973 Apical Periodontitis, 268 Furcation lesions.",
        "Zero Data Leakage: Complete patient isolation between training and validation splits with normalized coordinate validation."
    ])

    add_card(s5, 6.8, 1.8, 5.7, 5.0, "Native Resolution 640x640 Tiling", [
        "The Scaling Dilemma: Standard 640x640 downsampling of a 2000x1000 OPG destroys subtle micro-lesions (<15px).",
        "Our Solution: Slice full OPGs into native 640x640 patches with 30% spatial overlap (stride 448).",
        "Resulting Dataset: 14,538 high-detail training tiles preserving fine trabecular and enamel details.",
        "Coordinate Reconstruction: Predictions on tiles mapped back into full panoramic coordinates seamlessly."
    ])

    # -------------------------------------------------------------
    # SLIDE 6: 14-Class Dental Pathology Taxonomy
    # -------------------------------------------------------------
    s6 = prs.slides.add_slide(blank_layout)
    set_slide_background(s6)
    add_header(s6, "14-Class Dental Pathology & Device Taxonomy")

    add_card(s6, 0.8, 1.8, 5.6, 5.0, "Clinical Pathologies (Primary Focus)", [
        "Class 4 — Carious Lesion: Enamel and dentin radiolucencies.",
        "Class 5 — Bone Resorption: Alveolar bone crest reduction.",
        "Class 7 — Apical Periodontitis: Periapical radiolucencies around root apex.",
        "Class 9 — Furcation Lesion: Bone loss between multi-rooted molar roots.",
        "Class 11 — Root Resorption: Internal/external blunting of root structure.",
        "Class 8 — Root Fragment: Retained fractured root segments."
    ])

    add_card(s6, 6.8, 1.8, 5.7, 5.0, "Restorations, Anatomy & Devices", [
        "Class 0 — Implant: Titanium dental fixtures.",
        "Class 1 — Prosthetic Restoration: Crowns, bridges, veneers.",
        "Class 2 — Obturation: Root canal gutta-percha fillings.",
        "Class 3 — Endodontic Treatment: Completed endodontic therapies.",
        "Class 6 — Impacted Tooth: Unerupted / malpositioned third molars.",
        "Class 10 — Apical Surgery: Retrograde root fillings / apicoectomy.",
        "Class 12/13 — Orthodontic & Surgical Devices: Brackets, wires, plates."
    ])

    # -------------------------------------------------------------
    # SLIDE 7: AI Model & Inference Pipeline
    # -------------------------------------------------------------
    s7 = prs.slides.add_slide(blank_layout)
    set_slide_background(s7)
    add_header(s7, "AI Architecture & Weighted Box Fusion (WBF)")

    add_card(s7, 0.8, 1.8, 5.6, 5.0, "Model Architecture: YOLO11m", [
        "Backbone: 20,040,826 parameters, 126 fused layers, 67.8 GFLOPs.",
        "Model Checkpoint: best_model.pt (40.5 MB).",
        "Training Regime: 30 epochs on RTX 3050 Laptop GPU (11.1 hours).",
        "Adaptive Learning: Cosine LR schedule with mosaic and affine augmentations.",
        "Execution: Runs on CUDA GPU (~85ms) and Workstation CPU (~480ms)."
    ])

    add_card(s7, 6.8, 1.8, 5.7, 5.0, "Inference & Post-Processing", [
        "Sliding Window Tiling: Generates patches with 30% overlap across full jaw width.",
        "Weighted Box Fusion (WBF): Clusters overlapping tile detections at IoU 0.40 and averages coordinates weighted by confidence.",
        "Calibrated Per-Class Thresholds: Optimized sensitivity (Caries @ 0.15, Apical @ 0.15, Bone Loss @ 0.08, Implants @ 0.25).",
        "OpenCV Heuristic Fallback: CLAHE + Otsu segmentation engine guarantees zero runtime crashes even if weights are missing."
    ])

    # -------------------------------------------------------------
    # SLIDE 8: Experimental Results & Benchmarks
    # -------------------------------------------------------------
    s8 = prs.slides.add_slide(blank_layout)
    set_slide_background(s8)
    add_header(s8, "Verified Benchmark Results (100 Untouched OPGs)")

    add_card(s8, 0.8, 1.8, 5.6, 5.0, "Overall Evaluation Metrics", [
        "Evaluation Benchmark: 100 completely untouched clinical OPGs (1,369 ground-truth lesions, 0% train/val overlap).",
        "Full-Image mAP@50: 51.4% (Substantial jump over 42.4% full-resize baseline).",
        "Macro-Recall: 60.2% across all 14 classes.",
        "Clinical Utility: High sensitivity ensures critical pathologies are surfaced for clinician confirmation rather than missed."
    ])

    add_card(s8, 6.8, 1.8, 5.7, 5.0, "Key Class Performance Highlights", [
        "Endodontic Treatment (Class 3): 90.6% AP@50 (High contrast & precision).",
        "Dental Implant (Class 0): 87.2% AP@50 (Near-perfect fixture localization).",
        "Impacted Tooth (Class 6): 74.3% AP@50 (Accurate impaction detection).",
        "Carious Lesion (Class 4): 56.7% Recall / 36.6% AP@50 (High candidate recall).",
        "Apical Periodontitis (Class 7): 57.5% Recall / 38.6% AP@50 (Consistent apex detection)."
    ])

    # -------------------------------------------------------------
    # SLIDE 9: Application Modules & Features
    # -------------------------------------------------------------
    s9 = prs.slides.add_slide(blank_layout)
    set_slide_background(s9)
    add_header(s9, "Clinical Application Modules")

    add_card(s9, 0.8, 1.8, 3.6, 5.0, "Reception Workstation", [
        "Patient Registration: Demographics, allergies, emergency contacts.",
        "Instant Directory Search: Query by Patient ID, Name, or Phone.",
        "Daily Appointment Queue: Real-time patient triage & status badges."
    ])

    add_card(s9, 4.8, 1.8, 3.7, 5.0, "Doctor Clinical Workspace", [
        "8 Unified Tabs: X-rays, Overview, Visits, Prescriptions, History, Docs, Reports, Timeline.",
        "Interactive X-Ray Canvas: Zoom, pan, brightness/contrast filters, bounding box overlays.",
        "Finding Review Drawer: Confirm, modify tooth #, or reject detections."
    ])

    add_card(s9, 8.8, 1.8, 3.7, 5.0, "Reports & Audit Trail", [
        "Diagnostic Reports: Auto-merges confirmed AI findings with doctor directives.",
        "Printable Layout: Branded clinic header, printable via browser/PDF.",
        "Audit Timeline: Chronological immutable log of all clinical actions."
    ])

    # -------------------------------------------------------------
    # SLIDE 10: Human-in-the-Loop Workflow
    # -------------------------------------------------------------
    s10 = prs.slides.add_slide(blank_layout)
    set_slide_background(s10)
    add_header(s10, "Human-in-the-Loop Diagnostic Review")

    add_card(s10, 0.8, 1.8, 5.6, 5.0, "Clinical Review Principles", [
        "Doctor as Final Authority: AI predictions are candidate proposals; no finding is finalized without clinician confirmation.",
        "Three-Way Decision Drawer:",
        "  1. Confirm: Clinician agrees with finding; moves to final report.",
        "  2. Modify: Clinician adjusts tooth number or severity notes.",
        "  3. Reject: False positive discarded from patient record.",
        "Ethical Compliance: Software complies with medical AI regulations."
    ])

    add_card(s10, 6.8, 1.8, 5.7, 5.0, "Guaranteed Data Cleanliness", [
        "Zero Temp-File Leakage: Temporary upload buffers strictly purged from disk immediately after inference.",
        "Separation of Concerns: Local AI service does not touch external cloud databases directly.",
        "Permanent Cloud Persistence: Confirmed X-rays securely archived in Supabase Storage buckets.",
        "Audit Logging: All confirmations and edits tracked with timestamps."
    ])

    # -------------------------------------------------------------
    # SLIDE 11: Live Demonstration Scenario
    # -------------------------------------------------------------
    s11 = prs.slides.add_slide(blank_layout)
    set_slide_background(s11)
    add_header(s11, "Demonstration Flow (Live Viva Walkthrough)")

    add_card(s11, 0.8, 1.8, 11.7, 5.0, "Step-by-Step Clinical Demo Path", [
        "Step 1: Receptionist registers patient 'Amina Rahmani' (DOB: 1992-04-14, Medical Flag: Penicillin Allergy).",
        "Step 2: Switch role to Dr. Twahir Mohammed -> open patient workspace from queue.",
        "Step 3: Record Clinical Consultation: Chief complaint = 'Sharp pain in lower right molar (Tooth #46)'.",
        "Step 4: Navigate to 'X-rays & AI Engine' -> click 'Upload OPG X-Ray' -> select panoramic radiograph from disk.",
        "Step 5: Trigger AI Dental Analysis -> YOLO11m executes in ~120ms -> Bounding boxes render on canvas (Caries #46, Apical Lesion #46).",
        "Step 6: Doctor confirms Caries finding on #46 -> modifies notes -> navigates to 'Diagnostic Reports'.",
        "Step 7: Auto-compiled diagnostic report displays AI detections and doctor directives -> print/export ready.",
        "Step 8: Open 'History Timeline' -> verify chronological event chain (Registration -> Visit -> X-ray -> AI Analysis -> Report)."
    ])

    # -------------------------------------------------------------
    # SLIDE 12: Testing & Verification Evidence
    # -------------------------------------------------------------
    s12 = prs.slides.add_slide(blank_layout)
    set_slide_background(s12)
    add_header(s12, "Testing & Verification Evidence")

    add_card(s12, 0.8, 1.8, 5.6, 5.0, "Automated Test Suites", [
        "AI Service Test Suite: 23 passed, 0 failed via PyTest.",
        "API Tests: Verified /health, /version, /analyze multipart uploads.",
        "Inference & Preprocessor Tests: Verified CLAHE, augmentations, and NMS suppression.",
        "Backend Vitest Suite: 9/9 validation tests pass; health check integration test passes.",
        "Desktop Production Bundle: Vite compiles 1,495 modules in 1.81s with 0 errors."
    ])

    add_card(s12, 6.8, 1.8, 5.7, 5.0, "Robustness & Failure Handling", [
        "Graceful Fallback: OpenCV contour engine activates if model file is missing.",
        "Network Disconnection: Desktop API client gracefully handles offline states without crashing.",
        "Data Validation: Zod schemas validate phone, DOB, and clinical inputs.",
        "Security: Helmet headers, CORS restrictions, JWT auth middleware."
    ])

    # -------------------------------------------------------------
    # SLIDE 13: Limitations & Future Enhancements
    # -------------------------------------------------------------
    s13 = prs.slides.add_slide(blank_layout)
    set_slide_background(s13)
    add_header(s13, "Current Limitations & Future Scope")

    add_card(s13, 0.8, 1.8, 5.6, 5.0, "Honest Technical Limitations", [
        "Superimposed Jaw Anatomy: Ghost shadows from cervical spine occasionally cause spurious low-confidence detections.",
        "Micro-Caries Sensitivity: Incipient enamel-only caries (<10px) remain challenging on lower-resolution scans.",
        "Diffuse Bone Resorption: Horizontal alveolar crest reduction lacks sharp edges, requiring clinician verification.",
        "2D vs 3D Modality: Panoramic 2D scans cannot measure buccolingual bone depth."
    ])

    add_card(s13, 6.8, 1.8, 5.7, 5.0, "Future Scope (Version 2.0)", [
        "CBCT 3D Volumetric Segmentation: Multi-planar reconstruction for implant planning.",
        "Voice-Assisted Dictation: Speech-to-text clinical consultation logging.",
        "Tooth Segmentation Masks: Instance segmentation (YOLO11-seg) for exact crown/root boundaries.",
        "Mobile Patient Portal: Progressive Web App (PWA) for patient appointment viewing."
    ])

    # -------------------------------------------------------------
    # SLIDE 14: Conclusion & Acknowledgments
    # -------------------------------------------------------------
    s14 = prs.slides.add_slide(blank_layout)
    set_slide_background(s14)
    add_header(s14, "Conclusion & Team Contributions")

    add_card(s14, 0.8, 1.8, 11.7, 5.0, "Summary & Acknowledgments", [
        "Conclusion: DentaVision AI successfully delivers an integrated, clinically viable dental management system powered by a state-of-the-art YOLO11m patch-tiled detection model achieving 51.4% mAP@50 on real clinical benchmarks.",
        "Team Ownership & Accomplishments:",
        "  • Noaman: AI Dataset restoration, YOLO11m patch tiling, WBF inference pipeline, system technical integration.",
        "  • Twahir: Express backend, 14-table PostgreSQL schema in Prisma, Supabase storage, AI proxy controller.",
        "  • Sneha: Electron desktop shell, interactive canvas overlays, dark-mode clinical UI, report generator.",
        "  • Soha: FastAPI REST engine, API schemas, model loading interface, service error handling.",
        "Acknowledgments: We express sincere gratitude to our Project Guide, Faculty Reviewers, and Department for their invaluable support.",
        "Thank you! We are now open for Questions & Discussion."
    ])

    # Save presentation
    output_dir = Path("docs/presentation")
    output_dir.mkdir(parents=True, exist_ok=True)
    out_file = output_dir / "DentaVision_AI_Final_Presentation.pptx"
    prs.save(str(out_file))
    print(f"Presentation successfully created at: {out_file.resolve()}")
    return out_file

if __name__ == "__main__":
    create_deck()
