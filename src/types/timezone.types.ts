// Timezone Types and Interfaces

export type TimezoneRegion = 'Americas' | 'Europe' | 'Africa' | 'Asia/Pacific';

export interface TimezoneInfo {
  ianaId: string;
  region: TimezoneRegion;
  offset: number; // UTC offset in hours
  displayName: string; // e.g., "PST (UTC-8)"
  label: string; // e.g., "America/Los_Angeles"
}

export interface MentorTimezoneData {
  mentorId: string;
  timezone: string;
  localTime: Date;
  isAvailableNow: boolean;
  availabilitySlots: AvailabilitySlot[];
}

export interface AvailabilitySlot {
  dayOfWeek: number; // 0-6
  startHour: number; // 0-23
  endHour: number; // 0-23
}

export interface TimezoneProximityFilter {
  selectedTimezone?: string;
  selectedRegions: TimezoneRegion[];
  similarToMine: boolean;
  availableNow: boolean;
}

export interface MentorWithTimezoneData {
  mentor: any; // Mentor type
  localTime: string;
  timezoneOffset: number;
  nextAvailableTime?: Date;
  isAvailableNow: boolean;
}

export interface MapMentorPin {
  mentorId: string;
  mentorName: string;
  lat: number;
  lng: number;
  timezone: string;
  localTime: string;
  avatar?: string;
}

export interface TimezoneClusters {
  [region: string]: MapMentorPin[];
}
