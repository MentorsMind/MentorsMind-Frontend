import { useState, useEffect, useCallback } from 'react';
import type { SessionHistoryItem } from '../types';
import api from '../services/api.client';

const STORAGE_KEY = 'post_session_review_state';
const REVIEW_DELAY_MS = 60 * 60 * 1000; // 1 hour
const REMIND_LATER_MS = 24 * 60 * 60 * 1000; // 24 hours

interface ReviewState {
  dismissedUntil: Record<string, number>; // sessionId -> timestamp
  submitted: string[]; // sessionId[]
}

const loadState = (): ReviewState => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return { dismissedUntil: {}, submitted: [] };
  }
};

const saveState = (state: ReviewState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const usePostSessionReview = (sessions: SessionHistoryItem[]) => {
  const [pendingSession, setPendingSession] = useState<SessionHistoryItem | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [updatedRating, setUpdatedRating] = useState<number | null>(null);

  useEffect(() => {
    const state = loadState();
    const now = Date.now();

    const eligible = sessions.find((s) => {
      if (s.status !== 'completed') return false;
      if (state.submitted?.includes(s.id)) return false;

      const dismissedUntil = state.dismissedUntil?.[s.id] ?? 0;
      if (now < dismissedUntil) return false;

      const sessionEndTime = new Date(s.date).getTime() + s.duration * 60 * 1000;
      return now >= sessionEndTime + REVIEW_DELAY_MS;
    });

    setPendingSession(eligible ?? null);
  }, [sessions]);

  const submitReview = useCallback(
    async (data: { rating: number; comment: string; skillTags: string[] }) => {
      if (!pendingSession) return;

      await api.post(`/sessions/${pendingSession.id}/review`, {
        mentorId: pendingSession.mentorId,
        ...data,
      });

      const state = loadState();
      state.submitted = [...(state.submitted ?? []), pendingSession.id];
      saveState(state);

      setUpdatedRating(data.rating);
      setSubmitted(true);
    },
    [pendingSession],
  );

  const dismissForNow = useCallback(() => {
    if (!pendingSession) return;
    const state = loadState();
    state.dismissedUntil = {
      ...(state.dismissedUntil ?? {}),
      [pendingSession.id]: Date.now() + REMIND_LATER_MS,
    };
    saveState(state);
    setPendingSession(null);
  }, [pendingSession]);

  const close = useCallback(() => {
    setPendingSession(null);
    setSubmitted(false);
    setUpdatedRating(null);
  }, []);

  return { pendingSession, submitted, updatedRating, submitReview, dismissForNow, close };
};
