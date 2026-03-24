import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  AvailabilitySlot,
  BookingConfirmationDetails,
  BookingDraft,
  BookingPricingBreakdown,
  BookingSessionType,
  LearnerCalendarEvent,
  MentorProfile,
} from '../types';
import type { PaymentDetails } from '../types/payment.types';

const SESSION_TYPE_MULTIPLIERS: Record<BookingSessionType, number> = {
  '1:1': 1,
  group: 0.85,
  workshop: 1.2,
};

const SESSION_TYPE_LABELS: Record<BookingSessionType, string> = {
  '1:1': '1:1 Session',
  group: 'Group Session',
  workshop: 'Workshop',
};

const DEFAULT_DURATION = 60;
const PLATFORM_FEE_RATE = 0.05;

const DAY_INDEX: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

const pad = (value: number) => value.toString().padStart(2, '0');

const parseTime = (time: string) => {
  const [hour, minute] = time.split(':').map(Number);
  return { hour, minute };
};

const toIso = (date: Date) => {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
};

const formatSlotLabel = (start: Date, end: Date) => {
  return `${start.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  })} - ${end.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  })}`;
};

const createCalendarInvite = (booking: Omit<BookingConfirmationDetails, 'calendarInvite' | 'learnerCalendarEvent'>) => {
  const dtStart = booking.slot.start.replace(/[-:]/g, '').replace('.000', '');
  const dtEnd = booking.slot.end.replace(/[-:]/g, '').replace('.000', '');
  const description = `Mentor: ${booking.mentorName}\\nType: ${SESSION_TYPE_LABELS[booking.sessionType]}\\nNotes: ${booking.notes || 'No notes added.'}`;

  const content = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MentorsMind//Session Booking//EN',
    'BEGIN:VEVENT',
    `UID:${booking.sessionId}@mentorsmind.dev`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace('.000', '')}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${SESSION_TYPE_LABELS[booking.sessionType]} with ${booking.mentorName}`,
    `DESCRIPTION:${description}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\n');

  return {
    filename: `mentorsmind-${booking.sessionId}.ics`,
    content,
  };
};

const buildAvailabilitySlots = (mentor: MentorProfile, duration: number) => {
  const slots: AvailabilitySlot[] = [];
  const now = new Date();

  for (let offset = 0; offset < 14; offset += 1) {
    const day = new Date(now);
    day.setDate(now.getDate() + offset);
    day.setHours(0, 0, 0, 0);

    const dayName = day.toLocaleDateString('en-US', { weekday: 'long' });
    if (!mentor.availability.days.includes(dayName)) {
      continue;
    }

    mentor.availability.timeSlots.forEach((range, rangeIndex) => {
      const [startText, endText] = range.split('-');
      const startTime = parseTime(startText);
      const endTime = parseTime(endText);

      const startMinutes = startTime.hour * 60 + startTime.minute;
      const endMinutes = endTime.hour * 60 + endTime.minute;

      for (let minute = startMinutes; minute + duration <= endMinutes; minute += 60) {
        const start = new Date(day);
        start.setHours(Math.floor(minute / 60), minute % 60, 0, 0);
        if (start <= now) {
          continue;
        }

        const end = new Date(start);
        end.setMinutes(end.getMinutes() + duration);

        slots.push({
          id: `${mentor.id}-${offset}-${rangeIndex}-${minute}-${duration}`,
          start: toIso(start),
          end: toIso(end),
          label: formatSlotLabel(start, end),
          dateLabel: start.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          }),
          dateKey: toIso(start).split('T')[0],
          timezone: mentor.availability.timezone,
        });
      }
    });
  }

  return slots;
};

export const useBooking = (mentor: MentorProfile | null) => {
  const [draft, setDraft] = useState<BookingDraft | null>(
    mentor
      ? {
          mentorId: mentor.id,
          mentorName: mentor.name,
          mentorAvatar: mentor.avatar,
          sessionType: '1:1',
          duration: DEFAULT_DURATION,
          notes: '',
        }
      : null
  );
  const [learnerCalendar, setLearnerCalendar] = useState<LearnerCalendarEvent[]>([]);
  const [confirmedBooking, setConfirmedBooking] = useState<BookingConfirmationDetails | null>(null);

  useEffect(() => {
    if (!mentor) {
      setDraft(null);
      setConfirmedBooking(null);
      return;
    }

    setDraft({
      mentorId: mentor.id,
      mentorName: mentor.name,
      mentorAvatar: mentor.avatar,
      sessionType: '1:1',
      duration: DEFAULT_DURATION,
      notes: '',
    });
    setConfirmedBooking(null);
  }, [mentor]);

  const syncDraft = useCallback(
    (updater: (current: BookingDraft) => BookingDraft) => {
      if (!mentor) return;
      setDraft((current) =>
        updater(
          current ?? {
            mentorId: mentor.id,
            mentorName: mentor.name,
            mentorAvatar: mentor.avatar,
            sessionType: '1:1',
            duration: DEFAULT_DURATION,
            notes: '',
          }
        )
      );
    },
    [mentor]
  );

  const availability = useMemo(() => {
    if (!mentor || !draft) return [];
    return buildAvailabilitySlots(mentor, draft.duration);
  }, [draft, mentor]);

  const selectedDateKey = draft?.selectedSlot?.dateKey ?? availability[0]?.dateKey ?? '';

  const groupedAvailability = useMemo(() => {
    return availability.reduce<Record<string, AvailabilitySlot[]>>((acc, slot) => {
      acc[slot.dateKey] = acc[slot.dateKey] ? [...acc[slot.dateKey], slot] : [slot];
      return acc;
    }, {});
  }, [availability]);

  const pricing = useMemo<BookingPricingBreakdown | null>(() => {
    if (!mentor || !draft) return null;
    const hourlyRate = mentor.hourlyRate;
    const baseAmount = (hourlyRate * draft.duration) / 60;
    const sessionTypeMultiplier = SESSION_TYPE_MULTIPLIERS[draft.sessionType];
    const sessionTypeFee = baseAmount * (sessionTypeMultiplier - 1);
    const subtotal = baseAmount + sessionTypeFee;
    const platformFee = subtotal * PLATFORM_FEE_RATE;

    return {
      hourlyRate,
      duration: draft.duration,
      baseAmount,
      sessionTypeMultiplier,
      sessionTypeFee,
      platformFee,
      totalAmount: subtotal + platformFee,
      currency: mentor.currency,
    };
  }, [draft, mentor]);

  const paymentDetails = useMemo<PaymentDetails | null>(() => {
    if (!draft || !pricing || !draft.selectedSlot) {
      return null;
    }

    return {
      mentorId: draft.mentorId,
      mentorName: draft.mentorName,
      sessionId: `booking-${draft.mentorId}-${draft.selectedSlot.id}`,
      sessionTopic: `${SESSION_TYPE_LABELS[draft.sessionType]} on ${draft.selectedSlot.dateLabel}`,
      amount: Number(pricing.totalAmount.toFixed(2)),
    };
  }, [draft, pricing]);

  const setSessionType = useCallback(
    (sessionType: BookingSessionType) => {
      syncDraft((current) => ({ ...current, sessionType }));
    },
    [syncDraft]
  );

  const setDuration = useCallback(
    (duration: number) => {
      syncDraft((current) => ({ ...current, duration, selectedSlot: undefined }));
    },
    [syncDraft]
  );

  const setNotes = useCallback(
    (notes: string) => {
      syncDraft((current) => ({ ...current, notes }));
    },
    [syncDraft]
  );

  const selectSlot = useCallback(
    (slot: AvailabilitySlot) => {
      syncDraft((current) => ({ ...current, selectedSlot: slot }));
    },
    [syncDraft]
  );

  const reset = useCallback(() => {
    if (!mentor) {
      setDraft(null);
      setConfirmedBooking(null);
      return;
    }

    setDraft({
      mentorId: mentor.id,
      mentorName: mentor.name,
      mentorAvatar: mentor.avatar,
      sessionType: '1:1',
      duration: DEFAULT_DURATION,
      notes: '',
    });
    setConfirmedBooking(null);
  }, [mentor]);

  const confirmBooking = useCallback(
    (paymentTransactionHash?: string) => {
      if (!draft?.selectedSlot || !pricing || !mentor) {
        return null;
      }

      const sessionId = `session-${draft.selectedSlot.id}`;
      const bookingBase = {
        sessionId,
        mentorId: draft.mentorId,
        mentorName: draft.mentorName,
        sessionType: draft.sessionType,
        duration: draft.duration,
        notes: draft.notes,
        slot: draft.selectedSlot,
        pricing,
        paymentTransactionHash,
      };

      const learnerCalendarEvent: LearnerCalendarEvent = {
        id: sessionId,
        title: `${SESSION_TYPE_LABELS[draft.sessionType]} with ${draft.mentorName}`,
        start: draft.selectedSlot.start,
        end: draft.selectedSlot.end,
        mentorName: draft.mentorName,
        notes: draft.notes || 'No notes added.',
        status: 'scheduled',
      };

      const confirmation: BookingConfirmationDetails = {
        ...bookingBase,
        calendarInvite: createCalendarInvite(bookingBase),
        learnerCalendarEvent,
      };

      setLearnerCalendar((current) => [learnerCalendarEvent, ...current]);
      setConfirmedBooking(confirmation);

      return confirmation;
    },
    [draft, mentor, pricing]
  );

  return {
    draft,
    availability,
    groupedAvailability,
    selectedDateKey,
    pricing,
    learnerCalendar,
    confirmedBooking,
    paymentDetails,
    setSessionType,
    setDuration,
    setNotes,
    selectSlot,
    confirmBooking,
    reset,
    canReviewBooking: Boolean(draft?.selectedSlot && pricing),
  };
};
