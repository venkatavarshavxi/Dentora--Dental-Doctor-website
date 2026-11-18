import { ChevronDown, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { ACCEPTED_PLANS, PRE_VISIT_FAQS } from '../data/seedData';

export function PreVisitSection() {
  const [openFaqId, setOpenFaqId] = useState<string>(PRE_VISIT_FAQS[0].id);

  return (
    <section className="bg-[#F0F5FB] py-16">
      <div className="mx-auto max-w-6xl px-6 space-y-12">
        {/* Accepted Dental Plans Strip (Clean unboxed typography, zero pill clutter) */}
        <div className="rounded-2xl border border-blue-200/80 bg-white px-6 py-6 sm:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-900">
              <ShieldCheck
                className="h-5 w-5 text-blue-700 shrink-0"
                aria-hidden="true"
              />
              <span>Accepted Insurance &amp; Care Plans</span>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-slate-600 sm:text-sm">
              {ACCEPTED_PLANS.map((plan, index) => (
                <span key={plan} className="inline-flex items-center gap-4">
                  <span>{plan}</span>
                  {index < ACCEPTED_PLANS.length - 1 && (
                    <span aria-hidden="true" className="text-slate-300">
                      ·
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Pre-Visit FAQ Accordion */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-5">
            <p className="text-xs font-semibold tracking-wide text-blue-700">
              Patient Guide
            </p>
            <h2
              className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
              style={{ textWrap: 'balance' }}
            >
              Quick answers before your clinic visit.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Clear preparation guidelines, transparent cancellation policies,
              and comfort care details.
            </p>
          </div>

          <div className="space-y-3 lg:col-span-7">
            {PRE_VISIT_FAQS.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="rounded-xl border border-slate-200 bg-white transition-colors"
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() =>
                      setOpenFaqId(isOpen ? '' : faq.id)
                    }
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left cursor-pointer"
                  >
                    <span className="font-display text-sm font-bold text-slate-900 sm:text-base">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-blue-700 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </button>

                  {isOpen && (
                    <div className="border-t border-slate-100 px-5 pb-4 pt-3 text-sm leading-relaxed text-slate-600">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
