import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatients } from '../../context/PatientContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Pill, 
  Mic, 
  MicOff, 
  Plus, 
  Trash2, 
  Printer, 
  CheckCircle2, 
  Volume2, 
  ArrowLeft,
  Save,
  FileCheck,
  AlertTriangle
} from 'lucide-react';

const commonMedicines = [
  'Amoxicillin',
  'Ibuprofen',
  'Paracetamol',
  'Metronidazole',
  'Chlorhexidine Mouthwash',
  'Clindamycin',
  'Amoxicillin + Clavulanate (Augmentin)',
  'Ketorolac DT'
];

export const PrescriptionModule = () => {
  const navigate = useNavigate();
  const { activePatient } = usePatients();
  const { user } = useAuth();

  const [prescriptions, setPrescriptions] = useState([
    { id: 1, medicine: 'Amoxicillin', strength: '500mg', dose: '1 Capsule', frequency: 'TDS (3x/day)', timing: 'After Food', duration: '5 Days', instructions: 'Complete full course to prevent bacterial resistance.' },
    { id: 2, medicine: 'Ibuprofen', strength: '400mg', dose: '1 Tablet', frequency: 'BD (2x/day)', timing: 'After Food', duration: '3 Days', instructions: 'Take strictly after meals for inflammatory pain relief.' }
  ]);

  const [currentMed, setCurrentMed] = useState({
    medicine: 'Amoxicillin',
    strength: '500mg',
    dose: '1 Capsule',
    frequency: 'TDS (3x/day)',
    timing: 'After Food',
    duration: '5 Days',
    instructions: 'Take after meals.'
  });

  const [isRecording, setIsRecording] = useState(false);
  const [voiceNote, setVoiceNote] = useState('Take medications strictly after meals. Rinse mouth gently with warm saline solution. Avoid chewing on the right side for 48 hours.');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const addMedication = () => {
    if (!currentMed.medicine) return;
    setPrescriptions(prev => [...prev, { ...currentMed, id: Date.now() }]);
    setFeedbackMsg(`Added ${currentMed.medicine} to current prescription.`);
    setTimeout(() => setFeedbackMsg(''), 2500);
  };

  const removeMedication = (id) => {
    setPrescriptions(prev => prev.filter(m => m.id !== id));
  };

  const toggleVoiceRecording = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        setVoiceNote('Take Amoxicillin 500mg three times daily for 5 days. Use Ibuprofen for severe pain. Maintain soft diet.');
      }, 2500);
    }
  };

  const exportOfficialPrescriptionPdf = () => {
    const doctorName = user?.name || 'Dr. Twahir Mohammed';
    const patientName = activePatient?.name || 'Amina Rahmani';
    const patientId = activePatient?.id || 'PT-2026-0705';
    const patientDob = activePatient?.dob || '1992-04-14';
    const patientGender = activePatient?.gender || 'Female';
    const patientPhone = activePatient?.phone || '+91 98765 43210';
    const dateFormatted = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const medicalAllergies = activePatient?.medicalHistory?.join(', ') || 'No known allergies reported';

    const medsRows = prescriptions.map((p, idx) => `
      <tr>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600; text-align: center;">${idx + 1}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0;">
          <strong style="color: #0f172a; font-size: 14px;">${p.medicine}</strong>
          <span style="color: #0d9488; font-weight: 600; margin-left: 6px;">(${p.strength})</span>
          ${p.instructions ? `<div style="font-size: 11px; color: #64748b; margin-top: 2px;">${p.instructions}</div>` : ''}
        </td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0;">${p.dose}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #0f766e;">${p.frequency}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0;">${p.timing}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${p.duration}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Prescription_${patientName.replace(/\s+/g, '_')}_${patientId}</title>
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
          .clinic-header {
            width: 100%;
            border-bottom: 2px solid #0d9488;
            padding-bottom: 14px;
            margin-bottom: 18px;
          }
          .clinic-name {
            font-size: 22px;
            font-weight: 800;
            color: #0f766e;
            letter-spacing: -0.5px;
          }
          .clinic-sub {
            font-size: 12px;
            color: #64748b;
            margin-top: 2px;
          }
          .doctor-block {
            text-align: right;
          }
          .doctor-title {
            font-size: 15px;
            font-weight: 700;
            color: #0f172a;
          }
          .doctor-meta {
            font-size: 11px;
            color: #64748b;
          }
          .patient-box {
            width: 100%;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 12px 16px;
            margin-bottom: 18px;
            box-sizing: border-box;
          }
          .patient-table {
            width: 100%;
            font-size: 13px;
          }
          .patient-table td {
            padding: 4px 6px;
          }
          .p-label { color: #64748b; font-weight: 500; }
          .p-val { font-weight: 600; color: #0f172a; }
          .rx-symbol {
            font-size: 32px;
            font-family: "Times New Roman", serif;
            font-weight: bold;
            color: #0f766e;
            margin-bottom: 8px;
          }
          .meds-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
            margin-bottom: 20px;
          }
          .meds-table th {
            background: #f1f5f9;
            color: #334155;
            font-weight: 700;
            text-align: left;
            padding: 8px 12px;
            border-bottom: 1px solid #cbd5e1;
          }
          .advice-box {
            background: #f8fafc;
            border-left: 3px solid #0d9488;
            padding: 12px 14px;
            font-size: 13px;
            color: #1e293b;
            margin-bottom: 24px;
          }
          .footer-table {
            width: 100%;
            margin-top: 36px;
            border-top: 1px solid #e2e8f0;
            padding-top: 16px;
          }
          .signature-line {
            border-bottom: 1px dashed #94a3b8;
            margin-bottom: 6px;
            height: 40px;
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
        <table class="clinic-header">
          <tr>
            <td>
              <div class="clinic-name">DENTAVISION AI DENTAL CENTER</div>
              <div class="clinic-sub">Department of Comprehensive Dental Care & Oral Surgery • Unit 4, MG Road, Bengaluru</div>
              <div class="clinic-sub">Phone: +91 80 2345 6789 • Email: clinical@dentavision.ai</div>
            </td>
            <td class="doctor-block">
              <div class="doctor-title">${doctorName}, B.D.S., M.D.S.</div>
              <div class="doctor-meta">Oral Medicine & Radiology Specialist</div>
              <div class="doctor-meta">DCI Reg No: DCI-KA-2021-08491</div>
              <div style="font-size: 12px; color: #0d9488; font-weight: 600; margin-top: 4px;">Date: ${dateFormatted}</div>
            </td>
          </tr>
        </table>

        <div class="patient-box">
          <table class="patient-table">
            <tr>
              <td class="p-label" style="width: 15%;">Patient Name:</td>
              <td class="p-val" style="width: 35%;">${patientName}</td>
              <td class="p-label" style="width: 15%;">Patient ID:</td>
              <td class="p-val" style="width: 35%;">${patientId}</td>
            </tr>
            <tr>
              <td class="p-label">DOB / Gender:</td>
              <td class="p-val">${patientDob} (${patientGender})</td>
              <td class="p-label">Contact:</td>
              <td class="p-val">${patientPhone}</td>
            </tr>
            <tr>
              <td class="p-label">Medical Alerts:</td>
              <td class="p-val" colspan="3" style="color: #b45309;">${medicalAllergies}</td>
            </tr>
          </table>
        </div>

        <div class="rx-symbol">℞</div>

        <table class="meds-table">
          <thead>
            <tr>
              <th style="width: 5%; text-align: center;">#</th>
              <th style="width: 40%;">Medicine & Strength</th>
              <th style="width: 12%;">Dosage</th>
              <th style="width: 15%;">Frequency</th>
              <th style="width: 15%;">Timing</th>
              <th style="width: 13%;">Duration</th>
            </tr>
          </thead>
          <tbody>
            ${medsRows}
          </tbody>
        </table>

        <div style="font-size: 13px; font-weight: 700; color: #0f766e; margin-bottom: 6px; text-transform: uppercase;">
          Special Advice & Dietary Instructions
        </div>
        <div class="advice-box">${voiceNote}</div>

        <table class="footer-table">
          <tr>
            <td style="width: 60%; vertical-align: top; font-size: 11px; color: #64748b; line-height: 1.4;">
              <strong>Prescription Safety Notice:</strong> Follow prescribed dosage strictly. In case of unexpected allergic reaction (rash, swelling, respiratory difficulty), discontinue immediately and contact emergency helpline.
              <br /><br />
              <strong>Valid through:</strong> 14 days from date of issue • DentaVision Digital Rx ID #RX-${Math.floor(1000 + Math.random() * 9000)}
            </td>
            <td style="width: 40%; vertical-align: bottom; text-align: right;">
              <div style="display: inline-block; min-width: 190px;">
                <div class="signature-line">${doctorName}</div>
                <div style="font-size: 13px; font-weight: 700; color: #0f172a;">${doctorName}</div>
                <div style="font-size: 11px; color: #64748b;">Attending Dental Surgeon</div>
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
      window.print();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
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
              Rx Prescription Builder
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Patient: <strong>{activePatient?.name || 'Amina Rahmani'} ({activePatient?.id || 'PT-2026-0705'})</strong>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={exportOfficialPrescriptionPdf} className="btn-primary">
            <Printer size={18} />
            <span>Print / Export Clean Rx</span>
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="badge badge-success fade-in no-print" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', fontSize: '13px' }}>
          <CheckCircle2 size={16} />
          <span>{feedbackMsg}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Medication Builder Form */}
        <div className="glass-card no-print" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h4 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>Add Medication Entry</h4>

          <div>
            <label className="input-label">Medicine Name</label>
            <input
              type="text"
              className="input-field"
              list="medicines-list"
              value={currentMed.medicine}
              onChange={(e) => setCurrentMed({ ...currentMed, medicine: e.target.value })}
              placeholder="Type or select medicine..."
            />
            <datalist id="medicines-list">
              {commonMedicines.map((m, i) => <option key={i} value={m} />)}
            </datalist>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="input-label">Strength</label>
              <input
                type="text"
                className="input-field"
                value={currentMed.strength}
                onChange={(e) => setCurrentMed({ ...currentMed, strength: e.target.value })}
                placeholder="e.g. 500mg, 400mg, 0.2%"
              />
            </div>

            <div>
              <label className="input-label">Dose</label>
              <input
                type="text"
                className="input-field"
                value={currentMed.dose}
                onChange={(e) => setCurrentMed({ ...currentMed, dose: e.target.value })}
                placeholder="e.g. 1 Capsule, 10ml"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="input-label">Frequency</label>
              <select
                className="input-field"
                value={currentMed.frequency}
                onChange={(e) => setCurrentMed({ ...currentMed, frequency: e.target.value })}
              >
                <option value="OD (1x/day)">OD (Once daily)</option>
                <option value="BD (2x/day)">BD (Twice daily)</option>
                <option value="TDS (3x/day)">TDS (Thrice daily)</option>
                <option value="QID (4x/day)">QID (4 times daily)</option>
                <option value="SOS (As needed)">SOS (As needed for pain)</option>
              </select>
            </div>

            <div>
              <label className="input-label">Timing</label>
              <select
                className="input-field"
                value={currentMed.timing}
                onChange={(e) => setCurrentMed({ ...currentMed, timing: e.target.value })}
              >
                <option value="After Food">After Food</option>
                <option value="Before Food">Before Food</option>
                <option value="With Food">With Food</option>
                <option value="Before Bed">Before Bed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="input-label">Duration</label>
            <input
              type="text"
              className="input-field"
              value={currentMed.duration}
              onChange={(e) => setCurrentMed({ ...currentMed, duration: e.target.value })}
              placeholder="e.g. 5 Days, 7 Days"
            />
          </div>

          <button onClick={addMedication} className="btn-primary" style={{ marginTop: '6px' }}>
            <Plus size={18} />
            <span>Add Medication to Prescription</span>
          </button>
        </div>

        {/* Prescription Summary & Voice Instructions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Prescription List Card */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>Current Prescription List</h4>
              <span className="badge badge-info">{prescriptions.length} Meds</span>
            </div>

            {prescriptions.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No medications added yet.</p>
            ) : (
              prescriptions.map((p, idx) => (
                <div
                  key={p.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    backgroundColor: 'var(--btn-secondary-bg)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-glass)',
                  }}
                >
                  <div>
                    <h5 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      {idx + 1}. {p.medicine} <span style={{ color: 'var(--primary-teal)' }}>({p.strength})</span>
                    </h5>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Dose: {p.dose} • {p.frequency} • {p.timing} • {p.duration}
                    </p>
                  </div>

                  <button
                    onClick={() => removeMedication(p.id)}
                    className="no-print"
                    style={{ background: 'none', border: 'none', color: 'var(--status-error)', cursor: 'pointer', padding: '4px' }}
                    title="Remove medicine"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Voice Instructions Module */}
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Volume2 size={16} color="var(--primary-teal)" />
                <span>Doctor Advice & Voice Dictation</span>
              </h4>
              <button
                onClick={toggleVoiceRecording}
                className={`btn-${isRecording ? 'danger' : 'secondary'} no-print`}
                style={{ padding: '6px 12px', fontSize: '12px' }}
              >
                {isRecording ? <MicOff size={14} /> : <Mic size={14} />}
                <span>{isRecording ? 'Listening (Speak now)...' : 'Record Audio Note'}</span>
              </button>
            </div>

            <textarea
              className="input-field"
              rows={3}
              value={voiceNote}
              onChange={(e) => setVoiceNote(e.target.value)}
              placeholder="Dictated voice instructions or special patient dietary notes..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};
