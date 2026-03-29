import { useCallback, useEffect, useRef, useState } from 'react';

export type ConnectionQualityLabel = 'Excellent' | 'Good' | 'Poor';

export interface UseWebRTCOptions {
  sessionId: string;
  meetingLink?: string;
  onSessionEnd?: () => void;
  onEscrowRelease?: () => void;
}

export interface WebRTCState {
  isConnected: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;
  error: string | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  screenStream: MediaStream | null;
  isMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing: boolean;
  isAudioOnly: boolean;
  sessionDuration: number;
  connectionQuality: ConnectionQualityLabel;
  rttMs: number | null;
  screenShareSupported: boolean;
}

const INITIAL_STATE: WebRTCState = {
  isConnected: false,
  isConnecting: false,
  isReconnecting: false,
  error: null,
  localStream: null,
  remoteStream: null,
  screenStream: null,
  isMuted: false,
  isCameraOff: false,
  isScreenSharing: false,
  isAudioOnly: false,
  sessionDuration: 0,
  connectionQuality: 'Good',
  rttMs: null,
  screenShareSupported:
    typeof navigator !== 'undefined' && typeof navigator.mediaDevices?.getDisplayMedia === 'function',
};

const CAMERA_CONSTRAINTS: MediaTrackConstraints = {
  width: { ideal: 1280 },
  height: { ideal: 720 },
  frameRate: { ideal: 30, max: 30 },
};

const stopStreamTracks = (stream: MediaStream | null) => {
  stream?.getTracks().forEach((track) => track.stop());
};

const toErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

const mapRttToQuality = (rttMs: number): ConnectionQualityLabel => {
  if (rttMs <= 150) {
    return 'Excellent';
  }

  if (rttMs <= 300) {
    return 'Good';
  }

  return 'Poor';
};

const mergeRemoteTracks = (target: MediaStream, incoming: MediaStream) => {
  incoming.getTracks().forEach((track) => {
    const alreadyAdded = target.getTracks().some((existingTrack) => existingTrack.id === track.id);

    if (!alreadyAdded) {
      target.addTrack(track);
    }
  });
};

export const useWebRTC = ({
  sessionId,
  meetingLink,
  onSessionEnd,
  onEscrowRelease,
}: UseWebRTCOptions) => {
  const [state, setState] = useState<WebRTCState>(INITIAL_STATE);
  const stateRef = useRef<WebRTCState>(INITIAL_STATE);
  const localPeerRef = useRef<RTCPeerConnection | null>(null);
  const remotePeerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const videoSenderRef = useRef<RTCRtpSender | null>(null);
  const sessionTimerRef = useRef<number | null>(null);
  const statsTimerRef = useRef<number | null>(null);
  const reconnectingRef = useRef(false);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const setScreenShareSupport = useCallback(() => {
    setState((prev) => ({
      ...prev,
      screenShareSupported:
        typeof navigator !== 'undefined' && typeof navigator.mediaDevices?.getDisplayMedia === 'function',
    }));
  }, []);

  const clearTimers = useCallback(() => {
    if (sessionTimerRef.current !== null) {
      window.clearInterval(sessionTimerRef.current);
      sessionTimerRef.current = null;
    }

    if (statsTimerRef.current !== null) {
      window.clearInterval(statsTimerRef.current);
      statsTimerRef.current = null;
    }
  }, []);

  const teardownConnection = useCallback(
    (error: string | null = null) => {
      clearTimers();

      localPeerRef.current?.close();
      remotePeerRef.current?.close();

      stopStreamTracks(screenStreamRef.current);
      stopStreamTracks(localStreamRef.current);
      stopStreamTracks(remoteStreamRef.current);

      localPeerRef.current = null;
      remotePeerRef.current = null;
      localStreamRef.current = null;
      remoteStreamRef.current = null;
      screenStreamRef.current = null;
      videoSenderRef.current = null;
      reconnectingRef.current = false;

      setState({
        ...INITIAL_STATE,
        error,
        screenShareSupported:
          typeof navigator !== 'undefined' && typeof navigator.mediaDevices?.getDisplayMedia === 'function',
      });
    },
    [clearTimers],
  );

  const renegotiateConnection = useCallback(async (iceRestart = false) => {
    const localPeer = localPeerRef.current;
    const remotePeer = remotePeerRef.current;

    if (!localPeer || !remotePeer) {
      return;
    }

    const offer = await localPeer.createOffer(iceRestart ? { iceRestart: true } : undefined);
    await localPeer.setLocalDescription(offer);
    await remotePeer.setRemoteDescription(offer);

    const answer = await remotePeer.createAnswer();
    await remotePeer.setLocalDescription(answer);
    await localPeer.setRemoteDescription(answer);
  }, []);

  const startSessionTimer = useCallback(() => {
    if (sessionTimerRef.current !== null) {
      return;
    }

    sessionTimerRef.current = window.setInterval(() => {
      setState((prev) => ({ ...prev, sessionDuration: prev.sessionDuration + 1 }));
    }, 1000);
  }, []);

  const startStatsPolling = useCallback(() => {
    if (statsTimerRef.current !== null) {
      return;
    }

    statsTimerRef.current = window.setInterval(async () => {
      const localPeer = localPeerRef.current;

      if (!localPeer) {
        return;
      }

      try {
        const stats = await localPeer.getStats();
        let rttMs: number | null = null;

        stats.forEach((report) => {
          if (report.type === 'candidate-pair') {
            const candidatePair = report as RTCIceCandidatePairStats;

            if (candidatePair.state === 'succeeded' && typeof candidatePair.currentRoundTripTime === 'number') {
              rttMs = Math.round(candidatePair.currentRoundTripTime * 1000);
            }
          }

          if (rttMs === null && report.type === 'remote-inbound-rtp') {
            const remoteInbound = report as RTCStats & { roundTripTime?: number };

            if (typeof remoteInbound.roundTripTime === 'number') {
              rttMs = Math.round(remoteInbound.roundTripTime * 1000);
            }
          }
        });

        if (rttMs !== null) {
          const nextRtt = rttMs;

          setState((prev) => ({
            ...prev,
            rttMs: nextRtt,
            connectionQuality: mapRttToQuality(nextRtt),
          }));
        }
      } catch {
        setState((prev) => ({
          ...prev,
          connectionQuality: prev.isReconnecting ? 'Poor' : prev.connectionQuality,
        }));
      }
    }, 2000);
  }, []);

  const syncVideoSender = useCallback(
    async (track: MediaStreamTrack | null) => {
      const localPeer = localPeerRef.current;
      const currentStream = localStreamRef.current ?? screenStreamRef.current;

      if (!localPeer) {
        return;
      }

      if (videoSenderRef.current) {
        await videoSenderRef.current.replaceTrack(track);
        return;
      }

      if (!track || !currentStream) {
        return;
      }

      videoSenderRef.current = localPeer.addTrack(track, currentStream);
      await renegotiateConnection();
    },
    [renegotiateConnection],
  );

  const stopScreenShare = useCallback(async () => {
    if (!screenStreamRef.current) {
      return;
    }

    const localVideoTrack = localStreamRef.current?.getVideoTracks()[0] ?? null;

    try {
      if (localVideoTrack && localVideoTrack.enabled) {
        await syncVideoSender(localVideoTrack);
      } else {
        await syncVideoSender(null);
      }
    } finally {
      stopStreamTracks(screenStreamRef.current);
      screenStreamRef.current = null;

      setState((prev) => ({
        ...prev,
        isScreenSharing: false,
        screenStream: null,
      }));
    }
  }, [syncVideoSender]);

  const attemptReconnect = useCallback(async () => {
    if (reconnectingRef.current) {
      return;
    }

    reconnectingRef.current = true;

    try {
      const localPeer = localPeerRef.current;

      if (!localPeer) {
        return;
      }

      setState((prev) => ({
        ...prev,
        isReconnecting: true,
        connectionQuality: 'Poor',
      }));

      if (typeof localPeer.restartIce === 'function') {
        localPeer.restartIce();
      }

      await renegotiateConnection(true);
    } catch (error) {
      const reconnectError = toErrorMessage(error, 'The peer connection could not be restored.');
      teardownConnection(reconnectError);
    } finally {
      window.setTimeout(() => {
        reconnectingRef.current = false;
      }, 1000);
    }
  }, [renegotiateConnection, teardownConnection]);

  const bindPeerEvents = useCallback(
    (localPeer: RTCPeerConnection, remotePeer: RTCPeerConnection) => {
      const updateConnectionState = () => {
        const connectionState = localPeer.connectionState;
        const iceState = localPeer.iceConnectionState;

        if (connectionState === 'connected' || iceState === 'connected' || iceState === 'completed') {
          startSessionTimer();
          startStatsPolling();

          setState((prev) => ({
            ...prev,
            isConnected: true,
            isConnecting: false,
            isReconnecting: false,
            error: null,
          }));
          return;
        }

        if (connectionState === 'failed' || connectionState === 'disconnected' || iceState === 'failed' || iceState === 'disconnected') {
          setState((prev) => ({
            ...prev,
            isConnecting: false,
            isConnected: true,
            isReconnecting: true,
            connectionQuality: 'Poor',
          }));

          void attemptReconnect();
          return;
        }

        if (connectionState === 'closed') {
          clearTimers();
        }
      };

      localPeer.onicecandidate = (event) => {
        if (event.candidate) {
          void remotePeer.addIceCandidate(event.candidate);
        }
      };

      remotePeer.onicecandidate = (event) => {
        if (event.candidate) {
          void localPeer.addIceCandidate(event.candidate);
        }
      };

      remotePeer.ontrack = (event) => {
        const nextRemoteStream = remoteStreamRef.current ?? new MediaStream();
        const [incomingStream] = event.streams;

        if (incomingStream) {
          mergeRemoteTracks(nextRemoteStream, incomingStream);
        } else {
          nextRemoteStream.addTrack(event.track);
        }

        remoteStreamRef.current = nextRemoteStream;

        setState((prev) => ({
          ...prev,
          remoteStream: nextRemoteStream,
        }));
      };

      localPeer.onconnectionstatechange = updateConnectionState;
      localPeer.oniceconnectionstatechange = updateConnectionState;
    },
    [attemptReconnect, clearTimers, startSessionTimer, startStatsPolling],
  );

  const getInitialMediaStream = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('This browser does not support camera and microphone access.');
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: CAMERA_CONSTRAINTS,
      });

      return {
        stream,
        isAudioOnly: false,
      };
    } catch {
      const audioOnlyStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });

      return {
        stream: audioOnlyStream,
        isAudioOnly: true,
      };
    }
  }, []);

  const connect = useCallback(async () => {
    if (stateRef.current.isConnected || stateRef.current.isConnecting) {
      return;
    }

    if (typeof RTCPeerConnection === 'undefined') {
      setState((prev) => ({
        ...prev,
        error: 'This browser does not support WebRTC connections.',
      }));
      return;
    }

    setScreenShareSupport();
    teardownConnection();

    setState((prev) => ({
      ...prev,
      isConnecting: true,
      error: null,
    }));

    try {
      const { stream, isAudioOnly } = await getInitialMediaStream();
      const localPeer = new RTCPeerConnection();
      const remotePeer = new RTCPeerConnection();

      localPeerRef.current = localPeer;
      remotePeerRef.current = remotePeer;
      localStreamRef.current = stream;
      remoteStreamRef.current = new MediaStream();

      stream.getAudioTracks().forEach((track) => {
        localPeer.addTrack(track, stream);
      });

      stream.getVideoTracks().forEach((track) => {
        videoSenderRef.current = localPeer.addTrack(track, stream);
      });

      bindPeerEvents(localPeer, remotePeer);

      setState((prev) => ({
        ...prev,
        localStream: stream,
        remoteStream: remoteStreamRef.current,
        isAudioOnly,
        isCameraOff: isAudioOnly || stream.getVideoTracks().length === 0,
        isMuted: stream.getAudioTracks().every((track) => !track.enabled),
      }));

      await renegotiateConnection();
    } catch (error) {
      const mediaError = toErrorMessage(
        error,
        'Camera or microphone access failed. Please check your browser permissions.',
      );

      teardownConnection(mediaError);
    }
  }, [bindPeerEvents, getInitialMediaStream, renegotiateConnection, setScreenShareSupport, teardownConnection]);

  const disconnect = useCallback(() => {
    teardownConnection();

    if (onSessionEnd) {
      onSessionEnd();
    }
  }, [onSessionEnd, teardownConnection]);

  const toggleMute = useCallback(() => {
    const localStream = localStreamRef.current;

    if (!localStream) {
      return;
    }

    setState((prev) => {
      const nextMuted = !prev.isMuted;

      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !nextMuted;
      });

      return {
        ...prev,
        isMuted: nextMuted,
      };
    });
  }, []);

  const toggleCamera = useCallback(async () => {
    const localStream = localStreamRef.current;

    if (!localStream || !navigator.mediaDevices?.getUserMedia) {
      return;
    }

    let cameraTrack = localStream.getVideoTracks()[0] ?? null;

    try {
      if (!cameraTrack) {
        const cameraStream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: CAMERA_CONSTRAINTS,
        });

        cameraTrack = cameraStream.getVideoTracks()[0] ?? null;

        if (cameraTrack) {
          localStream.addTrack(cameraTrack);

          if (!stateRef.current.isScreenSharing) {
            await syncVideoSender(cameraTrack);
          }
        }
      }

      if (!cameraTrack) {
        throw new Error('No camera track is available for this session.');
      }

      cameraTrack.enabled = !cameraTrack.enabled;

      setState((prev) => ({
        ...prev,
        isCameraOff: !cameraTrack.enabled,
        isAudioOnly: false,
        error: null,
      }));
    } catch {
      setState((prev) => ({
        ...prev,
        isCameraOff: true,
        isAudioOnly: true,
        error: 'Video capture failed. The session is continuing in audio-only mode.',
      }));
    }
  }, [syncVideoSender]);

  const toggleScreenShare = useCallback(async () => {
    if (stateRef.current.isScreenSharing) {
      await stopScreenShare();
      return;
    }

    if (!navigator.mediaDevices?.getDisplayMedia) {
      setState((prev) => ({
        ...prev,
        error: 'Screen sharing is not available in this browser.',
      }));
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        audio: false,
        video: true,
      });
      const screenTrack = stream.getVideoTracks()[0] ?? null;

      if (!screenTrack) {
        throw new Error('No screen track was returned.');
      }

      screenTrack.onended = () => {
        void stopScreenShare();
      };

      screenStreamRef.current = stream;
      await syncVideoSender(screenTrack);

      setState((prev) => ({
        ...prev,
        isScreenSharing: true,
        screenStream: stream,
        error: null,
      }));
    } catch (error) {
      if (error instanceof DOMException && (error.name === 'AbortError' || error.name === 'NotAllowedError')) {
        return;
      }

      setState((prev) => ({
        ...prev,
        error: 'Screen sharing could not be started.',
      }));
    }
  }, [stopScreenShare, syncVideoSender]);

  const endSession = useCallback(() => {
    if (onEscrowRelease) {
      onEscrowRelease();
    }

    disconnect();
  }, [disconnect, onEscrowRelease]);

  const retry = useCallback(async () => {
    await connect();
  }, [connect]);

  useEffect(() => {
    return () => {
      teardownConnection();
    };
  }, [teardownConnection]);

  useEffect(() => {
    if (meetingLink && !stateRef.current.isConnected && !stateRef.current.isConnecting) {
      void connect();
    }
  }, [connect, meetingLink, sessionId]);

  return {
    ...state,
    connect,
    disconnect,
    toggleMute,
    toggleCamera,
    toggleScreenShare,
    endSession,
    retry,
  };
};
