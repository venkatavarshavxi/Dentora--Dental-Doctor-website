import { CheckCircle2, Download, X } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { DOCTORS, TIME_SLOTS, TREATMENTS } from '../data/seedData';
import { Appointment, UrgencyLevel, VisitType } from '../types/dental';

interface BookingModalProps {
  isOpen: boolean;
  initialDoctorId?: string;
  initialTreatmentId?: string;
  existingAppointments: Appointment[];
  onClose: () => void;
  onConfirmBooking: (input: {
    patientName: string;
    patientAge: number;
    patientEmail: string;
    patientPhone: string;
    visitType: VisitType;
    urgency: UrgencyLevel;
    reminderOptIn: boolean;
    doctorId: string;
    treatmentId: string;
    date: string;
    timeSlot: string;
    notes: string;
  }) => { ok: true; appointment: Appointment } | { ok: false; error: string };
}

const ALPHABETS_ONLY_REGEX = /^[A-Za-z\s.'-]{2,}$/;
const PHONE_10_DIGITS_REGEX = /^\d{10}$/;

export function downloadAppointmentSlip(apt: Appointment) {
  const doc = DOCTORS.find((d) => d.id === apt.doctorId);
  const tr = TREATMENTS.find((t) => t.id === apt.treatmentId);

  const lines = [
    '=========================================',
    '        DENTORA DENTAL STUDIO',
    '     CONFIRMED APPOINTMENT PASS',
    '=========================================',
    `Reference ID : ${apt.id.toUpperCase()}`,
    `Status       : ${apt.status}`,
    `Patient      : ${apt.patientName} (Age ${apt.patientAge})`,
    `Visit Type   : ${apt.visitType} · ${apt.urgency}`,
    `Phone        : ${apt.patientPhone}`,
    `Email        : ${apt.patientEmail}`,
    '-----------------------------------------',
    `Specialist   : ${doc?.name || 'Dentora Specialist'}`,
    `Treatment    : ${tr?.title || 'Consultation'}`,
    `Date & Time  : ${apt.date} at ${apt.timeSlot}`,
    `24h Reminder : ${apt.reminderOptIn ? 'Enabled' : 'Disabled'}`,
    `Notes        : ${apt.notes || 'None'}`,
    '-----------------------------------------',
    'Location     : 420 Meridian Dental Plaza, Suite 300',
    'Helpline     : +1 (415) 890-4400',
    '=========================================',
  ].join('\n');

  const blob = new Blob([lines], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `dentora-appointment-${apt.id}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function BookingModal({
  isOpen,
  initialDoctorId,
  initialTreatmentId,
  existingAppointments,
  onClose,
  onConfirmBooking,
}: BookingModalProps) {
  const todayStr = new Date().toISOString().slice(0, 10);

  const [doctorId, setDoctorId] = useState(initialDoctorId || DOCTORS[0].id);
  const [treatmentId, setTreatmentId] = useState(
    initialTreatmentId || TREATMENTS[0].id,
  );
  const [date, setDate] = useState('2026-11-20');
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0]);
  const [visitType, setVisitType] = useState<VisitType>('New Patient');
  const [urgency, setUrgency] = useState<UrgencyLevel>('Routine');
  const [patientName, setPatientName] = useState('');
  const [nameHint, setNameHint] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [phoneHint, setPhoneHint] = useState('');
  const [reminderOptIn, setReminderOptIn] = useState(true);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [confirmedApt, setConfirmedApt] = useState<Appointment | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialDoctorId) setDoctorId(initialDoctorId);
      if (initialTreatmentId) setTreatmentId(initialTreatmentId);
      setError('');
      setNameHint('');
      setPhoneHint('');
      setConfirmedApt(null);
    }
  }, [isOpen, initialDoctorId, initialTreatmentId]);

  if (!isOpen) return null;

  const isSlotTaken = (slot: string) =>
    existingAppointments.some(
      (apt) =>
        apt.status === 'Confirmed' &&
        apt.doctorId === doctorId &&
        apt.date === date &&
        apt.timeSlot === slot,
    );

  const openSlotsCount = TIME_SLOTS.filter((slot) => !isSlotTaken(slot)).length;

  const handleNameChange = (rawValue: string) => {
    const cleaned = rawValue.replace(/[^A-Za-z\s.'-]/g, '');
    if (cleaned !== rawValue) {
      setNameHint('Only alphabets are accepted (numbers are blocked).');
    } else {
      setNameHint('');
    }
    setPatientName(cleaned);
  };

  const handleAgeChange = (rawValue: string) => {
    const digitsOnly = rawValue.replace(/\D/g, '').slice(0, 3);
    setPatientAge(digitsOnly);
  };

  const handlePhoneChange = (rawValue: string) => {
    const digitsOnly = rawValue.replace(/\D/g, '').slice(0, 10);
    if (rawValue !== digitsOnly && rawValue.length <= 10) {
      setPhoneHint('Only numbers are accepted (alphabets are blocked).');
    } else if (rawValue.replace(/\D/g, '').length > 10) {
      setPhoneHint('Phone number is limited to 10 digits.');
    } else {
      setPhoneHint('');
    }
    setPatientPhone(digitsOnly);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError('');

    if (!ALPHABETS_ONLY_REGEX.test(patientName.trim())) {
      setError(
        'Please enter the patient name using alphabets only (minimum 2 letters, no numbers).',
      );
      return;
    }

    const numericAge = Number(patientAge);
    if (!patientAge || Number.isNaN(numericAge) || numericAge < 1 || numericAge > 120) {
      setError('Please enter a valid patient age (1 to 120).');
      return;
    }

    if (!PHONE_10_DIGITS_REGEX.test(patientPhone)) {
      setError(
        'Please enter a valid 10-digit phone number (numbers only, no alphabets).',
      );
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(patientEmail.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!date) {
      setError('Please choose a preferred appointment date.');
      return;
    }

    const result = onConfirmBooking({
      patientName: patientName.trim(),
      patientAge: numericAge,
      patientEmail: patientEmail.trim(),
      patientPhone,
      visitType,
      urgency,
      reminderOptIn,
      doctorId,
      treatmentId,
      date,
      timeSlot,
      notes: notes.trim(),
    });

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setConfirmedApt(result.appointment);
  };

  const selectedDoctor = DOCTORS.find((d) => d.id === doctorId);
  const selectedTreatment = TREATMENTS.find((t) => t.id === treatmentId);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-xs"
    >
      <div className="popup-enter relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-blue-200 bg-[#F4F8FD] p-6 shadow-2xl sm:p-8">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close booking dialog"
          className="absolute right-5 top-5 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {confirmedApt ? (
          <div className="py-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <CheckCircle2 className="h-7 w-7" />
            </div>

            <h3
              id="booking-modal-title"
              className="mt-4 font-display text-2xl font-bold text-slate-900"
            >
              Consultation Confirmed
            </h3>
            <p className="mt-1.5 text-sm text-slate-600">
              Your appointment is saved in your Dentora portal. Download your
              appointment pass below if needed.
            </p>

            <div className="mt-6 space-y-3 rounded-xl border border-blue-100 bg-white p-5 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Reference ID</span>
                <span className="font-mono-num font-semibold text-slate-900">
                  {confirmedApt.id.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Patient</span>
                <span className="font-semibold text-slate-900 text-right">
                  {confirmedApt.patientName} (Age {confirmedApt.patientAge}) ·{' '}
                  {confirmedApt.patientPhone}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Visit Details</span>
                <span className="font-medium text-slate-900">
                  {confirmedApt.visitType} · {confirmedApt.urgency}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Specialist</span>
                <span className="font-semibold text-slate-900">
                  {selectedDoctor?.name}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Treatment</span>
                <span className="font-medium text-slate-900 text-right">
                  {selectedTreatment?.title}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Date &amp; Time</span>
                <span className="font-mono-num font-semibold text-blue-700">
                  {confirmedApt.date} · {confirmedApt.timeSlot}
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => downloadAppointmentSlip(confirmedApt)}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-white px-5 py-3 text-sm font-semibold text-blue-700 hover:border-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Download Slip
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-xs font-semibold text-blue-700">
              Instant Chair Reservation
            </p>
            <h3
              id="booking-modal-title"
              className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900"
            >
              Book Your Dental Visit
            </h3>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
              {/* Visit Type & Urgency */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <span className="block text-xs font-semibold text-slate-700">
                    Visit Type
                  </span>
                  <div className="mt-1.5 grid grid-cols-2 gap-1 rounded-lg border border-slate-200 bg-white p-1">
                    {(['New Patient', 'Returning Patient'] as VisitType[]).map(
                      (type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setVisitType(type)}
                          className={`rounded-md px-2 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                            visitType === type
                              ? 'bg-blue-700 text-white'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {type}
                        </button>
                      ),
                    )}
                  </div>
                </div>

                <div>
                  <span className="block text-xs font-semibold text-slate-700">
                    Priority Level
                  </span>
                  <div className="mt-1.5 grid grid-cols-2 gap-1 rounded-lg border border-slate-200 bg-white p-1">
                    {(['Routine', 'Urgent Pain'] as UrgencyLevel[]).map(
                      (level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setUrgency(level)}
                          className={`rounded-md px-2 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                            urgency === level
                              ? level === 'Urgent Pain'
                                ? 'bg-amber-600 text-white'
                                : 'bg-blue-700 text-white'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {level}
                        </button>
                      ),
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="book-doctor"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Select Specialist
                  </label>
                  <select
                    id="book-doctor"
                    value={doctorId}
                    onChange={(e) => setDoctorId(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  >
                    {DOCTORS.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="book-treatment"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Treatment
                  </label>
                  <select
                    id="book-treatment"
                    value={treatmentId}
                    onChange={(e) => setTreatmentId(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  >
                    {TREATMENTS.map((tr) => (
                      <option key={tr.id} value={tr.id}>
                        {tr.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="book-date"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Preferred Date
                </label>
                <input
                  id="book-date"
                  type="date"
                  min={todayStr}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="block text-xs font-semibold text-slate-700">
                    Available Time Slots
                  </span>
                  <span className="font-mono-num text-[11px] font-medium text-blue-700">
                    {openSlotsCount} of {TIME_SLOTS.length} open
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {TIME_SLOTS.map((slot) => {
                    const taken = isSlotTaken(slot);
                    const active = timeSlot === slot && !taken;
                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={taken}
                        onClick={() => setTimeSlot(slot)}
                        className={`font-mono-num rounded-lg border px-2.5 py-2 text-xs font-medium transition-all whitespace-nowrap ${
                          taken
                            ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 line-through'
                            : active
                              ? 'border-blue-700 bg-blue-700 text-white shadow-sm cursor-pointer'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-blue-600 hover:text-blue-700 cursor-pointer'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
                <div className="sm:col-span-8">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="book-name"
                      className="block text-xs font-semibold text-slate-700"
                    >
                      Patient Name
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Alphabets only
                    </span>
                  </div>
                  <input
                    id="book-name"
                    type="text"
                    value={patientName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Priya Verma"
                    className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  />
                  {nameHint && (
                    <p className="mt-1 text-[11px] font-medium text-amber-700">
                      {nameHint}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-4">
                  <label
                    htmlFor="book-age"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Age (Years)
                  </label>
                  <input
                    id="book-age"
                    type="text"
                    inputMode="numeric"
                    maxLength={3}
                    value={patientAge}
                    onChange={(e) => handleAgeChange(e.target.value)}
                    placeholder="e.g. 28"
                    className="font-mono-num mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="book-phone"
                      className="block text-xs font-semibold text-slate-700"
                    >
                      Phone Number
                    </label>
                    <span className="font-mono-num text-[11px] text-slate-500">
                      {patientPhone.length}/10 digits
                    </span>
                  </div>
                  <input
                    id="book-phone"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={patientPhone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="9876543210"
                    className="font-mono-num mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  />
                  {phoneHint && (
                    <p className="mt-1 text-[11px] font-medium text-amber-700">
                      {phoneHint}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="book-email"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Email Address
                  </label>
                  <input
                    id="book-email"
                    type="email"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    placeholder="patient@example.com"
                    className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="book-notes"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Clinical Notes (Optional)
                </label>
                <input
                  id="book-notes"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any tooth sensitivity, allergies, or preferred care notes"
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminderOptIn}
                  onChange={(e) => setReminderOptIn(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
                />
                <span>Send me a 24-hour pre-visit appointment reminder</span>
              </label>

              {error && (
                <p
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="w-full rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 active:scale-[0.99] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                Confirm Appointment
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
