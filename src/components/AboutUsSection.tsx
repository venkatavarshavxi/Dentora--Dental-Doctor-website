import {
  Building2,
  Clock,
  HelpCircle,
  MapPin,
  MessageCircle,
  Phone,
  Stethoscope,
} from 'lucide-react';
import { useState } from 'react';
import { CLINIC_WHATSAPP_DISPLAY } from '../data/seedData';
import { buildClinicWhatsAppUrl } from '../utils/whatsappSlip';

interface AboutUsSectionProps {
  isDoctor?: boolean;
  onBookVisit: () => void;
  onOpenDoctorPortal?: () => void;
}

const ABOUT_LOUNGE_IMAGE =
  '/src/assets/images/about_clinic_lounge_1795079932010.jpg';
const ABOUT_PATIENT_IMAGE =
  '/src/assets/images/about_patient_smile_care_1795079913118.jpg';
const ABOUT_TEAM_IMAGE =
  '/src/assets/images/about_team_consultation_1795079914122.jpg';

const EXPERIENCE_STATS = [
  {
    value: '14+ Yrs',
    label: 'Clinical Practice',
    detail: 'Serving families since 2012',
  },
  {
    value: '18,400+',
    label: 'Patients Treated',
    detail: 'Across 6 dental specialties',
  },
  {
    value: '98.6%',
    label: 'Comfort Rating',
    detail: 'Verified post-visit reviews',
  },
];

const CLINIC_HOURS = [
  { day: 'Monday – Saturday', hours: '9:00 AM – 6:30 PM', highlight: true },
  { day: 'Morning Chair Session', hours: '9:00 AM – 1:00 PM', highlight: false },
  { day: 'Afternoon Chair Session', hours: '2:00 PM – 6:30 PM', highlight: false },
  { day: 'Sunday', hours: 'Closed', highlight: false },
];

export function AboutUsSection({
  isDoctor = false,
  onBookVisit,
  onOpenDoctorPortal,
}: AboutUsSectionProps) {
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const markFailed = (key: string) =>
    setFailedImages((prev) => ({ ...prev, [key]: true }));

  return (
    <section
      id="about"
      className="border-b border-blue-200/70 bg-white py-16 lg:py-20"
    >
      <div className="mx-auto max-w-6xl px-6">
        {/* Top Editorial Split: Story + Experience on Left, 3-Photo Studio Gallery on Right */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-stretch">
          <div className="flex flex-col justify-between lg:col-span-5">
            <div>
              <p className="text-xs font-semibold tracking-wide text-blue-700">
                About Dentora Dental Studio
              </p>
              <h2
                className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
                style={{ textWrap: 'balance' }}
              >
                14+ years of calm, specialist-led dental care.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                Founded in 2012, Dentora brings six board-certified specialists
                together under one roof — combining gentle restorative care,
                3D digital diagnostics, and transparent visit planning without
                rushed waiting rooms.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                From routine children&apos;s checkups to guided dental implants
                and clear aligners, every patient receives step-by-step guidance
                and a clear chair schedule before treatment begins.
              </p>
            </div>

            {/* Experience & Patients Metrics */}
            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-slate-200 pt-6">
              {EXPERIENCE_STATS.map((stat) => (
                <div key={stat.label}>
                  <p className="font-mono-num text-xl font-bold tracking-tight text-blue-700 sm:text-2xl">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-900">
                    {stat.label}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-snug text-slate-500">
                    {stat.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Asymmetric 3-Photo Clinic & Patient Care Gallery */}
          <div className="flex flex-col gap-4 lg:col-span-7">
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              {!failedImages.lounge ? (
                <img
                  src={ABOUT_LOUNGE_IMAGE}
                  alt="Dentora Dental Studio reception counter and sunlit patient waiting lounge"
                  referrerPolicy="no-referrer"
                  onError={() => markFailed('lounge')}
                  className="h-full w-full object-cover object-center transition-transform duration-500 hover:scale-[1.02]"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-blue-50 p-6 text-center">
                  <Building2
                    className="h-10 w-10 text-blue-700"
                    aria-hidden="true"
                  />
                  <p className="mt-2 font-display text-sm font-semibold text-slate-800">
                    Dentora Reception &amp; Patient Lounge
                  </p>
                </div>
              )}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950/75 via-slate-950/30 to-transparent"
              />
              <p className="absolute bottom-3.5 left-4 text-xs font-semibold text-white">
                Calm Reception &amp; Zero-Rush Patient Lounge
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                {!failedImages.patient ? (
                  <img
                    src={ABOUT_PATIENT_IMAGE}
                    alt="Dentora specialist explaining a 3D tooth scan to a smiling patient"
                    referrerPolicy="no-referrer"
                    onError={() => markFailed('patient')}
                    className="h-full w-full object-cover object-center transition-transform duration-500 hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-blue-50 p-6 text-center">
                    <Stethoscope
                      className="h-8 w-8 text-blue-700"
                      aria-hidden="true"
                    />
                    <p className="mt-2 text-xs font-semibold text-slate-800">
                      Digital Patient Walkthroughs
                    </p>
                  </div>
                )}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950/75 via-slate-950/30 to-transparent"
                />
                <p className="absolute bottom-3 left-4 text-xs font-semibold text-white">
                  Visual 3D Scan Walkthroughs
                </p>
              </div>

              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                {!failedImages.team ? (
                  <img
                    src={ABOUT_TEAM_IMAGE}
                    alt="Two Dentora dental specialists reviewing digital radiographs together"
                    referrerPolicy="no-referrer"
                    onError={() => markFailed('team')}
                    className="h-full w-full object-cover object-center transition-transform duration-500 hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-blue-50 p-6 text-center">
                    <Stethoscope
                      className="h-8 w-8 text-blue-700"
                      aria-hidden="true"
                    />
                    <p className="mt-2 text-xs font-semibold text-slate-800">
                      Multi-Specialist Case Review
                    </p>
                  </div>
                )}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950/75 via-slate-950/30 to-transparent"
                />
                <p className="absolute bottom-3 left-4 text-xs font-semibold text-white">
                  Collaborative Specialist Planning
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom 3-Column Strip: Clinic Details, Timings & Queries */}
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Card 1: Clinic Details */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-[#F4F8FD] p-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-700">
                <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Clinic Details</span>
              </div>
              <h3 className="mt-2 font-display text-lg font-bold text-slate-900">
                Dentora Dental Studio
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                420 Meridian Dental Plaza, Suite 300
                <br />
                San Francisco, CA 94107
              </p>
            </div>

            <div className="mt-5 space-y-2 border-t border-slate-200/80 pt-4 text-xs text-slate-700">
              <p className="flex items-center gap-2 font-mono-num">
                <Phone className="h-3.5 w-3.5 text-blue-700 shrink-0" aria-hidden="true" />
                <span>Helpline: +1 (415) 890-4400</span>
              </p>
              <a
                href={buildClinicWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-mono-num font-semibold text-emerald-700 hover:text-emerald-800"
              >
                <MessageCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>WhatsApp Desk: {CLINIC_WHATSAPP_DISPLAY}</span>
              </a>
            </div>
          </div>

          {/* Card 2: Clinic Timings */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-[#F4F8FD] p-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-700">
                <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Clinic Timings</span>
              </div>
              <h3 className="mt-2 font-display text-lg font-bold text-slate-900">
                Weekly Chair Schedule
              </h3>
              <dl className="mt-4 space-y-2.5 text-xs">
                {CLINIC_HOURS.map((row) => (
                  <div
                    key={row.day}
                    className="flex items-center justify-between gap-2 border-b border-slate-200/70 pb-2 last:border-b-0 last:pb-0"
                  >
                    <dt
                      className={
                        row.highlight
                          ? 'font-semibold text-slate-900'
                          : 'text-slate-600'
                      }
                    >
                      {row.day}
                    </dt>
                    <dd
                      className={`font-mono-num whitespace-nowrap ${
                        row.hours === 'Closed'
                          ? 'font-semibold text-amber-700'
                          : row.highlight
                            ? 'font-semibold text-blue-700'
                            : 'text-slate-700'
                      }`}
                    >
                      {row.hours}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <p className="mt-4 text-[11px] text-slate-500">
              Same-day urgent toothache slots reserved daily Mon – Sat.
            </p>
          </div>

          {/* Card 3: Any Queries */}
          <div className="flex flex-col justify-between rounded-2xl border border-blue-200 bg-[#091830] p-6 text-white">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-sky-300">
                <HelpCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Any Queries?</span>
              </div>
              <h3 className="mt-2 font-display text-lg font-bold text-white">
                {isDoctor
                  ? 'Need to review patient queries?'
                  : 'Have questions before visiting?'}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                {isDoctor
                  ? 'Jump directly to the Patient Q&A feed to reply to pending symptoms or manage bookings in your Doctor Dashboard.'
                  : 'Ask our dentists directly online for symptom guidance, or message our clinic desk on WhatsApp for quick help.'}
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-2.5">
              <a
                href="#ask-sec"
                className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2.5 text-xs font-semibold text-[#091830] hover:bg-sky-50 transition-colors whitespace-nowrap"
              >
                {isDoctor ? 'Go to Patient Q&A' : 'Ask a Dentist Online'}
              </a>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={buildClinicWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-white/15 transition-colors whitespace-nowrap"
                >
                  <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>WhatsApp</span>
                </a>
                {isDoctor ? (
                  <button
                    type="button"
                    onClick={onOpenDoctorPortal}
                    className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/15 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Dashboard
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onBookVisit}
                    className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/15 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Book Visit
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
