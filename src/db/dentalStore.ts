import {
  DOCTORS,
  INITIAL_APPOINTMENTS,
  INITIAL_QUESTIONS,
} from '../data/seedData';
import { Appointment, DentalQuestion, QuestionTopic } from '../types/dental';

const APPOINTMENTS_KEY = 'dentora_appointments_v2';
const QUESTIONS_KEY = 'dentora_questions_v2';

export function loadAppointments(): Appointment[] {
  try {
    const raw = localStorage.getItem(APPOINTMENTS_KEY);
    if (!raw) {
      localStorage.setItem(
        APPOINTMENTS_KEY,
        JSON.stringify(INITIAL_APPOINTMENTS),
      );
      return INITIAL_APPOINTMENTS;
    }
    const parsed = JSON.parse(raw) as Appointment[];
    return Array.isArray(parsed) ? parsed : INITIAL_APPOINTMENTS;
  } catch {
    return INITIAL_APPOINTMENTS;
  }
}

export function saveAppointment(
  newApt: Omit<Appointment, 'id' | 'status' | 'createdAt'>,
): { ok: true; appointment: Appointment; appointments: Appointment[] } | { ok: false; error: string } {
  const existing = loadAppointments();
  const conflict = existing.find(
    (item) =>
      item.status === 'Confirmed' &&
      item.doctorId === newApt.doctorId &&
      item.date === newApt.date &&
      item.timeSlot === newApt.timeSlot,
  );

  if (conflict) {
    return {
      ok: false,
      error:
        'This time slot is already reserved for the selected specialist. Please pick another time.',
    };
  }

  const appointment: Appointment = {
    ...newApt,
    id: `apt-${Date.now().toString().slice(-5)}`,
    status: 'Confirmed',
    createdAt: new Date().toISOString().slice(0, 10),
  };

  const updated = [appointment, ...existing];
  localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(updated));
  return { ok: true, appointment, appointments: updated };
}

export function rescheduleAppointment(
  id: string,
  newDate: string,
  newTimeSlot: string,
): { ok: true; appointments: Appointment[] } | { ok: false; error: string } {
  const existing = loadAppointments();
  const target = existing.find((apt) => apt.id === id);
  if (!target) {
    return { ok: false, error: 'Appointment not found.' };
  }

  const conflict = existing.find(
    (item) =>
      item.id !== id &&
      item.status === 'Confirmed' &&
      item.doctorId === target.doctorId &&
      item.date === newDate &&
      item.timeSlot === newTimeSlot,
  );

  if (conflict) {
    return {
      ok: false,
      error:
        'That slot is already reserved for this specialist. Please select another time.',
    };
  }

  const updated = existing.map((apt) =>
    apt.id === id
      ? { ...apt, date: newDate, timeSlot: newTimeSlot, status: 'Confirmed' as const }
      : apt,
  );
  localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(updated));
  return { ok: true, appointments: updated };
}

export function cancelAppointment(id: string): Appointment[] {
  const existing = loadAppointments();
  const updated = existing.map((apt) =>
    apt.id === id ? { ...apt, status: 'Cancelled' as const } : apt,
  );
  localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(updated));
  return updated;
}

export function loadQuestions(): DentalQuestion[] {
  try {
    const raw = localStorage.getItem(QUESTIONS_KEY);
    if (!raw) {
      localStorage.setItem(QUESTIONS_KEY, JSON.stringify(INITIAL_QUESTIONS));
      return INITIAL_QUESTIONS;
    }
    const parsed = JSON.parse(raw) as DentalQuestion[];
    return Array.isArray(parsed) ? parsed : INITIAL_QUESTIONS;
  } catch {
    return INITIAL_QUESTIONS;
  }
}

export function saveQuestion(
  input: Pick<
    DentalQuestion,
    'patientName' | 'patientEmail' | 'topic' | 'question'
  >,
): DentalQuestion[] {
  const existing = loadQuestions();
  const entry: DentalQuestion = {
    id: `q-${Date.now().toString().slice(-5)}`,
    patientName: input.patientName.trim(),
    patientEmail: input.patientEmail.trim(),
    topic: input.topic as QuestionTopic,
    question: input.question.trim(),
    createdAt: new Date().toISOString().slice(0, 10),
    status: 'Pending Review',
  };

  const updated = [entry, ...existing];
  localStorage.setItem(QUESTIONS_KEY, JSON.stringify(updated));
  return updated;
}

export function replyToQuestion(
  questionId: string,
  doctorId: string,
  answerText: string,
): DentalQuestion[] {
  const existing = loadQuestions();
  const doctor = DOCTORS.find((d) => d.id === doctorId) || DOCTORS[0];

  const updated = existing.map((item) =>
    item.id === questionId
      ? {
          ...item,
          answeredByDoctorName: doctor.name,
          answeredByRole: doctor.role,
          answer: answerText.trim(),
          status: 'Answered' as const,
        }
      : item,
  );

  localStorage.setItem(QUESTIONS_KEY, JSON.stringify(updated));
  return updated;
}
