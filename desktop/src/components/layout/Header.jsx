import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePatients } from '../../context/PatientContext';
import { 
  Search, 
  Bell, 
  Building2, 
  Activity, 
  CheckCircle2, 
  UserCheck, 
  ChevronDown,
  Sparkles,
  Shield,
  Stethoscope,
  Users
} from 'lucide-react';

export const Header = () => {
  const { user, switchRole } = useAuth();
  const { searchQuery, setSearchQuery, activePatient } = usePatients();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, title: 'AI Detection Ready', desc: 'X-ray analysis completed for Amina Rahmani (#PT-2026-0705)', time: '2m ago' },
    { id: 2, title: 'New Patient Registered', desc: 'Vikramaditya V added by Reception', time: '15m ago' },
    { id: 3, title: 'Cloud Sync Completed', desc: 'All local records synced to PostgreSQL', time: '1h ago' }
  ];

  return (
    <header
      style={{
        height: '64px',
        backgroundColor: 'rgba(19, 27, 46, 0.8)',
        backdropFilter: 'var(--backdrop-blur)',
        borderBottom: '1px solid var(--border-glass)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        zIndex: 10,
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
              backgroundColor: 'rgba(6, 182, 212, 0.1)',
              border: '1px solid rgba(6, 182, 212, 0.25)',
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

      {/* Right Controls: Role Switcher, System Health, Notifications */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* System Health Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: 'var(--radius-full)',
            padding: '4px 12px',
          }}
        >
          <Activity size={14} color="var(--status-success)" />
          <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--status-success)' }}>
            AI Engine: Active (35ms)
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
              backgroundColor: 'rgba(30, 41, 59, 0.8)',
              border: '1px solid var(--border-glass)',
              borderRadius: '8px',
              padding: '6px 12px',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
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
                <span>Administrator</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications Dropdown Toggle */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              position: 'relative',
              background: 'rgba(30, 41, 59, 0.8)',
              border: '1px solid var(--border-glass)',
              borderRadius: '8px',
              padding: '8px',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
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
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
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
      </div>
    </header>
  );
};
