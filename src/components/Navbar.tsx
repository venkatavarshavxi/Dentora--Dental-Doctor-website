import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { AuthSession } from '../types/dental';
import { ToothIcon } from './ToothIcon';

interface NavbarProps {
  appointmentCount: number;
  session: AuthSession | null;
  onOpenBooking: () => void;
  onOpenAppointments: () => void;
  onOpenLogin: () => void;
  onOpenDoctorPortal: () => void;
}

export function Navbar({
  appointmentCount,
  session,
  onOpenBooking,
  onOpenAppointments,
  onOpenLogin,
  onOpenDoctorPortal,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const authLabel = !session
    ? 'Login'
    : session.role === 'doctor'
      ? 'Doctor Portal'
      : `Account (${session.name.split(' ')[0]})`;

  const handleAuthAction = () => {
    if (!session) {
      onOpenLogin();
    } else if (session.role === 'doctor') {
      onOpenDoctorPortal();
    } else {
      onOpenAppointments();
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#091830]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-6 py-3.5">
        {/* Zone 1: Brand lockup with tooth icon beside Dentora */}
        <a
          href="#top"
          className="inline-flex items-center gap-2 font-display text-xl font-bold tracking-tight text-white whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-sm"
        >
          <ToothIcon className="h-6 w-6 text-sky-400 shrink-0" />
          <span>Dentora</span>
        </a>

        {/* Zone 2: 5 concise single-line navigation links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-200"
        >
          <a
            href="#treatments"
            className="whitespace-nowrap shrink-0 py-1 hover:text-sky-300 hover:underline underline-offset-8 decoration-sky-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-sm"
          >
            Treatments
          </a>
          <a
            href="#specialists"
            className="whitespace-nowrap shrink-0 py-1 hover:text-sky-300 hover:underline underline-offset-8 decoration-sky-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-sm"
          >
            Specialists
          </a>
          <a
            href="#ask-sec"
            className="whitespace-nowrap shrink-0 py-1 hover:text-sky-300 hover:underline underline-offset-8 decoration-sky-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-sm"
          >
            {session?.role === 'doctor' ? 'Patient Q&A' : 'Ask a Dentist'}
          </a>
          <button
            type="button"
            onClick={onOpenAppointments}
            className="whitespace-nowrap shrink-0 py-1 text-left hover:text-sky-300 hover:underline underline-offset-8 decoration-sky-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-sm cursor-pointer"
          >
            Appointments ({appointmentCount})
          </button>
          <button
            type="button"
            onClick={handleAuthAction}
            className="whitespace-nowrap shrink-0 py-1 text-left text-sky-300 hover:text-white hover:underline underline-offset-8 decoration-sky-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-sm cursor-pointer"
          >
            {authLabel}
          </button>
        </nav>

        {/* Zone 3: 1 Primary CTA action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenBooking}
            className="hidden sm:inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 active:scale-[0.98] transition-all whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#091830]"
          >
            Book Visit
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 text-slate-100 hover:bg-white/10 transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#091830] px-6 py-4 space-y-3">
          <a
            href="#treatments"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-200 hover:text-sky-300"
          >
            Treatments
          </a>
          <a
            href="#specialists"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-200 hover:text-sky-300"
          >
            Specialists
          </a>
          <a
            href="#ask-sec"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-200 hover:text-sky-300"
          >
            {session?.role === 'doctor' ? 'Patient Q&A' : 'Ask a Dentist'}
          </a>
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenAppointments();
            }}
            className="block w-full py-2 text-left text-base font-medium text-slate-200 hover:text-sky-300 cursor-pointer"
          >
            Appointments ({appointmentCount})
          </button>
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              handleAuthAction();
            }}
            className="block w-full py-2 text-left text-base font-medium text-sky-300 hover:text-white cursor-pointer"
          >
            {authLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenBooking();
            }}
            className="w-full rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500 transition-colors cursor-pointer"
          >
            Book Visit
          </button>
        </div>
      )}
    </header>
  );
}
