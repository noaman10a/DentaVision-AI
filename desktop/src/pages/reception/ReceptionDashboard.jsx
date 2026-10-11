import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatients } from '../../context/PatientContext';
import { 
  Users, 
  UserPlus, 
  Search, 
  Calendar, 
  Clock, 
  CreditCard, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { PatientRegistrationModal } from './PatientRegistrationModal';

export const ReceptionDashboard = () => {
  const navigate = useNavigate();
  const { patients, selectPatientById } = usePatients();
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const stats = [
    { title: "Today's Patients", count: "14", change: "+3 from yesterday", icon: Users, color: 'var(--primary-teal)' },
    { title: "Scheduled Appointments", count: "8", change: "2 pending check-in", icon: Calendar, color: 'var(--secondary-cyan)' },
    { title: "Pending Follow-ups", count: "5", change: "Requires callback", icon: Clock, color: 'var(--status-warning)' },
    { title: "Awaiting X-rays", count: "3", change: "Queue ready", icon: Sparkles, color: 'var(--accent-purple)' },
  ];

  const recentActivities = [
    { id: 1, text: 'Amina Rahmani checked in for X-ray analysis', time: '10 mins ago', type: 'Check-in' },
    { id: 2, text: 'Rohan Sharma registered by Reception Desk', time: '25 mins ago', type: 'Registration' },
    { id: 3, text: 'Vikramaditya V payment receipt #INV-889 generated', time: '40 mins ago', type: 'Payment' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner & Quick Action Buttons */}
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
          <div className="badge badge-info" style={{ marginBottom: '8px' }}>Reception Desk Lead</div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>
            Welcome to Reception Control
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Manage daily check-ins, register new clinic patients, and coordinate X-ray workflows.
          </p>
        </div>

        {/* Action Button Grid */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowRegisterModal(true)}
            className="btn-primary"
          >
            <UserPlus size={18} />
            <span>Register Patient</span>
          </button>

          <button
            onClick={() => navigate('/reception/search')}
            className="btn-secondary"
          >
            <Search size={18} />
            <span>Search Patient</span>
          </button>

          <button
            onClick={() => alert('Appointment Scheduling module loaded.')}
            className="btn-secondary"
          >
            <Calendar size={18} />
            <span>Schedule</span>
          </button>

          <button
            onClick={() => alert('Billing & Payment receipts module loaded.')}
            className="btn-secondary"
          >
            <CreditCard size={18} />
            <span>Payments</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>{stat.title}</span>
                <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'var(--btn-secondary-bg)' }}>
                  <Icon size={20} color={stat.color} />
                </div>
              </div>
              <div>
                <h3 style={{ fontSize: '28px', fontWeight: '700', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>{stat.count}</h3>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{stat.change}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Patient Queue & Recent Activity Feed Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Today's Check-in Table */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>Active Reception Patient Queue</h3>
            <button
              onClick={() => navigate('/reception/search')}
              style={{ background: 'none', border: 'none', color: 'var(--primary-teal)', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <span>View All ({patients.length})</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '10px 12px' }}>Patient ID</th>
                  <th style={{ padding: '10px 12px' }}>Full Name</th>
                  <th style={{ padding: '10px 12px' }}>Phone</th>
                  <th style={{ padding: '10px 12px' }}>Status</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                    <td style={{ padding: '12px', fontWeight: '600', color: 'var(--primary-teal)' }}>{p.id}</td>
                    <td style={{ padding: '12px', fontWeight: '500', color: 'var(--text-primary)' }}>{p.name}</td>
                    <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{p.phone}</td>
                    <td style={{ padding: '12px' }}>
                      <span className={`badge ${
                        p.status === 'Awaiting Review' ? 'badge-warning' :
                        p.status === 'Waiting' ? 'badge-info' : 'badge-success'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <button
                        onClick={() => {
                          selectPatientById(p.id);
                          navigate('/workspace');
                        }}
                        className="btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        Open Workspace
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Clinic Activity */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>Recent Reception Feed</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentActivities.map((act) => (
              <div
                key={act.id}
                style={{
                  padding: '12px',
                  backgroundColor: 'var(--btn-secondary-bg)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-glass)',
                  transition: 'var(--transition-theme)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span className="badge badge-info" style={{ fontSize: '10px' }}>{act.type}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{act.time}</span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-primary)', marginTop: '4px' }}>
                  {act.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Patient Registration Modal */}
      {showRegisterModal && (
        <PatientRegistrationModal onClose={() => setShowRegisterModal(false)} />
      )}
    </div>
  );
};
