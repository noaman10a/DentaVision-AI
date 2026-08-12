import React, { useState } from 'react';
import { usePatients } from '../../context/PatientContext';
import { Pill, Mic, MicOff, Plus, Trash2, Printer, CheckCircle2, Volume2 } from 'lucide-react';

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
  const { activePatient } = usePatients();
  const [prescriptions, setPrescriptions] = useState([
    { id: 1, medicine: 'Amoxicillin', strength: '500mg', dose: '1 Capsule', frequency: 'TDS (3x/day)', timing: 'After Food', duration: '5 Days' },
    { id: 2, medicine: 'Ibuprofen', strength: '400mg', dose: '1 Tablet', frequency: 'BD (2x/day)', timing: 'After Food', duration: '3 Days' }
  ]);

  const [currentMed, setCurrentMed] = useState({
    medicine: 'Amoxicillin',
    strength: '500mg',
    dose: '1 Capsule',
    frequency: 'TDS (3x/day)',
    timing: 'After Food',
    duration: '5 Days'
  });

  const [isRecording, setIsRecording] = useState(false);
  const [voiceNote, setVoiceNote] = useState('Take medications strictly after meals. Rinse with Chlorhexidine twice daily.');
  const [savedMsg, setSavedMsg] = useState('');

  const addMedication = () => {
    if (!currentMed.medicine) return;
    setPrescriptions(prev => [...prev, { ...currentMed, id: Date.now() }]);
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
        setVoiceNote('Take Amoxicillin 500mg three times daily for 5 days. Use Ibuprofen for severe pain.');
      }, 3000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Pill size={24} color="var(--primary-teal)" />
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', fontFamily: 'var(--font-heading)' }}>
              Rx Prescription Builder
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Patient: <strong>{activePatient?.name} ({activePatient?.id})</strong>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handlePrint} className="btn-secondary">
            <Printer size={18} />
            <span>Print Prescription</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Medication Builder Form */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h4 style={{ fontSize: '15px', fontWeight: '600' }}>Add Medication Entry</h4>

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
            <h4 style={{ fontSize: '15px', fontWeight: '600' }}>Current Prescription List</h4>
            {prescriptions.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No medications added yet.</p>
            ) : (
              prescriptions.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-glass)',
                  }}
                >
                  <div>
                    <h5 style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>
                      {p.medicine} <span style={{ color: 'var(--primary-teal)' }}>({p.strength})</span>
                    </h5>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Dose: {p.dose} • {p.frequency} • {p.timing} • {p.duration}
                    </p>
                  </div>

                  <button
                    onClick={() => removeMedication(p.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--status-error)', cursor: 'pointer' }}
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
              <h4 style={{ fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Volume2 size={16} color="var(--primary-teal)" />
                <span>Voice Instructions (Dictation)</span>
              </h4>
              <button
                onClick={toggleVoiceRecording}
                className={`btn-${isRecording ? 'danger' : 'secondary'}`}
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
