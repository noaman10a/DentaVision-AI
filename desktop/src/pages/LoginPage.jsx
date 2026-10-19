import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sparkles, Lock, Mail, ArrowRight, AlertCircle, Moon, Sun } from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [emailOrId, setEmailOrId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanEmail = emailOrId.trim();

    if (!cleanEmail) {
      setErrorMsg('Please enter your registered clinic email.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your account password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const res = login(cleanEmail, password);

      if (!res.success) {
        setErrorMsg(res.error || 'Authentication failed. Please verify your credentials.');
        return;
      }

      // Route based on authenticated role automatically resolved from the email
      const redirectPath = 
        res.role === 'admin' ? '/admin' :
        res.role === 'reception' ? '/reception' : '/doctor';
      
      navigate(redirectPath);
    }, 450);
  };

  const handleOpenForgotPassword = (e) => {
    e.preventDefault();
    // Opens Forgot Password recovery workflow in a new browser tab as requested
    window.open('#/forgot-password', '_blank');
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
        position: 'relative',
        transition: 'var(--transition-theme)',
      }}
    >
      {/* Top Right Theme Toggle */}
      <button
        onClick={toggleTheme}
        style={{
          position: 'absolute',
          top: '24px',
          right: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'var(--btn-secondary-bg)',
          border: '1px solid var(--border-glass)',
          borderRadius: 'var(--radius-full)',
          padding: '6px 14px',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-sm)',
          transition: 'var(--transition-theme)',
          outline: 'none',
          zIndex: 10,
        }}
        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {theme === 'dark' ? (
          <>
            <Moon size={16} color="var(--primary-teal)" />
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>Dark Mode</span>
          </>
        ) : (
          <>
            <Sun size={16} color="#f59e0b" />
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>Light Mode</span>
          </>
        )}
        <div
          style={{
            width: '30px',
            height: '16px',
            borderRadius: '8px',
            backgroundColor: 'var(--primary-teal)',
            position: 'relative',
            marginLeft: '2px',
          }}
        >
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              position: 'absolute',
              top: '2px',
              left: theme === 'dark' ? '15px' : '2px',
              transition: 'left 0.25s ease',
            }}
          />
        </div>
      </button>

      <div
        className="glass-card fade-in"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '40px 36px',
          boxShadow: 'var(--shadow-lg), var(--shadow-glow)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-glass)',
        }}
      >
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
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

        {/* Error Alert */}
        {errorMsg && (
          <div
            className="badge badge-error"
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: '8px',
              marginBottom: '18px',
              fontSize: '12.5px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              lineHeight: '1.4',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Clean Login Form: Only Email and Password */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label className="input-label">Clinic Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                className="input-field"
                placeholder="e.g. doctor@dentavision.ai or staff email"
                value={emailOrId}
                onChange={(e) => setEmailOrId(e.target.value)}
                style={{ paddingLeft: '38px' }}
                autoComplete="username"
                autoFocus
                required
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="input-label" style={{ marginBottom: 0 }}>Password</label>
              <a
                href="#/forgot-password"
                onClick={handleOpenForgotPassword}
                style={{
                  color: 'var(--primary-teal)',
                  fontSize: '12px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s ease',
                }}
                title="Open password recovery tab"
              >
                Forgot Password?
              </a>
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
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading}
            style={{ width: '100%', height: '46px', marginTop: '6px', fontSize: '15px', fontWeight: '600' }}
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

        {/* Demo Helper Links */}
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-glass)', textAlign: 'center' }}>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Registered Clinic Accounts (Quick Fill):
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => {
                setEmailOrId('doctor@dentavision.ai');
                setPassword('password123');
                setErrorMsg('');
              }}
              style={{
                fontSize: '11px',
                padding: '4px 10px',
                borderRadius: '6px',
                backgroundColor: 'var(--btn-secondary-bg)',
                border: '1px solid var(--border-glass)',
                color: 'var(--primary-teal)',
                cursor: 'pointer',
              }}
            >
              Doctor Account
            </button>
            <button
              type="button"
              onClick={() => {
                setEmailOrId('reception@dentavision.ai');
                setPassword('password123');
                setErrorMsg('');
              }}
              style={{
                fontSize: '11px',
                padding: '4px 10px',
                borderRadius: '6px',
                backgroundColor: 'var(--btn-secondary-bg)',
                border: '1px solid var(--border-glass)',
                color: 'var(--secondary-cyan)',
                cursor: 'pointer',
              }}
            >
              Receptionist Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
