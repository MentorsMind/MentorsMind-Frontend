import { useEffect, useRef } from 'react';
import PresenceService from '../services/presence.service';

const HEARTBEAT_INTERVAL = 20_000; // 20 seconds

/**
 * Sends REST heartbeats every 20s when WebSocket is disconnected.
 * Stops automatically when WebSocket reconnects.
 * Relies on 'ws-status' CustomEvents dispatched by useWebSocket.
 */
export const usePresenceHeartbeat = () => {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const presenceService = useRef(new PresenceService());

  const startHeartbeat = () => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      presenceService.current.sendHeartbeat().catch(() => {/* silent */});
    }, HEARTBEAT_INTERVAL);
  };

  const stopHeartbeat = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    const handleWsStatus = (e: Event) => {
      const status = (e as CustomEvent<string>).detail;
      if (status === 'connected') {
        stopHeartbeat();
      } else if (status === 'disconnected') {
        startHeartbeat();
      }
    };

    window.addEventListener('ws-status', handleWsStatus);
    return () => {
      window.removeEventListener('ws-status', handleWsStatus);
      stopHeartbeat();
    };
  }, []);
};
