import React from 'react';
import { usePatients } from '../../context/PatientContext';
import { History, UserPlus, Stethoscope, Sparkles, FileText, Calendar, CheckCircle2 } from 'lucide-react';

export const TimelineModule = () => {
  const { activePatient } = usePatients();

  const timelineEvents = [
    {
      id: 1,
      title: 'Scheduled Follow-up Appointment',
      date: '2026-08-20 (Upcoming)',
      category: 'Follow-up',
      icon: Calendar,
      color: 'var(--status-warning)',
      desc: 'Post-restoration checkup for Tooth #16 composite resin.'
    },
    {
      id: 2,
      title: 'Diagnostic AI Radiology Report Issued',
      date: '2026-08-12 10:30 AM',
      category: 'Report',
      icon: FileText,
      color: 'var(--secondary-cyan)',
      desc: 'Signed report #REP-2026-904 finalized by Dr. Twahir Mohammed.'
    },
    {
      id: 3,
      title: 'AI Neural Network Analysis Completed',
      date: '2026-08-12 10:03 AM',
      category: 'AI Analysis',
      icon: Sparkles,
      color: 'var(--primary-teal)',
      desc: 'DentaVisionNet v1.0.0 detected Caries on Tooth #16 (92% Confidence).'
    },
    {
      id: 4,
      title: 'Clinical Consultation Visit Logged',
      date: '2026-08-10 02:15 PM',
      category: 'Clinical Visit',
      icon: Stethoscope,
      color: 'var(--accent-purple)',
      desc: 'Chief Complaint: Sharp pain in lower right molar on mastication.'
    },
    {
      id: 5,
      title: 'Initial Intake Registration',
      date: '2026-08-05 09:00 AM',
      category: 'Registration',
      icon: UserPlus,
      color: 'var(--status-success)',
      desc: 'Patient record created by Receptionist Sneha Sahadevan.'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <History size={24} color="var(--primary-teal)" />
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', fontFamily: 'var(--font-heading)' }}>
              Chronological Patient Journey Timeline
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Patient: <strong>{activePatient?.name} ({activePatient?.id})</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Vertical Timeline */}
      <div className="glass-card" style={{ padding: '32px' }}>
        <div style={{ position: 'relative', borderLeft: '2px dashed var(--border-glass)', paddingLeft: '28px', marginLeft: '12px' }}>
          {timelineEvents.map((ev, index) => {
            const Icon = ev.icon;
            return (
              <div key={ev.id} style={{ position: 'relative', marginBottom: index === timelineEvents.length - 1 ? 0 : '32px' }}>
                {/* Timeline Point Dot */}
                <div
                  style={{
                    position: 'absolute',
                    left: '-41px',
                    top: '0',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--bg-dark-surface)',
                    border: `2px solid ${ev.color}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 0 10px ${ev.color}`,
                  }}
                >
                  <Icon size={12} color={ev.color} />
                </div>

                {/* Event Card */}
                <div
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '10px',
                    padding: '16px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span className="badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: ev.color, border: `1px solid ${ev.color}` }}>
                      {ev.category}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{ev.date}</span>
                  </div>

                  <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#fff', marginTop: '6px' }}>
                    {ev.title}
                  </h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {ev.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
