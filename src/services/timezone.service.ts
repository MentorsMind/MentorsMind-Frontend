import apiClient from './api.client';
import type {
  MentorWithTimezoneData,
  TimezoneProximityFilter,
  MapMentorPin,
  TimezoneClusters,
} from '../types/timezone.types';
import {
  getMentorLocalTime,
  formatTime,
  getNearbyTimezones,
  isMentorAvailableNow,
  getNextAvailableTime,
  parseTimezoneOffset,
} from '../utils/timezone.utils';
import type { Mentor } from '../types';

class TimezoneService {
  /**
   * Get mentors filtered by timezone proximity
   */
  async getMentorsByTimezone(
    filter: TimezoneProximityFilter
  ): Promise<Mentor[]> {
    try {
      const params = new URLSearchParams();
      
      if (filter.selectedTimezone) {
        params.append('timezone', filter.selectedTimezone);
      }
      
      if (filter.selectedRegions.length > 0) {
        params.append('regions', filter.selectedRegions.join(','));
      }
      
      if (filter.availableNow) {
        params.append('availableNow', 'true');
      }
      
      const response = await apiClient.get('/mentors', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching mentors by timezone:', error);
      throw error;
    }
  }

  /**
   * Get enriched mentor data with timezone information
   */
  async getMentorWithTimezoneData(mentor: Mentor): Promise<MentorWithTimezoneData> {
    const localTime = getMentorLocalTime(mentor.timezone);
    const userTimezone = this.getUserTimezone();
    const timezoneOffset = parseTimezoneOffset(mentor.timezone) - parseTimezoneOffset(userTimezone);
    
    // Mock availability data - in production, fetch from API
    const mockAvailability = [
      { dayOfWeek: 1, startHour: 9, endHour: 17 },
      { dayOfWeek: 2, startHour: 9, endHour: 17 },
      { dayOfWeek: 3, startHour: 9, endHour: 17 },
      { dayOfWeek: 4, startHour: 9, endHour: 17 },
      { dayOfWeek: 5, startHour: 9, endHour: 17 },
    ];
    
    return {
      mentor,
      localTime: formatTime(localTime),
      timezoneOffset,
      nextAvailableTime: getNextAvailableTime(mentor.timezone, mockAvailability) ?? undefined,
      isAvailableNow: isMentorAvailableNow(mentor.timezone, mockAvailability),
    };
  }

  /**
   * Get nearby mentors in similar timezones
   */
  getNearbyMentors(mentors: Mentor[], hourRange: number = 3): Mentor[] {
    const userTimezone = this.getUserTimezone();
    const nearbyTimezones = getNearbyTimezones(userTimezone, hourRange);
    const nearbyTimezoneIds = nearbyTimezones.map(tz => tz.ianaId);
    
    return mentors.filter(mentor =>
      nearbyTimezoneIds.includes(mentor.timezone) ||
      // Also match UTC offset format
      Math.abs(parseTimezoneOffset(mentor.timezone) - parseTimezoneOffset(userTimezone)) <= hourRange
    );
  }

  /**
   * Get mentors available right now
   */
  getAvailableNowMentors(mentors: Mentor[], availabilityMap: Record<string, { dayOfWeek: number; startHour: number; endHour: number }[]>): Mentor[] {
    return mentors.filter(mentor => {
      const slots = availabilityMap[mentor.id] ?? [];
      return isMentorAvailableNow(mentor.timezone, slots);
    });
  }

  /**
   * Sort mentors by closest timezone
   */
  sortByClosestTimezone(mentors: Mentor[]): Mentor[] {
    const userTimezone = this.getUserTimezone();
    const userOffset = parseTimezoneOffset(userTimezone);
    
    return [...mentors].sort((a, b) => {
      const offsetA = Math.abs(parseTimezoneOffset(a.timezone) - userOffset);
      const offsetB = Math.abs(parseTimezoneOffset(b.timezone) - userOffset);
      return offsetA - offsetB;
    });
  }

  /**
   * Get map pins for mentors clustered by timezone region
   */
  getMentorMapPins(mentors: Mentor[]): MapMentorPin[] {
    return mentors.map(mentor => ({
      mentorId: mentor.id,
      mentorName: mentor.name,
      lat: this.getTimezoneLatitude(mentor.timezone),
      lng: this.getTimezoneLongitude(mentor.timezone),
      timezone: mentor.timezone,
      localTime: formatTime(getMentorLocalTime(mentor.timezone)),
      avatar: mentor.avatarUrl,
    }));
  }

  /**
   * Get clustered map data by timezone region
   */
  getClusteredMapData(mentors: Mentor[]): TimezoneClusters {
    const pins = this.getMentorMapPins(mentors);
    const clusters: TimezoneClusters = {};
    
    pins.forEach(pin => {
      const region = this.getTimezoneRegion(pin.timezone);
      if (!clusters[region]) {
        clusters[region] = [];
      }
      clusters[region].push(pin);
    });
    
    return clusters;
  }

  /**
   * Get user's current timezone
   */
  getUserTimezone(): string {
    // Try to get from localStorage first
    const stored = localStorage.getItem('userTimezone');
    if (stored) return stored;
    
    // Fall back to browser timezone
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  /**
   * Set user's timezone preference
   */
  setUserTimezone(timezone: string): void {
    localStorage.setItem('userTimezone', timezone);
  }

  /**
   * Get approximate latitude for timezone (for map display)
   */
  private getTimezoneLatitude(timezone: string): number {
    const offsets: Record<string, number> = {
      'Americas': 0,
      'Europe': 50,
      'Africa': 0,
      'Asia/Pacific': 20,
    };
    
    for (const [key, lat] of Object.entries(offsets)) {
      if (timezone.includes(key) || this.getTimezoneRegion(timezone).includes(key)) {
        return lat + (Math.random() - 0.5) * 20; // Add some randomness
      }
    }
    return 0;
  }

  /**
   * Get approximate longitude for timezone (for map display)
   */
  private getTimezoneLongitude(timezone: string): number {
    const offset = parseTimezoneOffset(timezone);
    // Rough conversion: UTC offset * 15 degrees per hour
    return offset * 15 + (Math.random() - 0.5) * 20;
  }

  /**
   * Get timezone region name
   */
  private getTimezoneRegion(timezone: string): string {
    if (timezone.includes('America')) return 'Americas';
    if (timezone.includes('Europe')) return 'Europe';
    if (timezone.includes('Africa')) return 'Africa';
    if (timezone.includes('Asia') || timezone.includes('Australia') || timezone.includes('Pacific')) {
      return 'Asia/Pacific';
    }
    
    // Fallback to region based on UTC offset
    const offset = parseTimezoneOffset(timezone);
    if (offset < -4) return 'Americas';
    if (offset >= -4 && offset < 3) return 'Europe';
    if (offset >= 3 && offset < 5) return 'Africa';
    return 'Asia/Pacific';
  }
}

export const timezoneService = new TimezoneService();
