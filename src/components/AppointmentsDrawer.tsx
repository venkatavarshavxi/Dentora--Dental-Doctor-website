import {
  Calendar,
  CalendarClock,
  FileText,
  LogIn,
  LogOut,
  Plus,
  Search,
  UserCheck,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { DOCTORS, TIME_SLOTS, TREATMENTS } from '../data/seedData';
import { getSlotAvailability } from '../db/dentalStore';
import { Appointment, AuthSession } from '../types/dental';
import { AppointmentSlipModal } from './AppointmentSlipModal';
import { ClinicDatePicker } from './ClinicDatePicker';

interface AppointmentsDrawerProps {
  isOpen: boolean;
  session: AuthSession | null;
  appointments: Appointment[];
  onClose: () => void;
  onCancelAppointment: (id: string) => void;
  onRescheduleAppointment: (
    id: string,
    newDate: string,
    newTimeSlot: string,
  ) => { ok: true } | { ok: false; error: string };
  onNewBooking: () => void;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenDoctorPortal?: () => void;
}

export function AppointmentsDrawer({
  isOpen,
  session,
  appointments,
  onClose,
  onCancelAppointment,
  onRescheduleAppointment,
  onNewBooking,
  onOpenLogin,
  onLogout,
  onOpenDoctorPortal,
}: AppointmentsDrawerProps) {
  const [statusFilter, setStatusFilter] = useState<
    'All' | 'Confirmed' | 'Cancelled'
  >('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newSlot, setNewSlot] = useState(TIME_SLOTS[0]);
  const [rescheduleError, setRescheduleError] = useState('');
  const [viewingSlipApt, setViewingSlipApt] = useState<Appointment | null>(null);

  if (!isOpen) return null;

  const filteredAppointments = appointments.filter((apt) => {
    const matchesScope =
      session?.role === 'customer'
        ? apt.patientEmail.toLowerCase() === session.email.toLowerCase()
        : session?.role === 'doctor'
          ? apt.doctorId === session.doctorId
          : apt.id !== 'apt-2041';
    const matchesStatus =
      statusFilter === 'All' || apt.status === statusFilter;
    const query = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !query ||
      apt.patientName.toLowerCase().includes(query) ||
      apt.id.toLowerCase().includes(query) ||
      apt.patientPhone.includes(query);
    return matchesScope && matchesStatus && matchesSearch;
  });

  const startReschedule = (apt: Appointment) => {
    setRescheduleId(apt.id);
    setNewDate(apt.date);
    setNewSlot(apt.timeSlot);
    setRescheduleError('');
  };

  const handleSaveReschedule = (id: string) => {
    setRescheduleError('');
    if (!newDate) {
      setRescheduleError('Please select a new date.');
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
      aria-labelledby="appointments-drawer-title"
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs"
    >
      <div className="flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-[#F4F8FD] shadow-2xl">
        <div className="flex items-center justify-between border-b border-blue-900/40 bg-[#091830] px-6 py-5 text-white">
          <div>
            <h3
              id="appointments-drawer-title"
              className="font-display text-lg font-bold text-white"
            >
              Your Appointments
            </h3>
            <p className="text-xs text-sky-200">
              Saved locally in your browser · Instant updates
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close appointments drawer"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-slate-200 hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Account Status Banner */}
        <div className="border-b border-blue-100 bg-blue-50/70 px-6 py-3">
          {session ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <UserCheck className="h-4 w-4 shrink-0 text-blue-700" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-slate-900">
                    {session.name}
                  </p>
                  <p className="truncate text-[11px] text-slate-600">
                    {session.role === 'doctor' ? 'Specialist Account' : session.email}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenLogin();
                  }}
                  className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-blue-700 hover:bg-blue-50 cursor-pointer"
                >
                  <span>Switch</span>
                </button>
                <button
                  type="button"
                  onClick={onLogout}
                  className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:border-red-300 hover:text-red-600 cursor-pointer"
                >
                  <LogOut className="h-3 w-3" aria-hidden="true" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] text-slate-600">
                Sign in to view your saved visits &amp; slips
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenLogin();
                }}
                className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-blue-700 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-blue-800 cursor-pointer"
              >
                <LogIn className="h-3 w-3" aria-hidden="true" />
                <span>Sign In</span>
              </button>
            </div>
          )}
        </div>

        {/* Search & Status Filter Bar */}
        <div className="border-b border-slate-200 bg-white px-6 py-3.5 space-y-3">

          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, phone, or Ref ID..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1">
            {(['All', 'Confirmed', 'Cancelled'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`rounded-md py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                  statusFilter === tab
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {filteredAppointments.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
              <Calendar
                className="mx-auto h-8 w-8 text-slate-400"
                aria-hidden="true"
              />
              <p className="mt-3 text-sm font-semibold text-slate-800">
                No matching appointments
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Book a consultation or adjust your filter above.
              </p>
            </div>
          ) : (
            filteredAppointments.map((apt) => {
              const doc = DOCTORS.find((d) => d.id === apt.doctorId);
              const tr = TREATMENTS.find((t) => t.id === apt.treatmentId);
              const isConfirmed = apt.status === 'Confirmed';
              const isRescheduling = rescheduleId === apt.id;

              return (
                <div
                  key={apt.id}
                  className="card-pop rounded-xl border border-blue-100 bg-white p-4"
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-mono-num font-semibold text-slate-500">
                      {apt.id.toUpperCase()}
                    </span>
                    <span
                      className={`font-semibold ${
                        isConfirmed ? 'text-blue-700' : 'text-slate-400'
                      }`}
                    >
                      {apt.status}
                    </span>
                  </div>

                  <p className="mt-2 font-display text-base font-bold text-slate-900">
                    {tr?.title || 'Dental Consultation'}
                  </p>
                  <p className="text-xs font-medium text-blue-700">
                    {doc?.name || 'Dentora Specialist'} · {apt.patientName} (Age{' '}
                    {apt.patientAge})
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    {apt.visitType} ·{' '}
                    <span
                      className={
                        apt.urgency === 'Urgent Pain'
                          ? 'font-semibold text-amber-700'
                          : ''
                      }
                    >
                      {apt.urgency}
                    </span>{' '}
                    · {apt.patientPhone}
                  </p>
                  <p className="font-mono-num mt-1 text-[11px] font-medium text-slate-600">
                    WhatsApp: {apt.whatsappNumber || apt.patientPhone}
                  </p>

                  {isRescheduling ? (
                    <div className="mt-3 space-y-2.5 border-t border-slate-100 pt-3">
                      <p className="text-xs font-semibold text-slate-800">
                        Pick New Date &amp; Time (Mon–Sat)
                      </p>
                      <ClinicDatePicker
                        value={newDate}
                        onChange={setNewDate}
                        compact
                      />
                      <select
                        value={newSlot}
                        onChange={(e) => setNewSlot(e.target.value)}
                        className="font-mono-num w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900"
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
                      {rescheduleError && (
                        <p className="text-[11px] font-medium text-red-600">
                          {rescheduleError}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleSaveReschedule(apt.id)}
                          className="flex-1 rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 cursor-pointer"
                        >
                          Save Slot
                        </button>
                        <button
                          type="button"
                          onClick={() => setRescheduleId(null)}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                        >
                          Back
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
                      <span className="font-mono-num font-medium text-slate-900">
                        {apt.date} · {apt.timeSlot}
                      </span>

                      {isConfirmed && (
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setViewingSlipApt(apt)}
                            title="View Styled Appointment Slip"
                            className="inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-blue-700 cursor-pointer"
                          >
                            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                            View Slip
                          </button>
                          <button
                            type="button"
                            onClick={() => startReschedule(apt)}
                            className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:underline cursor-pointer"
                          >
                            <CalendarClock
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />
                            Reschedule
                          </button>
                          {session?.role === 'doctor' && (
                            <button
                              type="button"
                              onClick={() => onCancelAppointment(apt.id)}
                              className="font-semibold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="border-t border-slate-200 bg-white p-6">
          {session?.role === 'doctor' ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenDoctorPortal?.();
              }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 transition-colors cursor-pointer"
            >
              Open Doctor Dashboard
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                onClose();
                onNewBooking();
              }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Book New Appointment
            </button>
          )}
        </div>
      </div>

      <AppointmentSlipModal
        appointment={viewingSlipApt}
        onClose={() => setViewingSlipApt(null)}
      />
    </div>
  );
}
