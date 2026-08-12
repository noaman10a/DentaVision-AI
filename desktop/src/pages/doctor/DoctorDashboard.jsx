import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatients } from '../../context/PatientContext';
import { useAI } from '../../context/AIContext';
import { 
  Stethoscope, 
  Users, 
  Clock, 
  Sparkles, 
  FileText, 
  FolderOpen, 
  ArrowRight, 
  AlertTriangle,
  PlusCircle,
  Activity
} from 'lucide-react';

export const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { patients, selectPatientById } = usePatients();
  const { analysisResult } = useAI();

  const doctorStats = [
    { title: "Today's Clinical Queue", count: "12", sub: "4 completed", icon: Users, color: 'var(--primary-teal)' },
    { title: "Patients Waiting", count: "3", sub: "In consultation lounge", icon: Clock, color: 'var(--status-warning)' },
    { title: "Awaiting Review (AI)", count: "2", sub: "New X-rays processed", icon: Sparkles, color: 'var(--accent-purple)' },
    { title: "Reports Generated", count: "9", sub: "Ready for signature", icon: FileText, color: 'var(--secondary-cyan)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Welcome Banner */}
      <div
        className="glass-card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.18) 0%, rgba(139, 92, 246, 0.12) 100%)',
          border: '1px solid var(--border-accent)',
        }}
      >
        <div>
          <div className="badge badge-success" style={{ marginBottom: '8px' }}>Senior Dental Surgeon</div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: '700' }}>
            Doctor Clinical Workstation
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Review AI tooth detection findings, write clinical notes, prescribe medications, and issue diagnostic reports.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => navigate('/doctor/clinical-visit')}
            className="btn-primary"
          >
            <PlusCircle size={18} />
            <span>New Clinical Visit</span>
          </button>

          <button
            onClick={() => navigate('/workspace')}
            className="btn-secondary"
          >
            <Sparkles size={18} color="var(--primary-teal)" />
            <span>AI Analysis Viewer</span>
          </button>

          <button
            onClick={() => navigate('/doctor/reports')}
            className="btn-secondary"
          >
            <FileText size={18} />
            <span>Reports</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {doctorStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>{stat.title}</span>
                <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                  <Icon size={20} color={stat.color} />
                </div>
              </div>
              <div>
                <h3 style={{ fontSize: '28px', fontWeight: '700', fontFamily: 'var(--font-heading)', color: '#fff' }}>{stat.count}</h3>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{stat.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Patients Needing Review & AI Highlight */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Waiting Patients List */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Patient Consultation Queue</h3>
            <span className="badge badge-info">{patients.length} Active Patients</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {patients.map(p => (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '10px',
                  border: '1px solid var(--border-glass)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>{p.name}</span>
                    <span style={{ fontSize: '12px', color: 'var(--primary-teal)', fontWeight: '600' }}>({p.id})</span>
                    <span className="badge badge-warning">{p.status}</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Last Visit: {p.lastVisit} • Medical: {p.medicalHistory?.join(', ') || 'None noted'}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => { selectPatientById(p.id); navigate('/workspace'); }}
                    className="btn-primary"
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                  >
                    Open Workspace
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Diagnostics Highlight Card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid var(--border-accent)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={20} color="var(--primary-teal)" />
            <h3 style={{ fontSize: '16px', fontWeight: '600' }}>AI Analysis Ready</h3>
          </div>

          <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', height: '160px' }}>
            <img
              src={analysisResult.xray_url}
              alt="X-ray AI preview"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(15, 23, 42, 0.9), transparent)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '12px',
              }}
            >
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>
                Caries Detected on Tooth #16
              </p>
              <p style={{ fontSize: '11px', color: 'var(--primary-teal)' }}>
                Confidence: {(analysisResult.findings[0]?.confidence * 100).toFixed(0)}% • Model: {analysisResult.model_version}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/workspace')}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <span>Inspect X-ray & Bounding Boxes</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
