import React, { useState } from 'react';
import { usePatients } from '../../context/PatientContext';
import { useAI } from '../../context/AIContext';
import { XRayViewer } from '../../components/ai/XRayViewer';
import { ClinicalVisitScreen } from './ClinicalVisitScreen';
import { PrescriptionModule } from './PrescriptionModule';
import { ReportModule } from './ReportModule';
import { DocumentsModule } from './DocumentsModule';
import { TimelineModule } from './TimelineModule';
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  HeartPulse, 
  Stethoscope, 
  Sparkles, 
  FileText, 
  FolderOpen, 
  History, 
  Pill,
  Plus
} from 'lucide-react';

export const PatientWorkspace = () => {
  const { activePatient } = usePatients();
  const { runAIAnalysis, isAnalyzing } = useAI();
  const [activeTab, setActiveTab] = useState('xrays'); // 'overview', 'visits', 'history', 'xrays', 'documents', 'reports', 'timeline'

  if (!activePatient) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
        <User size={40} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
        <h3>No Patient Workspace Selected</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Select a patient from search or dashboard to launch workspace.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Patient Header Card */}
      <div
        className="glass-card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          background: 'linear-gradient(135deg, rgba(19, 27, 46, 0.9) 0%, rgba(30, 41, 59, 0.7) 100%)',
          border: '1px solid var(--border-accent)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-teal-glow)',
              border: '2px solid var(--primary-teal)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              fontWeight: '700',
              color: 'var(--primary-teal)',
            }}
          >
            {activePatient.name.charAt(0)}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', fontWeight: '700', color: '#fff' }}>
                {activePatient.name}
              </h2>
              <span className="badge badge-info">{activePatient.id}</span>
              <span className="badge badge-success">{activePatient.status}</span>
            </div>
            <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              <span>{activePatient.gender}, DOB: {activePatient.dob}</span>
              <span>•</span>
              <span>Phone: {activePatient.phone}</span>
              <span>•</span>
              <span>Last Visit: {activePatient.lastVisit}</span>
            </div>
          </div>
        </div>

        {/* AI Trigger button */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => runAIAnalysis(activePatient.id)}
            className="btn-primary"
            disabled={isAnalyzing}
          >
            <Sparkles size={18} />
            <span>{isAnalyzing ? 'Running Neural Net Inference...' : 'Trigger AI Dental Analysis'}</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '2px', overflowX: 'auto' }}>
        {[
          { id: 'xrays', label: 'X-rays & AI Engine', icon: Sparkles },
          { id: 'overview', label: 'Patient Overview', icon: User },
          { id: 'visits', label: 'Clinical Visits', icon: Stethoscope },
          { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
          { id: 'history', label: 'Medical History', icon: HeartPulse },
          { id: 'documents', label: 'Documents', icon: FolderOpen },
          { id: 'reports', label: 'Diagnostic Reports', icon: FileText },
          { id: 'timeline', label: 'History Timeline', icon: History },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--primary-teal)' : '2px solid transparent',
                backgroundColor: isActive ? 'rgba(20, 184, 166, 0.1)' : 'transparent',
                color: isActive ? 'var(--primary-teal)' : 'var(--text-secondary)',
                borderRadius: '8px 8px 0 0',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: isActive ? '600' : '500',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
              }}
            >
              <Icon size={16} color={isActive ? 'var(--primary-teal)' : 'currentColor'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Display */}
      <div className="fade-in">
        {activeTab === 'xrays' && <XRayViewer />}

        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="glass-card">
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Demographics & Contact Info</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <p><strong>Address:</strong> {activePatient.address}</p>
                <p><strong>Email:</strong> {activePatient.email || 'None'}</p>
                <p><strong>Emergency Contact:</strong> {activePatient.emergencyContact}</p>
              </div>
            </div>

            <div className="glass-card">
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Medical Flags & Allergies</h3>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {activePatient.medicalHistory?.map((med, i) => (
                  <span key={i} className="badge badge-warning" style={{ fontSize: '12px', padding: '6px 12px' }}>
                    {med}
                  </span>
                )) || <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No medical alerts recorded.</p>}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'visits' && <ClinicalVisitScreen />}
        {activeTab === 'prescriptions' && <PrescriptionModule />}
        {activeTab === 'history' && (
          <div className="glass-card">
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Detailed Dental & Medical History</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Comprehensive systemic conditions, past restorations, root canal treatments, and periodontal records for {activePatient.name}.
            </p>
          </div>
        )}
        {activeTab === 'documents' && <DocumentsModule />}
        {activeTab === 'reports' && <ReportModule />}
        {activeTab === 'timeline' && <TimelineModule />}
      </div>
    </div>
  );
};
