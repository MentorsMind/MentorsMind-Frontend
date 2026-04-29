import type { TimezoneInfo, TimezoneRegion } from '../types/timezone.types';

// Comprehensive IANA timezone database by region
const TIMEZONE_DATABASE: TimezoneInfo[] = [
  // Americas - North
  { ianaId: 'America/Anchorage', region: 'Americas', offset: -9, displayName: 'AKST (UTC-9)', label: 'America/Anchorage' },
  { ianaId: 'America/Los_Angeles', region: 'Americas', offset: -8, displayName: 'PST (UTC-8)', label: 'America/Los_Angeles' },
  { ianaId: 'America/Denver', region: 'Americas', offset: -7, displayName: 'MST (UTC-7)', label: 'America/Denver' },
  { ianaId: 'America/Chicago', region: 'Americas', offset: -6, displayName: 'CST (UTC-6)', label: 'America/Chicago' },
  { ianaId: 'America/New_York', region: 'Americas', offset: -5, displayName: 'EST (UTC-5)', label: 'America/New_York' },
  
  // Americas - South
  { ianaId: 'America/Mexico_City', region: 'Americas', offset: -6, displayName: 'CST (UTC-6)', label: 'America/Mexico_City' },
  { ianaId: 'America/Caracas', region: 'Americas', offset: -4, displayName: 'VET (UTC-4)', label: 'America/Caracas' },
  { ianaId: 'America/Bogota', region: 'Americas', offset: -5, displayName: 'COT (UTC-5)', label: 'America/Bogota' },
  { ianaId: 'America/Lima', region: 'Americas', offset: -5, displayName: 'PET (UTC-5)', label: 'America/Lima' },
  { ianaId: 'America/Buenos_Aires', region: 'Americas', offset: -3, displayName: 'ART (UTC-3)', label: 'America/Buenos_Aires' },
  { ianaId: 'America/Sao_Paulo', region: 'Americas', offset: -3, displayName: 'BRT (UTC-3)', label: 'America/Sao_Paulo' },
  
  // Europe
  { ianaId: 'Europe/Lisbon', region: 'Europe', offset: 0, displayName: 'WET (UTC+0)', label: 'Europe/Lisbon' },
  { ianaId: 'Europe/London', region: 'Europe', offset: 0, displayName: 'GMT (UTC+0)', label: 'Europe/London' },
  { ianaId: 'Europe/Dublin', region: 'Europe', offset: 0, displayName: 'IST (UTC+0)', label: 'Europe/Dublin' },
  { ianaId: 'Europe/Paris', region: 'Europe', offset: 1, displayName: 'CET (UTC+1)', label: 'Europe/Paris' },
  { ianaId: 'Europe/Berlin', region: 'Europe', offset: 1, displayName: 'CET (UTC+1)', label: 'Europe/Berlin' },
  { ianaId: 'Europe/Amsterdam', region: 'Europe', offset: 1, displayName: 'CET (UTC+1)', label: 'Europe/Amsterdam' },
  { ianaId: 'Europe/Madrid', region: 'Europe', offset: 1, displayName: 'CET (UTC+1)', label: 'Europe/Madrid' },
  { ianaId: 'Europe/Rome', region: 'Europe', offset: 1, displayName: 'CET (UTC+1)', label: 'Europe/Rome' },
  { ianaId: 'Europe/Prague', region: 'Europe', offset: 1, displayName: 'CET (UTC+1)', label: 'Europe/Prague' },
  { ianaId: 'Europe/Istanbul', region: 'Europe', offset: 3, displayName: 'EET (UTC+3)', label: 'Europe/Istanbul' },
  { ianaId: 'Europe/Moscow', region: 'Europe', offset: 3, displayName: 'MSK (UTC+3)', label: 'Europe/Moscow' },
  
  // Africa
  { ianaId: 'Africa/Cairo', region: 'Africa', offset: 2, displayName: 'EET (UTC+2)', label: 'Africa/Cairo' },
  { ianaId: 'Africa/Lagos', region: 'Africa', offset: 1, displayName: 'WAT (UTC+1)', label: 'Africa/Lagos' },
  { ianaId: 'Africa/Johannesburg', region: 'Africa', offset: 2, displayName: 'SAST (UTC+2)', label: 'Africa/Johannesburg' },
  { ianaId: 'Africa/Nairobi', region: 'Africa', offset: 3, displayName: 'EAT (UTC+3)', label: 'Africa/Nairobi' },
  
  // Asia
  { ianaId: 'Asia/Dubai', region: 'Asia/Pacific', offset: 4, displayName: 'GST (UTC+4)', label: 'Asia/Dubai' },
  { ianaId: 'Asia/Karachi', region: 'Asia/Pacific', offset: 5, displayName: 'PKT (UTC+5)', label: 'Asia/Karachi' },
  { ianaId: 'Asia/Kolkata', region: 'Asia/Pacific', offset: 5.5, displayName: 'IST (UTC+5:30)', label: 'Asia/Kolkata' },
  { ianaId: 'Asia/Bangkok', region: 'Asia/Pacific', offset: 7, displayName: 'ICT (UTC+7)', label: 'Asia/Bangkok' },
  { ianaId: 'Asia/Ho_Chi_Minh', region: 'Asia/Pacific', offset: 7, displayName: 'ICT (UTC+7)', label: 'Asia/Ho_Chi_Minh' },
  { ianaId: 'Asia/Singapore', region: 'Asia/Pacific', offset: 8, displayName: 'SGT (UTC+8)', label: 'Asia/Singapore' },
  { ianaId: 'Asia/Hong_Kong', region: 'Asia/Pacific', offset: 8, displayName: 'HKT (UTC+8)', label: 'Asia/Hong_Kong' },
  { ianaId: 'Asia/Shanghai', region: 'Asia/Pacific', offset: 8, displayName: 'CST (UTC+8)', label: 'Asia/Shanghai' },
  { ianaId: 'Asia/Tokyo', region: 'Asia/Pacific', offset: 9, displayName: 'JST (UTC+9)', label: 'Asia/Tokyo' },
  { ianaId: 'Asia/Seoul', region: 'Asia/Pacific', offset: 9, displayName: 'KST (UTC+9)', label: 'Asia/Seoul' },
  
  // Pacific
  { ianaId: 'Australia/Sydney', region: 'Asia/Pacific', offset: 10, displayName: 'AEDT (UTC+10)', label: 'Australia/Sydney' },
  { ianaId: 'Pacific/Auckland', region: 'Asia/Pacific', offset: 12, displayName: 'NZDT (UTC+12)', label: 'Pacific/Auckland' },
];




/**
 * Get all available timezones
 */
export function getAllTimezones(): TimezoneInfo[] {
  return TIMEZONE_DATABASE;
}

/**
 * Get timezones by region
 */
export function getTimezonesByRegion(region: TimezoneRegion): TimezoneInfo[] {
  return TIMEZONE_DATABASE.filter(tz => tz.region === region);
}

/**
 * Get all unique regions
 */
export function getAllRegions(): TimezoneRegion[] {
  const regions = new Set<TimezoneRegion>();
  TIMEZONE_DATABASE.forEach(tz => regions.add(tz.region));
  return Array.from(regions);
}

/**
 * Parse IANA timezone string to extract offset
 * Handles formats like "UTC-8", "UTC+5:30", "UTC+1"
 */
export function parseTimezoneOffset(timezoneStr: string): number {
  const trimmed = timezoneStr.trim();
  
  // Try to find in database first
  const dbEntry = TIMEZONE_DATABASE.find(tz => tz.ianaId === trimmed || tz.label === trimmed);
  if (dbEntry) return dbEntry.offset;
  
  // Parse UTC format
  const match = trimmed.match(/UTC([+-])(\d{1,2})(?::(\d{2}))?/);
  if (match) {
    const sign = match[1] === '+' ? 1 : -1;
    const hours = parseInt(match[2], 10);
    const minutes = match[3] ? parseInt(match[3], 10) : 0;
    return sign * (hours + minutes / 60);
  }
  
  return 0; // Default to UTC
}

/**
 * Get current local time for a mentor in their timezone
 */
export function getMentorLocalTime(timezoneStr: string): Date {
  const offset = parseTimezoneOffset(timezoneStr);
  const now = new Date();
  const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utcTime + offset * 3600000);
}

/**
 * Format time as "HH:MM AM/PM"
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Get timezones within ±N hours of user's timezone
 */
export function getNearbyTimezones(userTimezoneStr: string, hourRange: number = 3): TimezoneInfo[] {
  const userOffset = parseTimezoneOffset(userTimezoneStr);
  return TIMEZONE_DATABASE.filter(tz => {
    const diff = Math.abs(tz.offset - userOffset);
    return diff <= hourRange;
  });
}

/**
 * Calculate timezone difference in hours
 */
export function calculateTimezoneOffset(tz1: string, tz2: string): number {
  const offset1 = parseTimezoneOffset(tz1);
  const offset2 = parseTimezoneOffset(tz2);
  return offset2 - offset1;
}

/**
 * Check if mentor is available now based on current time and availability slots
 */
export function isMentorAvailableNow(
  timezoneStr: string,
  availabilitySlots: { dayOfWeek: number; startHour: number; endHour: number }[]
): boolean {
  const localTime = getMentorLocalTime(timezoneStr);
  const dayOfWeek = localTime.getDay();
  const currentHour = localTime.getHours();
  
  return availabilitySlots.some(
    slot => slot.dayOfWeek === dayOfWeek && currentHour >= slot.startHour && currentHour < slot.endHour
  );
}

/**
 * Get next available time for a mentor
 */
export function getNextAvailableTime(
  timezoneStr: string,
  availabilitySlots: { dayOfWeek: number; startHour: number; endHour: number }[]
): Date | null {
  if (!availabilitySlots || availabilitySlots.length === 0) return null;
  
  const localTime = getMentorLocalTime(timezoneStr);
  const currentDayOfWeek = localTime.getDay();
  const currentHour = localTime.getHours();
  
  // Sort slots by day and hour
  const sortedSlots = [...availabilitySlots].sort((a, b) => {
    if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
    return a.startHour - b.startHour;
  });
  
  // Find next available slot
  for (const slot of sortedSlots) {
    if (slot.dayOfWeek > currentDayOfWeek || 
        (slot.dayOfWeek === currentDayOfWeek && slot.startHour >= currentHour)) {
      const nextTime = new Date(localTime);
      nextTime.setDate(nextTime.getDate() + (slot.dayOfWeek - currentDayOfWeek));
      nextTime.setHours(slot.startHour, 0, 0, 0);
      return nextTime;
    }
  }
  
  return null;
}

/**
 * Format timezone difference for display
 */
export function formatTimezoneOffset(offsetHours: number): string {
  if (offsetHours === 0) return 'Same timezone';
  const sign = offsetHours > 0 ? '+' : '';
  return offsetHours % 1 === 0
    ? `${sign}${offsetHours}h`
    : `${sign}${offsetHours.toFixed(1)}h`;
}

/**
 * Get timezone info by IANA ID
 */
export function getTimezoneInfo(ianaId: string): TimezoneInfo | undefined {
  return TIMEZONE_DATABASE.find(tz => tz.ianaId === ianaId);
}
