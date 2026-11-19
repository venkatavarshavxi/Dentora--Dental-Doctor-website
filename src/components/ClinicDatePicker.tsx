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
  allowedDays?: number[];
  scheduleLabel?: string;
  availabilityText?: string;
  compact?: boolean;
}

const DAY_LABELS: Record<number, string> = {
  1: 'Mon',
  2: 'Tue',
  3: 'Wed',
  4: 'Thu',
  5: 'Fri',
  6: 'Sat',
};

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
  allowedDays,
  scheduleLabel,
  availabilityText,
  compact = false,
}: ClinicDatePickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const todayISO = getTodayISO();
  const todayDate = parseLocalDate(todayISO);

  const visibleDays = useMemo(() => {
    const valid = (allowedDays || [1, 2, 3, 4, 5, 6]).filter(
      (d) => d >= 1 && d <= 6,
    );
    const unique = Array.from(new Set(valid)).sort((a, b) => a - b);
    return unique.length > 0 ? unique : [1, 2, 3, 4, 5, 6];
  }, [allowedDays]);

  const colCount = visibleDays.length;
  const gridColsClass =
    colCount === 5
      ? 'grid-cols-5'
      : colCount === 4
        ? 'grid-cols-4'
        : 'grid-cols-6';

  const effectiveScheduleLabel =
    scheduleLabel ||
    (colCount === 6
      ? 'Mon–Sat'
      : visibleDays.map((d) => DAY_LABELS[d]).join(', '));

  const offDaysSummary = useMemo(() => {
    const off: string[] = ['Sun'];
    for (let d = 1; d <= 6; d++) {
      if (!visibleDays.includes(d)) {
        off.push(DAY_LABELS[d]);
      }
    }
    return off.length === 1
      ? 'Closed Sundays'
      : `Unavailable: ${off.join(' & ')}`;
  }, [visibleDays]);

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

  // Build calendar rows strictly omitting Sundays and non-working weekdays for the selected doctor
  const weeks = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const rows: Array<Array<CalendarDayCell | null>> = [];
    let currentRow: Array<CalendarDayCell | null> = Array.from(
      { length: colCount },
      () => null,
    );
    let hasCellInRow = false;

    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(year, month, day);
      const dayOfWeek = dateObj.getDay();
      const colIndex = visibleDays.indexOf(dayOfWeek);

      if (colIndex === -1) {
        if (hasCellInRow) {
          rows.push(currentRow);
          currentRow = Array.from({ length: colCount }, () => null);
          hasCellInRow = false;
        }
        continue;
      }

      const iso = formatDateISO(dateObj);
      currentRow[colIndex] = {
        iso,
        dayNumber: day,
        isPast: iso < todayISO,
        isToday: iso === todayISO,
        isSelected: iso === value,
      };
      hasCellInRow = true;

      if (colIndex === colCount - 1) {
        rows.push(currentRow);
        currentRow = Array.from({ length: colCount }, () => null);
        hasCellInRow = false;
      }
    }

    if (hasCellInRow) {
      rows.push(currentRow);
    }

    return rows;
  }, [year, month, todayISO, value, visibleDays, colCount]);

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
            {value
              ? formatReadableDate(value)
              : `Select date (${effectiveScheduleLabel})`}
          </span>
        </span>
        <span className="text-[11px] font-semibold text-blue-700 whitespace-nowrap">
          {effectiveScheduleLabel}
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Specialist booking calendar"
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

          <div
            className={`grid ${gridColsClass} gap-1.5 border-b border-slate-100 pb-2 text-center`}
          >
            {visibleDays.map((dayNum) => (
              <span
                key={dayNum}
                className="text-[11px] font-semibold text-slate-500"
              >
                {DAY_LABELS[dayNum]}
              </span>
            ))}
          </div>

          <div className="mt-2 space-y-1.5">
            {weeks.map((week, rowIdx) => (
              <div key={rowIdx} className={`grid ${gridColsClass} gap-1.5`}>
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

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2.5 text-[11px] text-slate-500">
            <span>{availabilityText || `Open ${effectiveScheduleLabel}`}</span>
            <span className="font-semibold text-blue-700">{offDaysSummary}</span>
          </div>
        </div>
      )}
    </div>
  );
}
