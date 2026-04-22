import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export interface SessionInfo {
  id: string;
  topic: string;
  mentorName: string;
  scheduledStart: Date; // used to gate the Join button
  durationLimit: number; // seconds
}

// Mock session — in production, fetch by id
function getMockSession(id: string): SessionInfo {
  return {
    id,
    topic: 'React Architecture Deep Dive',
    mentorName: 'Alex Chen',
    scheduledStart: new Date(Date.now() - 5 * 60 * 1000), // started 5 min ago
    durationLimit: 60 * 60, // 1 hour
  };
}

export type SidebarTab = 'notes' | 'resources' | 'chat' | 'escrow';

export function useSessionRoom() {
  const { id = 'demo' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const session = getMockSession(id);

  // Media state
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Timer
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // UI
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('notes');
  const [notes, setNotes] = useState('');
  const [showEndModal, setShowEndModal] = useState(false);
  const [escrowStatus, setEscrowStatus] = useState<'idle' | 'releasing' | 'released'>('idle');

  // Can join 10 min before scheduled start
  const canJoin = Date.now() >= session.scheduledStart.getTime() - 10 * 60 * 1000;

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const join = useCallback(async () => {
    setIsConnecting(true);
    await new Promise(r => setTimeout(r, 1200));
    setIsConnected(true);
    setIsConnecting(false);
    startTimer();
  }, [startTimer]);

  const releaseEscrow = useCallback(async () => {
    setEscrowStatus('releasing');
    await new Promise(r => setTimeout(r, 1500));
    setEscrowStatus('released');
  }, []);

  const endSession = useCallback(async () => {
    stopTimer();
    setIsConnected(false);
    await releaseEscrow();
    navigate(`/sessions/${id}/review`);
  }, [stopTimer, releaseEscrow, navigate, id]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      if (e.key === 'm' || e.key === 'M') setIsMuted(v => !v);
      if (e.key === 'v' || e.key === 'V') setIsVideoOff(v => !v);
      if (e.key === 'Escape' && isFullscreen) {
        document.exitFullscreen?.();
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isFullscreen]);

  useEffect(() => () => stopTimer(), [stopTimer]);

  const toggleFullscreen = useCallback(() => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, [isFullscreen]);

  return {
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
  };
}
