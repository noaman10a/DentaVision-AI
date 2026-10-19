import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  FileUp,
  Image as ImageIcon
} from 'lucide-react';
import { usePatients } from '../../context/PatientContext';

export const IntakeUploadModal = ({ patient, onClose, onUploaded }) => {
  const { addPatientDocument, setPatients } = usePatients();

  const [category, setCategory] = useState('Panoramic OPG X-ray');
  const [fileName, setFileName] = useState('');
  const [filePreview, setFilePreview] = useState(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!patient) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setErrorMsg('');
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fileName) {
      setErrorMsg('Please select a dental radiograph or document file to upload.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      const isXray = category.toLowerCase().includes('x-ray') || category.toLowerCase().includes('radiograph');

      const docRecord = {
        id: `DOC-${Date.now()}`,
        name: fileName,
        category: category,
        date: new Date().toISOString().split('T')[0],
        uploader: 'Reception Staff',
        notes: notes || 'Intake document attached at reception desk.',
        previewUrl: filePreview || null,
        size: '2.4 MB'
      };

      // Update patient state in PatientContext
      setPatients(prev => prev.map(p => {
        if (p.id === patient.id) {
          const newDocs = [docRecord, ...(p.documents || [])];
          return {
            ...p,
            status: isXray ? 'Awaiting Review' : p.status,
            xrayCount: isXray ? (p.xrayCount || 0) + 1 : (p.xrayCount || 0),
            documents: newDocs
          };
        }
        return p;
      }));

      setIsSuccess(true);
      if (onUploaded) onUploaded(docRecord);

      setTimeout(() => {
        onClose();
      }, 1400);
    }, 500);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'var(--backdrop-blur)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '20px',
      }}
    >
      <div
        className="glass-card fade-in"
        style={{
          width: '100%',
          maxWidth: '560px',
          padding: '28px',
          position: 'relative',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
          }}
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: 'var(--primary-teal-glow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border-accent)',
            }}
          >
            <UploadCloud size={22} color="var(--primary-teal)" />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>
              Attach Intake Files & X-rays
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Patient: <strong style={{ color: 'var(--text-primary)' }}>{patient.name}</strong> ({patient.id})
            </p>
          </div>
        </div>

        {isSuccess ? (
          <div style={{ textAlign: 'center', padding: '30px 20px' }}>
            <CheckCircle2 size={48} color="var(--status-success)" style={{ margin: '0 auto 12px' }} />
            <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
              Intake File Successfully Attached!
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              The radiograph and notes have been attached to {patient.name}'s file and queued for doctor clinical review.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {errorMsg && (
              <div style={{ backgroundColor: 'var(--status-error-bg)', color: 'var(--status-error)', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="form-label">Document / Radiograph Category</label>
              <select
                className="input-field"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Panoramic OPG X-ray">Panoramic OPG Radiograph (X-ray)</option>
                <option value="Bitewing Radiograph">Bitewing Radiograph</option>
                <option value="Periapical Radiograph">Periapical Radiograph</option>
                <option value="Doctor Referral Slip">External Doctor Referral Slip</option>
                <option value="Dental Lab Report">Dental Lab Slip / Investigation</option>
                <option value="Patient ID / Insurance">Patient ID / Insurance Verification</option>
                <option value="Consent Form">Signed Patient Consent Form</option>
              </select>
            </div>

            <div>
              <label className="form-label">Select Dental File (PNG, JPG, DICOM, PDF)</label>
              <div
                style={{
                  border: '2px dashed var(--border-glass)',
                  borderRadius: '10px',
                  padding: '24px 16px',
                  textAlign: 'center',
                  backgroundColor: 'var(--btn-secondary-bg)',
                  position: 'relative',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="file"
                  accept="image/*,.pdf,.dcm"
                  onChange={handleFileChange}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0,
                    cursor: 'pointer',
                    width: '100%',
                    height: '100%',
                  }}
                />
                <FileUp size={32} color="var(--primary-teal)" style={{ margin: '0 auto 8px' }} />
                <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  {fileName ? fileName : 'Click or Drag files to attach'}
                </p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Supports High-Resolution Panoramic OPGs, DICOMs, and Clinical Scans
                </p>
              </div>

              {filePreview && (
                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', backgroundColor: 'var(--btn-secondary-bg)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                  <img src={filePreview} alt="Preview" style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                  <span style={{ fontSize: '12px', color: 'var(--primary-teal)', fontWeight: '600' }}>Image Preview Loaded</span>
                </div>
              )}
            </div>

            <div>
              <label className="form-label">Notes for Attending Doctor</label>
              <textarea
                className="input-field"
                rows={3}
                placeholder="e.g. Scanned intake radiograph. Patient complaints of pain on quadrant 4."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px', borderTop: '1px solid var(--border-glass)', paddingTop: '16px' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                style={{ padding: '8px 18px' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
                style={{ padding: '8px 24px' }}
              >
                <UploadCloud size={16} />
                <span>{isSubmitting ? 'Attaching...' : 'Attach to Record'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
