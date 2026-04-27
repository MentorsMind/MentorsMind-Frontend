import { describe, expect, it } from 'vitest';
import {
  getSessionActionState,
  normalizeSessionDetail,
  type SessionDetailViewModel,
} from '../utils/session-detail.utils';

const baseSession: SessionDetailViewModel = {
  id: 'booking-1',
  mentor: { id: 'mentor-1', name: 'Ada Mentor' },
  mentee: { id: 'learner-1', name: 'Ben Learner' },
  topic: 'Stellar mentoring',
  scheduledStart: '2026-04-22T12:00:00.000Z',
  scheduledEnd: '2026-04-22T13:00:00.000Z',
  durationMinutes: 60,
  paymentStatus: 'completed',
  status: 'confirmed',
  meetingUrl: 'https://meet.example/session',
  hasReview: false,
};

describe('session detail utilities', () => {
  it('opens the join window ten minutes before start and closes after the session end', () => {
    expect(
      getSessionActionState(
        baseSession,
        new Date('2026-04-22T11:49:59.000Z'),
      ).isJoinWindowOpen,
    ).toBe(false);

    expect(
      getSessionActionState(
        baseSession,
        new Date('2026-04-22T11:50:00.000Z'),
      ).isJoinWindowOpen,
    ).toBe(true);

    expect(
      getSessionActionState(
        baseSession,
        new Date('2026-04-22T13:00:01.000Z'),
      ).isJoinWindowOpen,
    ).toBe(false);
  });

  it('requests regeneration when the meeting link is missing or expired', () => {
    expect(
      getSessionActionState(
        { ...baseSession, meetingUrl: undefined },
        new Date('2026-04-22T11:55:00.000Z'),
      ).shouldShowRegenerate,
    ).toBe(true);

    expect(
      getSessionActionState(
        {
          ...baseSession,
          meetingExpiresAt: '2026-04-22T11:54:00.000Z',
        },
        new Date('2026-04-22T11:55:00.000Z'),
      ).shouldShowRegenerate,
    ).toBe(true);
  });

  it('shows review and cancel states from session timing and backend flags', () => {
    expect(
      getSessionActionState(
        { ...baseSession, hasReview: false },
        new Date('2026-04-22T13:05:00.000Z'),
      ).shouldShowReviewPrompt,
    ).toBe(true);

    expect(
      getSessionActionState(
        { ...baseSession, canCancel: false },
        new Date('2026-04-21T09:00:00.000Z'),
      ).canCancel,
    ).toBe(false);
  });

  it('normalizes backend booking payload variants', () => {
    const session = normalizeSessionDetail({
      id: 'booking-2',
      mentor: { id: 'mentor-2', name: 'Grace' },
      learner_name: 'Linus',
      scheduled_at: '2026-04-22T10:00:00.000Z',
      scheduled_end: '2026-04-22T10:45:00.000Z',
      payment_status: 'paid',
      meeting_link: 'https://whereby.example/room',
      reviewExists: false,
    });

    expect(session.mentor.name).toBe('Grace');
    expect(session.mentee.name).toBe('Linus');
    expect(session.paymentStatus).toBe('paid');
    expect(session.meetingUrl).toBe('https://whereby.example/room');
    expect(session.durationMinutes).toBe(60);
  });
});
