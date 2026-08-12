export interface Patient {
  id: string;
  name: string;
  age?: number;
  gender?: string;
  phone?: string;
  createdAt: string;
}

const patients: Patient[] = [];

export const createPatient = (
  name: string,
  age?: number,
  gender?: string,
  phone?: string
): Patient => {
  const patient: Patient = {
    id: crypto.randomUUID(),
    name,
    age,
    gender,
    phone,
    createdAt: new Date().toISOString(),
  };

  patients.push(patient);

  return patient;
};

export const getPatients = (): Patient[] => {
  return patients;
};

export const getPatientById = (id: string): Patient | undefined => {
  return patients.find((patient) => patient.id === id);
};