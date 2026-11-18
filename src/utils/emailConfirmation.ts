import { CLINIC_WHATSAPP_DISPLAY, DOCTORS, TREATMENTS } from '../data/seedData';
import { Appointment } from '../types/dental';
import { formatReadableDate } from './clinicDates';

export interface EmailDispatchResult {
  mode: 'emailjs_sent' | 'emailjs_failed' | 'mailto_ready';
  message: string;
  mailtoUrl: string;
}

export function buildConfirmationEmailContent(apt: Appointment): {
  subject: string;
  body: string;
  mailtoUrl: string;
} {
  const doctor = DOCTORS.find((d) => d.id === apt.doctorId);
  const treatment = TREATMENTS.find((t) => t.id === apt.treatmentId);
  const readableDate = formatReadableDate(apt.date);

  const subject = `Dentora Appointment Confirmed · ${apt.id.toUpperCase()} (${readableDate})`;

  const body = [
    `Hello ${apt.patientName},`,
    '',
    'Your dental appointment at Dentora Dental Studio is confirmed.',
    '',
    `Booking Reference : ${apt.id.toUpperCase()}`,
    `Date & Time       : ${readableDate} at ${apt.timeSlot}`,
    `Specialist        : ${doctor?.name || 'Dentora Specialist'} (${doctor?.role || ''})`,
    `Treatment         : ${treatment?.title || 'Consultation'}`,
    `Visit Type        : ${apt.visitType} · ${apt.urgency}`,
    `WhatsApp Number   : ${apt.whatsappNumber || apt.patientPhone}`,
    apt.notes ? `Clinical Notes    : ${apt.notes}` : '',
    '',
    'Clinic Address    : 420 Meridian Dental Plaza, Suite 300',
    'Clinic Hours      : Mon – Sat · 9:00 AM – 6:30 PM (Closed Sundays)',
    `Clinic WhatsApp   : ${CLINIC_WHATSAPP_DISPLAY}`,
    'Helpline          : +1 (415) 890-4400',
    '',
    'Please arrive 10 minutes prior to your chair time.',
    'Warm regards,',
    'Dentora Dental Studio',
  ]
    .filter(Boolean)
    .join('\n');

  const mailtoUrl = `mailto:${encodeURIComponent(apt.patientEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return { subject, body, mailtoUrl };
}

export function isEmailJsConfigured(): boolean {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
  return Boolean(serviceId && templateId && publicKey);
}

export async function sendBookingConfirmationEmail(
  apt: Appointment,
): Promise<EmailDispatchResult> {
  const { subject, body, mailtoUrl } = buildConfirmationEmailContent(apt);

  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  if (!serviceId || !templateId || !publicKey) {
    return {
      mode: 'mailto_ready',
      message: `Confirmation email prepared for ${apt.patientEmail}. Click "Send Email Confirmation" to open your mail app, or configure EmailJS env keys for automatic sending.`,
      mailtoUrl,
    };
  }

  const doctor = DOCTORS.find((d) => d.id === apt.doctorId);
  const treatment = TREATMENTS.find((t) => t.id === apt.treatmentId);
  const readableDate = formatReadableDate(apt.date);

  const slipHtml = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;border:1px solid #bfdbfe;border-radius:14px;overflow:hidden;background:#ffffff;color:#0f172a;">
      <div style="background:#091830;color:#ffffff;padding:18px 22px;">
        <div style="font-size:18px;font-weight:700;">Dentora Dental Studio</div>
        <div style="font-size:12px;color:#bae6fd;margin-top:2px;">Official Chair Reservation Slip · ${apt.id.toUpperCase()}</div>
      </div>
      <div style="background:#eff6ff;padding:14px 22px;border-bottom:1px solid #dbeafe;">
        <div style="font-size:12px;color:#475569;">Date &amp; Chair Time</div>
        <div style="font-size:16px;font-weight:700;color:#1d4ed8;margin-top:2px;">${readableDate} at ${apt.timeSlot}</div>
      </div>
      <div style="padding:18px 22px;font-size:13px;line-height:1.6;">
        <p style="margin:0 0 8px;"><strong>Patient:</strong> ${apt.patientName} (Age ${apt.patientAge}) · ${apt.patientPhone}</p>
        <p style="margin:0 0 8px;"><strong>WhatsApp:</strong> ${apt.whatsappNumber || apt.patientPhone}</p>
        <p style="margin:0 0 8px;"><strong>Specialist:</strong> ${doctor?.name || 'Dentora Specialist'} (${doctor?.role || ''})</p>
        <p style="margin:0 0 8px;"><strong>Treatment:</strong> ${treatment?.title || 'Dental Consultation'} (${treatment?.duration || '45 min'})</p>
        <p style="margin:0 0 8px;"><strong>Visit Type:</strong> ${apt.visitType} · ${apt.urgency}</p>
        ${apt.notes ? `<p style="margin:0 0 8px;"><strong>Notes:</strong> ${apt.notes}</p>` : ''}
      </div>
      <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:12px 22px;font-size:11px;color:#475569;">
        420 Meridian Dental Plaza, Suite 300 · Mon–Sat 9:00 AM – 6:30 PM (Closed Sundays)<br />
        WhatsApp: ${CLINIC_WHATSAPP_DISPLAY} · Helpline: +1 (415) 890-4400
      </div>
    </div>
  `.trim();

  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: {
          to_email: apt.patientEmail,
          email: apt.patientEmail,
          user_email: apt.patientEmail,
          recipient_email: apt.patientEmail,
          patient_email: apt.patientEmail,
          to: apt.patientEmail,
          to_name: apt.patientName,
          name: apt.patientName,
          subject,
          title: subject,
          booking_id: apt.id.toUpperCase(),
          appointment_date: readableDate,
          time_slot: apt.timeSlot,
          doctor_name: doctor?.name || 'Dentora Specialist',
          doctor_role: doctor?.role || '',
          treatment_name: treatment?.title || 'Dental Consultation',
          treatment_duration: treatment?.duration || '45 min',
          visit_type: apt.visitType,
          urgency: apt.urgency,
          patient_phone: apt.patientPhone,
          whatsapp_number: apt.whatsappNumber || apt.patientPhone,
          clinic_notes: apt.notes || 'None',
          slip_html: slipHtml,
          message: body,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      return {
        mode: 'emailjs_failed',
        message: `Email service returned ${response.status}${errorText ? `: ${errorText}` : ''}.`,
        mailtoUrl,
      };
    }

    return {
      mode: 'emailjs_sent',
      message: `Confirmation email sent directly to ${apt.patientEmail}.`,
      mailtoUrl,
    };
  } catch {
    return {
      mode: 'emailjs_failed',
      message: `Could not reach automatic mail service. Use "Send Email Confirmation" below to send via your mail app.`,
      mailtoUrl,
    };
  }
}
