import React from 'react';
import { Mic, MicOff, Video, VideoOff, Maximize2, Minimize2, PhoneOff } from 'lucide-react';
import { useSessionRoom } from '../hooks/useSessionRoom';
import SessionSidebar from '../components/session/SessionSidebar';
import EndSessionModal from '../components/session/EndSessionModal';

function fmt(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
  const sec = (s % 60).toString().padStart(2, '0');
  return h > 0 ? `${h}:${m}:${sec}` : `${m}:${sec}`;
}

const SessionRoom: React.FC = () => {
  const {
    session,
    canJoin,
    isConnected, isConnecting,
    isMuted, setIsMuted,
    isVideoOff, setIsVideoOff,
    isFullscreen, toggleFullscreen,
    elapsed,
    sidebarTab, setSidebarTab,
    notes, setNotes,
    showEndModal, setShowEndModal,
    escrowStatus,
    join,
    endSession,
  } = useSessionRoom();

  const limitPct = Math.min((elapsed / session.durationLimit) * 100, 100);
  const nearLimit = elapsed >= session.durationLimit * 0.9;

  // Pre-join screen
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-blue-100 flex items-center justify-center">
            <Video className="h-7 w-7 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">{session.topic}</h2>
          <p className="text-sm text-gray-500">with {session.mentorName}</p>
          {isConnecting ? (
            <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
              <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              Connecting…
            </div>
          ) : canJoin ? (
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
        </div>

        {/* Video placeholder */}
        <div className="flex-1 relative bg-gray-800 flex items-center justify-center">
          {isVideoOff ? (
            <div className="flex flex-col items-center gap-2 text-white/40">
              <VideoOff className="h-12 w-12" />
              <span className="text-sm">Camera off</span>
            </div>
          ) : (
            <div className="text-white/20 text-sm">Video stream</div>
          )}
          {/* Fullscreen toggle */}
          <button
            onClick={toggleFullscreen}
            className="absolute top-3 right-3 p-2 rounded-lg bg-black/40 text-white/60 hover:text-white transition-colors"
            aria-label="Toggle fullscreen"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>

        {/* Controls bar */}
        <div className="flex items-center justify-center gap-3 py-4 bg-gray-900/80">
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

        {/* Keyboard hint */}
        <p className="text-center text-xs text-white/20 pb-2">
          M — mute · V — video · Esc — exit fullscreen
        </p>
      </div>

      {/* Sidebar — 30% */}
      <div className="flex-1 border-l border-white/10">
        <SessionSidebar
          activeTab={sidebarTab}
          onTabChange={setSidebarTab}
          notes={notes}
          onNotesChange={setNotes}
          escrowStatus={escrowStatus}
          collateral={120}
          borrowedAmount={0}
        />
      </div>

      {/* End session modal */}
      {showEndModal && (
        <EndSessionModal
          elapsed={elapsed}
          escrowStatus={escrowStatus}
          onConfirm={endSession}
          onCancel={() => setShowEndModal(false)}
        />
      )}
    </div>
  );
};

export default SessionRoom;
