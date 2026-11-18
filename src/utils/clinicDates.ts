export function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return new Date();
  return new Date(y, m - 1, d);
}

export function isSundayDate(dateStr: string): boolean {
  if (!dateStr) return false;
  return parseLocalDate(dateStr).getDay() === 0;
}

export function getTodayISO(): string {
  return formatDateISO(new Date());
}

export function getNextOpenClinicDate(fromDate = new Date()): string {
  const d = new Date(
    fromDate.getFullYear(),
    fromDate.getMonth(),
    fromDate.getDate(),
  );
  if (d.getDay() === 0) {
    d.setDate(d.getDate() + 1);
  }
  return formatDateISO(d);
}

export function formatReadableDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = parseLocalDate(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
