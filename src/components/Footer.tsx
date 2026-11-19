import { MessageCircle } from 'lucide-react';
import { CLINIC_WHATSAPP_DISPLAY } from '../data/seedData';
import { buildClinicWhatsAppUrl } from '../utils/whatsappSlip';
import { ToothIcon } from './ToothIcon';

interface FooterProps {
  isDoctor?: boolean;
  onBookVisit: () => void;
  onOpenDoctorPortal?: () => void;
}

export function Footer({
  isDoctor = false,
  onBookVisit,
  onOpenDoctorPortal,
}: FooterProps) {
  return (
    <footer className="border-t border-white/10 bg-[#071326] py-12 text-slate-300">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          <div className="md:col-span-5">
            <span className="inline-flex items-center gap-2 font-display text-xl font-bold tracking-tight text-white">
              <ToothIcon className="h-5 w-5 text-sky-400 shrink-0" />
              <span>Dentora</span>
            </span>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-300">
              Precision preventive, cosmetic, and implant dentistry with
              transparent care plans and direct specialist guidance.
            </p>
          </div>

          <div className="md:col-span-4 space-y-2 text-sm">
            <p className="font-semibold text-white">Clinic Hours &amp; Desk</p>
            <p className="font-mono-num text-xs text-sky-300">
              Mon – Sat · 9:00 AM – 6:30 PM (Closed Sundays)
            </p>
            <p className="text-xs text-slate-400">
              420 Meridian Dental Plaza, Suite 300
            </p>
            <p className="font-mono-num text-xs text-slate-400">
              care@dentorastudio.com · +1 (415) 890-4400
            </p>
            <a
              href={buildClinicWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-mono-num text-xs font-semibold text-emerald-300 hover:text-emerald-200 transition-colors"
            >
              <MessageCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>WhatsApp: {CLINIC_WHATSAPP_DISPLAY}</span>
            </a>
          </div>

          <div className="md:col-span-3 flex flex-col items-start gap-2.5 text-sm">
            <p className="font-semibold text-white">Quick Links</p>
            <a
              href="#treatments"
              className="text-slate-300 hover:text-sky-300 transition-colors"
            >
              Treatments
            </a>
            <a
              href="#specialists"
              className="text-slate-300 hover:text-sky-300 transition-colors"
            >
              Specialists
            </a>
            <a
              href="#ask-sec"
              className="text-slate-300 hover:text-sky-300 transition-colors"
            >
              {isDoctor ? 'Patient Q&A' : 'Ask a Dentist'}
            </a>
            {isDoctor ? (
              <button
                type="button"
                onClick={onOpenDoctorPortal}
                className="font-semibold text-sky-300 hover:text-sky-200 cursor-pointer"
              >
                Doctor Dashboard
              </button>
            ) : (
              <button
                type="button"
                onClick={onBookVisit}
                className="font-semibold text-sky-300 hover:text-sky-200 cursor-pointer"
              >
                Book Consultation
              </button>
            )}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Dentora Dental Studio. All rights reserved.</p>
          <p>Board-Certified Dental Care · Patient Privacy Protected</p>
        </div>
      </div>
    </footer>
  );
}
