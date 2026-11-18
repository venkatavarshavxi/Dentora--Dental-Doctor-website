import {
  BOOKING_FEE_INR,
  DOCTORS,
  INITIAL_APPOINTMENTS,
  INITIAL_QUESTIONS,
  MAX_SLOT_CAPACITY,
} from '../data/seedData';
import {
  Appointment,
  DentalQuestion,
  PaymentMethod,
  QuestionTopic,
} from '../types/dental';
import { isSundayDate } from '../utils/clinicDates';

const APPOINTMENTS_KEY = 'dentora_appointments_v2';
const QUESTIONS_KEY = 'dentora_questions_v2';

export interface SlotAvailability {
  confirmedInSlotCount: number;
  remainingSpots: number;
  isDoctorBooked: boolean;
  isCapacityFull: boolean;
  isUnavailable: boolean;
  statusLabel: string;
}

export function getSlotAvailability(
  appointments: Appointment[],
  doctorId: string,
  date: string,
  timeSlot: string,
  excludeAppointmentId?: string,
): SlotAvailability {
  const activeInSlot = appointments.filter(
    (item) =>
      item.id !== excludeAppointmentId &&
      item.status === 'Confirmed' &&
      item.date === date &&
      item.timeSlot === timeSlot,
  );

  const confirmedInSlotCount = activeInSlot.length;
  const remainingSpots = Math.max(0, MAX_SLOT_CAPACITY - confirmedInSlotCount);
  const isDoctorBooked = activeInSlot.some((item) => item.doctorId === doctorId);
  const isCapacityFull = confirmedInSlotCount >= MAX_SLOT_CAPACITY;
  const isUnavailable = isDoctorBooked || isCapacityFull;

  let statusLabel = `${remainingSpots}/${MAX_SLOT_CAPACITY} open`;
  if (isDoctorBooked) {
    statusLabel = 'Booked';
  } else if (isCapacityFull) {
    statusLabel = `Booked (${MAX_SLOT_CAPACITY}/${MAX_SLOT_CAPACITY})`;
  }

  return {
    confirmedInSlotCount,
    remainingSpots,
    isDoctorBooked,
    isCapacityFull,
    isUnavailable,
    statusLabel,
  };
}

function normalizeAppointment(apt: Appointment): Appointment {
  return {
    ...apt,
    bookingFeeInr: apt.bookingFeeInr ?? BOOKING_FEE_INR,
    paymentMethod: apt.paymentMethod ?? 'UPI / QR',
    paymentStatus: apt.paymentStatus ?? 'Paid (₹500)',
    paymentRef: apt.paymentRef ?? `PAY-${apt.id.replace(/\D/g, '') || '10001'}`,
  };
}

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
    return Array.isArray(parsed)
      ? parsed.map(normalizeAppointment)
      : INITIAL_APPOINTMENTS;
  } catch {
    return INITIAL_APPOINTMENTS;
  }
}

export function saveAppointment(
  newApt: Omit<
    Appointment,
    | 'id'
    | 'status'
    | 'createdAt'
    | 'bookingFeeInr'
    | 'paymentStatus'
    | 'paymentRef'
  > & { paymentMethod: PaymentMethod; paymentRef?: string },
): { ok: true; appointment: Appointment; appointments: Appointment[] } | { ok: false; error: string } {
  if (isSundayDate(newApt.date)) {
    return {
      ok: false,
      error:
        'Dentora is closed on Sundays. Please pick a Monday to Saturday date.',
    };
  }

  const existing = loadAppointments();
  const availability = getSlotAvailability(
    existing,
    newApt.doctorId,
    newApt.date,
    newApt.timeSlot,
  );

  if (availability.isDoctorBooked) {
    return {
      ok: false,
      error:
        'This time slot is already booked for the selected specialist. Please pick another time.',
    };
  }

  if (availability.isCapacityFull) {
    return {
      ok: false,
      error: `This ${newApt.timeSlot} slot has reached the clinic limit of ${MAX_SLOT_CAPACITY} patients on ${newApt.date}. Please choose another slot.`,
    };
  }

  const shortSuffix = Date.now().toString().slice(-5);
  const isPayAtClinic = newApt.paymentMethod === 'Pay at Clinic';
  const customRef = newApt.paymentRef?.trim();

  const appointment: Appointment = {
    ...newApt,
    id: `apt-${shortSuffix}`,
    bookingFeeInr: BOOKING_FEE_INR,
    paymentMethod: newApt.paymentMethod,
    paymentStatus: isPayAtClinic ? 'Pay ₹500 at Clinic' : 'Paid (₹500)',
    paymentRef:
      customRef || (isPayAtClinic ? `DESK-${shortSuffix}` : `PAY-${shortSuffix}`),
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
  if (isSundayDate(newDate)) {
    return {
      ok: false,
      error:
        'Dentora is closed on Sundays. Please pick a Monday to Saturday date.',
    };
  }

  const existing = loadAppointments();
  const target = existing.find((apt) => apt.id === id);
  if (!target) {
    return { ok: false, error: 'Appointment not found.' };
  }

  const availability = getSlotAvailability(
    existing,
    target.doctorId,
    newDate,
    newTimeSlot,
    id,
  );

  if (availability.isDoctorBooked) {
    return {
      ok: false,
      error:
        'That slot is already booked for this specialist. Please select another time.',
    };
  }

  if (availability.isCapacityFull) {
    return {
      ok: false,
      error: `The ${newTimeSlot} slot is full (${MAX_SLOT_CAPACITY}/${MAX_SLOT_CAPACITY} booked) on ${newDate}. Please select another time.`,
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
