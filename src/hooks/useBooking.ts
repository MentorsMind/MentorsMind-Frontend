import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import BookingService from '../services/booking.service';
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
import { ApiError } from '../services/api.error';

// Helper functions for timezone conversions
const toZonedTime = (date: Date, timeZone: string) => {
  return new Date(date.toLocaleString('en-US', { timeZone }));
};

const fromZonedTime = (date: Date, timeZone: string) => {
  const zoned = new Date(date.toLocaleString('en-US', { timeZone }));
  const offset = zoned.getTime() - date.getTime();
  return new Date(date.getTime() - offset);
};

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

const formatSlotLabel = (localStart: Date, localEnd: Date, mentorTz: string) => {
  const localLabel = `${localStart.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} – ${localEnd.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
  const mentorStart = toZonedTime(localStart, mentorTz);
  const mentorTimeStr = mentorStart.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const viewerTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (viewerTz === mentorTz) return localLabel;
  return `${localLabel} (${mentorTimeStr} ${mentorTz})`;
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
  const mentorTz = mentor.availability.timezone;
  const now = new Date();

  for (let offset = 0; offset < 14; offset += 1) {
    // Build the candidate date in the mentor's timezone
    const mentorNow = toZonedTime(now, mentorTz);
    const mentorDay = new Date(mentorNow);
    mentorDay.setDate(mentorNow.getDate() + offset);
    mentorDay.setHours(0, 0, 0, 0);

    const dayName = mentorDay.toLocaleDateString('en-US', { weekday: 'long' });
    if (!mentor.availability.days.includes(dayName)) continue;

    mentor.availability.timeSlots.forEach((range, rangeIndex) => {
      const [startText, endText] = range.split('-');
      const startTime = parseTime(startText.trim());
      const endTime = parseTime(endText.trim());

      const startMinutes = startTime.hour * 60 + startTime.minute;
      const endMinutes = endTime.hour * 60 + endTime.minute;

      for (let minute = startMinutes; minute + duration <= endMinutes; minute += 60) {
        // Construct the slot start in mentor's timezone, then convert to UTC
        const mentorSlotStart = new Date(mentorDay);
        mentorSlotStart.setHours(Math.floor(minute / 60), minute % 60, 0, 0);
        const utcStart = fromZonedTime(mentorSlotStart, mentorTz);

        if (utcStart <= now) continue;

        const utcEnd = new Date(utcStart.getTime() + duration * 60_000);

        // Convert to viewer's local time for display
        const localStart = new Date(utcStart);
        const localEnd = new Date(utcEnd);

        slots.push({
          id: `${mentor.id}-${offset}-${rangeIndex}-${minute}-${duration}`,
          start: utcStart.toISOString(),
          end: utcEnd.toISOString(),
          label: formatSlotLabel(localStart, localEnd, mentorTz),
          dateLabel: localStart.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          }),
          dateKey: `${localStart.getFullYear()}-${pad(localStart.getMonth() + 1)}-${pad(localStart.getDate())}`,
          timezone: mentorTz,
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
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const bookingService = useRef(new BookingService());

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

    const p = {
      hourlyRate,
      duration: draft.duration,
      baseAmount,
      sessionTypeMultiplier,
      sessionTypeFee,
      sessionFee: subtotal,
      platformFee,
      totalAmount: subtotal + platformFee,
      currency: mentor.currency,
    };
    return p;
  }, [draft, mentor]);

  const paymentDetails = useMemo<PaymentDetails | null>(() => {
    if (!draft || !pricing || !draft.selectedSlot) {
      return null;
    }

    return {
      mentorId: draft.mentorId,
      mentorName: draft.mentorName,
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
    async (paymentTransactionHash?: string, sessionId?: string) => {
      if (!draft?.selectedSlot || !pricing || !mentor) {
        return null;
      }

      setIsConfirming(true);
      setConfirmError(null);

      try {
        const response = await bookingService.current.create({
          mentorId: draft.mentorId,
          sessionType: draft.sessionType,
          duration: draft.duration,
          notes: draft.notes,
          slotStart: draft.selectedSlot.start,
          slotEnd: draft.selectedSlot.end,
          timezone: draft.selectedSlot.timezone,
          totalAmount: pricing.totalAmount,
          currency: pricing.currency,
          paymentTransactionHash,
        });

        const resolvedId = response.id ?? sessionId ?? '';
        const bookingBase = {
          sessionId: resolvedId,
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
          id: resolvedId || draft.selectedSlot.id,
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
          warning: draft.notes.toLowerCase().includes('warning')
            ? 'This session is scheduled during a holiday. The mentor may take longer to confirm.'
            : undefined,
        };

        setLearnerCalendar((current) => [learnerCalendarEvent, ...current]);
        setConfirmedBooking(confirmation);
        return confirmation;
      } catch (err) {
        if (err instanceof ApiError && err.status === 501) {
          setConfirmError("Booking feature is coming soon! We're still putting the finishing touches on our session scheduler. Please check back later.");
        } else {
          const message = err instanceof Error ? err.message : 'Failed to create booking.';
          setConfirmError(message);
        }
        return null;
      } finally {
        setIsConfirming(false);
      }
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
    isConfirming,
    confirmError,
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
