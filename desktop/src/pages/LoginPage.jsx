import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Shield, Lock, Mail, UserCheck, Stethoscope, Users, ArrowRight, KeyRound } from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [emailOrId, setEmailOrId] = useState('twahir.doctor@dentavision.ai');
  const [password, setPassword] = useState('password123');
  const [selectedRole, setSelectedRole] = useState('doctor');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!emailOrId.trim()) {
      setErrorMsg('Please enter your Staff ID or Email Address.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your account password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      login(emailOrId, password, selectedRole);
      
      const redirectPath = 
        selectedRole === 'reception' ? '/reception' :
        selectedRole === 'admin' ? '/admin' : '/doctor';
      navigate(redirectPath);
    }, 600);
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotSent(true);
    setTimeout(() => {
      setShowForgotModal(false);
      setForgotSent(false);
      setForgotEmail('');
    }, 2000);
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: 'var(--bg-dark-base)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        transition: 'var(--transition-theme)',
      }}
    >
      <div
        className="glass-card fade-in"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '36px',
          boxShadow: 'var(--shadow-lg), var(--shadow-glow)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-glass)',
        }}
      >
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: 'var(--primary-teal)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            <Sparkles size={30} color="#fff" />
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '26px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            DentaVision <span style={{ color: 'var(--primary-teal)' }}>AI</span>
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Clinical Desktop Authentication & Workstation Gate
          </p>
        </div>

        {/* Role Quick Selector */}
        <div style={{ marginBottom: '20px' }}>
          <label className="input-label" style={{ textAlign: 'center', marginBottom: '8px' }}>Select Workstation Role Profile</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              onClick={() => { setSelectedRole('reception'); setEmailOrId('sneha.reception@dentavision.ai'); }}
              style={{
                padding: '8px',
                borderRadius: '8px',
                border: selectedRole === 'reception' ? '1px solid var(--primary-teal)' : '1px solid var(--border-glass)',
                backgroundColor: selectedRole === 'reception' ? 'var(--primary-teal-glow)' : 'var(--btn-secondary-bg)',
                color: selectedRole === 'reception' ? 'var(--primary-teal)' : 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                fontWeight: '600',
              }}
            >
              <Users size={16} color={selectedRole === 'reception' ? 'var(--primary-teal)' : 'currentColor'} />
              <span>Reception</span>
            </button>

            <button
              type="button"
              onClick={() => { setSelectedRole('doctor'); setEmailOrId('twahir.doctor@dentavision.ai'); }}
              style={{
                padding: '8px',
                borderRadius: '8px',
                border: selectedRole === 'doctor' ? '1px solid var(--primary-teal)' : '1px solid var(--border-glass)',
                backgroundColor: selectedRole === 'doctor' ? 'var(--primary-teal-glow)' : 'var(--btn-secondary-bg)',
                color: selectedRole === 'doctor' ? 'var(--primary-teal)' : 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                fontWeight: '600',
              }}
            >
              <Stethoscope size={16} color={selectedRole === 'doctor' ? 'var(--primary-teal)' : 'currentColor'} />
              <span>Doctor</span>
            </button>

            <button
              type="button"
              onClick={() => { setSelectedRole('admin'); setEmailOrId('admin@dentavision.ai'); }}
              style={{
                padding: '8px',
                borderRadius: '8px',
                border: selectedRole === 'admin' ? '1px solid var(--primary-teal)' : '1px solid var(--border-glass)',
                backgroundColor: selectedRole === 'admin' ? 'var(--primary-teal-glow)' : 'var(--btn-secondary-bg)',
                color: selectedRole === 'admin' ? 'var(--primary-teal)' : 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                fontWeight: '600',
              }}
            >
              <Shield size={16} color={selectedRole === 'admin' ? 'var(--primary-teal)' : 'currentColor'} />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="badge badge-error" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
            {errorMsg}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="input-label">Staff ID or Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="input-field"
                placeholder="e.g. DOC-102 or staff@dentavision.ai"
                value={emailOrId}
                onChange={(e) => setEmailOrId(e.target.value)}
                style={{ paddingLeft: '38px' }}
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="input-label" style={{ marginBottom: 0 }}>Account Password</label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                style={{ background: 'none', border: 'none', color: 'var(--primary-teal)', fontSize: '12px', cursor: 'pointer' }}
              >
                Forgot Password?
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                className="input-field"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '38px' }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading}
            style={{ width: '100%', height: '44px', marginTop: '8px', fontSize: '15px' }}
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Workstation</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Forgot Password Modal Overlay */}
      {showForgotModal && (
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
          <div className="glass-card fade-in" style={{ width: '100%', maxWidth: '400px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <KeyRound size={22} color="var(--primary-teal)" />
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>Reset Password</h3>
            </div>

            {forgotSent ? (
              <div className="badge badge-success" style={{ width: '100%', padding: '12px', borderRadius: '8px' }}>
                Reset instructions sent to your clinic email!
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit}>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                  Enter your registered clinic staff email. An IT security code will be dispatched immediately.
                </p>
                <input
                  type="email"
                  className="input-field"
                  placeholder="name@dentavision.ai"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  style={{ marginBottom: '16px' }}
                />
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn-secondary" onClick={() => setShowForgotModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
