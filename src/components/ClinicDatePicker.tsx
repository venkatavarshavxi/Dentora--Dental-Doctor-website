import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  formatDateISO,
  formatReadableDate,
  getTodayISO,
  parseLocalDate,
} from '../utils/clinicDates';

interface ClinicDatePickerProps {
  id?: string;
  value: string;
  onChange: (dateStr: string) => void;
  compact?: boolean;
}

const WEEKDAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

interface CalendarDayCell {
  iso: string;
  dayNumber: number;
  isPast: boolean;
  isToday: boolean;
  isSelected: boolean;
}

export function ClinicDatePicker({
  id,
  value,
  onChange,
  compact = false,
}: ClinicDatePickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const todayISO = getTodayISO();
  const todayDate = parseLocalDate(todayISO);

  const initialCursor = useMemo(() => {
    const base = value ? parseLocalDate(value) : new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  }, [value]);

  const [viewMonth, setViewMonth] = useState<Date>(initialCursor);

  useEffect(() => {
    if (value) {
      const parsed = parseLocalDate(value);
      setViewMonth(new Date(parsed.getFullYear(), parsed.getMonth(), 1));
    }
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();

  const canGoPrevMonth =
    year > todayDate.getFullYear() ||
    (year === todayDate.getFullYear() && month > todayDate.getMonth());

  // Build Mon–Sat weeks strictly omitting Sundays from the calendar grid
  const weeks = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const rows: Array<Array<CalendarDayCell | null>> = [];
    let currentRow: Array<CalendarDayCell | null> = [
      null,
      null,
      null,
      null,
      null,
      null,
    ];
    let hasCellInRow = false;

    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(year, month, day);
      const dayOfWeek = dateObj.getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat

      // Skip Sundays completely so Sunday bookings never appear in the calendar
      if (dayOfWeek === 0) {
        if (hasCellInRow) {
          rows.push(currentRow);
          currentRow = [null, null, null, null, null, null];
          hasCellInRow = false;
        }
        continue;
      }

      const colIndex = dayOfWeek - 1; // Mon=0 ... Sat=5
      const iso = formatDateISO(dateObj);
      currentRow[colIndex] = {
        iso,
        dayNumber: day,
        isPast: iso < todayISO,
        isToday: iso === todayISO,
        isSelected: iso === value,
      };
      hasCellInRow = true;

      if (dayOfWeek === 6) {
        rows.push(currentRow);
        currentRow = [null, null, null, null, null, null];
        hasCellInRow = false;
      }
    }

    if (hasCellInRow) {
      rows.push(currentRow);
    }

    return rows;
  }, [year, month, todayISO, value]);

  const monthLabel = viewMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div ref={containerRef} className="relative">
      <button
        id={id}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={`flex w-full items-center justify-between rounded-lg border bg-white text-left transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-600/20 ${
          open
            ? 'border-blue-600 ring-2 ring-blue-600/20'
            : 'border-slate-300 hover:border-blue-500'
        } ${compact ? 'px-3 py-1.5 text-xs' : 'px-3.5 py-2.5 text-sm'}`}
      >
        <span className="flex items-center gap-2 font-medium text-slate-900">
          <Calendar
            className={`${compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} text-blue-700 shrink-0`}
            aria-hidden="true"
          />
          <span>
            {value ? formatReadableDate(value) : 'Select clinic date (Mon–Sat)'}
          </span>
        </span>
        <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap">
          Mon–Sat
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Clinic booking calendar"
          className={`popup-enter mt-2 rounded-xl border border-blue-200 bg-white p-4 shadow-xl ${
            compact ? 'relative z-20' : 'absolute left-0 right-0 z-30'
          }`}
        >
          <div className="flex items-center justify-between pb-3">
            <button
              type="button"
              disabled={!canGoPrevMonth}
              onClick={() => setViewMonth(new Date(year, month - 1, 1))}
              aria-label="Previous month"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-35 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="font-display text-sm font-bold text-slate-900">
              {monthLabel}
            </span>

            <button
              type="button"
              onClick={() => setViewMonth(new Date(year, month + 1, 1))}
              aria-label="Next month"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-700 cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-6 gap-1.5 border-b border-slate-100 pb-2 text-center">
            {WEEKDAY_HEADERS.map((dayName) => (
              <span
                key={dayName}
                className="text-[11px] font-semibold text-slate-500"
              >
                {dayName}
              </span>
            ))}
          </div>

          <div className="mt-2 space-y-1.5">
            {weeks.map((week, rowIdx) => (
              <div key={rowIdx} className="grid grid-cols-6 gap-1.5">
                {week.map((cell, colIdx) => {
                  if (!cell) {
                    return <div key={colIdx} className="h-9" />;
                  }

                  return (
                    <button
                      key={cell.iso}
                      type="button"
                      disabled={cell.isPast}
                      onClick={() => {
                        onChange(cell.iso);
                        setOpen(false);
                      }}
                      aria-label={formatReadableDate(cell.iso)}
                      aria-pressed={cell.isSelected}
                      className={`font-mono-num relative flex h-9 items-center justify-center rounded-lg text-xs font-semibold transition-colors ${
                        cell.isPast
                          ? 'cursor-not-allowed text-slate-300'
                          : cell.isSelected
                            ? 'bg-blue-700 text-white shadow-xs cursor-pointer'
                            : cell.isToday
                              ? 'border border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer'
                              : 'text-slate-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer'
                      }`}
                    >
                      {cell.dayNumber}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-[11px] text-slate-500">
            <span>Open Mon – Sat · 9:00 AM – 6:30 PM</span>
            <span className="font-semibold text-blue-700">Closed Sundays</span>
          </div>
        </div>
      )}
    </div>
  );
}
