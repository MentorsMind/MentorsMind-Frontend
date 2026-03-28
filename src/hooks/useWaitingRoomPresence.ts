import { useState, useEffect } from 'react';

export interface UseWaitingRoomPresenceOptions {
  /** When false, the simulated other party never joins. */
  enabled?: boolean;
}

/**
 * Simulates the other participant joining (replace with WebSocket / Supabase presence / polling).
 */
export function useWaitingRoomPresence(
  _sessionId: string | undefined,
  options: UseWaitingRoomPresenceOptions = {},
): { otherJoined: boolean } {
  const { enabled = true } = options;
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (!enabled || !_sessionId) return;
    const delay = 4000 + Math.random() * 8000;
    const t = window.setTimeout(() => setJoined(true), delay);
    return () => window.clearTimeout(t);
  }, [enabled, _sessionId]);

  return { otherJoined: joined };
}
