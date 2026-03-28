import { useState, useCallback, useEffect } from 'react';
import type { SessionStatus } from '../types';
import {
  MENTOR_SESSION_FIXTURES,
  type ExtendedSession,
} from '../data/mentorSessionFixtures';

export type { ExtendedSession } from '../data/mentorSessionFixtures';

export interface MentorSessionsData {
  upcoming: ExtendedSession[];
  completed: ExtendedSession[];
  loading: boolean;
}

const POLL_INTERVAL_MS = 30_000;

export const useMentorSessions = () => {
  const [data, setData] = useState<MentorSessionsData>({
    upcoming: [],
    completed: [],
    loading: true,
  });

  const fetchSessions = useCallback(() => {
    const now = new Date().toISOString();
    const upcoming = MENTOR_SESSION_FIXTURES.filter((s) => new Date(s.startTime) > new Date(now));
    const completed = MENTOR_SESSION_FIXTURES.filter((s) => s.status === 'completed');
    setData({ upcoming, completed, loading: false });
  }, []);

  useEffect(() => {
    const timer = setTimeout(fetchSessions, 500);
    return () => clearTimeout(timer);
  }, [fetchSessions]);

  useEffect(() => {
    const interval = setInterval(fetchSessions, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchSessions]);

  useEffect(() => {
    const wsTimer = setTimeout(() => {
      const newBooking: ExtendedSession = {
        id: `ws-${Date.now()}`,
        mentorId: 'mentor-amina',
        mentorName: 'Dr. Amina Okonkwo',
        mentorAvatar:
          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80',
        learnerId: 'u-new',
        learnerName: 'Diana Prince',
        learnerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=48&h=48&fit=crop&crop=face',
        topic: 'Stellar Anchor Integration (New Booking)',
        startTime: new Date(Date.now() + 7200000).toISOString(),
        duration: 60,
        status: 'pending',
        price: 60,
        currency: 'USDC',
        checklist: [false, false, false],
        paymentStatus: 'pending',
      };
      setData((prev) => ({
        ...prev,
        upcoming: prev.upcoming.some((s) => s.id === newBooking.id)
          ? prev.upcoming
          : [newBooking, ...prev.upcoming],
      }));
    }, 8000);
    return () => clearTimeout(wsTimer);
  }, []);

  const updateSession = useCallback((updater: (sessions: ExtendedSession[]) => ExtendedSession[]) => {
    setData((prev) => ({
      ...prev,
      upcoming: updater(prev.upcoming),
      completed: updater(prev.completed),
    }));
  }, []);

  const updateStatus = useCallback(
    (id: string, status: SessionStatus) => {
      updateSession((sessions) => sessions.map((s) => (s.id === id ? { ...s, status } : s)));
    },
    [updateSession],
  );

  const reschedule = useCallback(
    (id: string, newStartTime: string) => {
      updateSession((sessions) =>
        sessions.map((s) =>
          s.id === id ? { ...s, startTime: newStartTime, status: 'rescheduled' as SessionStatus } : s,
        ),
      );
    },
    [updateSession],
  );

  const cancelWithReason = useCallback(
    (id: string, reason: string) => {
      updateSession((sessions) =>
        sessions.map((s) =>
          s.id === id ? { ...s, status: 'cancelled' as SessionStatus, cancelReason: reason } : s,
        ),
      );
    },
    [updateSession],
  );

  const completeSession = useCallback(
    (id: string) => {
      updateSession((sessions) =>
        sessions.map((s) =>
          s.id === id ? { ...s, status: 'completed' as SessionStatus, paymentStatus: 'paid' as const } : s,
        ),
      );
    },
    [updateSession],
  );

  const updateNotes = useCallback(
    (id: string, notes: string) => {
      updateSession((sessions) => sessions.map((s) => (s.id === id ? { ...s, notes } : s)));
    },
    [updateSession],
  );

  const toggleChecklist = useCallback(
    (id: string, index: number) => {
      updateSession((sessions) =>
        sessions.map((s) =>
          s.id === id
            ? {
                ...s,
                checklist: s.checklist.map((checked, i) => (i === index ? !checked : checked)),
              }
            : s,
        ),
      );
    },
    [updateSession],
  );

  const refresh = useCallback(() => {
    setData((prev) => ({ ...prev, loading: true }));
    setTimeout(() => setData((prev) => ({ ...prev, loading: false })), 300);
  }, []);

  return {
    data,
    updateStatus,
    reschedule,
    cancelWithReason,
    completeSession,
    updateNotes,
    toggleChecklist,
    refresh,
  };
};
