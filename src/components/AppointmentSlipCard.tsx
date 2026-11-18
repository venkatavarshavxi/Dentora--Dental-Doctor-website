import {
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Stethoscope,
} from 'lucide-react';
import { DOCTORS, TREATMENTS } from '../data/seedData';
import { Appointment } from '../types/dental';
import { formatReadableDate } from '../utils/clinicDates';
import { ToothIcon } from './ToothIcon';

interface AppointmentSlipCardProps {
  appointment: Appointment;
}

function getBarcodeBars(seed: string): { x: number; width: number }[] {
  const bars: { x: number; width: number }[] = [];
  let cursor = 0;
  const code = `${seed}-DENTORA-2026`;
  for (let i = 0; i < 32; i++) {
    const ch = code.charCodeAt(i % code.length);
    const width = (ch % 3) + 1;
    const gap = ((ch >> 1) % 2) + 1.5;
    bars.push({ x: cursor, width });
    cursor += width + gap;
  }
  return bars;
}

export function AppointmentSlipCard({ appointment }: AppointmentSlipCardProps) {
  const doctor = DOCTORS.find((d) => d.id === appointment.doctorId);
  const treatment = TREATMENTS.find((t) => t.id === appointment.treatmentId);
  const readableDate = formatReadableDate(appointment.date);

  const bars = getBarcodeBars(appointment.id);
  const totalWidth =
    bars.length > 0
      ? bars[bars.length - 1].x + bars[bars.length - 1].width
      : 120;

  return (
    <div className="printable-slip overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-lg">
      {/* Clinical Navy Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-br from-[#091830] via-[#0E2447] to-[#143463] px-5 py-4 text-white sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 border border-white/15">
            <ToothIcon className="h-5 w-5 text-sky-300" />
          </div>
          <div>
            <p className="font-display text-lg font-bold tracking-tight leading-none">
              Dentora
            </p>
            <p className="mt-1 text-[11px] text-sky-200">
              Official Chair Reservation Pass
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-[11px] text-sky-200">Booking Reference</p>
          <p className="font-mono-num text-sm font-bold tracking-wide text-white">
            {appointment.id.toUpperCase()}
          </p>
          <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{appointment.status}</span>
          </p>
        </div>
      </div>

      {/* Primary Appointment Date & Time Strip */}
      <div className="grid grid-cols-1 gap-3 border-b border-blue-100 bg-[#EEF4FC] px-5 py-4 sm:grid-cols-3 sm:px-6">
        <div>
          <p className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
            <Calendar className="h-3.5 w-3.5 text-blue-700" aria-hidden="true" />
            <span>Appointment Date</span>
          </p>
          <p className="font-mono-num mt-1 text-sm font-bold text-slate-900">
            {readableDate}
          </p>
        </div>

        <div>
          <p className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
            <Clock className="h-3.5 w-3.5 text-blue-700" aria-hidden="true" />
            <span>Chair Time</span>
          </p>
          <p className="font-mono-num mt-1 text-sm font-bold text-blue-700">
            {appointment.timeSlot}
          </p>
        </div>

        <div>
          <p className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
            <Stethoscope className="h-3.5 w-3.5 text-blue-700" aria-hidden="true" />
            <span>Est. Duration</span>
          </p>
          <p className="font-mono-num mt-1 text-sm font-bold text-slate-900">
            {treatment?.duration || '45 min'}
          </p>
        </div>
      </div>

      {/* Ticket Perforation Divider */}
      <div className="relative flex h-5 items-center bg-white">
        <span
          aria-hidden="true"
          className="absolute -left-2.5 h-5 w-5 rounded-full border border-blue-200 bg-[#F4F8FD]"
        />
        <div className="mx-4 w-full border-t border-dashed border-slate-300" />
        <span
          aria-hidden="true"
          className="absolute -right-2.5 h-5 w-5 rounded-full border border-blue-200 bg-[#F4F8FD]"
        />
      </div>

      {/* Specialist & Procedure */}
      <div className="px-5 pb-5 pt-2 sm:px-6">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {doctor?.imageUrl && (
              <img
                src={doctor.imageUrl}
                alt={doctor.name}
                referrerPolicy="no-referrer"
                className="h-12 w-12 rounded-xl object-cover border border-blue-100 shrink-0"
              />
            )}
            <div>
              <p className="text-[11px] font-semibold text-slate-500">
                Assigned Specialist
              </p>
              <p className="font-display text-sm font-bold text-slate-900">
                {doctor?.name || 'Dentora Specialist'}
              </p>
              <p className="text-xs text-slate-600">
                {doctor?.role} · {doctor?.credentials}
              </p>
            </div>
          </div>

          <div className="sm:text-right">
            <p className="text-[11px] font-semibold text-slate-500">
              Treatment Plan
            </p>
            <p className="text-sm font-bold text-slate-900">
              {treatment?.title || 'Dental Consultation'}
            </p>
            {treatment?.priceRange && (
              <p className="font-mono-num text-xs font-medium text-blue-700">
                Est. {treatment.priceRange}
              </p>
            )}
          </div>
        </div>

        {/* Patient Details Grid */}
        <div className="mt-4 grid grid-cols-1 gap-3.5 text-sm sm:grid-cols-2">
          <div>
            <p className="text-[11px] font-semibold text-slate-500">
              Patient Details
            </p>
            <p className="mt-0.5 font-semibold text-slate-900">
              {appointment.patientName} (Age {appointment.patientAge})
            </p>
          </div>

          <div>
            <p className="text-[11px] font-semibold text-slate-500">
              Phone Number
            </p>
            <p className="font-mono-num mt-0.5 font-semibold text-slate-900">
              {appointment.patientPhone}
            </p>
          </div>

          <div>
            <p className="text-[11px] font-semibold text-slate-500">
              Visit Type &amp; Priority
            </p>
            <p className="mt-0.5 font-medium text-slate-800">
              {appointment.visitType} ·{' '}
              <span
                className={
                  appointment.urgency === 'Urgent Pain'
                    ? 'font-semibold text-amber-700'
                    : 'text-slate-800'
                }
              >
                {appointment.urgency}
              </span>
            </p>
          </div>

          <div>
            <p className="text-[11px] font-semibold text-slate-500">
              24h Pre-Visit Reminder
            </p>
            <p className="mt-0.5 inline-flex items-center gap-1.5 font-medium text-slate-800">
              <Bell className="h-3.5 w-3.5 text-blue-700" aria-hidden="true" />
              <span>{appointment.reminderOptIn ? 'Enabled' : 'Disabled'}</span>
            </p>
          </div>

          <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-blue-100 bg-[#F4F8FD] px-3.5 py-2.5">
            <div>
              <p className="text-[11px] font-semibold text-slate-500">
                Chair Reservation Fee
              </p>
              <p className="font-mono-num text-xs font-bold text-slate-900">
                ₹{appointment.bookingFeeInr} · {appointment.paymentStatus}
              </p>
            </div>
            <div className="sm:text-right">
              <p className="text-[11px] text-slate-500">
                Method: {appointment.paymentMethod}
              </p>
              <p className="font-mono-num text-[11px] font-semibold text-blue-700">
                Receipt: {appointment.paymentRef}
              </p>
            </div>
          </div>
        </div>

        {appointment.notes && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5">
            <p className="text-[11px] font-semibold text-slate-500">
              Clinical Notes
            </p>
            <p className="mt-0.5 text-xs text-slate-700">{appointment.notes}</p>
          </div>
        )}
      </div>

      {/* Clinic Address & Verification Barcode */}
      <div className="flex flex-col justify-between gap-4 border-t border-slate-200 bg-slate-50 px-5 py-3.5 sm:flex-row sm:items-center sm:px-6">
        <div className="space-y-1 text-[11px] text-slate-600">
          <p className="flex items-center gap-1.5 font-semibold text-slate-800">
            <MapPin className="h-3.5 w-3.5 text-blue-700 shrink-0" aria-hidden="true" />
            <span>420 Meridian Dental Plaza, Suite 300</span>
          </p>
          <p className="flex items-center gap-1.5 font-mono-num">
            <Phone className="h-3 w-3 text-slate-500 shrink-0" aria-hidden="true" />
            <span>+1 (415) 890-4400 · Mon–Sat (Closed Sundays)</span>
          </p>
        </div>

        <div className="flex flex-col items-start sm:items-end">
          <svg
            width="132"
            height="28"
            viewBox={`0 0 ${totalWidth} 28`}
            aria-hidden="true"
            className="shrink-0"
          >
            {bars.map((bar, idx) => (
              <rect
                key={idx}
                x={bar.x}
                y={0}
                width={bar.width}
                height={28}
                rx={0.5}
                fill="#0f172a"
              />
            ))}
          </svg>
          <span className="font-mono-num mt-1 text-[10px] tracking-widest text-slate-500">
            {appointment.id.toUpperCase()} · VERIFIED
          </span>
        </div>
      </div>
    </div>
  );
}
