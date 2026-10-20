import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePatients } from '../../context/PatientContext';
import { Search, Bell, ArrowLeft } from 'lucide-react';

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { searchQuery, setSearchQuery } = usePatients();
  const [showNotifications, setShowNotifications] = useState(false);

  const isMainLanding = ['/', '/doctor', '/reception', '/admin'].includes(location.pathname);

  const notifications = [
    { id: 1, title: 'AI Detection Ready', desc: 'X-ray analysis completed for Amina Rahmani (#PT-2026-0705)', time: '2m ago' },
    { id: 2, title: 'New Patient Registered', desc: 'Vikramaditya V added by Reception', time: '15m ago' },
    { id: 3, title: 'Cloud Sync Completed', desc: 'All local records synced to PostgreSQL', time: '1h ago' }
  ];

  return (
    <header
      className="no-print"
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
      {/* Navigation & Search Area */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, maxWidth: '540px' }}>
        {!isMainLanding && (
          <button
            onClick={() => navigate(-1)}
            className="btn-secondary"
            style={{
              height: '40px',
              padding: '0 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              borderRadius: '8px',
              flexShrink: 0
            }}
            title="Go back to previous page"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
        )}

        <div style={{ position: 'relative', width: '100%' }}>
          <Search
            size={18}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            className="input-field"
            placeholder="Quick Search Patient ID, Name, Phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '40px', height: '40px', fontSize: '13px', width: '100%' }}
          />
        </div>
      </div>

      {/* Right Controls: Notifications Only */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
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
            title="Clinic Notifications"
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
                <h4 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>Clinic Notifications</h4>
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
      </div>
    </header>
  );
};
