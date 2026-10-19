import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Building2, 
  Award, 
  FileText, 
  Camera, 
  CheckCircle2, 
  Save, 
  KeyRound,
  MapPin,
  Sparkles,
  Stethoscope
} from 'lucide-react';

export const ProfilePage = () => {
  const { user, updateUserProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '+91 98450 12345',
    regNo: user?.regNo || 'DCI-KA-2021-08491',
    qualification: user?.qualification || 'BDS, MDS (Oral & Maxillofacial Surgery)',
    department: user?.department || 'Department of Oral Surgery & Implantology',
    suite: user?.suite || 'Consultation Operatory 4A',
    clinic: user?.clinic || 'DentaVision Main Clinic - Suite 4',
    bio: user?.bio || 'Specialist dental practitioner dedicated to computer-aided diagnostics, restorative care, and AI-assisted panoramic radiograph analysis.',
    avatar: user?.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
  });

  const [avatarUrlInput, setAvatarUrlInput] = useState('');
  const [showAvatarInput, setShowAvatarInput] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const avatarPresets = [
    { label: 'Doctor 1', url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80' },
    { label: 'Doctor 2', url: 'https://images.unsplash.com/photo-1594824813566-88855ce78961?w=150&auto=format&fit=crop&q=80' },
    { label: 'Doctor 3', url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80' },
    { label: 'Admin', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsSaved(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          handleInputChange('avatar', reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    const res = updateUserProfile(formData);
    if (res.success) {
      setIsSaved(true);
      setSaveMessage('Profile changes saved successfully to your workstation record.');
      setTimeout(() => {
        setIsSaved(false);
      }, 3500);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      {/* Page Title & Breadcrumb */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--primary-teal-glow)', border: '1px solid var(--border-accent)' }}>
        <div>
          <div className="badge badge-info" style={{ marginBottom: '8px' }}>
            {user?.role === 'doctor' ? 'Clinical Practitioner' : user?.role === 'reception' ? 'Front Desk Staff' : 'System Administrator'}
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>
            Workstation User Profile
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Manage your personal identity, contact numbers, professional dental credentials, and display photo.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-success" style={{ fontSize: '12px', padding: '6px 12px' }}>
            ID: {user?.id || 'DOC-102'}
          </span>
        </div>
      </div>

      {/* Save Success Banner */}
      {isSaved && (
        <div 
          className="fade-in" 
          style={{ 
            backgroundColor: 'var(--status-success-bg)', 
            border: '1px solid rgba(16, 185, 129, 0.4)', 
            borderRadius: 'var(--radius-md)', 
            padding: '14px 18px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px' 
          }}
        >
          <CheckCircle2 size={20} color="var(--status-success)" />
          <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--status-success)' }}>
            {saveMessage}
          </span>
        </div>
      )}

      {/* Profile Card & Form Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        
        {/* Left Column: Photo & Identity Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-card" style={{ textAlign: 'center', padding: '28px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '120px', height: '120px', marginBottom: '16px' }}>
              <img
                src={formData.avatar}
                alt={formData.name}
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid var(--primary-teal)',
                  boxShadow: 'var(--shadow-glow)',
                }}
              />
              <label
                htmlFor="avatar-upload"
                title="Upload Profile Photo"
                style={{
                  position: 'absolute',
                  bottom: '4px',
                  right: '4px',
                  backgroundColor: 'var(--primary-teal)',
                  color: '#ffffff',
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-md)',
                  border: '2px solid var(--bg-dark-surface)',
                  transition: 'transform 0.2s',
                }}
              >
                <Camera size={16} />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>
              {formData.name}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--primary-teal)', fontWeight: '600', marginTop: '2px' }}>
              {user?.roleLabel || 'Attending Staff'}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {formData.regNo}
            </p>

            <div style={{ width: '100%', height: '1px', backgroundColor: 'var(--border-glass)', margin: '16px 0' }} />

            <div style={{ width: '100%', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={14} color="var(--primary-teal)" />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{formData.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={14} color="var(--secondary-cyan)" />
                <span>{formData.phone}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={14} color="var(--accent-purple)" />
                <span>{formData.suite}</span>
              </div>
            </div>

            {/* Quick Avatar Presets */}
            <div style={{ width: '100%', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-glass)' }}>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>Quick Photo Presets</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                {avatarPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleInputChange('avatar', preset.url)}
                    style={{
                      padding: 0,
                      border: formData.avatar === preset.url ? '2px solid var(--primary-teal)' : '1px solid var(--border-glass)',
                      borderRadius: '50%',
                      background: 'none',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      width: '32px',
                      height: '32px',
                    }}
                    title={preset.label}
                  >
                    <img src={preset.url} alt={preset.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            </div>

            {/* Custom URL Input Toggle */}
            <button
              type="button"
              onClick={() => setShowAvatarInput(!showAvatarInput)}
              style={{
                marginTop: '12px',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '11px',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              {showAvatarInput ? 'Hide URL Input' : 'Or paste image link'}
            </button>

            {showAvatarInput && (
              <div style={{ marginTop: '8px', width: '100%' }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder="https://...image.jpg"
                  value={avatarUrlInput}
                  onChange={(e) => setAvatarUrlInput(e.target.value)}
                  style={{ fontSize: '11px', height: '32px' }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (avatarUrlInput.trim()) {
                      handleInputChange('avatar', avatarUrlInput.trim());
                      setAvatarUrlInput('');
                      setShowAvatarInput(false);
                    }
                  }}
                  className="btn-secondary"
                  style={{ width: '100%', marginTop: '4px', fontSize: '11px', padding: '4px' }}
                >
                  Apply Photo Link
                </button>
              </div>
            )}
          </div>

          {/* Workstation Security Box */}
          <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={16} color="var(--primary-teal)" />
              <h4 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>Workstation Session</h4>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Logged in locally under AES-256 session token. All clinical signatures are verified against your Dental Council registration.
            </p>
          </div>
        </div>

        {/* Right Column: Editable Details Form */}
        <div className="glass-card" style={{ padding: '28px' }}>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px' }}>
              Personal & Professional Credentials
            </h3>

            {/* Row 1: Full Name & Role */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={14} color="var(--primary-teal)" />
                  <span>Full Name</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Award size={14} color="var(--primary-teal)" />
                  <span>Role / Workstation Title</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={user?.roleLabel || 'Staff'}
                  disabled
                  style={{ opacity: 0.75, cursor: 'not-allowed' }}
                />
              </div>
            </div>

            {/* Row 2: Email & Phone */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={14} color="var(--primary-teal)" />
                  <span>Clinic Email</span>
                </label>
                <input
                  type="email"
                  className="input-field"
                  value={formData.email}
                  disabled
                  style={{ opacity: 0.75, cursor: 'not-allowed' }}
                  title="Registered clinic email cannot be edited directly"
                />
              </div>

              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={14} color="var(--primary-teal)" />
                  <span>Phone Number</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+91 98765 43210"
                  required
                />
              </div>
            </div>

            {/* Row 3: Reg No & Qualifications */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Shield size={14} color="var(--primary-teal)" />
                  <span>DCI Registration / Staff ID</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.regNo}
                  onChange={(e) => handleInputChange('regNo', e.target.value)}
                  placeholder="e.g. DCI-KA-2021-08491"
                  required
                />
              </div>

              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Stethoscope size={14} color="var(--primary-teal)" />
                  <span>Qualifications / Degrees</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.qualification}
                  onChange={(e) => handleInputChange('qualification', e.target.value)}
                  placeholder="e.g. BDS, MDS"
                />
              </div>
            </div>

            {/* Row 4: Department & Operatory Suite */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Building2 size={14} color="var(--primary-teal)" />
                  <span>Department</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                />
              </div>

              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} color="var(--primary-teal)" />
                  <span>Operatory Suite / Station</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.suite}
                  onChange={(e) => handleInputChange('suite', e.target.value)}
                />
              </div>
            </div>

            {/* Row 5: Bio / Clinical Statement */}
            <div>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={14} color="var(--primary-teal)" />
                <span>Professional Bio & Clinical Notes</span>
              </label>
              <textarea
                className="input-field"
                rows={4}
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px', borderTop: '1px solid var(--border-glass)', paddingTop: '18px' }}>
              <button
                type="submit"
                className="btn-primary"
                style={{ padding: '10px 24px', fontSize: '14px', fontWeight: '600' }}
              >
                <Save size={16} />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};
