import { useCallback, useEffect, useRef, useState } from 'react';

export const RECORDING_RETENTION_DAYS = 30;
export const CONSENT_AUTO_DECLINE_SECONDS = 30;
export const DEMO_REMOTE_RESPONSE_DELAY_MS = 1800;
export const INCOMING_CONSENT_REQUEST_DELAY_MS = 12000;

export type RecordingPartyRole = 'mentor' | 'learner';
export type RecordingRequestType = 'start' | 'stop';

export interface RecordingConsentRequest {
  type: RecordingRequestType;
  requesterRole: RecordingPartyRole;
  requesterName: string;
  expiresAt: number;
}

export interface RecordingConsentMetadata {
  sessionId: string;
  sessionTopic: string;
  ledgerReference: string;
  requestedBy: string;
  grantedAt: string;
  expiresAt: string;
  retentionDays: number;
  status: 'recording' | 'stopped';
}

export interface RecordingArchive {
  fileName: string;
  downloadUrl: string;
  availableUntil: string;
  sizeLabel: string;
}

interface UseRecordingOptions {
  sessionId: string;
  sessionTopic?: string;
  isSessionConnected: boolean;
  localPartyRole?: RecordingPartyRole;
  remotePartyRole?: RecordingPartyRole;
  remotePartyName?: string;
}

const getRoleLabel = (role: RecordingPartyRole) => (role === 'mentor' ? 'Mentor' : 'Learner');

export const useRecording = ({
  sessionId,
  sessionTopic = 'Mentoring Session',
  isSessionConnected,
  localPartyRole = 'learner',
  remotePartyRole = 'mentor',
  remotePartyName,
}: UseRecordingOptions) => {
  const remoteLabel = remotePartyName || getRoleLabel(remotePartyRole);
  const localLabel = getRoleLabel(localPartyRole);
  const privacyNotice = 'Recordings are stored for 30 days then deleted';

  const [isRecordingActive, setIsRecordingActive] = useState(false);
  const [pendingRequestType, setPendingRequestType] = useState<RecordingRequestType | null>(null);
  const [statusMessage, setStatusMessage] = useState('Recording is off. Both parties must consent before capture starts.');
  const [incomingRequest, setIncomingRequest] = useState<RecordingConsentRequest | null>(null);
  const [incomingSecondsRemaining, setIncomingSecondsRemaining] = useState(CONSENT_AUTO_DECLINE_SECONDS);
  const [consentMetadata, setConsentMetadata] = useState<RecordingConsentMetadata | null>(null);
  const [recordingArchive, setRecordingArchive] = useState<RecordingArchive | null>(null);
  const [hasRecordedContent, setHasRecordedContent] = useState(false);
  const [hasSimulatedIncomingRequest, setHasSimulatedIncomingRequest] = useState(false);

  const responseTimerRef = useRef<number | null>(null);
  const incomingPromptTimerRef = useRef<number | null>(null);
  const autoDeclineTimerRef = useRef<number | null>(null);
  const countdownTimerRef = useRef<number | null>(null);
  const previousConnectedRef = useRef(isSessionConnected);
  const archiveUrlRef = useRef<string | null>(null);

  const clearResponseTimer = useCallback(() => {
    if (responseTimerRef.current !== null) {
      window.clearTimeout(responseTimerRef.current);
      responseTimerRef.current = null;
    }
  }, []);

  const clearIncomingRequestTimers = useCallback(() => {
    if (incomingPromptTimerRef.current !== null) {
      window.clearTimeout(incomingPromptTimerRef.current);
      incomingPromptTimerRef.current = null;
    }

    if (autoDeclineTimerRef.current !== null) {
      window.clearTimeout(autoDeclineTimerRef.current);
      autoDeclineTimerRef.current = null;
    }

    if (countdownTimerRef.current !== null) {
      window.clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
  }, []);

  const buildConsentMetadata = useCallback(
    (requestedBy: string): RecordingConsentMetadata => {
      const grantedAt = new Date();
      const expiresAt = new Date(grantedAt);
      expiresAt.setDate(grantedAt.getDate() + RECORDING_RETENTION_DAYS);

      return {
        sessionId,
        sessionTopic,
        ledgerReference: `chain:${sessionId}:${grantedAt.getTime().toString(36).toUpperCase()}`,
        requestedBy,
        grantedAt: grantedAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
        retentionDays: RECORDING_RETENTION_DAYS,
        status: 'recording',
      };
    },
    [sessionId, sessionTopic],
  );

  const startRecording = useCallback(
    (requestedBy: string) => {
      setIsRecordingActive(true);
      setPendingRequestType(null);
      setIncomingRequest(null);
      setHasRecordedContent(true);
      setConsentMetadata(buildConsentMetadata(requestedBy));
      setStatusMessage('Both parties consented. Recording is live.');
    },
    [buildConsentMetadata],
  );

  const stopRecording = useCallback((message: string) => {
    setIsRecordingActive(false);
    setPendingRequestType(null);
    setIncomingRequest(null);
    setConsentMetadata((current) => (current ? { ...current, status: 'stopped' } : current));
    setStatusMessage(message);
  }, []);

  const createRecordingArchive = useCallback(() => {
    if (!consentMetadata || !hasRecordedContent || recordingArchive) {
      return;
    }

    if (archiveUrlRef.current) {
      window.URL.revokeObjectURL(archiveUrlRef.current);
      archiveUrlRef.current = null;
    }

    const archiveContents = [
      'MentorsMind session recording package',
      `Session topic: ${sessionTopic}`,
      `Session ID: ${sessionId}`,
      `On-chain metadata: ${consentMetadata.ledgerReference}`,
      `Requested by: ${consentMetadata.requestedBy}`,
      `Granted at: ${new Date(consentMetadata.grantedAt).toLocaleString()}`,
      `Available until: ${new Date(consentMetadata.expiresAt).toLocaleString()}`,
      `Retention: ${privacyNotice}`,
      'This downloadable package is a UI placeholder until media storage is connected.',
    ].join('\n');

    const archiveBlob = new Blob([archiveContents], { type: 'text/plain;charset=utf-8' });
    const archiveUrl = window.URL.createObjectURL(archiveBlob);
    archiveUrlRef.current = archiveUrl;

    setRecordingArchive({
      fileName: `${sessionId}-recording-package.txt`,
      downloadUrl: archiveUrl,
      availableUntil: consentMetadata.expiresAt,
      sizeLabel: `${Math.max(1, Math.round(archiveBlob.size / 1024))} KB`,
    });
  }, [consentMetadata, hasRecordedContent, privacyNotice, recordingArchive, sessionId, sessionTopic]);

  const closeIncomingRequest = useCallback(() => {
    clearIncomingRequestTimers();
    setIncomingRequest(null);
    setIncomingSecondsRemaining(CONSENT_AUTO_DECLINE_SECONDS);
  }, [clearIncomingRequestTimers]);

  const requestRecording = useCallback(() => {
    if (!isSessionConnected || isRecordingActive || pendingRequestType || incomingRequest) {
      return;
    }

    clearResponseTimer();
    clearIncomingRequestTimers();
    setPendingRequestType('start');
    setStatusMessage(`Consent request sent to ${remoteLabel}. Waiting for approval...`);

    responseTimerRef.current = window.setTimeout(() => {
      startRecording(localLabel);
    }, DEMO_REMOTE_RESPONSE_DELAY_MS);
  }, [
    clearIncomingRequestTimers,
    clearResponseTimer,
    incomingRequest,
    isRecordingActive,
    isSessionConnected,
    localLabel,
    pendingRequestType,
    remoteLabel,
    startRecording,
  ]);

  const requestStopRecording = useCallback(() => {
    if (!isSessionConnected || !isRecordingActive || pendingRequestType) {
      return;
    }

    clearResponseTimer();
    setPendingRequestType('stop');
    setStatusMessage(`Stop recording request sent to ${remoteLabel}. Waiting for approval...`);

    responseTimerRef.current = window.setTimeout(() => {
      stopRecording('Both parties agreed to stop recording.');
    }, DEMO_REMOTE_RESPONSE_DELAY_MS);
  }, [clearResponseTimer, isRecordingActive, isSessionConnected, pendingRequestType, remoteLabel, stopRecording]);

  const acceptIncomingRequest = useCallback(() => {
    if (!incomingRequest) {
      return;
    }

    const activeRequest = incomingRequest;
    closeIncomingRequest();

    if (activeRequest.type === 'start') {
      startRecording(activeRequest.requesterName);
      return;
    }

    stopRecording(`You approved ${activeRequest.requesterName}'s stop recording request.`);
  }, [closeIncomingRequest, incomingRequest, startRecording, stopRecording]);

  const declineIncomingRequest = useCallback(() => {
    if (!incomingRequest) {
      return;
    }

    const activeRequest = incomingRequest;
    closeIncomingRequest();
    setStatusMessage(`${activeRequest.requesterName}'s ${activeRequest.type === 'start' ? 'recording' : 'stop recording'} request was declined.`);
  }, [closeIncomingRequest, incomingRequest]);

  useEffect(() => {
    if (!incomingRequest) {
      return;
    }

    clearIncomingRequestTimers();

    const updateRemainingSeconds = () => {
      setIncomingSecondsRemaining(Math.max(0, Math.ceil((incomingRequest.expiresAt - Date.now()) / 1000)));
    };

    updateRemainingSeconds();
    countdownTimerRef.current = window.setInterval(updateRemainingSeconds, 1000);
    autoDeclineTimerRef.current = window.setTimeout(() => {
      setIncomingRequest(null);
      setIncomingSecondsRemaining(0);
      setStatusMessage(`${incomingRequest.requesterName}'s ${incomingRequest.type === 'start' ? 'recording' : 'stop recording'} request auto-declined after 30 seconds.`);
    }, CONSENT_AUTO_DECLINE_SECONDS * 1000);

    return () => {
      if (autoDeclineTimerRef.current !== null) {
        window.clearTimeout(autoDeclineTimerRef.current);
        autoDeclineTimerRef.current = null;
      }

      if (countdownTimerRef.current !== null) {
        window.clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
    };
  }, [clearIncomingRequestTimers, incomingRequest]);

  useEffect(() => {
    if (
      !isSessionConnected ||
      isRecordingActive ||
      pendingRequestType ||
      incomingRequest ||
      consentMetadata ||
      hasSimulatedIncomingRequest
    ) {
      return;
    }

    incomingPromptTimerRef.current = window.setTimeout(() => {
      const expiresAt = Date.now() + CONSENT_AUTO_DECLINE_SECONDS * 1000;
      setHasSimulatedIncomingRequest(true);
      setIncomingSecondsRemaining(CONSENT_AUTO_DECLINE_SECONDS);
      setIncomingRequest({
        type: 'start',
        requesterRole: remotePartyRole,
        requesterName: remoteLabel,
        expiresAt,
      });
      setStatusMessage(`${remoteLabel} wants to record this session.`);
    }, INCOMING_CONSENT_REQUEST_DELAY_MS);

    return () => {
      if (incomingPromptTimerRef.current !== null) {
        window.clearTimeout(incomingPromptTimerRef.current);
        incomingPromptTimerRef.current = null;
      }
    };
  }, [
    consentMetadata,
    hasSimulatedIncomingRequest,
    incomingRequest,
    isRecordingActive,
    isSessionConnected,
    pendingRequestType,
    remoteLabel,
    remotePartyRole,
  ]);

  useEffect(() => {
    const wasConnected = previousConnectedRef.current;

    if (wasConnected && !isSessionConnected) {
      clearResponseTimer();
      clearIncomingRequestTimers();

      if (isRecordingActive) {
        setIsRecordingActive(false);
        setConsentMetadata((current) => (current ? { ...current, status: 'stopped' } : current));
      }

      if (consentMetadata && hasRecordedContent) {
        createRecordingArchive();
        setStatusMessage('Session ended. Recording is available for download for 30 days.');
      }

      setPendingRequestType(null);
      setIncomingRequest(null);
    }

    previousConnectedRef.current = isSessionConnected;
  }, [
    clearIncomingRequestTimers,
    clearResponseTimer,
    consentMetadata,
    createRecordingArchive,
    hasRecordedContent,
    isRecordingActive,
    isSessionConnected,
  ]);

  useEffect(() => {
    return () => {
      clearResponseTimer();
      clearIncomingRequestTimers();

      if (archiveUrlRef.current) {
        window.URL.revokeObjectURL(archiveUrlRef.current);
        archiveUrlRef.current = null;
      }
    };
  }, [clearIncomingRequestTimers, clearResponseTimer]);

  return {
    isRecordingActive,
    canRequestRecording: isSessionConnected && !isRecordingActive && pendingRequestType === null,
    canStopRecording: isSessionConnected && isRecordingActive && pendingRequestType === null,
    pendingRequestType,
    statusMessage,
    privacyNotice,
    incomingRequest,
    incomingSecondsRemaining,
    consentMetadata,
    recordingArchive,
    requestRecording,
    requestStopRecording,
    acceptIncomingRequest,
    declineIncomingRequest,
  };
};
