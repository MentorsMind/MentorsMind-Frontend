import React from 'react';

interface SessionControlsProps {
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onEndSession: () => void;
  disabled?: boolean;
}

const SessionControls: React.FC<SessionControlsProps> = ({
  isMuted,
  isVideoOff,
  isScreenSharing,
  onToggleMute,
  onToggleVideo,
  onToggleScreenShare,
  onEndSession,
  disabled = false,
}) => {
  return (
    <div className="flex items-center justify-center gap-3 p-4 bg-gray-900/80 backdrop-blur-sm rounded-2xl">
      {/* Mute Button */}
      <button
        onClick={onToggleMute}
        disabled={disabled}
        className={`p-4 rounded-xl transition-all ${
          isMuted
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'bg-white/10 text-white hover:bg-white/20'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        aria-label={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        )}
      </button>

      {/* Video Button */}
      <button
        onClick={onToggleVideo}
        disabled={disabled}
        className={`p-4 rounded-xl transition-all ${
          isVideoOff
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'bg-white/10 text-white hover:bg-white/20'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        aria-label={isVideoOff ? 'Turn on video' : 'Turn off video'}
      >
        {isVideoOff ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )}
      </button>

      {/* Screen Share Button */}
      <button
        onClick={onToggleScreenShare}
        disabled={disabled}
        className={`p-4 rounded-xl transition-all ${
          isScreenSharing
            ? 'bg-green-500 text-white hover:bg-green-600'
            : 'bg-white/10 text-white hover:bg-white/20'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        aria-label={isScreenSharing ? 'Stop screen share' : 'Share screen'}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </button>

      {/* Divider */}
      <div className="w-px h-8 bg-white/20 mx-2" />

      {/* End Session Button */}
      <button
        onClick={onEndSession}
        disabled={disabled}
        className="px-6 py-4 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        End Session
      </button>
    </div>
  );
};

export default SessionControls;
