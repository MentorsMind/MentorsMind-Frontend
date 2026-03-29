import React, { useEffect, useMemo, useRef, useState } from 'react';
import RecordingConsent from '../components/session/RecordingConsent';
import RecordingIndicator from '../components/session/RecordingIndicator';
import ConnectionQuality from '../components/session/ConnectionQuality';
import VideoControls from '../components/session/VideoControls';
import VideoGrid from '../components/session/VideoGrid';
import SessionTimer from '../components/session/SessionTimer';
import { useRecording } from '../hooks/useRecording';
import { useWebRTC } from '../hooks/useWebRTC';

interface SessionRoomProps {
  sessionId: string;
  meetingLink?: string;
  sessionTopic?: string;
  mentorName?: string;
  viewerRole?: 'mentor' | 'learner';
}

const SessionRoom: React.FC<SessionRoomProps> = ({
  sessionId,
  meetingLink,
  sessionTopic = 'Mentoring Session',
  mentorName = 'Mentor',
  viewerRole = 'learner',
}) => {
  const {
    isConnected,
    isConnecting,
    isReconnecting,
    error,
    localStream,
    remoteStream,
    screenStream,
    isScreenSharing,
    isMuted,
    isCameraOff,
    isAudioOnly,
    sessionDuration,
    connectionQuality,
    rttMs,
    screenShareSupported,
    connect,
    disconnect,
    toggleMute,
    toggleCamera,
    toggleScreenShare,
    endSession,
    retry,
  } = useWebRTC({
    sessionId,
    meetingLink,
    onSessionEnd: () => {
      console.log('Session ended');
    },
    onEscrowRelease: () => {
      console.log('Escrow release triggered');
    },
  });

  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [isPictureInPicture, setIsPictureInPicture] = useState(false);
  const primaryVideoRef = useRef<HTMLVideoElement>(null);
  const pipSupported = useMemo(
    () =>
      typeof document !== 'undefined' &&
      document.pictureInPictureEnabled &&
      typeof HTMLVideoElement !== 'undefined' &&
      'requestPictureInPicture' in HTMLVideoElement.prototype,
    [],
  );

  const remotePartyRole = viewerRole === 'mentor' ? 'learner' : 'mentor';
  const remotePartyName = viewerRole === 'mentor' ? 'Learner' : mentorName;
  const {
    isRecordingActive,
    canRequestRecording,
    canStopRecording,
    pendingRequestType,
    statusMessage: recordingStatusMessage,
    privacyNotice,
    incomingRequest,
    incomingSecondsRemaining,
    consentMetadata,
    recordingArchive,
    requestRecording,
    requestStopRecording,
    acceptIncomingRequest,
    declineIncomingRequest,
  } = useRecording({
    sessionId,
    sessionTopic,
    isSessionConnected: isConnected,
    localPartyRole: viewerRole,
    remotePartyRole,
    remotePartyName,
  });

  useEffect(() => {
    const video = primaryVideoRef.current;

    if (!video) {
      return;
    }

    const handleEnter = () => setIsPictureInPicture(true);
    const handleLeave = () => setIsPictureInPicture(false);

    video.addEventListener('enterpictureinpicture', handleEnter);
    video.addEventListener('leavepictureinpicture', handleLeave);

    return () => {
      video.removeEventListener('enterpictureinpicture', handleEnter);
      video.removeEventListener('leavepictureinpicture', handleLeave);
    };
  }, [remoteStream, isScreenSharing]);

  const togglePictureInPicture = async () => {
    if (!pipSupported || !primaryVideoRef.current) {
      return;
    }

    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
      setIsPictureInPicture(false);
      return;
    }

    await primaryVideoRef.current.requestPictureInPicture();
    setIsPictureInPicture(true);
  };

  const remoteVideoOff = !isScreenSharing && (isCameraOff || isAudioOnly);

  // Pre-join screen
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-blue-100 flex items-center justify-center">
            <Video className="h-7 w-7 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Connection Error</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                void retry();
              }}
              className="px-6 py-3 bg-stellar text-white font-bold rounded-xl hover:bg-stellar-dark transition-all"
            >
              Retry
            </button>
            <button
              onClick={join}
              className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Join Session
            </button>
          ) : (
            <p className="text-sm text-gray-400">
              Join button available 10 minutes before the session starts.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 overflow-hidden">
      {/* Video area — 70% */}
      <div className="flex flex-col" style={{ width: '70%' }}>
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-900/80">
          <div>
            <p className="text-white font-semibold text-sm">{session.topic}</p>
            <p className="text-white/50 text-xs">with {session.mentorName}</p>
          </div>
          {/* Timer */}
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2 bg-black/40 rounded-lg px-3 py-1">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <span className="font-mono text-white font-bold text-sm">{fmt(elapsed)}</span>
              <span className="text-white/40 text-xs">LIVE</span>
            </div>
            {/* Duration limit bar */}
            <div className="w-32 h-1 rounded-full bg-white/10 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${nearLimit ? 'bg-red-500' : 'bg-blue-400'}`}
                style={{ width: `${limitPct}%` }}
              />
            </div>
            {nearLimit && <span className="text-xs text-red-400">Session limit approaching</span>}
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Connecting to session...</h2>
          <p className="text-gray-500">Please wait while we connect you to the WebRTC session.</p>
        </div>

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-stellar/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-stellar" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Ready to join?</h2>
          <p className="text-gray-500 mb-6">
            You&apos;re about to join a session with {mentorName}.
          </p>
          {recordingArchive && consentMetadata && (
            <div className="mb-6 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-left">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-stellar">Recording Ready</p>
              <h3 className="mt-2 text-lg font-bold text-gray-900">Download recording</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Recording available until {new Date(recordingArchive.availableUntil).toLocaleDateString()}.
              </p>
              <div className="mt-4 rounded-2xl bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">On-chain consent metadata</p>
                <p className="mt-2 text-sm font-semibold text-gray-900">{consentMetadata.ledgerReference}</p>
              </div>
              <a
                href={recordingArchive.downloadUrl}
                download={recordingArchive.fileName}
                className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-stellar px-4 py-3 font-bold text-white transition-all hover:bg-stellar-dark"
              >
                Download recording
              </a>
            </div>
          )}
          <button
            onClick={() => {
              void connect();
            }}
            className="w-full px-6 py-3 bg-stellar text-white font-bold rounded-xl hover:bg-stellar-dark transition-all"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gray-900/50 p-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMuted(v => !v)}
            aria-label={isMuted ? 'Unmute (M)' : 'Mute (M)'}
            className={`p-3 rounded-xl transition-colors ${isMuted ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>
          <button
            onClick={() => setIsVideoOff(v => !v)}
            aria-label={isVideoOff ? 'Turn on video (V)' : 'Turn off video (V)'}
            className={`p-3 rounded-xl transition-colors ${isVideoOff ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
          </button>
          <div className="w-px h-8 bg-white/20" />
          <button
            onClick={() => setShowEndModal(true)}
            className="flex items-center gap-2 rounded-xl bg-red-500 px-5 py-3 text-sm font-semibold text-white hover:bg-red-600 transition-colors"
          >
            <PhoneOff className="h-4 w-4" />
            End Session
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3">
          <ConnectionQuality quality={connectionQuality} rttMs={rttMs} />
          <RecordingIndicator
            isRecording={isRecordingActive}
            retentionNotice={privacyNotice}
            metadataReference={consentMetadata?.ledgerReference}
          />
          <SessionTimer duration={sessionDuration} isLive />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4 lg:flex-row">
        <div className="flex flex-1 flex-col gap-4">
          {(isAudioOnly || isScreenSharing) && (
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/85">
              {isAudioOnly && <span>Audio-only fallback is active because video capture failed.</span>}
              {isScreenSharing && <span>Screen share is active and mirrored into the peer connection.</span>}
            </div>
          )}

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="rounded-2xl bg-white/10 p-5 text-left text-white">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-300">Recording Consent</p>
                  <h2 className="mt-2 text-xl font-bold">Session recording status</h2>
                </div>
                <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white/80">
                  {pendingRequestType === 'start'
                    ? 'Awaiting consent'
                    : pendingRequestType === 'stop'
                    ? 'Awaiting stop consent'
                    : isRecordingActive
                    ? 'Recording live'
                    : 'Recording off'}
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-white/75">{recordingStatusMessage}</p>
              <p className="mt-3 text-sm font-semibold text-white">{privacyNotice}</p>
            </div>

            <div className="rounded-2xl bg-white p-5 text-left">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-stellar">On-chain metadata</p>
              <h3 className="mt-2 text-lg font-bold text-gray-900">Consent anchored to session metadata</h3>
              <p className="mt-3 text-sm leading-6 text-gray-600">
                Recording consent is stored on-chain as session metadata so both participants have an auditable record of when capture was approved.
              </p>
              <div className="mt-4 rounded-2xl bg-gray-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">Ledger reference</p>
                <p className="mt-2 text-sm font-semibold text-gray-900">
                  {consentMetadata?.ledgerReference || 'Awaiting mutual consent'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <VideoGrid
              localStream={localStream}
              remoteStream={remoteStream}
              screenStream={screenStream}
              isMuted={isMuted}
              isCameraOff={isCameraOff}
              isRemoteVideoOff={remoteVideoOff}
              isScreenSharing={isScreenSharing}
              isAudioOnly={isAudioOnly}
              isReconnecting={isReconnecting}
              remoteName={mentorName}
              primaryVideoRef={primaryVideoRef}
            />
          </div>
        </div>

        {showNotes && (
          <div className="flex w-full flex-col rounded-2xl bg-white p-4 lg:w-80">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Session Notes</h3>
              <button
                onClick={() => setShowNotes(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Take notes during the session..."
              className="flex-1 w-full p-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-stellar/20 focus:border-stellar transition-all text-sm min-h-48"
            />
          </div>
        )}
      </div>

      <div className="p-4 flex justify-center">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`p-4 rounded-xl transition-all ${
              showNotes
                ? 'bg-stellar text-white'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
            aria-label="Toggle notes"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>

          {!isRecordingActive ? (
            <button
              onClick={requestRecording}
              disabled={!canRequestRecording}
              className={`px-5 py-4 rounded-xl font-bold transition-all ${
                canRequestRecording
                  ? 'bg-white text-gray-900 hover:bg-gray-100'
                  : 'bg-white/10 text-white/60 cursor-not-allowed'
              }`}
              aria-label="Request Recording"
            >
              {pendingRequestType === 'start' ? 'Awaiting consent...' : 'Request Recording'}
            </button>
          ) : (
            <button
              onClick={requestStopRecording}
              disabled={!canStopRecording}
              className={`px-5 py-4 rounded-xl font-bold transition-all ${
                canStopRecording
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-red-500/40 text-white/70 cursor-not-allowed'
              }`}
              aria-label="Stop Recording"
            >
              {pendingRequestType === 'stop' ? 'Awaiting stop consent...' : 'Stop Recording'}
            </button>
          )}

          <VideoControls
            isMuted={isMuted}
            isCameraOff={isCameraOff}
            isScreenSharing={isScreenSharing}
            isAudioOnly={isAudioOnly}
            isPictureInPicture={isPictureInPicture}
            pipSupported={pipSupported && !remoteVideoOff}
            onToggleMute={toggleMute}
            onToggleCamera={() => {
              void toggleCamera();
            }}
            onToggleScreenShare={() => {
              void toggleScreenShare();
            }}
            onTogglePictureInPicture={() => {
              void togglePictureInPicture();
            }}
            onEndSession={endSession}
            disabled={!screenShareSupported && isScreenSharing}
          />
        </div>
      </div>

      <RecordingConsent
        request={incomingRequest}
        secondsRemaining={incomingSecondsRemaining}
        onAccept={acceptIncomingRequest}
        onDecline={declineIncomingRequest}
      />
    </div>
  );
};

export default SessionRoom;
