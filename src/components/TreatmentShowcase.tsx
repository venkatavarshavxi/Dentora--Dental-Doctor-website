import { ArrowUpRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { HERO_CLINIC_IMAGE, TREATMENTS } from '../data/seedData';
import { Treatment, TreatmentCategory } from '../types/dental';

interface TreatmentShowcaseProps {
  onSelectTreatment: (treatment: Treatment) => void;
  onQuickBook: (treatment: Treatment) => void;
}

const CATEGORIES: Array<'All Treatments' | TreatmentCategory> = [
  'All Treatments',
  'Preventive',
  'Cosmetic',
  'Implants & Ortho',
];

export function TreatmentShowcase({
  onSelectTreatment,
  onQuickBook,
}: TreatmentShowcaseProps) {
  const [activeCategory, setActiveCategory] = useState<
    'All Treatments' | TreatmentCategory
  >('All Treatments');
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const visibleTreatments =
    activeCategory === 'All Treatments'
      ? TREATMENTS
      : TREATMENTS.filter((item) => item.category === activeCategory);

  return (
    <section id="treatments" className="bg-[#F0F5FB] py-16 lg:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-wide text-blue-700">
              Clinical Capabilities
            </p>
            <h2
              className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
              style={{ textWrap: 'balance' }}
            >
              Transparent dental care with upfront time and pricing.
            </h2>
          </div>

          {/* Interactive Category Filter Tabs */}
          <div
            role="tablist"
            aria-label="Filter treatments by category"
            className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-xs"
          >
            {CATEGORIES.map((category) => {
              const isSelected = activeCategory === category;
              return (
                <button
                  key={category}
                  role="tab"
                  aria-selected={isSelected}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                    isSelected
                      ? 'bg-blue-700 text-white'
                      : 'text-slate-600 hover:bg-blue-50 hover:text-blue-900'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {/* Uniform Equal-Width & Equal-Height Treatment Grid */}
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
          {visibleTreatments.map((treatment) => (
            <article
              key={treatment.id}
              onClick={() => onSelectTreatment(treatment)}
              className="card-pop group cursor-pointer flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white"
            >
              <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-slate-100">
                {treatment.imageUrl && !failedImages[treatment.id] ? (
                  <img
                    src={treatment.imageUrl}
                    alt={treatment.title}
                    referrerPolicy="no-referrer"
                    onError={() =>
                      setFailedImages((prev) => ({
                        ...prev,
                        [treatment.id]: true,
                      }))
                    }
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-blue-50">
                    <Sparkles className="h-7 w-7 text-blue-700" aria-hidden="true" />
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col justify-between p-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <span className="font-mono-num font-semibold text-blue-700">
                      {treatment.indexLabel}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{treatment.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono-num">{treatment.duration}</span>
                  </div>

                  <h3 className="mt-3 font-display text-xl font-bold tracking-tight text-slate-900 group-hover:text-blue-800 transition-colors">
                    {treatment.title}
                  </h3>

                  <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
                    {treatment.summary}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-200/80 pt-4">
                  <div>
                    <p className="text-[11px] font-medium text-slate-500">
                      Estimated range
                    </p>
                    <p className="font-mono-num text-sm font-semibold text-slate-900">
                      {treatment.priceRange}
                    </p>
                  </div>

                  <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => onSelectTreatment(treatment)}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-blue-600 hover:text-blue-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      View Steps
                    </button>
                    <button
                      type="button"
                      onClick={() => onQuickBook(treatment)}
                      aria-label={`Book ${treatment.title}`}
                      className="inline-flex items-center gap-1 rounded-lg bg-[#091830] px-3 py-2 text-xs font-semibold text-white group-hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Book
                      <ArrowUpRight
                        className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Architectural Clinical Suite Showcase Band */}
        <div className="mt-14 overflow-hidden rounded-2xl border border-blue-200/80 bg-white shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 lg:items-stretch">
            <div className="relative h-64 bg-slate-100 lg:col-span-6 lg:h-auto lg:min-h-[300px]">
              <img
                src={HERO_CLINIC_IMAGE}
                alt="Sunlit Dentora Dental Studio clinical suite and digital radiography room"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex flex-col justify-center p-7 sm:p-10 lg:col-span-6">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-700">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                <span>Inside Dentora Clinical Suite</span>
              </div>
              <h3
                className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900"
                style={{ textWrap: 'balance' }}
              >
                Designed for calm focus and hospital-grade sterilization.
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Every operatory pairs natural daylight with Class-B autoclave
                instrument sterilization, ultra-low-dose digital X-rays, and
                noise-isolated treatment suites.
              </p>

              <div className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-3">
                <div>
                  <p className="font-mono-num text-sm font-semibold text-slate-900">
                    Class-B
                  </p>
                  <p className="text-xs text-slate-500">
                    Autoclave sterilization
                  </p>
                </div>
                <div>
                  <p className="font-mono-num text-sm font-semibold text-slate-900">
                    90% Less
                  </p>
                  <p className="text-xs text-slate-500">
                    Digital X-ray exposure
                  </p>
                </div>
                <div>
                  <p className="font-mono-num text-sm font-semibold text-slate-900">
                    100%
                  </p>
                  <p className="text-xs text-slate-500">
                    Upfront treatment fees
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
