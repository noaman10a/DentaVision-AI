import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Plus,
  ArrowLeft,
  Users,
  Search,
  ArrowRight
} from 'lucide-react';

export const PatientWorkspace = () => {
  const navigate = useNavigate();
  const { activePatient, setActivePatient, selectPatientById, patients } = usePatients();
  const { runAIAnalysis, isAnalyzing } = useAI();
  const [activeTab, setActiveTab] = useState('xrays');

  if (!activePatient) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Navigation Bar */}
        <div className="glass-card no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => navigate('/doctor')}
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <ArrowLeft size={16} />
              <span>Back to Dashboard</span>
            </button>
            <h3 style={{ fontSize: '18px', fontWeight: '700', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
              Clinical Workspace
            </h3>
          </div>
          <button
            onClick={() => navigate('/reception/search')}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Search size={16} />
            <span>Search Patient Directory</span>
          </button>
        </div>

        {/* Empty Workspace Guide */}
        <div
          className="glass-card"
          style={{
            textAlign: 'center',
            padding: '48px 24px',
            background: 'var(--bg-dark-card)',
            border: '1px dashed var(--border-accent)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-teal-glow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary-teal)',
              marginBottom: '8px',
            }}
          >
            <Users size={32} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>
            No Patient Selected
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '480px', lineHeight: '1.5' }}>
            The clinical workstation is in standby mode. Please select a patient from today's consultation queue below or search the clinic records to load X-rays, diagnostic tools, and clinical notes.
          </p>
        </div>

        {/* Quick Patient Selector from Consultation Queue */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>
              Select Patient from Today's Queue
            </h4>
            <span className="badge badge-info">{patients.length} Registered Patients</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
            {patients.map(p => (
              <div
                key={p.id}
                className="glass-card glass-card-interactive"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px',
                  backgroundColor: 'var(--btn-secondary-bg)',
                }}
                onClick={() => selectPatientById(p.id)}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{p.name}</span>
                    <span style={{ fontSize: '11px', color: 'var(--primary-teal)', fontWeight: '600' }}>({p.id})</span>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {p.gender} • Last Visit: {p.lastVisit}
                  </p>
                </div>
                <button
                  className="btn-primary"
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                >
                  <span>Open</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
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
          background: 'var(--primary-teal-glow)',
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
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)' }}>
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

        {/* AI Trigger and Navigation buttons */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/doctor')}
            className="btn-secondary no-print"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Return to Doctor Dashboard"
          >
            <ArrowLeft size={16} />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActivePatient(null)}
            className="btn-secondary no-print"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Deselect active patient and return to queue"
          >
            <Users size={16} />
            <span>Switch Patient</span>
          </button>

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
                backgroundColor: isActive ? 'var(--primary-teal-glow)' : 'transparent',
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
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: 'var(--text-primary)' }}>Demographics & Contact Info</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: 'var(--text-primary)' }}>
                <p><strong style={{ color: 'var(--text-secondary)' }}>Address:</strong> {activePatient.address}</p>
                <p><strong style={{ color: 'var(--text-secondary)' }}>Email:</strong> {activePatient.email || 'None'}</p>
                <p><strong style={{ color: 'var(--text-secondary)' }}>Emergency Contact:</strong> {activePatient.emergencyContact}</p>
              </div>
            </div>

            <div className="glass-card">
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: 'var(--text-primary)' }}>Medical Flags & Allergies</h3>
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
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: 'var(--text-primary)' }}>Detailed Dental & Medical History</h3>
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
