import { useCallback, useState } from 'react';
import type { AvailabilitySlot } from '../types';

export interface RescheduleRequest {
  id: string;
  sessionId: string;
  requestedBy: 'mentor' | 'learner';
  originalTime: string;
  proposedTime: string;
  proposedSlot: AvailabilitySlot;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  respondedAt?: string;
  reason?: string;
}

export interface UseRescheduleOptions {
  sessionId: string;
  currentTime: string;
  mentorId: string;
  onRescheduleSubmit?: (request: RescheduleRequest) => void;
  onRescheduleResponse?: (requestId: string, accepted: boolean) => void;
}

export const useReschedule = ({
  sessionId,
  currentTime,
  mentorId,
  onRescheduleSubmit,
  onRescheduleResponse,
}: UseRescheduleOptions) => {
  const [pendingRequest, setPendingRequest] = useState<RescheduleRequest | null>(null);
  const [rescheduleCount, setRescheduleCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const MAX_RESCHEDULES = 2;

  const canReschedule = rescheduleCount < MAX_RESCHEDULES;

  const submitRescheduleRequest = useCallback(
    async (proposedSlot: AvailabilitySlot, reason?: string) => {
      if (!canReschedule) {
        setError('Maximum reschedule attempts reached');
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const request: RescheduleRequest = {
          id: `reschedule-${Date.now()}`,
          sessionId,
          requestedBy: 'learner',
          originalTime: currentTime,
          proposedTime: proposedSlot.start,
          proposedSlot,
          status: 'pending',
          createdAt: new Date().toISOString(),
          reason,
        };

        setPendingRequest(request);
        setRescheduleCount((prev) => prev + 1);

        if (onRescheduleSubmit) {
          onRescheduleSubmit(request);
        }

        setIsLoading(false);
        return request;
      } catch (err) {
        setError('Failed to submit reschedule request');
        setIsLoading(false);
        return null;
      }
    },
    [sessionId, currentTime, canReschedule, onRescheduleSubmit]
  );

  const respondToRescheduleRequest = useCallback(
    async (requestId: string, accepted: boolean) => {
      setIsLoading(true);
      setError(null);

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setPendingRequest((prev) =>
          prev && prev.id === requestId
            ? {
                ...prev,
                status: accepted ? 'accepted' : 'declined',
                respondedAt: new Date().toISOString(),
              }
            : prev
        );

        if (onRescheduleResponse) {
          onRescheduleResponse(requestId, accepted);
        }

        setIsLoading(false);
        return true;
      } catch (err) {
        setError('Failed to respond to reschedule request');
        setIsLoading(false);
        return false;
      }
    },
    [onRescheduleResponse]
  );

  const cancelRescheduleRequest = useCallback(async () => {
    if (!pendingRequest) return false;

    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setPendingRequest(null);
      setRescheduleCount((prev) => Math.max(0, prev - 1));
      setIsLoading(false);
      return true;
    } catch (err) {
      setError('Failed to cancel reschedule request');
      setIsLoading(false);
      return false;
    }
  }, [pendingRequest]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    pendingRequest,
    rescheduleCount,
    maxReschedules: MAX_RESCHEDULES,
    canReschedule,
    isLoading,
    error,
    submitRescheduleRequest,
    respondToRescheduleRequest,
    cancelRescheduleRequest,
    clearError,
  };
};
