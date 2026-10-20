import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  Eye, 
  EyeOff
} from 'lucide-react';
import heroGraphic from '../assets/dentavision_hero.png';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [emailOrId, setEmailOrId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const canvasRef = useRef(null);

  // Dynamic Neural Network Constellation Background (matches cybernetic tooth mesh)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particleCount = 48;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 1.8 + 0.8,
      alpha: Math.random() * 0.45 + 0.25,
    }));

    let mouse = { x: -1000, y: -1000 };
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw filaments between close particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 135) {
            const filamentAlpha = (1 - dist / 135) * 0.25;
            ctx.strokeStyle = `rgba(0, 210, 255, ${filamentAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Gentle interactive mouse glow
        const mdx = p.x - mouse.x;
        const mdy = p.y - mouse.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        let glowRadius = p.radius;
        if (mdist < 110) {
          glowRadius = p.radius * (1 + (1 - mdist / 110) * 1.6);
        }

        ctx.fillStyle = `rgba(0, 210, 255, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

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
    // Opens Forgot Password recovery workflow in a new browser tab
    window.open('#/forgot-password', '_blank');
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: '#00020f',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        color: '#f8fafc',
      }}
    >
      {/* Background Interactive Canvas (Neural Network Filament Mesh) */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Atmospheric Ambient Radial Glows */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          left: '10%',
          width: '700px',
          height: '700px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 210, 255, 0.12) 0%, rgba(0, 2, 15, 0) 70%)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-20%',
          right: '15%',
          width: '650px',
          height: '650px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.14) 0%, rgba(0, 2, 15, 0) 70%)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Main Split-Screen Container */}
      <div
        style={{
          width: '92%',
          maxWidth: '1280px',
          height: '88vh',
          maxHeight: '790px',
          display: 'grid',
          gridTemplateColumns: '1.2fr 0.8fr',
          borderRadius: '24px',
          overflow: 'hidden',
          zIndex: 10,
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85), 0 0 50px rgba(0, 210, 255, 0.12)',
          border: '1px solid rgba(0, 210, 255, 0.25)',
          background: 'rgba(0, 3, 18, 0.85)',
          backdropFilter: 'blur(28px)',
        }}
      >
        {/* ================= LEFT SECTION: DENTAVISION HERO & ANIMATIONS ================= */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '28px 32px',
            borderRight: '1px solid rgba(0, 210, 255, 0.18)',
            overflow: 'hidden',
            backgroundColor: '#00020f',
          }}
        >
          {/* Subtle Ambient Radial Glow underneath Hero */}
          <div
            style={{
              position: 'absolute',
              width: '480px',
              height: '480px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0, 210, 255, 0.22) 0%, rgba(37, 99, 235, 0.1) 45%, transparent 75%)',
              animation: 'pulseHalo 5s ease-in-out infinite',
              pointerEvents: 'none',
            }}
          />

          {/* SVG Animated Orbital Rings */}
          <svg
            style={{
              position: 'absolute',
              width: '600px',
              height: '600px',
              pointerEvents: 'none',
              animation: 'spinOrbit 36s linear infinite',
              opacity: 0.75,
            }}
            viewBox="0 0 500 500"
          >
            <ellipse
              cx="250"
              cy="230"
              rx="235"
              ry="110"
              fill="none"
              stroke="url(#orbitGradient1)"
              strokeWidth="1.2"
              strokeDasharray="8 6"
              transform="rotate(-25 250 230)"
            />
            <circle cx="475" cy="205" r="3.5" fill="#00d2ff">
              <animate attributeName="opacity" values="0.3;1;0.3" dur="3s" repeatCount="indefinite" />
            </circle>
            <defs>
              <linearGradient id="orbitGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00d2ff" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#2563eb" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#00d2ff" stopOpacity="0.8" />
              </linearGradient>
            </defs>
          </svg>

          <svg
            style={{
              position: 'absolute',
              width: '520px',
              height: '520px',
              pointerEvents: 'none',
              animation: 'spinOrbitReverse 26s linear infinite',
              opacity: 0.6,
            }}
            viewBox="0 0 500 500"
          >
            <ellipse
              cx="250"
              cy="230"
              rx="215"
              ry="80"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="0.9"
              strokeDasharray="4 8"
              transform="rotate(35 250 230)"
            />
            <circle cx="68" cy="252" r="3.2" fill="#38bdf8" />
          </svg>

          {/* Floating Hero Branding Graphic with True Alpha PNG */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '470px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              animation: 'floatHero 7s ease-in-out infinite',
              zIndex: 3,
            }}
          >
            <div
              style={{
                position: 'relative',
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <img
                src={heroGraphic}
                alt="DentaVision AI Cybernetic Tooth"
                style={{
                  width: '100%',
                  height: 'auto',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 15px 35px rgba(0, 210, 255, 0.35))',
                }}
              />
            </div>
          </div>
        </div>

        {/* ================= RIGHT SECTION: SLEEK GLASSMORPHIC LOGIN ================= */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '48px 46px',
            backgroundColor: 'rgba(8, 14, 30, 0.85)',
            backdropFilter: 'blur(20px)',
            position: 'relative',
          }}
        >
          {/* Heading */}
          <div style={{ marginBottom: '28px' }}>
            <h1
              style={{
                fontSize: '28px',
                fontWeight: '700',
                color: '#ffffff',
                fontFamily: 'var(--font-heading)',
                letterSpacing: '-0.5px',
                margin: 0,
              }}
            >
              Sign In to Workstation
            </h1>
          </div>

          {/* Error Alert Box */}
          {errorMsg && (
            <div
              className="badge badge-error"
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                marginBottom: '20px',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: '#fca5a5',
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Email Field */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '12.5px',
                  fontWeight: '600',
                  color: '#cbd5e1',
                  marginBottom: '8px',
                  letterSpacing: '0.2px',
                }}
              >
                Clinic Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={18}
                  color="#64748b"
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  type="email"
                  placeholder="doctor@dentavision.ai or staff email"
                  value={emailOrId}
                  onChange={(e) => setEmailOrId(e.target.value)}
                  autoComplete="username"
                  autoFocus
                  required
                  style={{
                    width: '100%',
                    height: '46px',
                    backgroundColor: 'rgba(15, 23, 42, 0.75)',
                    border: '1px solid #1e293b',
                    borderRadius: '10px',
                    padding: '0 16px 0 42px',
                    color: '#ffffff',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#00d2ff';
                    e.target.style.boxShadow = '0 0 0 3px rgba(0, 210, 255, 0.2), 0 0 15px rgba(0, 210, 255, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#1e293b';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Password Field with Interactive Show/Hide Toggle */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px',
                }}
              >
                <label
                  style={{
                    fontSize: '12.5px',
                    fontWeight: '600',
                    color: '#cbd5e1',
                    margin: 0,
                    letterSpacing: '0.2px',
                  }}
                >
                  Password
                </label>
                <a
                  href="#/forgot-password"
                  onClick={handleOpenForgotPassword}
                  style={{
                    color: '#00d2ff',
                    fontSize: '12px',
                    fontWeight: '600',
                    textDecoration: 'none',
                    cursor: 'pointer',
                    transition: 'opacity 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.target.style.textDecoration = 'underline')}
                  onMouseLeave={(e) => (e.target.style.textDecoration = 'none')}
                  title="Open password recovery tab"
                >
                  Forgot Password?
                </a>
              </div>

              <div style={{ position: 'relative' }}>
                <Lock
                  size={18}
                  color="#64748b"
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  style={{
                    width: '100%',
                    height: '46px',
                    backgroundColor: 'rgba(15, 23, 42, 0.75)',
                    border: '1px solid #1e293b',
                    borderRadius: '10px',
                    padding: '0 44px 0 42px',
                    color: '#ffffff',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#00d2ff';
                    e.target.style.boxShadow = '0 0 0 3px rgba(0, 210, 255, 0.2), 0 0 15px rgba(0, 210, 255, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#1e293b';
                    e.target.style.boxShadow = 'none';
                  }}
                />

                {/* Password Show/Hide Toggle Button */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: showPassword ? '#00d2ff' : '#64748b',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'color 0.2s ease',
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Glowing Lottie-Style CTA Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                height: '48px',
                marginTop: '10px',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #00d2ff 0%, #2563eb 100%)',
                color: '#ffffff',
                fontSize: '15px',
                fontWeight: '700',
                letterSpacing: '0.3px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 4px 20px rgba(0, 210, 255, 0.4), 0 0 10px rgba(37, 99, 235, 0.3)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease',
                opacity: isLoading ? 0.8 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 28px rgba(0, 210, 255, 0.6), 0 0 18px rgba(37, 99, 235, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 210, 255, 0.4), 0 0 10px rgba(37, 99, 235, 0.3)';
              }}
            >
              {isLoading ? (
                <>
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#ffffff',
                      animation: 'spinOrbit 0.8s linear infinite',
                    }}
                  />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Workstation</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
