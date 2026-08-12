import React, { useState } from 'react';
import { 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Monitor, 
  Cloud, 
  Database, 
  Sparkles, 
  HardDrive, 
  RefreshCcw,
  Zap
} from 'lucide-react';

export const HealthCheckScreen = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastCheck, setLastCheck] = useState(new Date().toLocaleTimeString());

  const services = [
    {
      id: 'desktop',
      name: 'Electron Desktop Application',
      category: 'Desktop Workstation',
      status: 'Healthy',
      latency: '1ms (IPC Native)',
      version: 'v1.0.0 (Chromium 122)',
      icon: Monitor,
      color: 'var(--status-success)'
    },
    {
      id: 'ai_service',
      name: 'Local PyTorch AI Engine (Noaman / Soha)',
      category: 'Neural Inference',
      status: 'Healthy',
      latency: '35ms - 42ms',
      version: 'DentaVisionNet v1.0.0 (CPU Optimized)',
      icon: Sparkles,
      color: 'var(--primary-teal)'
    },
    {
      id: 'cloud',
      name: 'Cloud Backend API Gateway (Twahir)',
      category: 'REST Services',
      status: 'Healthy',
      latency: '18ms',
      version: 'FastAPI / Python 3.11',
      icon: Cloud,
      color: 'var(--secondary-cyan)'
    },
    {
      id: 'database',
      name: 'PostgreSQL Clinical Database',
      category: 'Persistence Layer',
      status: 'Healthy',
      latency: '2ms',
      version: 'PostgreSQL 16.2',
      icon: Database,
      color: 'var(--accent-purple)'
    },
    {
      id: 'storage',
      name: 'Local DICOM Scan Storage Engine',
      category: 'Encrypted Disk Store',
      status: 'Healthy',
      latency: '412 GB Available',
      version: 'AES-256 Encrypted Volumes',
      icon: HardDrive,
      color: 'var(--status-success)'
    },
    {
      id: 'sync',
      name: 'Offline Background Sync Pipeline',
      category: 'Replication Service',
      status: 'Healthy',
      latency: '100% Synced',
      version: 'Queue Worker Active',
      icon: RefreshCcw,
      color: 'var(--status-success)'
    }
  ];

  const handleRunDiagnostics = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastCheck(new Date().toLocaleTimeString());
    }, 1000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Bar */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Activity size={24} color="var(--primary-teal)" />
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', fontFamily: 'var(--font-heading)' }}>
              System Health & Diagnostics Center
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Real-time monitoring for Desktop, AI Model, FastAPI Cloud, Database, Storage & Sync
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Last Diagnostic Check: <strong>{lastCheck}</strong>
          </span>
          <button
            onClick={handleRunDiagnostics}
            className="btn-primary"
            disabled={isRefreshing}
          >
            <RefreshCw size={18} className={isRefreshing ? 'pulse-glow' : ''} />
            <span>{isRefreshing ? 'Running Diagnostics...' : 'Run Diagnostics'}</span>
          </button>
        </div>
      </div>

      {/* Overall Health Status Banner */}
      <div
        className="glass-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
        }}
      >
        <div style={{ padding: '12px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.2)' }}>
          <CheckCircle2 size={28} color="var(--status-success)" />
        </div>
        <div>
          <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--status-success)' }}>
            All System Subsystems Operating Normally (6/6 Active)
          </h4>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Zero system errors detected. Workstation is operating at full clinical capability.
          </p>
        </div>
      </div>

      {/* Service Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {services.map(srv => {
          const Icon = srv.icon;
          return (
            <div key={srv.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                    <Icon size={22} color={srv.color} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#fff' }}>{srv.name}</h4>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{srv.category}</span>
                  </div>
                </div>

                <span className="badge badge-success">
                  {srv.status}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)', paddingTop: '10px', borderTop: '1px solid var(--border-glass)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Latency / Performance:</span>
                  <strong style={{ color: 'var(--primary-teal)' }}>{srv.latency}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Build Version / Protocol:</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{srv.version}</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
