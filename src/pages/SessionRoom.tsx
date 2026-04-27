import React, { useState } from 'react';
import { useVideoSession } from '../hooks/useVideoSession';
import VideoPlayer from '../components/session/VideoPlayer';
import SessionTimer from '../components/session/SessionTimer';
import SessionControls from '../components/session/SessionControls';

interface SessionRoomProps {
  sessionId: string;
  meetingLink?: string;
  sessionTopic?: string;
  mentorName?: string;
}

const SessionRoom: React.FC<SessionRoomProps> = ({
  sessionId,
  meetingLink,
  sessionTopic = 'Mentoring Session',
  mentorName = 'Mentor',
}) => {
  const {
    isConnected,
    isConnecting,
    error,
    participants,
    isScreenSharing,
    isMuted,
    isVideoOff,
    sessionDuration,
    connect,
    disconnect,
    toggleMute,
    toggleVideo,
    toggleScreenShare,
    endSession,
    retry,
  } = useVideoSession({
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Connection Error</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={retry}
              className="px-6 py-3 bg-stellar text-white font-bold rounded-xl hover:bg-stellar-dark transition-all"
            >
              Retry
            </button>
            <button
              onClick={disconnect}
              className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all"
            >
              Leave
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isConnecting) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-stellar/10 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-stellar border-t-transparent rounded-full animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Connecting to session...</h2>
          <p className="text-gray-500">Please wait while we connect you to the video call.</p>
        </div>
      </div>
    );
  }

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
            You're about to join a session with {mentorName}.
          </p>
          <button
            onClick={connect}
            className="w-full px-6 py-3 bg-stellar text-white font-bold rounded-xl hover:bg-stellar-dark transition-all"
          >
            Join Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-900/50">
        <div className="flex items-center gap-4">
          <button
            onClick={disconnect}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
            aria-label="Leave session"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-white font-bold">{sessionTopic}</h1>
            <p className="text-white/60 text-sm">with {mentorName}</p>
          </div>
        </div>

        <SessionTimer duration={sessionDuration} isLive />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-4 p-4">
        {/* Video Area */}
        <div className="flex-1">
          <VideoPlayer
            participants={participants}
            isScreenSharing={isScreenSharing}
          />
        </div>

        {/* Notes Panel */}
        {showNotes && (
          <div className="w-80 bg-white rounded-2xl p-4 flex flex-col">
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
              className="flex-1 w-full p-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-stellar/20 focus:border-stellar transition-all text-sm"
            />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 flex justify-center">
        <div className="flex items-center gap-3">
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

          <SessionControls
            isMuted={isMuted}
            isVideoOff={isVideoOff}
            isScreenSharing={isScreenSharing}
            onToggleMute={toggleMute}
            onToggleVideo={toggleVideo}
            onToggleScreenShare={toggleScreenShare}
            onEndSession={endSession}
          />
        </div>
      </div>
    </div>
  );
};

export default SessionRoom;
