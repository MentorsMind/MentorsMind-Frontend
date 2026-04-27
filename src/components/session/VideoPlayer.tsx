import React from 'react';
import type { Participant } from '../../hooks/useVideoSession';

interface VideoPlayerProps {
  participants: Participant[];
  isScreenSharing: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  participants,
  isScreenSharing,
}) => {
  const mainParticipant = participants.find((p) => p.isHost) || participants[0];
  const otherParticipants = participants.filter((p) => p.id !== mainParticipant?.id);

  return (
    <div className="relative w-full h-full bg-gray-900 rounded-2xl overflow-hidden">
      {/* Main Video */}
      {mainParticipant && (
        <div className="absolute inset-0 flex items-center justify-center">
          {mainParticipant.isVideoOff ? (
            <div className="flex flex-col items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center text-white text-3xl font-bold">
                {mainParticipant.name[0]}
              </div>
              <p className="mt-4 text-white/60 text-sm">Video is off</p>
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-stellar/20 flex items-center justify-center">
                  <svg className="w-10 h-10 text-stellar" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="mt-4 text-white/60 text-sm">Video feed</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Screen Share Indicator */}
      {isScreenSharing && (
        <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Screen Sharing
        </div>
      )}

      {/* Participant Thumbnails */}
      {otherParticipants.length > 0 && (
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          {otherParticipants.map((participant) => (
            <div
              key={participant.id}
              className="relative w-32 h-24 bg-gray-800 rounded-lg overflow-hidden border-2 border-white/20"
            >
              {participant.isVideoOff ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white text-sm font-bold">
                    {participant.name[0]}
                  </div>
                </div>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800" />
              )}

              {/* Connection Status */}
              <div className="absolute bottom-1 left-1">
                {participant.connectionStatus === 'connected' && (
                  <span className="w-2 h-2 bg-green-500 rounded-full block" />
                )}
                {participant.connectionStatus === 'connecting' && (
                  <span className="w-2 h-2 bg-yellow-500 rounded-full block animate-pulse" />
                )}
                {participant.connectionStatus === 'disconnected' && (
                  <span className="w-2 h-2 bg-red-500 rounded-full block" />
                )}
              </div>

              {/* Mute Indicator */}
              {participant.isMuted && (
                <div className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                </div>
              )}

              {/* Name */}
              <div className="absolute bottom-1 right-1 bg-black/50 px-1.5 py-0.5 rounded text-xs text-white">
                {participant.name}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Participants */}
      {participants.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-gray-800 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="mt-4 text-gray-500 text-sm">Waiting for participants...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
