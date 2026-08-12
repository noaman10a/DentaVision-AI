import React, { useState } from 'react';
import { usePatients } from '../../context/PatientContext';
import { X, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';

export const PatientRegistrationModal = ({ onClose }) => {
  const { registerPatient } = usePatients();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    dob: '',
    gender: 'Female',
    address: '',
    medicalHistory: '',
    emergencyContact: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full Name is required';
    
    // Phone validation (10+ digits or valid phone pattern)
    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (!/^\+?[0-9\s-]{10,15}$/.test(formData.phone.trim())) {
      errs.phone = 'Invalid phone number format (e.g. +91 98765 43210)';
    }

    // Email validation
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Invalid email address format';
    }

    if (!formData.dob) errs.dob = 'Date of Birth is required';
    if (!formData.address.trim()) errs.address = 'Residential Address is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const created = registerPatient({
        ...formData,
        medicalHistory: formData.medicalHistory ? formData.medicalHistory.split(',').map(s => s.trim()) : []
      });
      setSuccessMsg(`Patient registered successfully! Assigned ID: ${created.id}`);
      setTimeout(() => {
        onClose();
      }, 1200);
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
          maxWidth: '640px',
          maxHeight: '90vh',
          overflowY: 'auto',
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

        {/* Title Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: 'var(--primary-teal-glow)' }}>
            <UserPlus size={24} color="var(--primary-teal)" />
          </div>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', fontFamily: 'var(--font-heading)' }}>
              New Patient Registration
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Register new dental clinic intake record
            </p>
          </div>
        </div>

        {successMsg ? (
          <div className="badge badge-success" style={{ width: '100%', padding: '16px', borderRadius: '8px', fontSize: '14px' }}>
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Name & Phone */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="input-label">Full Name *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Amina Rahmani"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                {errors.name && <span style={{ fontSize: '11px', color: 'var(--status-error)', marginTop: '4px', display: 'block' }}>{errors.name}</span>}
              </div>

              <div>
                <label className="input-label">Phone Number *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                {errors.phone && <span style={{ fontSize: '11px', color: 'var(--status-error)', marginTop: '4px', display: 'block' }}>{errors.phone}</span>}
              </div>
            </div>

            {/* Email & DOB */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="input-label">Email Address</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="patient@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                {errors.email && <span style={{ fontSize: '11px', color: 'var(--status-error)', marginTop: '4px', display: 'block' }}>{errors.email}</span>}
              </div>

              <div>
                <label className="input-label">Date of Birth *</label>
                <input
                  type="date"
                  className="input-field"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                />
                {errors.dob && <span style={{ fontSize: '11px', color: 'var(--status-error)', marginTop: '4px', display: 'block' }}>{errors.dob}</span>}
              </div>
            </div>

            {/* Gender & Emergency Contact */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="input-label">Gender *</label>
                <select
                  className="input-field"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="input-label">Emergency Contact Name & Phone</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Relative (+91 98765 00000)"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="input-label">Residential Address *</label>
              <textarea
                className="input-field"
                rows={2}
                placeholder="Street address, City, Pincode"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
              {errors.address && <span style={{ fontSize: '11px', color: 'var(--status-error)', marginTop: '4px', display: 'block' }}>{errors.address}</span>}
            </div>

            {/* Medical History */}
            <div>
              <label className="input-label">Medical History / Allergies (Comma separated)</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Penicillin Allergy, Mild Hypertension, Asthma"
                value={formData.medicalHistory}
                onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Registering...' : 'Save & Register Patient'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
