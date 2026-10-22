import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatients } from '../../context/PatientContext';
import { 
  startClinicalSpeechRecognition, 
  isSpeechRecognitionSupported, 
  CLINICAL_PRESETS 
} from '../../services/speechRecognition';
import { 
  Stethoscope, 
  Calendar, 
  Save, 
  CheckCircle2, 
  FileText, 
  History, 
  Mic, 
  MicOff, 
  Volume2, 
  Sparkles, 
  ArrowLeft,
  AlertTriangle,
  X
} from 'lucide-react';

export const ClinicalVisitScreen = () => {
  const navigate = useNavigate();
  const { activePatient, addClinicalVisit } = usePatients();
  const [visitData, setVisitData] = useState({
    chiefComplaint: 'Sharp pain in lower right molar during chewing',
    examination: 'Localized deep occlusal caries on tooth 46. Percussion test sensitive.',
    diagnosis: 'Dentin Caries / Suspected Reversible Pulpitis on Tooth #46',
    treatmentPlan: 'Composite resin restoration or indirect pulp cap following AI X-ray verification.',
    followUpDate: '2026-08-20'
  });
  const [savedMessage, setSavedMessage] = useState('');
  const [activeMicField, setActiveMicField] = useState(null);
  const [liveInterim, setLiveInterim] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [speechError, setSpeechError] = useState('');

  const sessionRef = useRef(null);
  const fieldBaselineRef = useRef('');

  useEffect(() => {
    return () => {
      if (sessionRef.current) {
        try {
          sessionRef.current.abort();
        } catch (_) {}
      }
    };
  }, []);

  const stopActiveMic = () => {
    if (sessionRef.current) {
      try {
        sessionRef.current.stop();
      } catch (_) {}
      sessionRef.current = null;
    }
    setActiveMicField(null);
    setLiveInterim('');
    setAudioLevel(0);
  };

  const toggleMic = async (fieldName) => {
    if (activeMicField === fieldName) {
      stopActiveMic();
      return;
    }

    stopActiveMic();
    setSpeechError('');
    setLiveInterim('');
    fieldBaselineRef.current = visitData[fieldName] || '';

    try {
      const session = await startClinicalSpeechRecognition({
        onStart: () => {
          setActiveMicField(fieldName);
        },
        onAudioLevel: (lvl) => {
          setAudioLevel(lvl);
        },
        onInterim: (interim) => {
          setLiveInterim(interim);
        },
        onFinal: (finalText) => {
          const base = fieldBaselineRef.current.trim();
          const cleanFinal = finalText.trim();
          if (cleanFinal) {
            setVisitData(prev => ({
              ...prev,
              [fieldName]: base ? `${base} ${cleanFinal}` : cleanFinal
            }));
          }
        },
        onError: (errMsg) => {
          setSpeechError(errMsg);
        },
        onEnd: () => {
          setActiveMicField(null);
          setLiveInterim('');
          setAudioLevel(0);
          sessionRef.current = null;
        }
      });
      sessionRef.current = session;
    } catch (err) {
      console.warn('Speech recognition start failed:', err);
      setActiveMicField(null);
      setSpeechError(err.message || 'Microphone could not be initialized.');
    }
  };

  const applyPreset = (fieldName, presetText) => {
    setVisitData(prev => {
      const base = (prev[fieldName] || '').trim();
      return {
        ...prev,
        [fieldName]: base ? `${base} ${presetText}` : presetText
      };
    });
  };

  const clearField = (fieldName) => {
    setVisitData(prev => ({
      ...prev,
      [fieldName]: ''
    }));
  };

  const handleSaveVisit = (e) => {
    e.preventDefault();
    if (!activePatient) return;

    addClinicalVisit(activePatient.id, visitData);
    setSavedMessage('Clinical Visit record saved to patient file successfully!');
    setTimeout(() => setSavedMessage(''), 3000);
  };

  // Helper renderer for live recording feedback banner
  const renderLiveVisualizer = () => (
    <div
      style={{
        padding: '8px 12px',
        marginTop: '6px',
        marginBottom: '8px',
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        border: '1px solid rgba(239, 68, 68, 0.25)',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', fontWeight: '600', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block', animation: 'pulseGlow 1.2s infinite' }} />
          Microphone Active — Dictating clinical notes...
        </span>
        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
          Audio Level: {audioLevel}%
        </span>
      </div>

      <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
        <div
          style={{
            width: `${Math.max(5, audioLevel)}%`,
            height: '100%',
            backgroundColor: audioLevel > 50 ? '#ef4444' : 'var(--primary-teal)',
            transition: 'width 0.1s ease'
          }}
        />
      </div>

      {liveInterim && (
        <p style={{ fontSize: '12px', fontStyle: 'italic', color: 'var(--text-primary)', margin: 0 }}>
          Hearing: &ldquo;{liveInterim}&rdquo;
        </p>
      )}
    </div>
  );

  // Helper renderer for preset chips
  const renderPresetChips = (fieldName, label) => {
    const presets = CLINICAL_PRESETS[fieldName] || [];
    return (
      <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={11} color="var(--primary-teal)" />
            Quick Presets
          </span>
          {visitData[fieldName] && (
            <button
              type="button"
              onClick={() => clearField(fieldName)}
              style={{ background: 'none', border: 'none', fontSize: '11px', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              Clear
            </button>
          )}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {presets.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyPreset(fieldName, item.text)}
              className="btn-secondary"
              style={{
                padding: '2px 7px',
                fontSize: '11px',
                borderRadius: '6px',
                border: '1px solid var(--border-glass)'
              }}
              title={item.text}
            >
              + {item.label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Bar */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={() => navigate('/workspace')}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          <Stethoscope size={24} color="var(--primary-teal)" />
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
              Clinical Visit Consultation Entry
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Patient: <strong>{activePatient?.name || 'Unassigned'} ({activePatient?.id || 'PT-2026-0705'})</strong> • Voice-to-Text Enabled (MDS Sec. 15)
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

      {/* Global Speech / Mic Error Notice Banner */}
      {speechError && (
        <div
          className="glass-card"
          style={{
            padding: '10px 14px',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '13px',
            color: 'var(--text-primary)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} color="#f59e0b" />
            <span>{speechError}</span>
          </div>
          <button
            type="button"
            onClick={() => setSpeechError('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
            title="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <form onSubmit={handleSaveVisit} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Main Entry Form */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Chief Complaint */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="input-label" style={{ margin: 0 }}>Chief Complaint *</label>
              <button
                type="button"
                onClick={() => toggleMic('chiefComplaint')}
                className={activeMicField === 'chiefComplaint' ? 'btn-danger' : 'btn-secondary'}
                style={{
                  padding: '4px 10px',
                  fontSize: '11px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  height: '28px',
                  borderRadius: '6px'
                }}
                title="Click to dictate using Speech-to-Text"
              >
                {activeMicField === 'chiefComplaint' ? (
                  <>
                    <MicOff size={14} className="pulse-glow" />
                    <span>Stop Recording</span>
                  </>
                ) : (
                  <>
                    <Mic size={14} color="var(--primary-teal)" />
                    <span>Dictate Voice</span>
                  </>
                )}
              </button>
            </div>

            {activeMicField === 'chiefComplaint' && renderLiveVisualizer()}

            <textarea
              className="input-field"
              rows={2}
              value={visitData.chiefComplaint}
              onChange={(e) => setVisitData({ ...visitData, chiefComplaint: e.target.value })}
              placeholder="Describe primary patient symptom or complaint..."
              required
            />
            {renderPresetChips('chiefComplaint', 'Chief Complaint')}
          </div>

          {/* Clinical Examination */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="input-label" style={{ margin: 0 }}>Clinical Examination Findings *</label>
              <button
                type="button"
                onClick={() => toggleMic('examination')}
                className={activeMicField === 'examination' ? 'btn-danger' : 'btn-secondary'}
                style={{
                  padding: '4px 10px',
                  fontSize: '11px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  height: '28px',
                  borderRadius: '6px'
                }}
                title="Click to dictate clinical examination findings"
              >
                {activeMicField === 'examination' ? (
                  <>
                    <MicOff size={14} className="pulse-glow" />
                    <span>Stop Recording</span>
                  </>
                ) : (
                  <>
                    <Mic size={14} color="var(--primary-teal)" />
                    <span>Dictate Voice</span>
                  </>
                )}
              </button>
            </div>

            {activeMicField === 'examination' && renderLiveVisualizer()}

            <textarea
              className="input-field"
              rows={3}
              value={visitData.examination}
              onChange={(e) => setVisitData({ ...visitData, examination: e.target.value })}
              placeholder="Clinical inspection, palpation, mobility, cold/percussion test results..."
              required
            />
            {renderPresetChips('examination', 'Clinical Examination')}
          </div>

          {/* Diagnosis */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="input-label" style={{ margin: 0 }}>Diagnosis *</label>
              <button
                type="button"
                onClick={() => toggleMic('diagnosis')}
                className={activeMicField === 'diagnosis' ? 'btn-danger' : 'btn-secondary'}
                style={{
                  padding: '4px 10px',
                  fontSize: '11px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  height: '28px',
                  borderRadius: '6px'
                }}
                title="Click to dictate diagnosis"
              >
                {activeMicField === 'diagnosis' ? (
                  <>
                    <MicOff size={14} className="pulse-glow" />
                    <span>Stop Recording</span>
                  </>
                ) : (
                  <>
                    <Mic size={14} color="var(--primary-teal)" />
                    <span>Dictate Voice</span>
                  </>
                )}
              </button>
            </div>

            {activeMicField === 'diagnosis' && renderLiveVisualizer()}

            <input
              type="text"
              className="input-field"
              value={visitData.diagnosis}
              onChange={(e) => setVisitData({ ...visitData, diagnosis: e.target.value })}
              placeholder="Primary dental diagnosis..."
              required
            />
            {renderPresetChips('diagnosis', 'Diagnosis')}
          </div>

          {/* Treatment Plan */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="input-label" style={{ margin: 0 }}>Proposed Treatment Plan *</label>
              <button
                type="button"
                onClick={() => toggleMic('treatmentPlan')}
                className={activeMicField === 'treatmentPlan' ? 'btn-danger' : 'btn-secondary'}
                style={{
                  padding: '4px 10px',
                  fontSize: '11px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  height: '28px',
                  borderRadius: '6px'
                }}
                title="Click to dictate treatment plan"
              >
                {activeMicField === 'treatmentPlan' ? (
                  <>
                    <MicOff size={14} className="pulse-glow" />
                    <span>Stop Recording</span>
                  </>
                ) : (
                  <>
                    <Mic size={14} color="var(--primary-teal)" />
                    <span>Dictate Voice</span>
                  </>
                )}
              </button>
            </div>

            {activeMicField === 'treatmentPlan' && renderLiveVisualizer()}

            <textarea
              className="input-field"
              rows={3}
              value={visitData.treatmentPlan}
              onChange={(e) => setVisitData({ ...visitData, treatmentPlan: e.target.value })}
              placeholder="Step by step clinical procedure plan..."
              required
            />
            {renderPresetChips('treatmentPlan', 'Treatment Plan')}
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
