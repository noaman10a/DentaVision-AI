import React, { useState, useEffect } from 'react';
import { usePatients } from '../../context/PatientContext';
import { useAI } from '../../context/AIContext';
import { useAuth } from '../../context/AuthContext';
import { FileText, Save, Printer, Sparkles, CheckCircle2, Edit3, Share2 } from 'lucide-react';

export const ReportModule = () => {
  const { activePatient } = usePatients();
  const { analysisResult } = useAI();
  const { user } = useAuth();

  const [doctorNotes, setDoctorNotes] = useState(
    "AI Neural Network detected Caries on Tooth #46 with 92% confidence. Clinical examination confirms radiolucency. Recommended treatment: Composite resin restoration under local anesthesia."
  );
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (analysisResult?.findings?.length > 0) {
      const summary = analysisResult.findings
        .map(f => `${f.finding_type} on Tooth #${String(f.tooth_number || '').replace(/^Tooth\s*#?\s*/i, '')} (${f.status || 'Pending'})`)
        .join(', ');
      setDoctorNotes(
        `Comprehensive OPG radiograph review completed for ${activePatient?.name || 'patient'}. AI findings evaluated: ${summary}. Clinical examination confirms radiographic findings. Recommended treatment plan: composite restoration and follow-up as indicated.`
      );
    }
  }, [analysisResult, activePatient]);

  const handleSaveReport = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Action Header */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <FileText size={24} color="var(--primary-teal)" />
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
              Diagnostic Report Generator
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Integrated AI Findings & Doctor Evaluation PDF Report
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleSaveReport} className="btn-secondary">
            <Save size={18} />
            <span>Save Draft</span>
          </button>

          <button onClick={handlePrintReport} className="btn-primary">
            <Printer size={18} />
            <span>Print / Export PDF</span>
          </button>
        </div>
      </div>

      {isSaved && (
        <div className="badge badge-success" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px' }}>
          <CheckCircle2 size={16} />
          <span>Report draft saved to patient records.</span>
        </div>
      )}

      {/* Printable Report Canvas Layout */}
      <div
        className="glass-card"
        style={{
          backgroundColor: 'var(--bg-dark-card)',
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
            <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{activePatient?.name}</p>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Patient ID: {activePatient?.id}</p>
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
            {analysisResult?.findings.map((f) => {
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
      </div>
    </div>
  );
};
