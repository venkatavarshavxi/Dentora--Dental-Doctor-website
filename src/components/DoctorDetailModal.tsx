import { CalendarCheck2, Clock, Star, X } from 'lucide-react';
import { Doctor } from '../types/dental';

interface DoctorDetailModalProps {
  doctor: Doctor | null;
  onClose: () => void;
  onBookDoctor: (doctor: Doctor) => void;
}

export function DoctorDetailModal({
  doctor,
  onClose,
  onBookDoctor,
}: DoctorDetailModalProps) {
  if (!doctor) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="doctor-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
    >
      <div className="popup-enter relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-blue-200 bg-white shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close specialist profile"
          className="absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white/90 text-slate-600 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12">
          <div className="md:col-span-5 bg-slate-100">
            <img
              src={doctor.imageUrl}
              alt={doctor.name}
              referrerPolicy="no-referrer"
              className="h-72 w-full object-cover object-top md:h-full"
            />
          </div>

          <div className="flex flex-col justify-between p-6 sm:p-8 md:col-span-7">
            <div>
              <p className="text-xs font-semibold text-blue-700">
                {doctor.credentials}
              </p>
              <h3
                id="doctor-modal-title"
                className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900"
              >
                {doctor.name}
              </h3>
              <p className="text-sm font-medium text-slate-600">{doctor.role}</p>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-600">
                <span className="inline-flex items-center gap-1 font-semibold text-slate-900">
                  <Star
                    className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                    aria-hidden="true"
                  />
                  <span className="font-mono-num">{doctor.rating}</span>
                  <span className="font-normal text-slate-500">
                    ({doctor.reviewCount} patient reviews)
                  </span>
                </span>
                <span className="font-mono-num text-slate-500">
                  {doctor.experienceYears} years clinical practice
                </span>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                {doctor.bio}
              </p>

              <div className="mt-5 border-t border-slate-100 pt-4">
                <p className="text-xs font-semibold text-slate-800">
                  Clinical Focus Areas
                </p>
                <p className="mt-1.5 text-sm text-slate-600">
                  {doctor.specialties.join(' · ')}
                </p>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-slate-600">
                <Clock className="h-4 w-4 text-blue-700" aria-hidden="true" />
                <span className="font-mono-num">{doctor.availability}</span>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={() => onBookDoctor(doctor)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 active:scale-[0.99] transition-all cursor-pointer"
              >
                <CalendarCheck2 className="h-4 w-4" aria-hidden="true" />
                Book Consultation with {doctor.name}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
