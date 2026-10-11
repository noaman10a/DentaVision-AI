import React, { useState } from 'react';
import { usePatients } from '../../context/PatientContext';
import { Stethoscope, Calendar, Save, CheckCircle2, FileText, History } from 'lucide-react';

export const ClinicalVisitScreen = () => {
  const { activePatient, addClinicalVisit } = usePatients();
  const [visitData, setVisitData] = useState({
    chiefComplaint: 'Sharp pain in lower right molar during chewing',
    examination: 'Localized deep occlusal caries on tooth 46. Percussion test sensitive.',
    diagnosis: 'Dentin Caries / Suspected Reversible Pulpitis on Tooth #46',
    treatmentPlan: 'Composite resin restoration or indirect pulp cap following AI X-ray verification.',
    followUpDate: '2026-08-20'
  });
  const [savedMessage, setSavedMessage] = useState('');

  const handleSaveVisit = (e) => {
    e.preventDefault();
    if (!activePatient) return;

    addClinicalVisit(activePatient.id, visitData);
    setSavedMessage('Clinical Visit record saved to patient file successfully!');
    setTimeout(() => setSavedMessage(''), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Bar */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Stethoscope size={24} color="var(--primary-teal)" />
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
              Clinical Visit Consultation Entry
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Patient: <strong>{activePatient?.name} ({activePatient?.id})</strong>
            </p>
          </div>
        </div>

        {savedMessage && (
          <div className="badge badge-success" style={{ padding: '8px 14px' }}>
            <CheckCircle2 size={16} />
            <span>{savedMessage}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSaveVisit} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Main Entry Form */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Chief Complaint */}
          <div>
            <label className="input-label">Chief Complaint *</label>
            <textarea
              className="input-field"
              rows={2}
              value={visitData.chiefComplaint}
              onChange={(e) => setVisitData({ ...visitData, chiefComplaint: e.target.value })}
              placeholder="Describe primary patient symptom or complaint..."
              required
            />
          </div>

          {/* Clinical Examination */}
          <div>
            <label className="input-label">Clinical Examination Findings *</label>
            <textarea
              className="input-field"
              rows={3}
              value={visitData.examination}
              onChange={(e) => setVisitData({ ...visitData, examination: e.target.value })}
              placeholder="Clinical inspection, palpation, mobility, cold/percussion test results..."
              required
            />
          </div>

          {/* Diagnosis */}
          <div>
            <label className="input-label">Diagnosis *</label>
            <input
              type="text"
              className="input-field"
              value={visitData.diagnosis}
              onChange={(e) => setVisitData({ ...visitData, diagnosis: e.target.value })}
              placeholder="Primary dental diagnosis..."
              required
            />
          </div>

          {/* Treatment Plan */}
          <div>
            <label className="input-label">Proposed Treatment Plan *</label>
            <textarea
              className="input-field"
              rows={3}
              value={visitData.treatmentPlan}
              onChange={(e) => setVisitData({ ...visitData, treatmentPlan: e.target.value })}
              placeholder="Step by step clinical procedure plan..."
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button type="submit" className="btn-primary">
              <Save size={18} />
              <span>Save Clinical Visit</span>
            </button>
          </div>
        </div>

        {/* Sidebar Context: Previous Visit Summary & Follow-up */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Follow up date */}
          <div className="glass-card">
            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
              <Calendar size={16} color="var(--primary-teal)" />
              <span>Recommended Follow-up</span>
            </h4>
            <input
              type="date"
              className="input-field"
              value={visitData.followUpDate}
              onChange={(e) => setVisitData({ ...visitData, followUpDate: e.target.value })}
            />
          </div>

          {/* Previous Visit Summary */}
          <div className="glass-card">
            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
              <History size={16} color="var(--secondary-cyan)" />
              <span>Previous Visit Summary</span>
            </h4>
            {activePatient?.visits?.length > 0 ? (
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <p><strong style={{ color: 'var(--text-primary)' }}>Date:</strong> {activePatient.visits[0].date}</p>
                <p><strong style={{ color: 'var(--text-primary)' }}>Doctor:</strong> {activePatient.visits[0].doctor}</p>
                <p><strong style={{ color: 'var(--text-primary)' }}>Diagnosis:</strong> {activePatient.visits[0].diagnosis}</p>
              </div>
            ) : (
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No previous visit records logged.</p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
