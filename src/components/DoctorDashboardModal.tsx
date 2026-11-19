import {
  Calendar,
  CalendarClock,
  CheckCircle2,
  FileText,
  LogOut,
  MessageSquareText,
  Send,
  Stethoscope,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { TIME_SLOTS, TREATMENTS } from '../data/seedData';
import { getSlotAvailability } from '../db/dentalStore';
import { Appointment, AuthSession, DentalQuestion } from '../types/dental';
import { formatReadableDate } from '../utils/clinicDates';
import { AppointmentSlipModal } from './AppointmentSlipModal';
import { ClinicDatePicker } from './ClinicDatePicker';

interface DoctorDashboardModalProps {
  isOpen: boolean;
  session: Extract<AuthSession, { role: 'doctor' }> | null;
  appointments: Appointment[];
  questions: DentalQuestion[];
  onClose: () => void;
  onCancelAppointment: (id: string) => void;
  onCompleteAppointment: (id: string) => void;
  onRescheduleAppointment: (
    id: string,
    newDate: string,
    newTimeSlot: string,
  ) => { ok: true } | { ok: false; error: string };
  onReplyQuestion: (
    questionId: string,
    doctorId: string,
    answerText: string,
  ) => void;
  onLogout: () => void;
}

export function DoctorDashboardModal({
  isOpen,
  session,
  appointments,
  questions,
  onClose,
  onCancelAppointment,
  onCompleteAppointment,
  onRescheduleAppointment,
  onReplyQuestion,
  onLogout,
}: DoctorDashboardModalProps) {
  const [activeTab, setActiveTab] = useState<'schedule' | 'questions'>('schedule');
  const [statusFilter, setStatusFilter] = useState<
    'All' | 'Confirmed' | 'Completed' | 'Cancelled'
  >('All');
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [viewingSlip, setViewingSlip] = useState<Appointment | null>(null);
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newSlot, setNewSlot] = useState(TIME_SLOTS[0]);
  const [rescheduleError, setRescheduleError] = useState('');

  if (!isOpen || !session) return null;

  const doctorAppointments = appointments.filter(
    (apt) => apt.doctorId === session.doctorId,
  );
  const filteredDoctorAppointments = doctorAppointments.filter(
    (apt) => statusFilter === 'All' || apt.status === statusFilter,
  );
  const confirmedAppointments = doctorAppointments.filter(
    (apt) => apt.status === 'Confirmed',
  );
  const pendingQuestions = questions.filter((q) => q.status === 'Pending Review');

  const startReschedule = (apt: Appointment) => {
    setRescheduleId(apt.id);
    setNewDate(apt.date);
    setNewSlot(apt.timeSlot);
    setRescheduleError('');
  };

  const handleSaveReschedule = (id: string) => {
    setRescheduleError('');
    if (!newDate) {
      setRescheduleError('Please select a new clinic date.');
      return;
    }
    const res = onRescheduleAppointment(id, newDate, newSlot);
    if (!res.ok) {
      setRescheduleError(res.error);
      return;
    }
    setRescheduleId(null);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="doctor-portal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs"
    >
      <div className="popup-enter flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-blue-200 bg-[#F4F8FD] shadow-2xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-blue-900/40 bg-[#091830] px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-sky-300">
              <Stethoscope className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-sky-300">
                Specialist Workspace · {session.roleTitle}
              </p>
              <h3
                id="doctor-portal-title"
                className="font-display text-lg font-bold text-white"
              >
                {session.name}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-100 hover:bg-white/20 cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Sign Out</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close doctor portal"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-slate-200 hover:bg-white/10 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Summary & Tabs */}
        <div className="border-b border-slate-200 bg-white px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setActiveTab('schedule')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'schedule'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
              <span>My Bookings ({confirmedAppointments.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('questions')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'questions'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquareText className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Patient Questions ({pendingQuestions.length} pending)</span>
            </button>
          </div>

          <p className="font-mono-num text-xs text-slate-500">
            {session.email}
          </p>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'schedule' ? (
            <>
              {doctorAppointments.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="inline-flex rounded-lg bg-slate-200/70 p-1">
                    {(['All', 'Confirmed', 'Completed', 'Cancelled'] as const).map(
                      (tab) => (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setStatusFilter(tab)}
                          className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                            statusFilter === tab
                              ? 'bg-white text-blue-700 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {tab}
                        </button>
                      ),
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    Showing {filteredDoctorAppointments.length} of{' '}
                    {doctorAppointments.length} bookings
                  </p>
                </div>
              )}

              {filteredDoctorAppointments.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
                  <p className="text-sm font-semibold text-slate-800">
                    {doctorAppointments.length === 0
                      ? 'No appointments assigned yet'
                      : `No ${statusFilter.toLowerCase()} bookings`}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {doctorAppointments.length === 0
                      ? `Bookings made under ${session.name} will appear here automatically.`
                      : 'Switch status filter above to view your other bookings.'}
                  </p>
                </div>
              ) : (
                filteredDoctorAppointments.map((apt) => {
                  const tr = TREATMENTS.find((t) => t.id === apt.treatmentId);
                  const isConfirmed = apt.status === 'Confirmed';
                  const isCompleted = apt.status === 'Completed';
                  const isRescheduling = rescheduleId === apt.id;
                  return (
                    <div
                      key={apt.id}
                      className="rounded-xl border border-blue-100 bg-white p-4 shadow-xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="font-mono-num font-semibold text-slate-500">
                          {apt.id.toUpperCase()} · {formatReadableDate(apt.date)} at{' '}
                          <span className="text-blue-700">{apt.timeSlot}</span>
                        </span>
                        <span
                          className={`font-semibold ${
                            isConfirmed
                              ? 'text-blue-700'
                              : isCompleted
                                ? 'text-emerald-700'
                                : 'text-slate-400'
                          }`}
                        >
                          {apt.status}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-display text-base font-bold text-slate-900">
                            {apt.patientName} (Age {apt.patientAge})
                          </p>
                          <p className="text-xs font-medium text-blue-700">
                            {tr?.title || 'Consultation'} · {apt.visitType} ·{' '}
                            <span
                              className={
                                apt.urgency === 'Urgent Pain'
                                  ? 'font-bold text-amber-700'
                                  : ''
                              }
                            >
                              {apt.urgency}
                            </span>
                          </p>
                          <p className="font-mono-num mt-1 text-[11px] text-slate-500">
                            Phone: {apt.patientPhone} · WhatsApp:{' '}
                            {apt.whatsappNumber || apt.patientPhone} · Email:{' '}
                            {apt.patientEmail}
                          </p>
                          {apt.notes && (
                            <p className="mt-1 text-xs text-slate-600">
                              Notes: {apt.notes}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap shrink-0 items-center gap-2">
                          {(isConfirmed || isCompleted) && (
                            <button
                              type="button"
                              onClick={() => setViewingSlip(apt)}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-blue-600 hover:text-blue-700 cursor-pointer"
                            >
                              <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>Slip</span>
                            </button>
                          )}
                          {isConfirmed && (
                            <>
                              <button
                                type="button"
                                onClick={() => onCompleteAppointment(apt.id)}
                                className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 cursor-pointer"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                                <span>Mark Completed</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => startReschedule(apt)}
                                className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 cursor-pointer"
                              >
                                <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
                                <span>Reschedule</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (rescheduleId === apt.id) setRescheduleId(null);
                                  onCancelAppointment(apt.id);
                                }}
                                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 cursor-pointer"
                              >
                                Cancel Slot
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {isConfirmed && isRescheduling && (
                        <div className="mt-4 space-y-3 border-t border-slate-100 pt-3">
                          <p className="text-xs font-semibold text-slate-800">
                            Reschedule Date &amp; Chair Time (Mon–Sat)
                          </p>
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <ClinicDatePicker
                              value={newDate}
                              onChange={setNewDate}
                              compact
                            />
                            <select
                              value={newSlot}
                              onChange={(e) => setNewSlot(e.target.value)}
                              className="font-mono-num w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                            >
                              {TIME_SLOTS.map((slot) => {
                                const availability = getSlotAvailability(
                                  appointments,
                                  apt.doctorId,
                                  newDate,
                                  slot,
                                  apt.id,
                                );
                                return (
                                  <option
                                    key={slot}
                                    value={slot}
                                    disabled={availability.isUnavailable}
                                  >
                                    {slot} — {availability.statusLabel}
                                  </option>
                                );
                              })}
                            </select>
                          </div>
                          {rescheduleError && (
                            <p className="text-xs font-medium text-red-600">
                              {rescheduleError}
                            </p>
                          )}
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleSaveReschedule(apt.id)}
                              className="rounded-lg bg-blue-700 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 cursor-pointer"
                            >
                              Save New Slot
                            </button>
                            <button
                              type="button"
                              onClick={() => setRescheduleId(null)}
                              className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                            >
                              Back
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </>
          ) : questions.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
              <p className="text-sm font-semibold text-slate-800">
                No patient questions yet
              </p>
            </div>
          ) : (
            questions.map((q) => {
              const draft = replyDrafts[q.id] || '';
              return (
                <div
                  key={q.id}
                  className="rounded-xl border border-blue-100 bg-white p-4 shadow-xs"
                >
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                    <span>
                      <strong className="text-blue-700">{q.topic}</strong> · Asked by{' '}
                      {q.patientName}
                    </span>
                    <span
                      className={`font-semibold ${
                        q.status === 'Answered'
                          ? 'text-blue-700'
                          : 'text-amber-700'
                      }`}
                    >
                      {q.status}
                    </span>
                  </div>

                  <p className="mt-2 font-display text-sm font-bold text-slate-900">
                    {q.question}
                  </p>

                  {q.answer ? (
                    <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs text-slate-700">
                      <p className="font-semibold text-slate-900">
                        {q.answeredByDoctorName}
                      </p>
                      <p className="mt-1">{q.answer}</p>
                    </div>
                  ) : (
                    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                      <input
                        type="text"
                        value={draft}
                        onChange={(e) =>
                          setReplyDrafts((prev) => ({
                            ...prev,
                            [q.id]: e.target.value,
                          }))
                        }
                        placeholder={`Reply as ${session.name}...`}
                        className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                      />
                      <button
                        type="button"
                        disabled={draft.trim().length < 10}
                        onClick={() => {
                          onReplyQuestion(q.id, session.doctorId, draft);
                          setReplyDrafts((prev) => ({ ...prev, [q.id]: '' }));
                        }}
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-45 cursor-pointer"
                      >
                        <Send className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Publish Reply</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <AppointmentSlipModal
        appointment={viewingSlip}
        onClose={() => setViewingSlip(null)}
      />
    </div>
  );
}
