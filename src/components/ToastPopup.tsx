import { CheckCircle2, X } from 'lucide-react';

interface ToastPopupProps {
  message: string | null;
  onDismiss: () => void;
}

export function ToastPopup({ message, onDismiss }: ToastPopupProps) {
  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="popup-enter fixed bottom-5 right-5 z-50 flex max-w-sm items-center gap-3 rounded-xl border border-sky-400/40 bg-[#091830] px-4 py-3.5 text-sm text-white shadow-2xl"
    >
      <CheckCircle2
        className="h-5 w-5 shrink-0 text-sky-400"
        aria-hidden="true"
      />
      <p className="flex-1 text-xs font-medium leading-snug text-slate-100">
        {message}
      </p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="rounded-md p-1 text-slate-400 hover:bg-white/10 hover:text-white cursor-pointer"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
