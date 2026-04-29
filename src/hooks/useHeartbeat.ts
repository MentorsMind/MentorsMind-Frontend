import { useEffect, useCallback } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { heartbeatManager } from '../services/presence.service';

/**
 * Hook for managing heartbeat functionality
 * Automatically starts/stops heartbeat based on authentication state
 */
export function useHeartbeat(intervalMs: number = 30000) {
  const { isAuthenticated } = useAuthContext();

  const startHeartbeat = useCallback(() => {
    if (isAuthenticated) {
      heartbeatManager.start(intervalMs);
    }
  }, [isAuthenticated, intervalMs]);

  const stopHeartbeat = useCallback(() => {
    heartbeatManager.stop();
  }, []);

  // Automatically manage heartbeat based on auth state
  useEffect(() => {
    if (isAuthenticated) {
      startHeartbeat();
    } else {
      stopHeartbeat();
    }

    // Cleanup on unmount
    return () => {
      stopHeartbeat();
    };
  }, [isAuthenticated, startHeartbeat, stopHeartbeat]);

  return {
    startHeartbeat,
    stopHeartbeat,
    isActive: heartbeatManager.isActive,
  };
}
