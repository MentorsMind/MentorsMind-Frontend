import { useCallback, useMemo, useState } from 'react';
import { prefersReducedMotion } from '../utils/animation.utils';

export type HeatLevel = 0 | 1 | 2 | 3 | 4;

export interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  streakWeeks: number;
  isCurrentUser?: boolean;
}

export interface UseStreakOptions {
  sessionsCompleted?: number;
}

const WEEKS = 12;
const DAYS = 7;

function mockHeatGrid(streakWeeks: number): HeatLevel[][] {
  return Array.from({ length: WEEKS }, (_, w) =>
    Array.from({ length: DAYS }, (_, d) => {
      const recent = w >= WEEKS - Math.min(streakWeeks + 2, WEEKS);
      const base = (w + d * 3 + streakWeeks) % 5;
      return (recent ? Math.min(4, base + 1) : (base % 3) as number) as HeatLevel;
    })
  );
}

const MOCK_LEADERBOARD: Omit<LeaderboardEntry, 'rank'>[] = [
  { id: '1', name: 'Aisha Chen', streakWeeks: 12 },
  { id: '2', name: 'Ben Okoro', streakWeeks: 11 },
  { id: '3', name: 'Chloe Martinez', streakWeeks: 10 },
  { id: '4', name: 'David Mensah', streakWeeks: 9 },
  { id: 'you', name: 'You', streakWeeks: 3, isCurrentUser: true },
  { id: '6', name: 'Elena Rossi', streakWeeks: 8 },
  { id: '7', name: 'Farah Ali', streakWeeks: 7 },
  { id: '8', name: 'Gabriel Lee', streakWeeks: 6 },
  { id: '9', name: 'Hannah Kim', streakWeeks: 5 },
  { id: '10', name: 'Ivan Petrov', streakWeeks: 4 },
];

function sortLeaderboard(entries: Omit<LeaderboardEntry, 'rank'>[]): LeaderboardEntry[] {
  const sorted = [...entries].sort((a, b) => b.streakWeeks - a.streakWeeks);
  return sorted.slice(0, 10).map((e, i) => ({ ...e, rank: i + 1 }));
}

export function playStreakCelebrationSound(): void {
  if (typeof window === 'undefined') return;
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(523.25, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.36);
  } catch {}
}

export function useStreak(options: UseStreakOptions = {}) {
  const { sessionsCompleted = 18 } = options;

  const [currentWeekStreak] = useState(3);
  const [streakBroken, setStreakBroken] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !sessionStorage.getItem('streak-broken-dismissed');
  });
  const [mntEarnedTotal] = useState(240);
  const [unclaimedMnt, setUnclaimedMnt] = useState(40);

  const milestoneSessions = useMemo(() => {
    const derived = 8 + (sessionsCompleted % 2);
    return Math.min(9, Math.max(0, derived));
  }, [sessionsCompleted]);

  const heatGrid = useMemo(() => mockHeatGrid(currentWeekStreak), [currentWeekStreak]);

  const leaderboardTop10 = useMemo(() => {
    const entries = MOCK_LEADERBOARD.map((e) =>
      e.isCurrentUser ? { ...e, streakWeeks: currentWeekStreak } : e
    );
    return sortLeaderboard(entries);
  }, [currentWeekStreak]);

  const [celebrationOpen, setCelebrationOpen] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');

  const milestoneTarget = 10;
  const milestoneBonus = 100;

  const claimUnclaimedMnt = useCallback(() => {
    setUnclaimedMnt((prev) => {
      if (prev <= 0) return prev;
      const amount = prev;
      queueMicrotask(() => {
        setCelebrationMessage(`You claimed ${amount} MNT from streak rewards!`);
        setCelebrationOpen(true);
        if (!prefersReducedMotion()) {
          playStreakCelebrationSound();
        }
      });
      return 0;
    });
  }, []);

  const dismissStreakBroken = useCallback(() => {
    sessionStorage.setItem('streak-broken-dismissed', '1');
    setStreakBroken(false);
  }, []);

  const closeCelebration = useCallback(() => {
    setCelebrationOpen(false);
  }, []);

  return {
    currentWeekStreak,
    weekStreakLabel: `${currentWeekStreak} week streak!`,
    heatGrid,
    mntEarnedTotal,
    unclaimedMnt,
    claimUnclaimedMnt,
    milestoneSessions,
    milestoneTarget,
    milestoneBonus,
    streakBroken,
    dismissStreakBroken,
    leaderboardTop10,
    celebrationOpen,
    celebrationMessage,
    closeCelebration,
  };
}

export default useStreak;
