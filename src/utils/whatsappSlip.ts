import {
  CLINIC_WHATSAPP_DIGITS,
  CLINIC_WHATSAPP_DISPLAY,
  DOCTORS,
  TREATMENTS,
} from '../data/seedData';
import { Appointment } from '../types/dental';
import { formatReadableDate } from './clinicDates';

/**
 * Formats a 10-digit Indian phone number (or international digits) for wa.me links.
 */
export function formatWhatsAppDigits(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, '');
  if (!digits) return CLINIC_WHATSAPP_DIGITS;
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

export function buildWhatsAppSlipMessage(apt: Appointment): string {
  const doctor = DOCTORS.find((d) => d.id === apt.doctorId);
  const treatment = TREATMENTS.find((t) => t.id === apt.treatmentId);
  const readableDate = formatReadableDate(apt.date);
  const patientWhatsapp = apt.whatsappNumber || apt.patientPhone;

  return [
    '*DENTORA DENTAL STUDIO — APPOINTMENT SLIP*',
    `Ref ID: *${apt.id.toUpperCase()}* (${apt.status})`,
    '',
    `Date: ${readableDate}`,
    `Chair Time: *${apt.timeSlot}*`,
    `Duration: ${treatment?.duration || '45 min'}`,
    '',
    `Patient: ${apt.patientName} (Age ${apt.patientAge})`,
    `Phone: ${apt.patientPhone}`,
    `WhatsApp: ${patientWhatsapp}`,
    `Visit Type: ${apt.visitType} · ${apt.urgency}`,
    '',
    `Specialist: ${doctor?.name || 'Dentora Specialist'} (${doctor?.role || ''})`,
    `Treatment: ${treatment?.title || 'Dental Consultation'}`,
    apt.notes ? `Notes: ${apt.notes}` : '',
    '',
    '420 Meridian Dental Plaza, Suite 300',
    `Clinic WhatsApp: ${CLINIC_WHATSAPP_DISPLAY}`,
    'Hours: Mon – Sat · 9:00 AM – 6:30 PM (Closed Sundays)',
  ]
    .filter(Boolean)
    .join('\n');
}

export function buildPatientWhatsAppUrl(apt: Appointment): string {
  const digits = formatWhatsAppDigits(apt.whatsappNumber || apt.patientPhone);
  const text = buildWhatsAppSlipMessage(apt);
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export function buildClinicWhatsAppUrl(apt?: Appointment): string {
  const text = apt
    ? buildWhatsAppSlipMessage(apt)
    : 'Hello Dentora Dental Studio, I have a question regarding an appointment.';
  return `https://wa.me/${CLINIC_WHATSAPP_DIGITS}?text=${encodeURIComponent(text)}`;
}
