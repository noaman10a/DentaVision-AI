import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatients } from '../../context/PatientContext';
import { 
  UserPlus, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  MapPin, 
  HeartPulse, 
  FileUp, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  UploadCloud
} from 'lucide-react';

export const PatientRegistrationPage = () => {
  const navigate = useNavigate();
  const { registerPatient } = usePatients();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    dob: '',
    gender: 'Female',
    address: '',
    medicalHistory: '',
    emergencyContact: '',
    intakeDocCategory: 'Panoramic X-ray (Intake)',
    intakeDocNotes: '',
    intakeFileName: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredPatient, setRegisteredPatient] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, intakeFileName: file.name }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full legal name is required';
    if (!formData.phone.trim()) {
      errs.phone = 'Contact phone number is required';
    } else if (!/^\+?[0-9\s-]{10,15}$/.test(formData.phone.trim())) {
      errs.phone = 'Valid phone format required (e.g. +91 98765 43210)';
    }

    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Valid email address format required';
    }

    if (!formData.dob) errs.dob = 'Date of birth is required';
    if (!formData.address.trim()) errs.address = 'Residential address is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      const medicalTags = formData.medicalHistory
        ? formData.medicalHistory.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      const newPatient = registerPatient({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        dob: formData.dob,
        gender: formData.gender,
        address: formData.address.trim(),
        medicalHistory: medicalTags,
        emergencyContact: formData.emergencyContact.trim(),
        status: formData.intakeFileName ? 'Awaiting Review' : 'Waiting',
        xrayCount: formData.intakeFileName ? 1 : 0,
      });

      setRegisteredPatient(newPatient);
    }, 450);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      dob: '',
      gender: 'Female',
      address: '',
      medicalHistory: '',
      emergencyContact: '',
      intakeDocCategory: 'Panoramic X-ray (Intake)',
      intakeDocNotes: '',
      intakeFileName: '',
    });
    setErrors({});
    setRegisteredPatient(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '960px', margin: '0 auto', width: '100%' }}>
      {/* Header Banner */}
      <div 
        className="glass-card" 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          background: 'var(--primary-teal-glow)', 
          border: '1px solid var(--border-accent)' 
        }}
      >
        <div>
          <div className="badge badge-info" style={{ marginBottom: '8px' }}>Reception Intake Terminal</div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>
            New Patient Registration
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Register new clinic patients, assign system ID (PT-2026-XXXX), and upload intake X-rays or referral documentation.
          </p>
        </div>
        <button
          onClick={() => navigate('/reception')}
          className="btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Queue</span>
        </button>
      </div>

      {/* Success Notification Banner */}
      {registeredPatient ? (
        <div 
          className="glass-card fade-in" 
          style={{ 
            textAlign: 'center', 
            padding: '48px 32px', 
            border: '2px solid var(--primary-teal)',
            background: 'var(--primary-teal-glow)'
          }}
        >
          <div 
            style={{ 
              width: '64px', 
              height: '64px', 
              borderRadius: '50%', 
              backgroundColor: 'var(--primary-teal)', 
              color: '#ffffff', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 16px',
              boxShadow: 'var(--shadow-glow)'
            }}
          >
            <CheckCircle2 size={36} />
          </div>

          <h3 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)' }}>
            Patient Successfully Registered!
          </h3>
          <p style={{ fontSize: '15px', color: 'var(--primary-teal)', fontWeight: '600', marginTop: '6px' }}>
            Assigned Clinical ID: {registeredPatient.id}
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '520px', margin: '8px auto 24px' }}>
            <strong>{registeredPatient.name}</strong> has been enrolled into the clinic directory and added to today's active waiting queue for doctor consultation.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/reception')}
              className="btn-primary"
              style={{ padding: '10px 24px' }}
            >
              <span>Go to Reception Queue</span>
              <ArrowRight size={16} />
            </button>
            <button
              onClick={resetForm}
              className="btn-secondary"
              style={{ padding: '10px 20px' }}
            >
              <UserPlus size={16} />
              <span>Register Another Patient</span>
            </button>
          </div>
        </div>
      ) : (
        /* Registration Form */
        <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Section 1: Demographics */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px', marginBottom: '16px' }}>
              <User size={18} color="var(--primary-teal)" />
              <span>1. Patient Demographics & Contact</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              {/* Full Name */}
              <div>
                <label className="form-label">Full Name <span style={{ color: 'var(--status-error)' }}>*</span></label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Amina Rahmani"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
                {errors.name && <p style={{ fontSize: '11px', color: 'var(--status-error)', marginTop: '4px' }}>{errors.name}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="form-label">Phone Number <span style={{ color: 'var(--status-error)' }}>*</span></label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
                {errors.phone && <p style={{ fontSize: '11px', color: 'var(--status-error)', marginTop: '4px' }}>{errors.phone}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="form-label">Email Address (Optional)</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="patient@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
                {errors.email && <p style={{ fontSize: '11px', color: 'var(--status-error)', marginTop: '4px' }}>{errors.email}</p>}
              </div>

              {/* DOB */}
              <div>
                <label className="form-label">Date of Birth <span style={{ color: 'var(--status-error)' }}>*</span></label>
                <input
                  type="date"
                  className="input-field"
                  value={formData.dob}
                  onChange={(e) => handleInputChange('dob', e.target.value)}
                />
                {errors.dob && <p style={{ fontSize: '11px', color: 'var(--status-error)', marginTop: '4px' }}>{errors.dob}</p>}
              </div>

              {/* Gender */}
              <div>
                <label className="form-label">Gender</label>
                <select
                  className="input-field"
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Emergency Contact */}
              <div>
                <label className="form-label">Emergency Contact Name & Phone</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Farhan Rahmani (+91 98765 43211)"
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                />
              </div>
            </div>

            {/* Address */}
            <div style={{ marginTop: '16px' }}>
              <label className="form-label">Residential Address <span style={{ color: 'var(--status-error)' }}>*</span></label>
              <textarea
                className="input-field"
                rows={2}
                placeholder="Residential street, apartment, city, state"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
              />
              {errors.address && <p style={{ fontSize: '11px', color: 'var(--status-error)', marginTop: '4px' }}>{errors.address}</p>}
            </div>
          </div>

          {/* Section 2: Medical History & Allergies */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px', marginBottom: '16px' }}>
              <HeartPulse size={18} color="var(--status-warning)" />
              <span>2. Medical History & Critical Allergies</span>
            </h3>

            <div>
              <label className="form-label">Known Allergies & Systemic Conditions (Comma-separated)</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Penicillin Allergy, Mild Hypertension, Asthma, Type 2 Diabetes"
                value={formData.medicalHistory}
                onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
              />
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                These safety alerts will be highlighted in yellow/red on the Doctor's diagnostic workspace.
              </p>
            </div>
          </div>

          {/* Section 3: Reception Intake Document / Initial X-ray */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px', marginBottom: '16px' }}>
              <UploadCloud size={18} color="var(--secondary-cyan)" />
              <span>3. Intake Files & Dental X-ray Attachment (Optional)</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
              <div>
                <label className="form-label">Document Category</label>
                <select
                  className="input-field"
                  value={formData.intakeDocCategory}
                  onChange={(e) => handleInputChange('intakeDocCategory', e.target.value)}
                >
                  <option value="Panoramic X-ray (Intake)">Panoramic OPG X-ray</option>
                  <option value="Bitewing Radiograph">Bitewing Radiograph</option>
                  <option value="Referral Slip">Doctor Referral Slip</option>
                  <option value="Patient ID / Insurance">Patient ID / Insurance Card</option>
                  <option value="Consent Form">Signed Dental Consent Form</option>
                </select>
              </div>

              <div>
                <label className="form-label">Select Intake File</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label
                    htmlFor="intake-file"
                    className="btn-secondary"
                    style={{ cursor: 'pointer', padding: '10px 16px', whiteSpace: 'nowrap' }}
                  >
                    <FileUp size={16} />
                    <span>Choose File</span>
                    <input
                      id="intake-file"
                      type="file"
                      accept="image/*,.pdf,.dcm"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <span style={{ fontSize: '12px', color: formData.intakeFileName ? 'var(--primary-teal)' : 'var(--text-muted)' }}>
                    {formData.intakeFileName || 'No intake file selected (can be added later)'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '14px', borderTop: '1px solid var(--border-glass)', paddingTop: '20px' }}>
            <button
              type="button"
              onClick={() => navigate('/reception')}
              className="btn-secondary"
              style={{ padding: '10px 20px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
              style={{ padding: '10px 28px', fontSize: '14px', fontWeight: '600' }}
            >
              <UserPlus size={18} />
              <span>{isSubmitting ? 'Registering...' : 'Register Patient to Queue'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
