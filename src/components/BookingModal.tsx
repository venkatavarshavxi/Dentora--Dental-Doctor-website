import {
  CheckCircle2,
  Download,
  Lock,
  MessageCircle,
  Printer,
  X,
} from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import {
  CLINIC_WHATSAPP_DISPLAY,
  DOCTOR_PRIMARY_TREATMENT,
  DOCTORS,
  getDoctorTimeSlots,
  MAX_SLOT_CAPACITY,
  TREATMENTS,
} from '../data/seedData';
import { getSlotAvailability } from '../db/dentalStore';
import {
  Appointment,
  AuthSession,
  UrgencyLevel,
  VisitType,
} from '../types/dental';
import { downloadAppointmentSlip } from '../utils/appointmentSlip';
import {
  getNextOpenClinicDate,
  isDoctorWorkingDate,
  isSundayDate,
  parseLocalDate,
} from '../utils/clinicDates';
import {
  buildClinicWhatsAppUrl,
  buildPatientWhatsAppUrl,
} from '../utils/whatsappSlip';
import { AppointmentSlipCard } from './AppointmentSlipCard';
import { ClinicDatePicker } from './ClinicDatePicker';

interface BookingModalProps {
  isOpen: boolean;
  session?: AuthSession | null;
  initialDoctorId?: string;
  initialTreatmentId?: string;
  existingAppointments: Appointment[];
  onClose: () => void;
  onConfirmBooking: (input: {
    patientName: string;
    patientAge: number;
    patientEmail: string;
    patientPhone: string;
    whatsappNumber: string;
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

export function BookingModal({
  isOpen,
  session,
  initialDoctorId,
  initialTreatmentId,
  existingAppointments,
  onClose,
  onConfirmBooking,
}: BookingModalProps) {
  const initialDoc = initialDoctorId || DOCTORS[0].id;
  const [doctorId, setDoctorId] = useState(initialDoc);
  const [treatmentId, setTreatmentId] = useState(
    initialTreatmentId ||
      DOCTOR_PRIMARY_TREATMENT[initialDoc] ||
      TREATMENTS[0].id,
  );
  const [date, setDate] = useState(() =>
    getNextOpenClinicDate(new Date(), DOCTORS[0].workingDays),
  );
  const [timeSlot, setTimeSlot] = useState(
    () => getDoctorTimeSlots(initialDoc)[0],
  );
  const [visitType, setVisitType] = useState<VisitType>('New Patient');
  const [urgency, setUrgency] = useState<UrgencyLevel>('Routine');
  const [patientName, setPatientName] = useState('');
  const [nameHint, setNameHint] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [phoneHint, setPhoneHint] = useState('');
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappHint, setWhatsappHint] = useState('');
  const [reminderOptIn, setReminderOptIn] = useState(true);
  const [notes, setNotes] = useState('');
  const [step, setStep] = useState<'form' | 'confirmed'>('form');
  const [error, setError] = useState('');
  const [confirmedApt, setConfirmedApt] = useState<Appointment | null>(null);

  useEffect(() => {
    if (session?.role === 'customer') {
      setPatientName(session.name);
      setPatientEmail(session.email);
      setPatientPhone(session.phone);
      setWhatsappNumber(session.phone);
    } else {
      setPatientName('');
      setPatientEmail('');
      setPatientPhone('');
      setWhatsappNumber('');
    }
  }, [session]);

  useEffect(() => {
    if (isOpen) {
      const targetDoc = initialDoctorId || DOCTORS[0].id;
      const targetTr =
        initialTreatmentId ||
        DOCTOR_PRIMARY_TREATMENT[targetDoc] ||
        TREATMENTS[0].id;
      const targetDocObj =
        DOCTORS.find((d) => d.id === targetDoc) || DOCTORS[0];
      setDoctorId(targetDoc);
      setTreatmentId(targetTr);
      setDate((prev) =>
        prev && isDoctorWorkingDate(prev, targetDocObj.workingDays)
          ? prev
          : getNextOpenClinicDate(new Date(), targetDocObj.workingDays),
      );
      if (session?.role === 'customer') {
        setPatientName(session.name);
        setPatientEmail(session.email);
        setPatientPhone(session.phone);
        setWhatsappNumber(session.phone);
      }
      setError('');
      setNameHint('');
      setPhoneHint('');
      setWhatsappHint('');
      setStep('form');
      setConfirmedApt(null);
    }
  }, [isOpen, initialDoctorId, initialTreatmentId, session]);

  const doctorSlots = getDoctorTimeSlots(doctorId);

  useEffect(() => {
    if (!isOpen || step !== 'form') return;
    const isValidForDoctor = doctorSlots.includes(timeSlot);
    const currentStatus = getSlotAvailability(
      existingAppointments,
      doctorId,
      date,
      timeSlot,
    );
    if (!isValidForDoctor || currentStatus.isUnavailable) {
      const firstOpen = doctorSlots.find(
        (slot) =>
          !getSlotAvailability(existingAppointments, doctorId, date, slot)
            .isUnavailable,
      );
      if (firstOpen) {
        setTimeSlot(firstOpen);
      } else if (!isValidForDoctor && doctorSlots[0]) {
        setTimeSlot(doctorSlots[0]);
      }
    }
  }, [isOpen, step, doctorId, date, existingAppointments, timeSlot, doctorSlots]);

  if (!isOpen) return null;

  const openSlotsCount = doctorSlots.filter(
    (slot) =>
      !getSlotAvailability(existingAppointments, doctorId, date, slot)
        .isUnavailable,
  ).length;

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
    if (sameAsPhone) {
      setWhatsappNumber(digitsOnly);
    }
  };

  const handleWhatsappChange = (rawValue: string) => {
    const digitsOnly = rawValue.replace(/\D/g, '').slice(0, 10);
    if (rawValue !== digitsOnly && rawValue.length <= 10) {
      setWhatsappHint('Only numbers are accepted (alphabets are blocked).');
    } else if (rawValue.replace(/\D/g, '').length > 10) {
      setWhatsappHint('WhatsApp number is limited to 10 digits.');
    } else {
      setWhatsappHint('');
    }
    setWhatsappNumber(digitsOnly);
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

    const effectiveWhatsapp = sameAsPhone ? patientPhone : whatsappNumber;
    if (!PHONE_10_DIGITS_REGEX.test(effectiveWhatsapp)) {
      setError(
        'Please enter a valid 10-digit WhatsApp number so we can prepare your WhatsApp slip.',
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

    if (isSundayDate(date)) {
      setError(
        'Dentora is closed on Sundays. Please select an open clinic date.',
      );
      return;
    }

    const activeDoctor =
      DOCTORS.find((d) => d.id === doctorId) || DOCTORS[0];
    if (!isDoctorWorkingDate(date, activeDoctor.workingDays)) {
      setError(
        `${activeDoctor.name} is available ${activeDoctor.workingDaysLabel} only. Please pick an available date from the calendar.`,
      );
      return;
    }

    if (!doctorSlots.includes(timeSlot)) {
      setError(
        `${activeDoctor.name} does not have a ${timeSlot} slot. Please select one of their available times.`,
      );
      return;
    }

    const slotState = getSlotAvailability(
      existingAppointments,
      doctorId,
      date,
      timeSlot,
    );

    if (slotState.isDoctorBooked) {
      setError(
        'This time slot is already booked for the selected specialist. Please pick an open slot.',
      );
      return;
    }

    if (slotState.isCapacityFull) {
      setError(
        `This ${timeSlot} slot is already full (${MAX_SLOT_CAPACITY}/${MAX_SLOT_CAPACITY} booked). Please pick another time.`,
      );
      return;
    }

    const result = onConfirmBooking({
      patientName: patientName.trim(),
      patientAge: numericAge,
      patientEmail: patientEmail.trim(),
      patientPhone,
      whatsappNumber: effectiveWhatsapp,
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
    setStep('confirmed');
  };

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
          className="absolute right-5 top-5 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer print:hidden"
        >
          <X className="h-4 w-4" />
        </button>

        {step === 'confirmed' && confirmedApt ? (
          <div className="py-2">
            <div className="mb-5 flex items-center gap-3 print:hidden">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 shrink-0">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3
                  id="booking-modal-title"
                  className="font-display text-xl font-bold text-slate-900 sm:text-2xl"
                >
                  Consultation Confirmed
                </h3>
                <p className="text-xs text-slate-600 sm:text-sm">
                  Your chair slot is reserved. Send your pass to WhatsApp, print, or download below.
                </p>
              </div>
            </div>

            <AppointmentSlipCard appointment={confirmedApt} />

            {/* WhatsApp Instant Slip Delivery */}
            <div className="mt-4 flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
              <div className="min-w-0">
                <p className="text-xs font-bold text-emerald-950">
                  WhatsApp Slip Ready ({confirmedApt.whatsappNumber})
                </p>
                <p className="mt-0.5 text-[11px] text-emerald-800">
                  Send your full slip to WhatsApp, or{' '}
                  <a
                    href={buildClinicWhatsAppUrl(confirmedApt)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold underline underline-offset-2 hover:text-emerald-950"
                  >
                    chat with Clinic Desk ({CLINIC_WHATSAPP_DISPLAY})
                  </a>
                  .
                </p>
              </div>
              <a
                href={buildPatientWhatsAppUrl(confirmedApt)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors whitespace-nowrap"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                <span>Send Slip on WhatsApp</span>
              </a>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3 print:hidden">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
              >
                <Printer className="h-4 w-4" aria-hidden="true" />
                <span>Print / PDF</span>
              </button>
              <button
                type="button"
                onClick={() => downloadAppointmentSlip(confirmedApt)}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 hover:border-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                <span>Download Slip</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 transition-colors cursor-pointer"
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
                    onChange={(e) => {
                      const nextDoctorId = e.target.value;
                      const nextDoc =
                        DOCTORS.find((d) => d.id === nextDoctorId) || DOCTORS[0];
                      setDoctorId(nextDoctorId);
                      setTreatmentId(
                        DOCTOR_PRIMARY_TREATMENT[nextDoctorId] ||
                          TREATMENTS[0].id,
                      );
                      if (!isDoctorWorkingDate(date, nextDoc.workingDays)) {
                        const baseDate = date ? parseLocalDate(date) : new Date();
                        const todayStart = new Date();
                        todayStart.setHours(0, 0, 0, 0);
                        const startFrom =
                          baseDate >= todayStart ? baseDate : new Date();
                        setDate(
                          getNextOpenClinicDate(startFrom, nextDoc.workingDays),
                        );
                      }
                      setError('');
                    }}
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
                  <div className="flex items-center justify-between">
                    <span className="block text-xs font-semibold text-slate-700">
                      Fixed Treatment
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700">
                      <Lock className="h-3 w-3" aria-hidden="true" />
                      <span>Specialist-locked</span>
                    </span>
                  </div>
                  {(() => {
                    const selectedDoc = DOCTORS.find((d) => d.id === doctorId);
                    const fixedTr = TREATMENTS.find((t) => t.id === treatmentId);
                    return (
                      <div
                        aria-live="polite"
                        className="mt-1.5 rounded-lg border border-blue-200 bg-blue-50/70 px-3 py-2 text-slate-900"
                      >
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {fixedTr?.title || selectedDoc?.role || 'Dental Care'}
                        </p>
                        <p className="truncate text-[11px] text-slate-600">
                          {selectedDoc?.role} · {fixedTr?.duration || '45 min'}
                        </p>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {(() => {
                const selectedDoc =
                  DOCTORS.find((d) => d.id === doctorId) || DOCTORS[0];
                return (
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <label
                        htmlFor="book-date"
                        className="block text-xs font-semibold text-slate-700"
                      >
                        Preferred Date
                      </label>
                      <span className="text-[11px] font-medium text-slate-500">
                        {selectedDoc.availability}
                      </span>
                    </div>
                    <div className="mt-1.5">
                      <ClinicDatePicker
                        id="book-date"
                        value={date}
                        onChange={setDate}
                        allowedDays={selectedDoc.workingDays}
                        scheduleLabel={selectedDoc.workingDaysLabel}
                        availabilityText={selectedDoc.availability}
                      />
                    </div>
                  </div>
                );
              })()}

              <div>
                <div className="flex items-center justify-between">
                  <span className="block text-xs font-semibold text-slate-700">
                    Available Time Slots (Max {MAX_SLOT_CAPACITY} patients/slot)
                  </span>
                  <span className="font-mono-num text-[11px] font-medium text-blue-700">
                    {openSlotsCount} of {doctorSlots.length} open
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {doctorSlots.map((slot) => {
                    const availability = getSlotAvailability(
                      existingAppointments,
                      doctorId,
                      date,
                      slot,
                    );
                    const active =
                      timeSlot === slot && !availability.isUnavailable;
                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={availability.isUnavailable}
                        onClick={() => setTimeSlot(slot)}
                        className={`flex flex-col items-center justify-center rounded-lg border px-2.5 py-2 transition-all whitespace-nowrap ${
                          availability.isUnavailable
                            ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
                            : active
                              ? 'border-blue-700 bg-blue-700 text-white shadow-sm cursor-pointer'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-blue-600 hover:text-blue-700 cursor-pointer'
                        }`}
                      >
                        <span
                          className={`font-mono-num text-xs font-semibold ${
                            availability.isUnavailable ? 'line-through' : ''
                          }`}
                        >
                          {slot}
                        </span>
                        <span
                          className={`font-mono-num mt-0.5 text-[10px] font-medium ${
                            availability.isUnavailable
                              ? 'text-red-500'
                              : active
                                ? 'text-sky-100'
                                : 'text-slate-500'
                          }`}
                        >
                          {availability.statusLabel}
                        </span>
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

              {/* WhatsApp Number */}
              <div className="rounded-xl border border-emerald-200 bg-white p-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label
                    htmlFor="book-whatsapp"
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-800"
                  >
                    <MessageCircle
                      className="h-3.5 w-3.5 text-emerald-600"
                      aria-hidden="true"
                    />
                    <span>WhatsApp Number (for Appointment Slip)</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sameAsPhone}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setSameAsPhone(checked);
                        if (checked) setWhatsappNumber(patientPhone);
                      }}
                      className="h-3.5 w-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600"
                    />
                    <span>Same as phone number</span>
                  </label>
                </div>

                {!sameAsPhone && (
                  <div className="mt-2.5">
                    <input
                      id="book-whatsapp"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={whatsappNumber}
                      onChange={(e) => handleWhatsappChange(e.target.value)}
                      placeholder="10-digit WhatsApp number"
                      className="font-mono-num w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                    />
                    {whatsappHint && (
                      <p className="mt-1 text-[11px] font-medium text-amber-700">
                        {whatsappHint}
                      </p>
                    )}
                  </div>
                )}
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
                Confirm Appointment &amp; Generate Slip
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
