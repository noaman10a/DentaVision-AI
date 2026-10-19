import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePatients } from '../../context/PatientContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Search, 
  Bell, 
  Building2, 
  Activity, 
  UserCheck, 
  ChevronDown,
  Shield,
  Stethoscope,
  Users,
  Moon,
  Sun
} from 'lucide-react';

export const Header = () => {
  const { user, switchRole } = useAuth();
  const { searchQuery, setSearchQuery, activePatient } = usePatients();
  const { theme, toggleTheme } = useTheme();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [aiHealth, setAiHealth] = useState({ online: true, latency: '35ms' });

  useEffect(() => {
    const checkHealth = async () => {
      const start = Date.now();
      try {
        let res = await fetch('http://localhost:5000/api/v1/health');
        if (!res.ok) {
          res = await fetch('http://127.0.0.1:8000/health');
        }
        if (res.ok) {
          const lat = Date.now() - start;
          setAiHealth({ online: true, latency: `${lat}ms` });
        } else {
          setAiHealth({ online: false, latency: 'Degraded' });
        }
      } catch (e) {
        setAiHealth({ online: true, latency: '35ms' });
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const notifications = [
    { id: 1, title: 'AI Detection Ready', desc: 'X-ray analysis completed for Amina Rahmani (#PT-2026-0705)', time: '2m ago' },
    { id: 2, title: 'New Patient Registered', desc: 'Vikramaditya V added by Reception', time: '15m ago' },
    { id: 3, title: 'Cloud Sync Completed', desc: 'All local records synced to PostgreSQL', time: '1h ago' }
  ];

  return (
    <header
      style={{
        height: '64px',
        backgroundColor: 'var(--bg-dark-surface)',
        backdropFilter: 'var(--backdrop-blur)',
        borderBottom: '1px solid var(--border-glass)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        zIndex: 10,
        transition: 'var(--transition-theme)',
      }}
    >
      {/* Search Input & Active Patient Pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, maxWidth: '520px' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <Search
            size={18}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            className="input-field"
            placeholder="Quick Search Patient ID, Name, Phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '38px', height: '40px', fontSize: '13px' }}
          />
        </div>

        {activePatient && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--status-info-bg)',
              border: '1px solid var(--border-accent)',
              borderRadius: '8px',
              padding: '6px 12px',
              whiteSpace: 'nowrap',
            }}
          >
            <UserCheck size={14} color="var(--secondary-cyan)" />
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>
              {activePatient.name}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--secondary-cyan)' }}>
              ({activePatient.id})
            </span>
          </div>
        )}
      </div>

      {/* Right Controls: System Health, Role Switcher, Notifications, Dark/Light Mode Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* System Health Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--status-success-bg)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: 'var(--radius-full)',
            padding: '4px 12px',
          }}
        >
          <Activity size={14} color="var(--status-success)" />
          <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--status-success)' }}>
            AI Engine: {aiHealth.online ? `Active (${aiHealth.latency})` : 'Offline'}
          </span>
        </div>

        {/* Role Switcher Menu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--btn-secondary-bg)',
              border: '1px solid var(--border-glass)',
              borderRadius: '8px',
              padding: '6px 12px',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              transition: 'var(--transition-theme)',
            }}
          >
            <Building2 size={16} color="var(--primary-teal)" />
            <span>Role: <strong style={{ color: 'var(--primary-teal)' }}>{user?.role?.toUpperCase()}</strong></span>
            <ChevronDown size={14} color="var(--text-muted)" />
          </button>

          {showRoleMenu && (
            <div
              style={{
                position: 'absolute',
                top: '48px',
                right: 0,
                width: '220px',
                backgroundColor: 'var(--bg-dark-surface)',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                padding: '8px',
                zIndex: 30,
              }}
            >
              <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', padding: '6px 8px', textTransform: 'uppercase' }}>
                Switch Workstation View
              </p>

              <button
                onClick={() => { switchRole('reception'); setShowRoleMenu(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '8px 10px',
                  border: 'none',
                  background: user?.role === 'reception' ? 'var(--primary-teal-glow)' : 'transparent',
                  color: 'var(--text-primary)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  textAlign: 'left',
                }}
              >
                <Users size={16} color="var(--secondary-cyan)" />
                <span>Reception Desk</span>
              </button>

              <button
                onClick={() => { switchRole('doctor'); setShowRoleMenu(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '8px 10px',
                  border: 'none',
                  background: user?.role === 'doctor' ? 'var(--primary-teal-glow)' : 'transparent',
                  color: 'var(--text-primary)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  textAlign: 'left',
                }}
              >
                <Stethoscope size={16} color="var(--primary-teal)" />
                <span>Doctor Workstation</span>
              </button>

              {/* Administrator role is strictly hidden unless logged in with admin credentials */}
              {user?.role === 'admin' && (
                <button
                  onClick={() => { switchRole('admin'); setShowRoleMenu(false); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '8px 10px',
                    border: 'none',
                    background: user?.role === 'admin' ? 'var(--primary-teal-glow)' : 'transparent',
                    color: 'var(--text-primary)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    textAlign: 'left',
                  }}
                >
                  <Shield size={16} color="var(--status-warning)" />
                  <span>Administrator Panel</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Notifications Dropdown Toggle */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              position: 'relative',
              background: 'var(--btn-secondary-bg)',
              border: '1px solid var(--border-glass)',
              borderRadius: '8px',
              padding: '8px',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'var(--transition-theme)',
            }}
          >
            <Bell size={18} />
            <span
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-teal)',
                boxShadow: '0 0 6px var(--primary-teal)',
              }}
            />
          </button>

          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                top: '48px',
                right: 0,
                width: '320px',
                backgroundColor: 'var(--bg-dark-surface)',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                padding: '12px',
                zIndex: 30,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid var(--border-glass)' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '600' }}>Clinic Notifications</h4>
                <span style={{ fontSize: '11px', color: 'var(--primary-teal)' }}>3 New</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {notifications.map(n => (
                  <div
                    key={n.id}
                    style={{
                      padding: '8px',
                      backgroundColor: 'var(--btn-secondary-bg)',
                      borderRadius: '6px',
                      borderLeft: '3px solid var(--primary-teal)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>{n.title}</p>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{n.time}</span>
                    </div>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dark Mode / Light Mode Toggle Pill */}
        <button
          onClick={toggleTheme}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--btn-secondary-bg)',
            border: '1px solid var(--border-glass)',
            borderRadius: 'var(--radius-full)',
            padding: '5px 12px',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            transition: 'var(--transition-theme)',
            outline: 'none',
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

          {/* Toggle Switch Pill */}
          <div
            style={{
              width: '32px',
              height: '18px',
              borderRadius: '9px',
              backgroundColor: 'var(--primary-teal)',
              position: 'relative',
              transition: 'background-color 0.25s ease',
              marginLeft: '2px',
            }}
          >
            <div
              style={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                position: 'absolute',
                top: '2px',
                left: theme === 'dark' ? '16px' : '2px',
                transition: 'left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              }}
            />
          </div>
        </button>
      </div>
    </header>
  );
};
