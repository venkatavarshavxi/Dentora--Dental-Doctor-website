import { ArrowRight, Stethoscope } from 'lucide-react';
import { useState } from 'react';
import { HERO_DENTIST_PATIENT_IMAGE } from '../data/seedData';
import { AuthSession } from '../types/dental';

interface HeroSectionProps {
  session?: AuthSession | null;
  onBookVisit: () => void;
  onOpenDoctorPortal?: () => void;
}

const CLINIC_METRICS = [
  {
    value: '18,400+',
    label: 'Patient Visits Completed',
    detail: 'Across preventive & cosmetic care',
  },
  {
    value: '12 min',
    label: 'Average Chair Wait Time',
    detail: 'Digital check-in & on-time slots',
  },
  {
    value: '3D Scan',
    label: 'Zero-Putty Impressions',
    detail: 'Optical intraoral diagnostics',
  },
  {
    value: 'Same-Day',
    label: 'Urgent Toothache Slots',
    detail: 'Reserved daily for emergencies',
  },
];

export function HeroSection({
  session,
  onBookVisit,
  onOpenDoctorPortal,
}: HeroSectionProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <section
      id="top"
      className="relative overflow-hidden border-b border-blue-950/60 bg-gradient-to-br from-[#091830] via-[#0E2447] to-[#143463] text-white"
    >
      {/* Subtle architectural ambient light */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-blue-400/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 left-12 h-80 w-80 rounded-full bg-sky-400/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl px-6 py-14 lg:py-20">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-stretch">
          {/* Left Column: Value Proposition */}
          <div className="flex flex-col justify-center lg:col-span-6">
            <p className="text-xs font-semibold tracking-wide text-sky-300">
              Dentora Dental Studio · Board-Certified Care
            </p>

            {/* Slow glimmer slide hover effect exclusively on this hero headline */}
            <h1
              className="headline-shimmer mt-4 font-display font-bold tracking-tight leading-[1.08]"
              style={{
                fontSize: 'clamp(2.25rem, 4vw, 3.6rem)',
                textWrap: 'balance',
              }}
            >
              Calm, precision dentistry built around your schedule.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-200 sm:text-lg">
              Consult directly with specialist prosthodontists, implant
              surgeons, and orthodontists. Ask dental questions online, explore
              transparent treatment plans, and confirm your chair slot in
              seconds.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-5">
              {session?.role === 'doctor' ? (
                <button
                  type="button"
                  onClick={onOpenDoctorPortal}
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3.5 text-sm font-semibold text-[#091830] shadow-lg shadow-blue-950/35 hover:bg-sky-50 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#091830]"
                >
                  Open Doctor Dashboard
                  <ArrowRight className="h-4 w-4 text-blue-700" aria-hidden="true" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onBookVisit}
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3.5 text-sm font-semibold text-[#091830] shadow-lg shadow-blue-950/35 hover:bg-sky-50 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#091830]"
                >
                  Book Consultation
                  <ArrowRight className="h-4 w-4 text-blue-700" aria-hidden="true" />
                </button>
              )}

              <a
                href="#ask-sec"
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/[0.06] px-5 py-3.5 text-sm font-semibold text-sky-200 hover:border-sky-300/60 hover:bg-white/[0.12] hover:text-white transition-all whitespace-nowrap shrink-0"
              >
                {session?.role === 'doctor'
                  ? 'Answer Patient Q&A'
                  : 'Ask a Dentist Online'}
              </a>
            </div>
          </div>

          {/* Right Column: Bright White Teeth Smile Visual */}
          <div className="lg:col-span-6">
            <div className="card-pop-dark relative h-72 w-full overflow-hidden rounded-2xl border border-white/20 bg-slate-900 shadow-2xl sm:h-96 lg:h-full lg:min-h-[410px]">
              {!imgError ? (
                <img
                  src={HERO_DENTIST_PATIENT_IMAGE}
                  alt="Dentist examining a smiling patient in a bright blue-and-white Dentora clinic suite"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="h-full w-full object-cover object-center transition-transform duration-500 hover:scale-[1.03]"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#0E2447] to-[#143463] p-8 text-center">
                  <Stethoscope className="h-12 w-12 text-sky-300" aria-hidden="true" />
                  <p className="mt-3 font-display text-lg font-semibold text-white">
                    Dentora Smile Studio
                  </p>
                </div>
              )}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#091830]/70 via-[#091830]/20 to-transparent"
              />
            </div>
          </div>
        </div>

        {/* Full-Width 4-Column Clinic Proof Strip */}
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CLINIC_METRICS.map((metric) => (
            <div
              key={metric.label}
              className="card-pop-dark rounded-xl border border-white/15 bg-white/[0.06] p-5 backdrop-blur-xs"
            >
              <p className="font-mono-num text-2xl font-semibold tracking-tight text-sky-300">
                {metric.value}
              </p>
              <p className="mt-1.5 text-sm font-semibold text-white">
                {metric.label}
              </p>
              <p className="mt-0.5 text-xs text-slate-300">{metric.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
