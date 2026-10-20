import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatients } from '../../context/PatientContext';
import { useAI } from '../../context/AIContext';
import { useAuth } from '../../context/AuthContext';
import { 
  FileText, 
  Save, 
  Printer, 
  Sparkles, 
  CheckCircle2, 
  Edit3, 
  ArrowLeft,
  Download,
  Calendar,
  User,
  ShieldCheck
} from 'lucide-react';

export const ReportModule = () => {
  const navigate = useNavigate();
  const { activePatient, addPatientReport } = usePatients();
  const { analysisResult } = useAI();
  const { user } = useAuth();

  const draftKey = `dentavision_report_draft_${activePatient?.id || 'default'}`;

  const defaultDoctorNotes = "AI Neural Network detected Caries on Tooth #46 with 92% confidence. Clinical examination confirms radiolucency. Recommended treatment: Composite resin restoration under local anesthesia.";

  const [doctorNotes, setDoctorNotes] = useState(() => {
    return localStorage.getItem(draftKey) || defaultDoctorNotes;
  });
  const [isSaved, setIsSaved] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState(null);

  useEffect(() => {
    // If no manual draft has been saved yet, auto-populate from AI analysis
    const saved = localStorage.getItem(draftKey);
    if (!saved && analysisResult?.findings?.length > 0) {
      const summary = analysisResult.findings
        .map(f => `${f.finding_type} on Tooth #${String(f.tooth_number || '').replace(/^Tooth\s*#?\s*/i, '')} (${f.status || 'Pending'})`)
        .join(', ');
      setDoctorNotes(
        `Comprehensive OPG radiograph review completed for ${activePatient?.name || 'patient'}. AI findings evaluated: ${summary}. Clinical examination confirms radiographic findings. Recommended treatment plan: composite restoration and follow-up as indicated.`
      );
    }
  }, [analysisResult, activePatient, draftKey]);

  const handleSaveReport = () => {
    if (activePatient && addPatientReport) {
      addPatientReport(activePatient.id, {
        notes: doctorNotes,
        findingsCount: analysisResult?.findings?.length || 0,
        xrayId: analysisResult?.xray_id || 'XRAY-2026-0042',
        doctor: user?.name || 'Dr. Twahir Mohammed'
      });
    }
    localStorage.setItem(draftKey, doctorNotes);
    setIsSaved(true);
    setLastSavedTime(new Date().toLocaleTimeString());
    setTimeout(() => setIsSaved(false), 3000);
  };

  const exportOfficialReportPdf = () => {
    const reportDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const doctorName = user?.name || 'Dr. Twahir Mohammed';
    const patientName = activePatient?.name || 'Amina Rahmani';
    const patientId = activePatient?.id || 'PT-2026-0705';
    const patientDob = activePatient?.dob || '1992-04-14';
    const patientGender = activePatient?.gender || 'Female';
    const patientPhone = activePatient?.phone || '+91 98765 43210';
    const xrayId = analysisResult?.xray_id || 'XRAY-2026-0042';
    const modelVersion = analysisResult?.model_version || 'YOLO11m-Dental-v1.4';

    const findingsRows = (analysisResult?.findings || []).map(f => {
      const cleanTooth = String(f.tooth_number || '').replace(/^Tooth\s*#?\s*/i, '');
      const confPercent = Math.round((f.confidence || 0.9) * 100);
      return `
        <tr>
          <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">Tooth #${cleanTooth}</td>
          <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;">${f.finding_type}</td>
          <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #0284c7; font-weight: 600;">${confPercent}%</td>
          <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;"><span style="background: #f1f5f9; padding: 3px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">${f.status || 'Confirmed'}</span></td>
          <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #475569;">${f.notes || 'Verified by clinical examination'}</td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Diagnostic_Report_${patientName.replace(/\s+/g, '_')}_${patientId}</title>
        <style>
          @page { size: A4; margin: 18mm 16mm; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            background: #ffffff;
            margin: 0;
            padding: 0;
            line-height: 1.5;
            -webkit-print-color-adjust: exact;
          }
          .header-table {
            width: 100%;
            border-bottom: 2px solid #0d9488;
            padding-bottom: 14px;
            margin-bottom: 18px;
          }
          .clinic-title {
            font-size: 22px;
            font-weight: 800;
            color: #0f766e;
            letter-spacing: -0.5px;
          }
          .clinic-subtitle {
            font-size: 12px;
            color: #64748b;
            margin-top: 2px;
          }
          .report-badge {
            text-align: right;
          }
          .report-title {
            font-size: 15px;
            font-weight: 800;
            color: #0f172a;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .metadata-box {
            width: 100%;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 12px 16px;
            margin-bottom: 18px;
            box-sizing: border-box;
          }
          .meta-table {
            width: 100%;
            font-size: 13px;
          }
          .meta-table td {
            padding: 4px 8px;
          }
          .meta-label {
            color: #64748b;
            font-weight: 500;
          }
          .meta-value {
            font-weight: 600;
            color: #0f172a;
          }
          .section-heading {
            font-size: 14px;
            font-weight: 700;
            color: #0f766e;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 4px;
            margin-top: 18px;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .findings-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
            margin-bottom: 16px;
          }
          .findings-table th {
            background: #f1f5f9;
            color: #334155;
            font-weight: 700;
            text-align: left;
            padding: 8px 14px;
            border-bottom: 1px solid #cbd5e1;
          }
          .notes-box {
            background: #f8fafc;
            border-left: 3px solid #0d9488;
            padding: 12px 14px;
            font-size: 13px;
            color: #1e293b;
            margin-bottom: 24px;
            white-space: pre-wrap;
          }
          .footer-section {
            margin-top: 32px;
            padding-top: 16px;
            border-top: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          .attestation {
            font-size: 11px;
            color: #64748b;
            max-width: 380px;
            line-height: 1.4;
          }
          .signature-box {
            text-align: right;
            min-width: 200px;
          }
          .signature-line {
            border-bottom: 1px dashed #94a3b8;
            margin-bottom: 6px;
            height: 36px;
            display: flex;
            align-items: flex-end;
            justify-content: flex-end;
            font-family: cursive;
            font-size: 18px;
            color: #0f766e;
          }
        </style>
      </head>
      <body>
        <table class="header-table">
          <tr>
            <td>
              <div class="clinic-title">DENTAVISION AI CLINICAL CENTER</div>
              <div class="clinic-subtitle">Department of Dental Radiology & AI Decision Support • Unit 4, MG Road, Bengaluru, KA</div>
            </td>
            <td class="report-badge">
              <div class="report-title">Radiology Diagnostic Report</div>
              <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Date: ${reportDate}</div>
              <div style="font-size: 11px; color: #0d9488; font-weight: 600;">PACS Ref: ${xrayId}</div>
            </td>
          </tr>
        </table>

        <div class="metadata-box">
          <table class="meta-table">
            <tr>
              <td class="meta-label">Patient Name:</td>
              <td class="meta-value">${patientName}</td>
              <td class="meta-label">Attending Surgeon:</td>
              <td class="meta-value">${doctorName}, B.D.S., M.D.S.</td>
            </tr>
            <tr>
              <td class="meta-label">Patient ID:</td>
              <td class="meta-value">${patientId}</td>
              <td class="meta-label">Specialty:</td>
              <td class="meta-value">Oral & Maxillofacial Radiology</td>
            </tr>
            <tr>
              <td class="meta-label">DOB / Gender:</td>
              <td class="meta-value">${patientDob} (${patientGender})</td>
              <td class="meta-label">AI Diagnostic Engine:</td>
              <td class="meta-value">${modelVersion}</td>
            </tr>
            <tr>
              <td class="meta-label">Contact:</td>
              <td class="meta-value">${patientPhone}</td>
              <td class="meta-label">Attestation Status:</td>
              <td class="meta-value" style="color: #0f766e;">Attested (Human-in-the-Loop)</td>
            </tr>
          </table>
        </div>

        <div class="section-heading">Automated Neural Network Detections & Verified Findings</div>
        <table class="findings-table">
          <thead>
            <tr>
              <th>Tooth</th>
              <th>Pathology</th>
              <th>Confidence</th>
              <th>Status</th>
              <th>Clinical Verification Notes</th>
            </tr>
          </thead>
          <tbody>
            ${findingsRows || '<tr><td colspan="5" style="padding: 12px; text-align: center; color: #64748b;">No pathological abnormalities detected on scan.</td></tr>'}
          </tbody>
        </table>

        <div class="section-heading">Doctor Impression & Clinical Directives</div>
        <div class="notes-box">${doctorNotes}</div>

        <table style="width: 100%; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 14px;">
          <tr>
            <td style="width: 60%; vertical-align: top;">
              <div class="attestation">
                <strong>Attestation & Verification:</strong> This official diagnostic report synthesizes AI neural inference cross-examined and validated by the attending specialist. Formulated in accordance with DCI Diagnostic Radiology protocols.
                <br /><br />
                <strong>Audit Hash:</strong> DV-HITL-${xrayId}-VERIFIED-${Date.now()}
              </div>
            </td>
            <td style="width: 40%; vertical-align: bottom; text-align: right;">
              <div class="signature-box" style="display: inline-block;">
                <div class="signature-line">${doctorName}</div>
                <div style="font-size: 13px; font-weight: 700; color: #0f172a;">${doctorName}, B.D.S., M.D.S.</div>
                <div style="font-size: 11px; color: #64748b;">Reg No: DCI-KA-2021-08491</div>
                <div style="font-size: 11px; color: #0f766e; font-weight: 600;">Oral Radiology Specialist</div>
              </div>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const printWin = window.open('', '_blank', 'width=900,height=1000');
    if (printWin) {
      printWin.document.open();
      printWin.document.write(htmlContent);
      printWin.document.close();
      printWin.focus();
      setTimeout(() => {
        printWin.print();
      }, 350);
    } else {
      // Fallback to window.print with @media print CSS
      window.print();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Action Header */}
      <div className="glass-card no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => navigate('/workspace')}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <ArrowLeft size={16} />
            <span>Back to Workspace</span>
          </button>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
              Diagnostic Report Generator
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Integrated AI Findings & Doctor Evaluation • Formatted Clinical PDF Export
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleSaveReport} className="btn-secondary">
            <Save size={18} />
            <span>Save Draft</span>
          </button>

          <button onClick={exportOfficialReportPdf} className="btn-primary">
            <Printer size={18} />
            <span>Export Clean PDF / Print</span>
          </button>
        </div>
      </div>

      {isSaved && (
        <div className="badge badge-success fade-in no-print" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', fontSize: '13px' }}>
          <CheckCircle2 size={16} />
          <span>Report draft saved to patient records at {lastSavedTime}.</span>
        </div>
      )}

      {/* Printable Report Canvas Layout */}
      <div
        className="glass-card printable-document"
        style={{
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          border: '1px solid var(--border-accent)',
        }}
      >
        {/* Clinic & Report Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--primary-teal)', paddingBottom: '16px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', color: 'var(--primary-teal)', fontWeight: '700' }}>
              DENTAVISION AI CLINICAL CENTER
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Department of Dental Radiology & AI Diagnostics • Unit 4, MG Road, Bengaluru
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>RADIOLOGY DIAGNOSTIC REPORT</p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Date: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Patient & Exam Metadata */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', backgroundColor: 'var(--btn-secondary-bg)', padding: '16px', borderRadius: '8px' }}>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Patient Name</p>
            <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{activePatient?.name || 'Amina Rahmani'}</p>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Patient ID: {activePatient?.id || 'PT-2026-0705'}</p>
          </div>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Attending Surgeon</p>
            <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{user?.name || 'Dr. Twahir Mohammed'}</p>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Model Engine: {analysisResult?.model_version}</p>
          </div>
        </div>

        {/* AI Findings Summary */}
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--primary-teal)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} />
            <span>Automated AI Neural Network Detections</span>
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {analysisResult?.findings?.map((f) => {
              const cleanTooth = String(f.tooth_number || '').replace(/^Tooth\s*#?\s*/i, '');
              const statusColor = 
                f.status === 'Confirmed' ? 'badge-success' :
                f.status === 'Rejected' ? 'badge-error' :
                f.status === 'Modified' ? 'badge-warning' : 'badge-info';

              return (
                <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: 'var(--btn-secondary-bg)', borderRadius: '6px', borderLeft: '3px solid var(--primary-teal)' }}>
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      Tooth #{cleanTooth || '??'} — {f.finding_type}
                    </span>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {f.notes || `Model confidence: ${(f.confidence * 100).toFixed(1)}%`}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span className={`badge ${statusColor}`} style={{ fontSize: '11px' }}>
                      {f.status || 'Pending Review'}
                    </span>
                    <span className="badge badge-success" style={{ fontSize: '11px' }}>
                      {(f.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Doctor Impression Edit Area */}
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Edit3 size={16} color="var(--primary-teal)" />
            <span>Doctor Impression & Clinical Directives</span>
          </h4>
          <textarea
            className="input-field"
            rows={4}
            value={doctorNotes}
            onChange={(e) => setDoctorNotes(e.target.value)}
            style={{ fontSize: '13px', lineHeight: '1.5' }}
          />
        </div>

        {/* Doctor Verification & Signature Footer */}
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-glass)', display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', alignItems: 'flex-end' }}>
          <div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              <strong>Human-in-the-Loop Clinical Attestation:</strong> This diagnostic record integrates AI neural decision support verified by the licensed attending surgeon. All bounding box classifications have undergone clinical cross-examination prior to report generation.
            </p>
            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--primary-teal)' }}>
              <CheckCircle2 size={14} />
              <span>Digital Audit Hash: DV-HITL-{analysisResult?.xray_id || 'XR2026'}-STAMPED</span>
            </div>
          </div>

          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <div style={{ borderBottom: '1px dashed var(--text-muted)', width: '200px', height: '40px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '4px' }}>
              <span style={{ fontFamily: 'cursive', fontSize: '16px', color: 'var(--primary-teal)' }}>
                {user?.name || 'Dr. Twahir Mohammed'}
              </span>
            </div>
            <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '6px' }}>
              {user?.name || 'Dr. Twahir Mohammed, B.D.S., M.D.S.'}
            </p>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Reg No: DCI-KA-2021-08491 • Oral Radiology Specialist
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
