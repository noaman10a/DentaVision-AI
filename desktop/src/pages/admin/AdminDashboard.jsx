import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  Users, 
  Activity, 
  Database, 
  HardDrive, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Search, 
  RefreshCw,
  ArrowRight
} from 'lucide-react';

const mockUsersList = [
  { id: 'STF-001', name: 'Sneha Sahadevan', role: 'Receptionist Lead', email: 'sneha.reception@dentavision.ai', status: 'Active' },
  { id: 'DOC-102', name: 'Dr. Twahir Mohammed', role: 'Senior Dental Surgeon', email: 'twahir.doctor@dentavision.ai', status: 'Active' },
  { id: 'AI-ENG-01', name: 'Noaman (AI Lead)', role: 'AI Model Engineer', email: 'noaman@dentavision.ai', status: 'Active' },
  { id: 'API-ENG-02', name: 'Soha (FastAPI Lead)', role: 'AI Service Engineer', email: 'soha@dentavision.ai', status: 'Active' },
];

const mockAuditLogs = [
  { id: 1, action: 'User Login', user: 'Dr. Twahir Mohammed', timestamp: '2026-08-12 10:01 AM', status: 'Success' },
  { id: 2, action: 'AI Inference Call', user: 'X-ray Engine v1.0', timestamp: '2026-08-12 10:03 AM', status: 'Success (42ms)' },
  { id: 3, action: 'Patient Registered', user: 'Sneha Sahadevan', timestamp: '2026-08-12 09:45 AM', status: 'Success' },
  { id: 4, action: 'PostgreSQL Sync', user: 'Sync Engine', timestamp: '2026-08-12 09:00 AM', status: 'Synced (120 records)' },
];

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState(mockUsersList);
  const [feedback, setFeedback] = useState('');

  const systemMetrics = [
    { title: "Active System Users", value: "4 Staff", desc: "100% operational", icon: Users, color: 'var(--primary-teal)' },
    { title: "System Health Status", value: "Optimal", desc: "All 6 services running", icon: Activity, color: 'var(--status-success)' },
    { title: "PostgreSQL Database", value: "Connected", desc: "Latency: 2ms", icon: Database, color: 'var(--secondary-cyan)' },
    { title: "Local DICOM Storage", value: "24.5 GB", desc: "Free: 412 GB", icon: HardDrive, color: 'var(--accent-purple)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Admin Header Banner */}
      <div
        className="glass-card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--primary-teal-glow)',
          border: '1px solid var(--border-accent)',
        }}
      >
        <div>
          <div className="badge badge-warning" style={{ marginBottom: '8px' }}>System Administrator</div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>
            Administrator System Console
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Monitor clinic node health, manage staff user accounts, inspect audit logs, and trigger sync processes.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => navigate('/admin/health')} className="btn-primary">
            <Activity size={18} />
            <span>Launch Health Diagnostics</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {systemMetrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <div key={i} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>{m.title}</span>
                <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'var(--btn-secondary-bg)' }}>
                  <Icon size={20} color={m.color} />
                </div>
              </div>
              <div>
                <h3 style={{ fontSize: '24px', fontWeight: '700', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>{m.value}</h3>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{m.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {feedback && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          backgroundColor: 'rgba(34, 197, 94, 0.15)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          color: '#22c55e',
          fontSize: '13px',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>{feedback}</span>
        </div>
      )}

      {/* User Management & Audit Logs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* User Management */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>Staff User Accounts</h3>
            <button
              onClick={() => {
                const name = prompt('Enter new staff member name:');
                if (name) {
                  setUsers(prev => [
                    ...prev,
                    { id: `STF-${Math.floor(100 + Math.random() * 900)}`, name, role: 'Dental Staff', email: `${name.toLowerCase().replace(' ', '.')}@dentavision.ai`, status: 'Active' }
                  ]);
                }
              }}
              className="btn-primary"
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              <Plus size={14} />
              <span>Add Staff User</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {users.map(u => (
              <div
                key={u.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  backgroundColor: 'var(--btn-secondary-bg)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-glass)',
                  transition: 'var(--transition-theme)',
                }}
              >
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                    {u.name} <span style={{ fontSize: '11px', color: 'var(--primary-teal)' }}>({u.id})</span>
                  </h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {u.role} • {u.email}
                  </p>
                </div>
                <span className="badge badge-success" style={{ fontSize: '11px' }}>{u.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Logs */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>Audit Trail & Security Logs</h3>
            <button onClick={() => { setFeedback('Audit logs refreshed successfully.'); setTimeout(() => setFeedback(''), 3000); }} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
              <RefreshCw size={14} />
              <span>Refresh</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {mockAuditLogs.map(log => (
              <div
                key={log.id}
                style={{
                  padding: '10px 14px',
                  backgroundColor: 'var(--btn-secondary-bg)',
                  borderRadius: '8px',
                  borderLeft: '3px solid var(--primary-teal)',
                  transition: 'var(--transition-theme)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>{log.action}</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{log.timestamp}</span>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Initiator: {log.user} • Result: <strong style={{ color: 'var(--status-success)' }}>{log.status}</strong>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
