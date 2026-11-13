import i18n from 'i18next';

/** Dates in the panel's language (ADR 0022); copied from BC with the locale taken from i18n. */
const locale = () => i18n.language || undefined;

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat(locale(), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(iso));
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat(locale(), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

/** "3 hours ago", "yesterday", falling back to the date after a month. */
export function formatRelative(iso: string, now = Date.now()): string {
  const rel = new Intl.RelativeTimeFormat(locale(), { numeric: 'auto' });
  const diff = (new Date(iso).getTime() - now) / 1000;
  const abs = Math.abs(diff);
  if (abs < 60) return rel.format(0, 'second');
  if (abs < 3600) return rel.format(Math.round(diff / 60), 'minute');
  if (abs < 86_400) return rel.format(Math.round(diff / 3600), 'hour');
  if (abs < 86_400 * 30) return rel.format(Math.round(diff / 86_400), 'day');
  return formatDate(iso);
}

/** A calendar date (`YYYY-MM-DD`), read as UTC midnight so the day never shifts with time zones. */
export function formatDay(day: string): string {
  return new Intl.DateTimeFormat(locale(), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${day}T00:00:00Z`));
}

/** A decimal taka amount (`"2000.00"`) as `৳ 2,000.00` in the panel's language. */
export function formatTaka(amount: string): string {
  const n = new Intl.NumberFormat(locale(), {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount));
  return `৳ ${n}`;
}
