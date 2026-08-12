import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatients } from '../../context/PatientContext';
import { Search, UserCheck, Calendar, Phone, Mail, FileText, ArrowRight, Filter, ShieldAlert } from 'lucide-react';

export const PatientSearchPage = () => {
  const navigate = useNavigate();
  const { patients, searchQuery, setSearchQuery, selectPatientById } = usePatients();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Bar */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', fontWeight: '700' }}>
            Patient Directory & Search Engine
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Search registered clinic records by Patient ID, Name, or Phone Number
          </p>
        </div>
      </div>

      {/* Search Input Box */}
      <div className="glass-card" style={{ padding: '16px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={20} color="var(--primary-teal)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Search by Patient ID (e.g. PT-2026-0705), Name (e.g. Amina), or Phone (+91...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '44px', height: '46px', fontSize: '15px' }}
          />
        </div>
      </div>

      {/* Search Results Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {patients.length === 0 ? (
          <div className="glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
            <ShieldAlert size={40} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '600' }}>No Patient Records Found</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              No matches found for query "{searchQuery}". Try searching by ID or register a new patient.
            </p>
          </div>
        ) : (
          patients.map((patient) => (
            <div
              key={patient.id}
              className="glass-card glass-card-interactive"
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--primary-teal)', letterSpacing: '0.5px' }}>
                    {patient.id}
                  </span>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#fff', marginTop: '2px' }}>
                    {patient.name}
                  </h3>
                </div>
                <span className={`badge ${
                  patient.status === 'Awaiting Review' ? 'badge-warning' :
                  patient.status === 'Waiting' ? 'badge-info' : 'badge-success'
                }`}>
                  {patient.status}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone size={14} color="var(--text-muted)" />
                  <span>{patient.phone}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={14} color="var(--text-muted)" />
                  <span>{patient.email || 'No email registered'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={14} color="var(--text-muted)" />
                  <span>Last Visit: {patient.lastVisit}</span>
                </div>
              </div>

              {/* Medical History Tags */}
              {patient.medicalHistory?.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {patient.medicalHistory.map((med, i) => (
                    <span key={i} className="badge badge-warning" style={{ fontSize: '10px' }}>
                      {med}
                    </span>
                  ))}
                </div>
              )}

              {/* Card Footer Actions */}
              <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {patient.visits?.length || 0} Clinical Visits
                </span>
                <button
                  onClick={() => {
                    selectPatientById(patient.id);
                    navigate('/workspace');
                  }}
                  className="btn-primary"
                  style={{ padding: '6px 14px', fontSize: '12px' }}
                >
                  <span>Open Workspace</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
