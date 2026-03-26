export const formatTimeSlot = (
  start: Date | string,
  end: Date | string,
  timeZone?: string,
  use24h = false
): string => {
  const startDate = typeof start === 'string' ? new Date(start) : start;
  const endDate = typeof end === 'string' ? new Date(end) : end;

  const formatTime = (date: Date) =>
    new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: !use24h,
      timeZone,
    }).format(date);

  return `${formatTime(startDate)} - ${formatTime(endDate)}`;
};

export const convertTimezone = (date: Date, fromTz: string, toTz: string): Date => {
  const dateStr = date.toLocaleString('en-US', { timeZone: fromTz });
  const targetDate = new Date(dateStr);
  return new Date(targetDate.toLocaleString('en-US', { timeZone: toTz }));
};

export const getTimezones = (): string[] => {
  return Intl.supportedValuesOf('timeZone');
};

export const detectTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

export const isTimeSlotOverlapping = (
  slot1: { start: Date; end: Date },
  slot2: { start: Date; end: Date }
): boolean => {
  return slot1.start < slot2.end && slot1.end > slot2.start;
};

export const generateRecurringSlots = (
  baseSlot: { start: Date; end: Date },
  pattern: { frequency: 'daily' | 'weekly' | 'monthly'; daysOfWeek?: number[]; endDate?: Date },
  maxOccurrences = 52
): Array<{ start: Date; end: Date }> => {
  const slots: Array<{ start: Date; end: Date }> = [];
  let currentStart = new Date(baseSlot.start);
  let currentEnd = new Date(baseSlot.end);

  for (let i = 0; i < maxOccurrences; i++) {
    if (pattern.endDate && currentStart > pattern.endDate) break;

    if (pattern.frequency === 'weekly' && pattern.daysOfWeek) {
      if (pattern.daysOfWeek.includes(currentStart.getDay())) {
        slots.push({ start: new Date(currentStart), end: new Date(currentEnd) });
      }
    } else {
      slots.push({ start: new Date(currentStart), end: new Date(currentEnd) });
    }

    const duration = currentEnd.getTime() - currentStart.getTime();
    
    if (pattern.frequency === 'daily') {
      currentStart.setDate(currentStart.getDate() + 1);
    } else if (pattern.frequency === 'weekly') {
      currentStart.setDate(currentStart.getDate() + 7);
    } else if (pattern.frequency === 'monthly') {
      currentStart.setMonth(currentStart.getMonth() + 1);
    }
    
    currentEnd = new Date(currentStart.getTime() + duration);
  }

  return slots;
};

export const formatDateRange = (start: Date, end: Date): string => {
  const sameDay = start.toDateString() === end.toDateString();
  if (sameDay) {
    return `${start.toLocaleDateString()} ${formatTimeSlot(start, end)}`;
  }
  return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
};
