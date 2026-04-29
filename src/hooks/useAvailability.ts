import { useState, useCallback, useEffect } from 'react';
import { getAvailability, saveAvailability as apiSave, syncCalendar } from '../services/mentor.service';
import { isTimeSlotOverlapping } from '../utils/calendar.utils';

export interface TimeSlot {
  id: string;
  day: number;       // 0 = Sun … 6 = Sat
  hour: number;      // 0-23
  isBooked: boolean;
  isBlocked: boolean;
  recurring: boolean;
}

export interface ConflictWarning {
  slotId: string;
  message: string;
}

export const useAvailability = (mentorId: string) => {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [pending, setPending] = useState<TimeSlot[]>([]);   // unsaved changes
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [syncedCalendars, setSyncedCalendars] = useState<string[]>([]);
  const [conflicts, setConflicts] = useState<ConflictWarning[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load from API on mount / mentorId change
  useEffect(() => {
    if (!mentorId) return;
    setLoading(true);
    getAvailability(mentorId)
      .then((data) => { setSlots(data.slots); setTimezone(data.timezone); setSyncedCalendars(data.syncedCalendars ?? []); })
      .catch(() => {/* silently fall back to empty */})
      .finally(() => setLoading(false));
  }, [mentorId]);

  const detectConflicts = useCallback((next: TimeSlot[]): ConflictWarning[] => {
    const warnings: ConflictWarning[] = [];
    const booked = next.filter((s) => s.isBooked);
    const available = next.filter((s) => !s.isBooked && !s.isBlocked);
    for (const a of available) {
      const aStart = new Date(2000, 0, a.day + 1, a.hour);
      const aEnd   = new Date(2000, 0, a.day + 1, a.hour + 1);
      for (const b of booked) {
        const bStart = new Date(2000, 0, b.day + 1, b.hour);
        const bEnd   = new Date(2000, 0, b.day + 1, b.hour + 1);
        if (isTimeSlotOverlapping({ start: aStart, end: aEnd }, { start: bStart, end: bEnd })) {
          warnings.push({ slotId: a.id, message: `Overlaps a confirmed booking at ${a.hour}:00` });
        }
      }
    }
    return warnings;
  }, []);

  const toggleSlot = useCallback((day: number, hour: number, recurring: boolean) => {
    setPending((prev) => {
      const key = (s: TimeSlot) => s.day === day && s.hour === hour;
      const existing = prev.find(key) ?? slots.find(key);

      let next: TimeSlot[];
      if (existing?.isBooked || existing?.isBlocked) return prev; // can't toggle booked/blocked

      if (existing && prev.find(key)) {
        // already in pending — remove it (deselect)
        next = prev.filter((s) => !(s.day === day && s.hour === hour));
      } else if (existing) {
        // in saved slots but not pending — mark for removal
        next = [...prev, { ...existing, id: `rm-${existing.id}` }];
      } else {
        // new slot
        next = [...prev, { id: `new-${day}-${hour}-${Date.now()}`, day, hour, isBooked: false, isBlocked: false, recurring }];
      }

      setConflicts(detectConflicts([...slots, ...next]));
      return next;
    });
  }, [slots, detectConflicts]);

  const setRecurring = useCallback((day: number, hour: number, recurring: boolean) => {
    setPending((prev) =>
      prev.map((s) => s.day === day && s.hour === hour ? { ...s, recurring } : s)
    );
  }, []);

  const save = useCallback(async () => {
    setSaving(true);
    try {
      // Merge pending into slots
      const merged = [...slots];
      for (const p of pending) {
        if (p.id.startsWith('rm-')) {
          const origId = p.id.slice(3);
          const idx = merged.findIndex((s) => s.id === origId);
          if (idx !== -1) merged.splice(idx, 1);
        } else {
          merged.push(p);
        }
      }
      await apiSave(mentorId, { slots: merged, timezone });
      setSlots(merged);
      setPending([]);
      setConflicts([]);
    } finally {
      setSaving(false);
    }
  }, [mentorId, slots, pending, timezone]);

  const connectCalendar = useCallback(async (provider: 'google' | 'outlook') => {
    await syncCalendar(mentorId, provider);
    setSyncedCalendars((prev) => prev.includes(provider) ? prev.filter((p) => p !== provider) : [...prev, provider]);
  }, [mentorId]);

  // Effective view: saved slots + pending additions, minus pending removals
  const effectiveSlots = [
    ...slots.filter((s) => !pending.some((p) => p.id === `rm-${s.id}`)),
    ...pending.filter((p) => !p.id.startsWith('rm-')),
  ];

  return {
    slots: effectiveSlots,
    savedSlots: slots,
    pending,
    timezone,
    setTimezone,
    syncedCalendars,
    conflicts,
    loading,
    saving,
    hasPendingChanges: pending.length > 0,
    toggleSlot,
    setRecurring,
    save,
    connectCalendar,
    discardChanges: () => { setPending([]); setConflicts([]); },
  };
};
