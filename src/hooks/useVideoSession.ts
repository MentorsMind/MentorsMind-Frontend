import { useCallback, useEffect, useState } from 'react';

export interface VideoSessionState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  participants: Participant[];
  isScreenSharing: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  sessionDuration: number;
}

export interface Participant {
  id: string;
  name: string;
  avatar?: string;
  isHost: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
}

export interface UseVideoSessionOptions {
  sessionId: string;
  meetingLink?: string;
  onSessionEnd?: () => void;
  onEscrowRelease?: () => void;
}

export const useVideoSession = ({
  sessionId,
  meetingLink,
  onSessionEnd,
  onEscrowRelease,
}: UseVideoSessionOptions) => {
  const [state, setState] = useState<VideoSessionState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    participants: [],
    isScreenSharing: false,
    isMuted: false,
    isVideoOff: false,
    sessionDuration: 0,
  });

  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    setState((prev) => ({ ...prev, isConnecting: true, error: null }));

    // Simulate connection delay
    setTimeout(() => {
      setState((prev) => ({
        ...prev,
        isConnecting: false,
        isConnected: true,
        participants: [
          {
            id: 'user-1',
            name: 'You',
            isHost: false,
            isMuted: false,
            isVideoOff: false,
            isScreenSharing: false,
            connectionStatus: 'connected',
          },
          {
            id: 'mentor-1',
            name: 'Mentor',
            isHost: true,
            isMuted: false,
            isVideoOff: false,
            isScreenSharing: false,
            connectionStatus: 'connected',
          },
        ],
      }));

      // Start session timer
      const interval = setInterval(() => {
        setState((prev) => ({
          ...prev,
          sessionDuration: prev.sessionDuration + 1,
        }));
      }, 1000);
      setTimer(interval);
    }, 1500);
  }, []);

  const disconnect = useCallback(() => {
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }

    setState({
      isConnected: false,
      isConnecting: false,
      error: null,
      participants: [],
      isScreenSharing: false,
      isMuted: false,
      isVideoOff: false,
      sessionDuration: 0,
    });

    if (onSessionEnd) {
      onSessionEnd();
    }
  }, [timer, onSessionEnd]);

  const toggleMute = useCallback(() => {
    setState((prev) => ({ ...prev, isMuted: !prev.isMuted }));
  }, []);

  const toggleVideo = useCallback(() => {
    setState((prev) => ({ ...prev, isVideoOff: !prev.isVideoOff }));
  }, []);

  const toggleScreenShare = useCallback(() => {
    setState((prev) => ({ ...prev, isScreenSharing: !prev.isScreenSharing }));
  }, []);

  const endSession = useCallback(() => {
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }

    // Trigger escrow release flow
    if (onEscrowRelease) {
      onEscrowRelease();
    }

    disconnect();
  }, [timer, disconnect, onEscrowRelease]);

  const retry = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
    connect();
  }, [connect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [timer]);

  // Auto-connect if meeting link is provided
  useEffect(() => {
    if (meetingLink && !state.isConnected && !state.isConnecting) {
      connect();
    }
  }, [meetingLink, state.isConnected, state.isConnecting, connect]);

  return {
    ...state,
    connect,
    disconnect,
    toggleMute,
    toggleVideo,
    toggleScreenShare,
    endSession,
    retry,
  };
};
