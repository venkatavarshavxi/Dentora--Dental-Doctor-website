import {
  CheckCircle2,
  CreditCard,
  Download,
  IndianRupee,
  Printer,
  QrCode,
  Store,
  X,
} from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import {
  BOOKING_FEE_INR,
  DOCTORS,
  MAX_SLOT_CAPACITY,
  TIME_SLOTS,
  TREATMENTS,
} from '../data/seedData';
import { getSlotAvailability } from '../db/dentalStore';
import {
  Appointment,
  AuthSession,
  PaymentMethod,
  UrgencyLevel,
  VisitType,
} from '../types/dental';
import { downloadAppointmentSlip } from '../utils/appointmentSlip';
import { getNextOpenClinicDate, isSundayDate } from '../utils/clinicDates';
import { sendBookingConfirmationEmail } from '../utils/emailConfirmation';
import { AppointmentSlipCard } from './AppointmentSlipCard';
import { ClinicDatePicker } from './ClinicDatePicker';
import { PaymentGatewayStep } from './PaymentGatewayStep';

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
    visitType: VisitType;
    urgency: UrgencyLevel;
    reminderOptIn: boolean;
    doctorId: string;
    treatmentId: string;
    date: string;
    timeSlot: string;
    notes: string;
    paymentMethod: PaymentMethod;
    paymentRef?: string;
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
  const [doctorId, setDoctorId] = useState(initialDoctorId || DOCTORS[0].id);
  const [treatmentId, setTreatmentId] = useState(
    initialTreatmentId || TREATMENTS[0].id,
  );
  const [date, setDate] = useState(() => getNextOpenClinicDate());
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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI / QR');
  const [step, setStep] = useState<'form' | 'payment' | 'confirmed'>('form');
  const [error, setError] = useState('');
  const [confirmedApt, setConfirmedApt] = useState<Appointment | null>(null);
  const [emailFeedback, setEmailFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialDoctorId) setDoctorId(initialDoctorId);
      if (initialTreatmentId) setTreatmentId(initialTreatmentId);
      if (session?.role === 'customer') {
        setPatientName((prev) => prev || session.name);
        setPatientEmail((prev) => prev || session.email);
        setPatientPhone((prev) => prev || session.phone);
      }
      setError('');
      setNameHint('');
      setPhoneHint('');
      setStep('form');
      setConfirmedApt(null);
      setEmailFeedback(null);
    }
  }, [isOpen, initialDoctorId, initialTreatmentId, session]);

  useEffect(() => {
    if (!isOpen || step !== 'form') return;
    const currentStatus = getSlotAvailability(
      existingAppointments,
      doctorId,
      date,
      timeSlot,
    );
    if (currentStatus.isUnavailable) {
      const firstOpen = TIME_SLOTS.find(
        (slot) =>
          !getSlotAvailability(existingAppointments, doctorId, date, slot)
            .isUnavailable,
      );
      if (firstOpen) {
        setTimeSlot(firstOpen);
      }
    }
  }, [isOpen, step, doctorId, date, existingAppointments, timeSlot]);

  if (!isOpen) return null;

  const openSlotsCount = TIME_SLOTS.filter(
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
  };

  const finalizeBooking = (customPaymentRef?: string) => {
    const numericAge = Number(patientAge);
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
      paymentMethod,
      paymentRef: customPaymentRef,
    });

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setConfirmedApt(result.appointment);
    setStep('confirmed');
    setEmailFeedback(`Sending confirmation email to ${result.appointment.patientEmail}...`);

    // Silently dispatch confirmation email directly to the patient when EmailJS is configured
    void sendBookingConfirmationEmail(result.appointment).then((dispatch) => {
      if (dispatch.mode === 'emailjs_sent') {
        setEmailFeedback(dispatch.message);
      } else if (dispatch.mode === 'emailjs_failed') {
        setEmailFeedback(dispatch.message);
      } else {
        setEmailFeedback(
          'Your chair slot is reserved. Print or download your Dentora pass below.',
        );
      }
    });
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

    if (isSundayDate(date)) {
      setError(
        'Dentora is closed on Sundays. Please select a Monday to Saturday date.',
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

    if (paymentMethod === 'UPI / QR' || paymentMethod === 'Card') {
      setStep('payment');
      return;
    }

    finalizeBooking();
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
                  {emailFeedback ||
                    'Your chair slot is reserved. Print or download your Dentora pass below.'}
                </p>
              </div>
            </div>

            <AppointmentSlipCard appointment={confirmedApt} />

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3 print:hidden">
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
        ) : step === 'payment' &&
          (paymentMethod === 'UPI / QR' || paymentMethod === 'Card') ? (
          <PaymentGatewayStep
            patientName={patientName.trim()}
            patientEmail={patientEmail.trim()}
            doctorId={doctorId}
            treatmentId={treatmentId}
            date={date}
            timeSlot={timeSlot}
            paymentMethod={paymentMethod}
            error={error}
            onBack={() => {
              setError('');
              setStep('form');
            }}
            onConfirmPaid={(ref) => finalizeBooking(ref)}
          />
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
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="book-date"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Preferred Date
                  </label>
                  <span className="text-[11px] font-medium text-slate-500">
                    Closed on Sundays
                  </span>
                </div>
                <div className="mt-1.5">
                  <ClinicDatePicker
                    id="book-date"
                    value={date}
                    onChange={setDate}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="block text-xs font-semibold text-slate-700">
                    Available Time Slots (Max {MAX_SLOT_CAPACITY} patients/slot)
                  </span>
                  <span className="font-mono-num text-[11px] font-medium text-blue-700">
                    {openSlotsCount} of {TIME_SLOTS.length} open
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {TIME_SLOTS.map((slot) => {
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

              {/* ₹500 Chair Reservation Fee & Payment Option */}
              <div className="rounded-xl border border-blue-200 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-900">
                      Chair Reservation Fee (All Bookings)
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      Adjusted against your final treatment bill at the clinic
                    </p>
                  </div>
                  <span className="font-mono-num inline-flex items-center text-lg font-bold text-blue-700 shrink-0">
                    <IndianRupee className="h-4 w-4" aria-hidden="true" />
                    {BOOKING_FEE_INR}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {(
                    [
                      { id: 'UPI / QR', label: 'UPI / QR', icon: QrCode },
                      { id: 'Card', label: 'Card', icon: CreditCard },
                      {
                        id: 'Pay at Clinic',
                        label: 'Pay at Clinic',
                        icon: Store,
                      },
                    ] as const
                  ).map(({ id, label, icon: Icon }) => {
                    const selected = paymentMethod === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setPaymentMethod(id)}
                        className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                          selected
                            ? 'border-blue-700 bg-blue-700 text-white'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-500 hover:text-blue-700'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>

                <p className="mt-2.5 text-[11px] text-slate-600">
                  {paymentMethod === 'UPI / QR' &&
                    'Clicking continue opens the Dentora UPI QR scanner to pay ₹500.'}
                  {paymentMethod === 'Card' &&
                    'Clicking continue opens the ₹500 card confirmation checkout.'}
                  {paymentMethod === 'Pay at Clinic' &&
                    'No advance payment needed — pay ₹500 at Dentora reception upon arrival.'}
                </p>
              </div>

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
                {paymentMethod === 'UPI / QR'
                  ? `Continue to UPI QR Payment (₹${BOOKING_FEE_INR})`
                  : paymentMethod === 'Card'
                    ? `Continue to Card Payment (₹${BOOKING_FEE_INR})`
                    : `Confirm Booking (Pay ₹${BOOKING_FEE_INR} at Clinic)`}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
