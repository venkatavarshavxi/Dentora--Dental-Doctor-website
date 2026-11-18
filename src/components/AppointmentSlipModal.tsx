import { Download, Mail, Printer, X } from 'lucide-react';
import { Appointment } from '../types/dental';
import { downloadAppointmentSlip } from '../utils/appointmentSlip';
import { buildConfirmationEmailContent } from '../utils/emailConfirmation';
import { AppointmentSlipCard } from './AppointmentSlipCard';

interface AppointmentSlipModalProps {
  appointment: Appointment | null;
  onClose: () => void;
}

export function AppointmentSlipModal({
  appointment,
  onClose,
}: AppointmentSlipModalProps) {
  if (!appointment) return null;

  const { mailtoUrl } = buildConfirmationEmailContent(appointment);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="slip-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs"
    >
      <div className="popup-enter relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-blue-200 bg-[#F4F8FD] p-5 shadow-2xl sm:p-7">
        <div className="mb-4 flex items-center justify-between gap-4 print:hidden">
          <div>
            <p className="text-xs font-semibold text-blue-700">
              Dentora Patient Pass
            </p>
            <h3
              id="slip-modal-title"
              className="font-display text-xl font-bold text-slate-900"
            >
              Appointment Booking Slip
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close appointment slip"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <AppointmentSlipCard appointment={appointment} />

        <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4 print:hidden">
          <a
            href={mailtoUrl}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 hover:border-blue-600 hover:text-blue-700 transition-colors whitespace-nowrap"
          >
            <Mail className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Email Slip</span>
          </a>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 hover:border-blue-600 hover:text-blue-700 transition-colors whitespace-nowrap cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Print / PDF</span>
          </button>

          <button
            type="button"
            onClick={() => downloadAppointmentSlip(appointment)}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-white px-3 py-2.5 text-xs font-semibold text-blue-700 hover:border-blue-600 hover:bg-blue-50 transition-colors whitespace-nowrap cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Download</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-blue-700 px-3 py-2.5 text-xs font-semibold text-white hover:bg-blue-800 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
