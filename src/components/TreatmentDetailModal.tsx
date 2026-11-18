import { ArrowRight, X } from 'lucide-react';
import { DOCTORS } from '../data/seedData';
import { Treatment } from '../types/dental';

interface TreatmentDetailModalProps {
  treatment: Treatment | null;
  onClose: () => void;
  onBookTreatment: (treatment: Treatment) => void;
}

export function TreatmentDetailModal({
  treatment,
  onClose,
  onBookTreatment,
}: TreatmentDetailModalProps) {
  if (!treatment) return null;

  const recommendedDoctor = DOCTORS.find(
    (doc) => doc.id === treatment.recommendedDoctorId,
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="treatment-detail-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
    >
      <div className="popup-enter relative w-full max-w-lg rounded-2xl border border-blue-200 bg-[#F4F8FD] p-6 shadow-2xl sm:p-8">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close treatment details"
          className="absolute right-5 top-5 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <span className="font-mono-num font-semibold text-blue-700">
            {treatment.indexLabel}
          </span>
          <span aria-hidden="true">·</span>
          <span>{treatment.category}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono-num">{treatment.duration}</span>
        </div>

        <h3
          id="treatment-detail-title"
          className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900 pr-8"
        >
          {treatment.title}
        </h3>

        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          {treatment.summary}
        </p>

        <div className="mt-6 rounded-xl border border-blue-100 bg-white p-5">
          <p className="text-xs font-semibold text-slate-800">
            Clinical Visit Steps
          </p>
          <ol className="mt-3 space-y-2.5">
            {treatment.steps.map((step, index) => (
              <li
                key={step}
                className="flex items-start gap-3 text-sm text-slate-600"
              >
                <span className="font-mono-num mt-0.5 text-xs font-semibold text-blue-700">
                  0{index + 1}.
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-blue-100 pt-5">
          <div>
            <p className="text-xs text-slate-500">
              Estimated fee · Lead specialist
            </p>
            <p className="mt-0.5 text-sm font-semibold text-slate-900">
              <span className="font-mono-num">{treatment.priceRange}</span>
              {recommendedDoctor ? ` · ${recommendedDoctor.name}` : ''}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onBookTreatment(treatment)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 transition-colors cursor-pointer"
          >
            Schedule Treatment
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
