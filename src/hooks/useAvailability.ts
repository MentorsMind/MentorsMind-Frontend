import { useState, useCallback } from 'react';

export interface TimeSlot {
  id: string;
  start: Date;
  end: Date;
  isBooked: boolean;
  isBlocked: boolean;
  recurring?: RecurringPattern;
}

export interface RecurringPattern {
  frequency: 'daily' | 'weekly' | 'monthly';
  daysOfWeek?: number[];
  endDate?: Date;
}

export interface AvailabilityTemplate {
  id: string;
  name: string;
  slots: Omit<TimeSlot, 'id'>[];
}

export const useAvailability = () => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [loading, setLoading] = useState(false);

  const addTimeSlot = useCallback((slot: Omit<TimeSlot, 'id'>) => {
    const newSlot: TimeSlot = {
      ...slot,
      id: Date.now().toString(),
    };
    setTimeSlots((prev) => [...prev, newSlot]);
  }, []);

  const updateTimeSlot = useCallback((id: string, updates: Partial<TimeSlot>) => {
    setTimeSlots((prev) =>
      prev.map((slot) => (slot.id === id ? { ...slot, ...updates } : slot))
    );
  }, []);

  const deleteTimeSlot = useCallback((id: string) => {
    setTimeSlots((prev) => prev.filter((slot) => slot.id !== id));
  }, []);

  const blockTimeRange = useCallback((start: Date, end: Date) => {
    const blockedSlot: TimeSlot = {
      id: Date.now().toString(),
      start,
      end,
      isBooked: false,
      isBlocked: true,
    };
    setTimeSlots((prev) => [...prev, blockedSlot]);
  }, []);

  const copyFromPreviousWeek = useCallback(() => {
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    const copiedSlots = timeSlots
      .filter((slot) => !slot.isBooked)
      .map((slot) => ({
        ...slot,
        id: `${Date.now()}-${Math.random()}`,
        start: new Date(slot.start.getTime() + oneWeek),
        end: new Date(slot.end.getTime() + oneWeek),
      }));
    setTimeSlots((prev) => [...prev, ...copiedSlots]);
  }, [timeSlots]);

  const saveAvailability = useCallback(async () => {
    setLoading(true);
    try {
      // API call would go here
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { success: true };
    } catch (error) {
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, [timeSlots, timezone]);

  return {
    timeSlots,
    timezone,
    loading,
    setTimezone,
    addTimeSlot,
    updateTimeSlot,
    deleteTimeSlot,
    blockTimeRange,
    copyFromPreviousWeek,
    saveAvailability,
  };
};
