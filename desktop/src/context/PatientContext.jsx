import React, { createContext, useContext, useState } from 'react';

const PatientContext = createContext();

const initialPatients = [
  {
    id: 'PT-2026-0705',
    name: 'Amina Rahmani',
    phone: '+91 98765 43210',
    email: 'amina.r@example.com',
    dob: '1992-04-14',
    gender: 'Female',
    address: '42 MG Road, Suite 3, Bengaluru, KA',
    medicalHistory: ['Penicillin Allergy', 'Mild Hypertension'],
    emergencyContact: 'Farhan Rahmani (+91 98765 43211)',
    lastVisit: '2026-08-10',
    status: 'Awaiting Review',
    xrayCount: 3,
    reportsCount: 2,
    visits: [
      {
        id: 'VST-101',
        date: '2026-08-10',
        doctor: 'Dr. Twahir Mohammed',
        chiefComplaint: 'Sharp pain in lower right molar (Tooth 46) during mastication.',
        examination: 'Localized deep occlusal caries on tooth 46. Percussion test sensitive.',
        diagnosis: 'Dentin Caries / Suspected Reversible Pulpitis on #46.',
        treatmentPlan: 'Composite restoration or indirect pulp cap following AI X-ray verification.',
        prescriptions: [
          { medicine: 'Amoxicillin', strength: '500mg', dose: '1 Capsule', frequency: 'TDS (3x/day)', timing: 'After Food', duration: '5 Days' },
          { medicine: 'Ibuprofen', strength: '400mg', dose: '1 Tablet', frequency: 'BD (2x/day)', timing: 'After Food', duration: '3 Days' }
        ]
      },
      {
        id: 'VST-088',
        date: '2026-05-18',
        doctor: 'Dr. Twahir Mohammed',
        chiefComplaint: 'Routine scaling & dental checkup.',
        examination: 'Mild calculus buildup on lower anterior teeth.',
        diagnosis: 'Gingivitis Class 1.',
        treatmentPlan: 'Full mouth scaling and polishing done.',
        prescriptions: [
          { medicine: 'Chlorhexidine Mouthwash 0.2%', strength: '100ml', dose: '10ml', frequency: 'BD (2x/day)', timing: 'After Brushing', duration: '7 Days' }
        ]
      }
    ]
  },
  {
    id: 'PT-2026-0708',
    name: 'Rohan Sharma',
    phone: '+91 91234 56789',
    email: 'rohan.s@example.com',
    dob: '1988-11-22',
    gender: 'Male',
    address: '108 Indiranagar 10th Main, Bengaluru',
    medicalHistory: ['Asthma (Inhaler)'],
    emergencyContact: 'Priya Sharma (+91 91234 56790)',
    lastVisit: '2026-08-11',
    status: 'Waiting',
    xrayCount: 1,
    reportsCount: 1,
    visits: []
  },
  {
    id: 'PT-2026-0712',
    name: 'Vikramaditya V',
    phone: '+91 99887 76655',
    email: 'vikram.v@example.com',
    dob: '1975-02-08',
    gender: 'Male',
    address: '15 Koramangala 4th Block, Bengaluru',
    medicalHistory: ['Type 2 Diabetes'],
    emergencyContact: 'Sunita V (+91 99887 76650)',
    lastVisit: '2026-08-12',
    status: 'Registered',
    xrayCount: 0,
    reportsCount: 0,
    visits: []
  }
];

export const PatientProvider = ({ children }) => {
  const [patients, setPatients] = useState(initialPatients);
  const [activePatient, setActivePatient] = useState(initialPatients[0]);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch real patient records from Express Backend Gateway
  React.useEffect(() => {
    const fetchRealPatients = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/v1/patients');
        if (response.ok) {
          const json = await response.json();
          if (json.data && Array.isArray(json.data) && json.data.length > 0) {
            const mapped = json.data.map(p => ({
              id: p.id || 'PT-2026-0705',
              name: p.name || 'Amina Rahmani',
              phone: p.phone || '+91 98765 43210',
              email: p.email || 'amina.r@example.com',
              dob: p.dob ? new Date(p.dob).toISOString().split('T')[0] : '1992-04-14',
              gender: p.gender || 'Female',
              address: p.address || '42 MG Road, Suite 3, Bengaluru, KA',
              medicalHistory: p.medicalHistory ? p.medicalHistory.map(m => m.condition) : ['Penicillin Allergy', 'Mild Hypertension'],
              emergencyContact: 'Farhan Rahmani (+91 98765 43211)',
              lastVisit: p.updatedAt ? new Date(p.updatedAt).toISOString().split('T')[0] : '2026-08-10',
              status: p.status || 'Awaiting Review',
              xrayCount: 3,
              reportsCount: 2,
              visits: p.visits || initialPatients[0].visits
            }));
            setPatients(mapped);
            setActivePatient(mapped[0]);
          }
        }
      } catch (err) {
        console.warn('Real patients fetch (http://localhost:5000/api/v1/patients) warning:', err);
      }
    };
    fetchRealPatients();
  }, []);

  const registerPatient = (newPatientData) => {
    const newId = `PT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const createdPatient = {
      id: newId,
      ...newPatientData,
      lastVisit: new Date().toISOString().split('T')[0],
      status: 'Registered',
      xrayCount: 0,
      reportsCount: 0,
      visits: []
    };
    setPatients(prev => [createdPatient, ...prev]);
    setActivePatient(createdPatient);
    return createdPatient;
  };

  const selectPatientById = (id) => {
    const found = patients.find(p => p.id === id);
    if (found) {
      setActivePatient(found);
    }
  };

  const addClinicalVisit = (patientId, visitData) => {
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        const newVisit = {
          id: `VST-${Math.floor(100 + Math.random() * 900)}`,
          date: new Date().toISOString().split('T')[0],
          doctor: 'Dr. Twahir Mohammed',
          ...visitData
        };
        const updated = {
          ...p,
          lastVisit: newVisit.date,
          status: 'Reviewed',
          visits: [newVisit, ...p.visits]
        };
        if (activePatient?.id === patientId) {
          setActivePatient(updated);
        }
        return updated;
      }
      return p;
    }));
  };

  const filteredPatients = patients.filter(p => {
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.phone.includes(q)
    );
  });

  return (
    <PatientContext.Provider
      value={{
        patients: filteredPatients,
        allPatients: patients,
        activePatient,
        setActivePatient,
        selectPatientById,
        searchQuery,
        setSearchQuery,
        registerPatient,
        addClinicalVisit
      }}
    >
      {children}
    </PatientContext.Provider>
  );
};

export const usePatients = () => {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('usePatients must be used within a PatientProvider');
  }
  return context;
};
