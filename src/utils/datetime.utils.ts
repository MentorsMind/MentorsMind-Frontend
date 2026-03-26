// src/utils/datetime.utils.ts
export const detectUserTimezone = (): string => Intl.DateTimeFormat().resolvedOptions().timeZone;

export const formatDateTime = (
  date: Date | string,
  options?: Intl.DateTimeFormatOptions,
  timeZone?: string
): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', { timeZone, ...options }).format(d);
};

export const getDateKey = (date: Date | string, timeZone?: string): string =>
  formatDateTime(
    date,
    {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    },
    timeZone
  );

export const getTimezoneShortName = (date: Date | string, timeZone: string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'short',
  }).formatToParts(d);

  return parts.find((part) => part.type === 'timeZoneName')?.value ?? timeZone;
};

export const relativeTimeFromNow = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
  if (Math.abs(diffDay) >= 1) return rtf.format(diffDay, 'day');
  if (Math.abs(diffHour) >= 1) return rtf.format(diffHour, 'hour');
  if (Math.abs(diffMin) >= 1) return rtf.format(diffMin, 'minute');
  return rtf.format(diffSec, 'second');
};
