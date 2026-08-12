export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  reason: string;
  status: "scheduled" | "completed" | "cancelled";
}

const appointments: Appointment[] = [];

export const createAppointment = (
  appointmentData: Omit<Appointment, "id">
): Appointment => {
  const appointment: Appointment = {
    id: String(appointments.length + 1),
    ...appointmentData,
  };

  appointments.push(appointment);

  return appointment;
};

export const getAppointments = (): Appointment[] => {
  return appointments;
};

export const getAppointmentById = (
  id: string
): Appointment | undefined => {
  return appointments.find((appointment) => appointment.id === id);
};

export const updateAppointment = (
  id: string,
  appointmentData: Partial<Omit<Appointment, "id">>
): Appointment | undefined => {
  const appointment = appointments.find(
    (appointment) => appointment.id === id
  );

  if (!appointment) {
    return undefined;
  }

  Object.assign(appointment, appointmentData);

  return appointment;
};

export const deleteAppointment = (
  id: string
): boolean => {
  const index = appointments.findIndex(
    (appointment) => appointment.id === id
  );

  if (index === -1) {
    return false;
  }

  appointments.splice(index, 1);

  return true;
};