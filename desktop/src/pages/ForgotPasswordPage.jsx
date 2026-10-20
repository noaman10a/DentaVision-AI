import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Mail, Lock, KeyRound, CheckCircle2, ArrowRight, ArrowLeft, AlertCircle, ShieldCheck } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { isEmailRegistered, resetPassword } = useAuth();

  // Steps: 1 = Email Input, 2 = OTP Verification, 3 = New Password, 4 = Success Confirmation
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Email format validation
  const isValidEmailFormat = (str) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str.trim());
  };

  // Step 1: Request OTP
  const handleRequestOtp = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setErrorMsg('Please enter your clinic email address.');
      return;
    }

    if (!isValidEmailFormat(cleanEmail)) {
      setErrorMsg('Please enter a valid email address format (e.g. staff@dentavision.ai or name@gmail.com).');
      return;
    }

    // Strict registered check
    if (!isEmailRegistered(cleanEmail)) {
      setErrorMsg(`The email "${email}" is not registered in the DentaVision clinical directory. Only registered clinic personnel can reset their password.`);
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Generate realistic 6-digit OTP
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);
      setIsLoading(false);
      setStep(2);
    }, 600);
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!otp.trim()) {
      setErrorMsg('Please enter the 6-digit verification code.');
      return;
    }

    if (otp.trim() !== generatedOtp) {
      setErrorMsg('Invalid verification code. Please check the 6-digit code and try again.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(3);
    }, 400);
  };

  // Step 3: Update Password
  const handleUpdatePassword = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!newPassword) {
      setErrorMsg('Please enter your new password.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters in length.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('The passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const result = resetPassword(email, newPassword);
      setIsLoading(false);

      if (result.success) {
        setStep(4);
      } else {
        setErrorMsg(result.error || 'Failed to update password.');
      }
    }, 600);
  };

  return (
    <div
      style={{
        width: '100vw',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-dark-base)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
        transition: 'var(--transition-theme)',
      }}
    >
      {/* Atmospheric Ambient Radial Glow */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          left: '15%',
          width: '550px',
          height: '550px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 210, 255, 0.12) 0%, rgba(0, 2, 15, 0) 70%)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-15%',
          right: '15%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.12) 0%, rgba(0, 2, 15, 0) 70%)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />


      <div
        className="glass-card fade-in"
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: '36px',
          boxShadow: 'var(--shadow-lg), var(--shadow-glow)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-glass)',
        }}
      >
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
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
            <KeyRound size={28} color="#fff" />
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            Account Password Recovery
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            DentaVision AI Clinical Security Gateway
          </p>
        </div>

        {/* Progress Step Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
          {[
            { num: 1, label: 'Email' },
            { num: 2, label: 'OTP' },
            { num: 3, label: 'New Password' },
            { num: 4, label: 'Done' }
          ].map((s, idx) => (
            <React.Fragment key={s.num}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    backgroundColor: step >= s.num ? 'var(--primary-teal)' : 'var(--btn-secondary-bg)',
                    color: step >= s.num ? '#ffffff' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '700',
                    border: '1px solid var(--border-glass)',
                  }}
                >
                  {step > s.num ? '✓' : s.num}
                </div>
                <span style={{ fontSize: '11px', fontWeight: step === s.num ? '700' : '500', color: step === s.num ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {s.label}
                </span>
              </div>
              {idx < 3 && (
                <div style={{ width: '20px', height: '2px', backgroundColor: step > s.num ? 'var(--primary-teal)' : 'var(--border-glass)' }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="badge badge-error" style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', marginBottom: '18px', fontSize: '12.5px', display: 'flex', alignItems: 'flex-start', gap: '8px', lineHeight: '1.4' }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: Email Input */}
        {step === 1 && (
          <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Enter your registered clinical email address. The system will verify your registration and dispatch a secure 6-digit one-time passcode (OTP).
            </p>

            <div>
              <label className="input-label">Registered Clinic Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  className="input-field"
                  placeholder="e.g. doctor@dentavision.ai or your Gmail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '38px' }}
                  autoFocus
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
              style={{ width: '100%', height: '44px', marginTop: '4px', fontSize: '14px' }}
            >
              {isLoading ? (
                <span>Verifying Registration...</span>
              ) : (
                <>
                  <span>Send Security OTP Code</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="btn-secondary"
              style={{ width: '100%', height: '40px', fontSize: '13px' }}
            >
              <ArrowLeft size={16} />
              <span>Back to Sign In</span>
            </button>
          </form>
        )}

        {/* STEP 2: OTP Verification */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Live Security Dispatch Banner with Mock OTP for Demo */}
            <div
              style={{
                backgroundColor: 'rgba(6, 182, 212, 0.12)',
                border: '1px solid var(--secondary-cyan)',
                padding: '12px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                color: 'var(--text-primary)',
                lineHeight: '1.4',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', color: 'var(--secondary-cyan)', marginBottom: '4px' }}>
                <ShieldCheck size={16} />
                <span>Security Code Dispatched to: {email}</span>
              </div>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                For evaluation/testing demonstration, your generated OTP code is:
              </p>
              <div style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'monospace', color: 'var(--primary-teal)', letterSpacing: '4px', marginTop: '4px' }}>
                {generatedOtp}
              </div>
            </div>

            <div>
              <label className="input-label">Enter 6-Digit Verification Code</label>
              <input
                type="text"
                maxLength={6}
                className="input-field"
                placeholder="• • • • • •"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                style={{
                  fontSize: '22px',
                  fontWeight: '700',
                  letterSpacing: '8px',
                  textAlign: 'center',
                  fontFamily: 'monospace',
                }}
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading || otp.length < 6}
              style={{ width: '100%', height: '44px', marginTop: '4px', fontSize: '14px' }}
            >
              {isLoading ? (
                <span>Verifying Passcode...</span>
              ) : (
                <>
                  <span>Confirm OTP & Proceed</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
              <button
                type="button"
                onClick={() => { setStep(1); setOtp(''); setErrorMsg(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '12px', cursor: 'pointer' }}
              >
                ← Change Email Address
              </button>
              <button
                type="button"
                onClick={() => {
                  const code = Math.floor(100000 + Math.random() * 900000).toString();
                  setGeneratedOtp(code);
                  setErrorMsg('');
                }}
                style={{ background: 'none', border: 'none', color: 'var(--primary-teal)', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
              >
                Resend New OTP
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Set New Password */}
        {step === 3 && (
          <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--status-success)', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
              <CheckCircle2 size={16} />
              <span>Identity Verified for {email}</span>
            </div>

            <div>
              <label className="input-label">New Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  className="input-field"
                  placeholder="Enter new password (min. 6 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ paddingLeft: '38px' }}
                  autoFocus
                  required
                />
              </div>
            </div>

            <div>
              <label className="input-label">Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  className="input-field"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ paddingLeft: '38px' }}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
              style={{ width: '100%', height: '44px', marginTop: '6px', fontSize: '14px' }}
            >
              {isLoading ? (
                <span>Updating Password...</span>
              ) : (
                <>
                  <span>Save New Password & Complete</span>
                  <CheckCircle2 size={18} />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 4: Success Confirmation */}
        {step === 4 && (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '12px 0' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '2px solid var(--status-success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={36} color="var(--status-success)" />
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>
              Password Reset Successfully!
            </h3>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', maxWidth: '360px' }}>
              Your account password for <strong style={{ color: 'var(--text-primary)' }}>{email}</strong> has been updated. You can now log into your workstation with your new credentials.
            </p>

            <button
              onClick={() => {
                // If opened in another tab, try to close tab or redirect to login
                navigate('/login');
              }}
              className="btn-primary"
              style={{ width: '100%', height: '44px', marginTop: '8px', fontSize: '14px' }}
            >
              <span>Proceed to Workstation Login</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
