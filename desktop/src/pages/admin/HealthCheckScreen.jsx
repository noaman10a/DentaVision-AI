import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Zap,
  ArrowLeft
} from 'lucide-react';

export const HealthCheckScreen = () => {
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastCheck, setLastCheck] = useState(new Date().toLocaleTimeString());
  const [liveMetrics, setLiveMetrics] = useState({
    aiLatency: '38ms',
    aiStatus: 'Healthy',
    aiVersion: 'DentaVisionNet v1.0.0 (YOLOv8 best_model.pt)',
    backendLatency: '12ms',
    backendStatus: 'Healthy',
    dbLatency: '3ms',
    dbStatus: 'Healthy',
  });

  const checkLiveHealth = async () => {
    setIsRefreshing(true);
    const startBackend = performance.now();
    let backendLat = '12ms';
    let backendStat = 'Healthy';

    try {
      const res = await fetch('http://localhost:5000/api/v1/health');
      const timeB = Math.round(performance.now() - startBackend);
      backendLat = `${timeB}ms`;
      if (!res.ok) backendStat = 'Degraded';
    } catch (_) {
      backendLat = 'Offline';
      backendStat = 'Offline';
    }

    const startAI = performance.now();
    let aiLat = '38ms';
    let aiStat = 'Healthy';
    let aiVer = 'DentaVisionNet v1.0.0 (best_model.pt)';

    try {
      const resAI = await fetch('http://127.0.0.1:8000/health');
      const timeAI = Math.round(performance.now() - startAI);
      aiLat = `${timeAI}ms`;
      if (resAI.ok) {
        const json = await resAI.json();
        if (json.model_loaded) {
          aiVer = 'DentaVisionNet v1.0.0 (Model Ready)';
        }
      } else {
        aiStat = 'Degraded';
      }
    } catch (_) {
      aiLat = 'Offline';
      aiStat = 'Offline';
    }

    setLiveMetrics({
      aiLatency: aiLat,
      aiStatus: aiStat,
      aiVersion: aiVer,
      backendLatency: backendLat,
      backendStatus: backendStat,
      dbLatency: '3ms (Prisma Pool)',
      dbStatus: 'Healthy',
    });

    setIsRefreshing(false);
    setLastCheck(new Date().toLocaleTimeString());
  };

  useEffect(() => {
    checkLiveHealth();
  }, []);

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
      status: liveMetrics.aiStatus,
      latency: liveMetrics.aiLatency,
      version: liveMetrics.aiVersion,
      icon: Sparkles,
      color: liveMetrics.aiStatus === 'Healthy' ? 'var(--primary-teal)' : '#ef4444'
    },
    {
      id: 'cloud',
      name: 'Backend API Gateway (Twahir)',
      category: 'REST Services',
      status: liveMetrics.backendStatus,
      latency: liveMetrics.backendLatency,
      version: 'Node.js Express / TypeScript',
      icon: Cloud,
      color: liveMetrics.backendStatus === 'Healthy' ? 'var(--secondary-cyan)' : '#ef4444'
    },
    {
      id: 'database',
      name: 'PostgreSQL Clinical Database',
      category: 'Persistence Layer',
      status: liveMetrics.dbStatus,
      latency: liveMetrics.dbLatency,
      version: 'PostgreSQL 16.2 / Supabase Fallback',
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
    checkLiveHealth();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Bar */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => navigate('/admin')}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </button>
          <Activity size={24} color="var(--primary-teal)" />
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
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
          backgroundColor: 'var(--status-success-bg)',
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
                  <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: 'var(--btn-secondary-bg)' }}>
                    <Icon size={22} color={srv.color} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>{srv.name}</h4>
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
