import { ArrowUpRight, CalendarCheck2, Star, UserRound } from 'lucide-react';
import { useState } from 'react';
import { DOCTORS, PATIENT_TESTIMONIALS } from '../data/seedData';
import { Doctor } from '../types/dental';

interface SpecialistGridProps {
  onBookWithDoctor: (doctor: Doctor) => void;
  onSelectDoctor: (doctor: Doctor) => void;
}

export function SpecialistGrid({
  onBookWithDoctor,
  onSelectDoctor,
}: SpecialistGridProps) {
  const [failedPortraits, setFailedPortraits] = useState<
    Record<string, boolean>
  >({});

  return (
    <section
      id="specialists"
      className="border-y border-blue-200/70 bg-[#E3ECF7] py-16 lg:py-20"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-wide text-blue-700">
            Clinical Team
          </p>
          <h2
            className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
            style={{ textWrap: 'balance' }}
          >
            Meet the specialists guiding your dental care.
          </h2>
          <p className="mt-3 text-base text-slate-700">
            Click any specialist card to view their full profile popup, or book
            directly into their live schedule.
          </p>
        </div>

        {/* 3 Specialist Cards with Clean Pop-Out Lift */}
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {DOCTORS.map((doctor) => (
            <article
              key={doctor.id}
              onClick={() => onSelectDoctor(doctor)}
              className="card-pop group cursor-pointer flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100">
                {!failedPortraits[doctor.id] ? (
                  <img
                    src={doctor.imageUrl}
                    alt={`${doctor.name}, ${doctor.role}`}
                    referrerPolicy="no-referrer"
                    onError={() =>
                      setFailedPortraits((prev) => ({
                        ...prev,
                        [doctor.id]: true,
                      }))
                    }
                    className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-blue-50 p-6 text-center">
                    <UserRound
                      className="h-12 w-12 text-blue-700"
                      aria-hidden="true"
                    />
                    <p className="mt-2 font-display text-base font-semibold text-slate-800">
                      {doctor.name}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col justify-between p-6">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{doctor.credentials}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono-num">
                      {doctor.experienceYears} yrs exp
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-2">
                    <h3 className="font-display text-xl font-bold tracking-tight text-slate-900 group-hover:text-blue-800 transition-colors">
                      {doctor.name}
                    </h3>
                    <ArrowUpRight
                      className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-blue-700"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="text-sm font-medium text-blue-700">
                    {doctor.role}
                  </p>

                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {doctor.bio}
                  </p>

                  <p className="mt-3 text-xs text-slate-500">
                    Focus: {doctor.specialties.join(' / ')}
                  </p>
                </div>

                <div
                  className="mt-6 border-t border-slate-100 pt-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1 font-medium text-slate-800">
                      <Star
                        className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                        aria-hidden="true"
                      />
                      <span className="font-mono-num">{doctor.rating}</span>
                      <span className="text-slate-400">
                        ({doctor.reviewCount})
                      </span>
                    </span>
                    <span className="font-mono-num text-[11px] text-slate-500">
                      {doctor.availability}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => onSelectDoctor(doctor)}
                      className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-700 hover:border-blue-600 hover:text-blue-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      View Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => onBookWithDoctor(doctor)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#091830] px-3 py-2.5 text-xs font-semibold text-white group-hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                    >
                      <CalendarCheck2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Book Visit
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Calm, Steady Verified Patient Experiences (No hover animation or shimmer) */}
        <div className="mt-14 border-t border-blue-200/80 pt-12">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-wide text-blue-700">
                Patient Outcomes
              </p>
              <h3 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900">
                Verified patient experiences
              </h3>
            </div>
            <p className="text-xs text-slate-600">
              98.6% post-visit comfort rating across 2026 patient surveys
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            {PATIENT_TESTIMONIALS.map((story) => (
              <blockquote
                key={story.id}
                className="flex flex-col justify-between rounded-xl border border-blue-200/80 bg-white p-6 text-slate-800 shadow-xs"
              >
                <p className="text-sm leading-relaxed text-slate-700">
                  “{story.quote}”
                </p>
                <footer className="mt-5 border-t border-slate-100 pt-3">
                  <p className="text-sm font-semibold text-slate-900">
                    {story.patientName}
                  </p>
                  <p className="text-xs font-medium text-blue-700">
                    {story.procedure} · {story.visitDate}
                  </p>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
