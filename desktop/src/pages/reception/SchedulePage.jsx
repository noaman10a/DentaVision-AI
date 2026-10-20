import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatients } from '../../context/PatientContext';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Plus, 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  X, 
  Search,
  Filter,
  Stethoscope,
  Phone,
  AlertCircle
} from 'lucide-react';

const initialAppointments = [
  {
    id: 'APT-101',
    date: '2026-08-10',
    time: '09:30 AM',
    patientId: 'PT-2026-0705',
    patientName: 'Amina Rahmani',
    phone: '+91 98765 43210',
    doctor: 'Dr. Twahir Mohammed',
    type: 'OPG Radiograph & AI Dental Caries Analysis',
    status: 'Waiting in Lounge',
    notes: 'Severe pain on lower right quadrant during mastication.'
  },
  {
    id: 'APT-102',
    date: '2026-08-10',
    time: '11:15 AM',
    patientId: 'PT-2026-0708',
    patientName: 'Rohan Sharma',
    phone: '+91 91234 56789',
    doctor: 'Dr. Twahir Mohammed',
    type: 'Bitewing X-Ray & Routine Checkup',
    status: 'Confirmed',
    notes: 'Annual preventive dental screening and scaling.'
  },
  {
    id: 'APT-103',
    date: '2026-08-10',
    time: '02:30 PM',
    patientId: 'PT-2026-0712',
    patientName: 'Vikramaditya V',
    phone: '+91 99887 76655',
    doctor: 'Dr. Twahir Mohammed',
    type: 'Consultation & Periodontal Screening',
    status: 'Pending Check-in',
    notes: 'Diabetic patient referral for gum sensitivity.'
  },
  {
    id: 'APT-104',
    date: '2026-08-11',
    time: '10:00 AM',
    patientId: 'PT-2026-0705',
    patientName: 'Amina Rahmani',
    phone: '+91 98765 43210',
    doctor: 'Dr. Twahir Mohammed',
    type: 'Post-Restoration Review',
    status: 'Confirmed',
    notes: 'Follow-up inspection of tooth #46 composite restoration.'
  }
];

export const SchedulePage = () => {
  const navigate = useNavigate();
  const { patients } = usePatients();

  // Selected date defaults to 2026-08-10 (the clinical demo date) or current date
  const [selectedDate, setSelectedDate] = useState('2026-08-10');
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 7, 1)); // August 2026
  const [appointments, setAppointments] = useState(initialAppointments);
  const [showAddModal, setShowAddModal] = useState(false);
  const [feedback, setFeedback] = useState('');

  // New Appointment Form State
  const [newApt, setNewApt] = useState({
    patientId: patients[0]?.id || 'PT-2026-0705',
    time: '10:00 AM',
    date: selectedDate,
    doctor: 'Dr. Twahir Mohammed',
    type: 'OPG Radiograph & AI Dental Caries Analysis',
    notes: ''
  });

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);

  // Appointments for the selected date
  const filteredAppointments = appointments.filter(a => a.date === selectedDate);

  const handleCreateAppointment = (e) => {
    e.preventDefault();
    const matchedPatient = patients.find(p => p.id === newApt.patientId) || patients[0];

    const created = {
      id: `APT-${Math.floor(100 + Math.random() * 900)}`,
      date: newApt.date,
      time: newApt.time,
      patientId: matchedPatient.id,
      patientName: matchedPatient.name,
      phone: matchedPatient.phone,
      doctor: newApt.doctor,
      type: newApt.type,
      status: 'Confirmed',
      notes: newApt.notes || 'Scheduled appointment.'
    };

    setAppointments(prev => [created, ...prev]);
    setSelectedDate(newApt.date);
    setShowAddModal(false);
    setFeedback(`Appointment booked for ${matchedPatient.name} on ${newApt.date} at ${newApt.time}`);
    setTimeout(() => setFeedback(''), 4000);
  };

  const updateStatus = (id, newStatus) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
    setFeedback(`Appointment status updated to ${newStatus}`);
    setTimeout(() => setFeedback(''), 3000);
  };

  const cancelAppointment = (id) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
    setFeedback('Appointment cancelled.');
    setTimeout(() => setFeedback(''), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Bar */}
      <div 
        className="glass-card" 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          background: 'var(--primary-teal-glow)', 
          border: '1px solid var(--border-accent)',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => navigate('/reception')}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <ArrowLeft size={16} />
            <span>Back to Queue</span>
          </button>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)' }}>
              Appointment Scheduling & Calendar
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Manage clinic bookings, check-in waiting patients, and coordinate doctor appointment slots
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setNewApt(prev => ({ ...prev, date: selectedDate }));
            setShowAddModal(true);
          }}
          className="btn-primary"
        >
          <Plus size={18} />
          <span>Book New Appointment</span>
        </button>
      </div>

      {feedback && (
        <div className="badge badge-success fade-in" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', fontSize: '13px' }}>
          <CheckCircle2 size={16} />
          <span>{feedback}</span>
        </div>
      )}

      {/* Main Calendar & Appointments Split View */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '20px' }}>
        
        {/* Calendar Picker Card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
              {monthNames[month]} {year}
            </h3>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button 
                onClick={handlePrevMonth}
                className="btn-secondary"
                style={{ padding: '6px 10px' }}
                title="Previous Month"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={handleNextMonth}
                className="btn-secondary"
                style={{ padding: '6px 10px' }}
                title="Next Month"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', gap: '4px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Month Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
            {/* Empty offset days */}
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`empty-${i}`} style={{ height: '42px' }} />
            ))}

            {/* Days of current month */}
            {Array.from({ length: totalDays }).map((_, i) => {
              const dayNum = i + 1;
              const formattedDay = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
              const formattedMonth = (month + 1) < 10 ? `0${month + 1}` : `${month + 1}`;
              const dateString = `${year}-${formattedMonth}-${formattedDay}`;
              const isSelected = selectedDate === dateString;
              const hasAppointments = appointments.some(a => a.date === dateString);

              return (
                <button
                  key={dateString}
                  onClick={() => setSelectedDate(dateString)}
                  style={{
                    height: '42px',
                    borderRadius: '8px',
                    border: isSelected ? '2px solid var(--primary-teal)' : '1px solid var(--border-glass)',
                    backgroundColor: isSelected ? 'var(--primary-teal-glow)' : 'var(--btn-secondary-bg)',
                    color: isSelected ? 'var(--primary-teal)' : 'var(--text-primary)',
                    fontWeight: isSelected ? '700' : '500',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ fontSize: '13px' }}>{dayNum}</span>
                  {hasAppointments && (
                    <span 
                      style={{ 
                        width: '5px', 
                        height: '5px', 
                        borderRadius: '50%', 
                        backgroundColor: 'var(--primary-teal)',
                        marginTop: '2px'
                      }} 
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Selected Date: <strong style={{ color: 'var(--primary-teal)' }}>{selectedDate}</strong>
            </span>
            <button 
              onClick={() => setSelectedDate('2026-08-10')} 
              className="btn-secondary" 
              style={{ padding: '4px 8px', fontSize: '11px' }}
            >
              Reset to Today
            </button>
          </div>
        </div>

        {/* Date's Appointments List Card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
                Appointments for {selectedDate}
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {filteredAppointments.length} patient consultations scheduled
              </p>
            </div>
            <span className="badge badge-info">{selectedDate}</span>
          </div>

          {filteredAppointments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 16px', border: '1px dashed var(--border-glass)', borderRadius: '8px' }}>
              <CalendarIcon size={36} color="var(--text-muted)" style={{ marginBottom: '8px' }} />
              <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>No Appointments for this Date</p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                There are no scheduled patient visits on {selectedDate}.
              </p>
              <button
                onClick={() => {
                  setNewApt(prev => ({ ...prev, date: selectedDate }));
                  setShowAddModal(true);
                }}
                className="btn-secondary"
                style={{ marginTop: '12px', fontSize: '12px' }}
              >
                <Plus size={14} />
                <span>Book on this Date</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredAppointments.map(apt => (
                <div 
                  key={apt.id} 
                  className="glass-card"
                  style={{ 
                    padding: '14px', 
                    backgroundColor: 'var(--btn-secondary-bg)',
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '10px',
                    borderLeft: `4px solid ${
                      apt.status === 'Waiting in Lounge' ? 'var(--status-warning)' :
                      apt.status === 'Confirmed' ? 'var(--primary-teal)' :
                      apt.status === 'Completed' ? 'var(--status-success)' : 'var(--text-muted)'
                    }`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>
                          {apt.patientName}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--primary-teal)', fontWeight: '600' }}>
                          ({apt.patientId})
                        </span>
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--primary-teal)', fontWeight: '600', marginTop: '2px' }}>
                        {apt.type}
                      </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      <span className={`badge ${
                        apt.status === 'Waiting in Lounge' ? 'badge-warning' :
                        apt.status === 'Confirmed' ? 'badge-info' :
                        apt.status === 'Completed' ? 'badge-success' : 'badge-secondary'
                      }`}>
                        {apt.status}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                        <Clock size={12} />
                        <span>{apt.time}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    <span>Phone: {apt.phone}</span>
                    <span>•</span>
                    <span>Doctor: {apt.doctor}</span>
                  </div>

                  {apt.notes && (
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic', backgroundColor: 'rgba(0,0,0,0.1)', padding: '6px 8px', borderRadius: '4px' }}>
                      Note: {apt.notes}
                    </p>
                  )}

                  {/* Quick Action Buttons */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--border-glass)', paddingTop: '8px' }}>
                    {apt.status !== 'Waiting in Lounge' && (
                      <button
                        onClick={() => updateStatus(apt.id, 'Waiting in Lounge')}
                        className="btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '11px', color: 'var(--status-warning)' }}
                      >
                        Check-in to Lounge
                      </button>
                    )}
                    {apt.status !== 'Completed' && (
                      <button
                        onClick={() => updateStatus(apt.id, 'Completed')}
                        className="btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '11px', color: 'var(--status-success)' }}
                      >
                        Mark Completed
                      </button>
                    )}
                    <button
                      onClick={() => cancelAppointment(apt.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--status-error)', cursor: 'pointer', fontSize: '11px', padding: '4px 8px' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Book New Appointment Modal */}
      {showAddModal && (
        <div 
          style={{ 
            position: 'fixed', 
            inset: 0, 
            backgroundColor: 'rgba(15, 23, 42, 0.85)', 
            backdropFilter: 'blur(6px)', 
            zIndex: 100, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '20px' 
          }}
          onClick={() => setShowAddModal(false)}
        >
          <div 
            className="glass-card" 
            style={{ 
              maxWidth: '540px', 
              width: '100%', 
              padding: '24px', 
              border: '1px solid var(--border-accent)',
              display: 'flex', 
              flexDirection: 'column', 
              gap: '16px' 
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CalendarIcon size={20} color="var(--primary-teal)" />
                <h3 style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text-primary)' }}>
                  Book Dental Appointment
                </h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="input-label">Select Registered Patient *</label>
                <select
                  className="input-field"
                  value={newApt.patientId}
                  onChange={(e) => setNewApt({ ...newApt, patientId: e.target.value })}
                  required
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.id}) — {p.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="input-label">Appointment Date *</label>
                  <input
                    type="date"
                    className="input-field"
                    value={newApt.date}
                    onChange={(e) => setNewApt({ ...newApt, date: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="input-label">Time Slot *</label>
                  <select
                    className="input-field"
                    value={newApt.time}
                    onChange={(e) => setNewApt({ ...newApt, time: e.target.value })}
                    required
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="09:30 AM">09:30 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="10:30 AM">10:30 AM</option>
                    <option value="11:15 AM">11:15 AM</option>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="02:30 PM">02:30 PM</option>
                    <option value="03:30 PM">03:30 PM</option>
                    <option value="04:15 PM">04:15 PM</option>
                    <option value="05:00 PM">05:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="input-label">Attending Dental Specialist</label>
                <select
                  className="input-field"
                  value={newApt.doctor}
                  onChange={(e) => setNewApt({ ...newApt, doctor: e.target.value })}
                >
                  <option value="Dr. Twahir Mohammed">Dr. Twahir Mohammed (Oral & Maxillofacial Radiology)</option>
                  <option value="Dr. Sarah Johnson">Dr. Sarah Johnson (Endodontist)</option>
                  <option value="Dr. Rajesh Patel">Dr. Rajesh Patel (Orthodontist)</option>
                </select>
              </div>

              <div>
                <label className="input-label">Consultation Category / Procedure</label>
                <select
                  className="input-field"
                  value={newApt.type}
                  onChange={(e) => setNewApt({ ...newApt, type: e.target.value })}
                >
                  <option value="OPG Radiograph & AI Dental Caries Analysis">OPG Radiograph & AI Dental Caries Analysis</option>
                  <option value="Bitewing X-Ray & Routine Checkup">Bitewing X-Ray & Routine Checkup</option>
                  <option value="Endodontic Root Canal Evaluation">Endodontic Root Canal Evaluation</option>
                  <option value="Scaling & Periodontal Prophylaxis">Scaling & Periodontal Prophylaxis</option>
                  <option value="Composite Restoration Follow-up">Composite Restoration Follow-up</option>
                </select>
              </div>

              <div>
                <label className="input-label">Clinical Notes / Symptoms</label>
                <textarea
                  className="input-field"
                  rows={2}
                  value={newApt.notes}
                  onChange={(e) => setNewApt({ ...newApt, notes: e.target.value })}
                  placeholder="e.g. Chief complaint, tooth number, referred from doctor..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
