import { useState, useEffect, useCallback } from 'react';
import {
  findSessionById,
  type ExtendedSession,
} from '../data/mentorSessionFixtures';
// import SessionService when wiring to backend:
// import SessionService from '../services/session.service';

const FETCH_DELAY_MS = 280;

export interface UseSessionDetailsResult {
  session: ExtendedSession | null;
  loading: boolean;
  error: 'not_found' | 'network' | null;
  refetch: () => void;
}

/**
 * Loads a single session by id. Uses shared fixtures today; swap the inner fetch for
 * `SessionService.getSession(id)` (or React Query) when the API is ready.
 */
export function useSessionDetails(sessionId: string | undefined): UseSessionDetailsResult {
  const [session, setSession] = useState<ExtendedSession | null>(null);
  const [loading, setLoading] = useState(Boolean(sessionId));
  const [error, setError] = useState<'not_found' | 'network' | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!sessionId) {
      setSession(null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        await new Promise((r) => setTimeout(r, FETCH_DELAY_MS));
        // const api = new SessionService();
        // const res = await api.getSession(sessionId);
        const found = findSessionById(sessionId);
        if (cancelled) return;
        if (!found) {
          setSession(null);
          setError('not_found');
        } else {
          setSession(found);
        }
      } catch {
        if (!cancelled) {
          setSession(null);
          setError('network');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionId, tick]);

  return { session, loading, error, refetch };
}
