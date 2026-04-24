import React, { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../../utils/animation.utils';
import { playStreakCelebrationSound } from '../../hooks/useStreak';

interface MilestoneModalProps {
  visible: boolean;
  message?: string;
  onClose: () => void;
  withCelebration?: boolean;
}

const CONFETTI_COLORS = ['#fbbf24', '#38bdf8', '#a78bfa', '#34d399', '#fb7185', '#f472b6'];

const ConfettiLayer: React.FC = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl" aria-hidden>
    {Array.from({ length: 28 }, (_, i) => (
      <span
        key={i}
        className="absolute w-2 h-2 rounded-sm opacity-90 animate-confetti-fall"
        style={{
          left: `${(i * 41) % 92}%`,
          top: '-12px',
          backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
          animationDelay: `${i * 0.025}s`,
          animationDuration: `${0.75 + (i % 4) * 0.08}s`,
        }}
      />
    ))}
  </div>
);

const MilestoneModal: React.FC<MilestoneModalProps> = ({
  visible,
  message,
  onClose,
  withCelebration = false,
}) => {
  const playedRef = useRef(false);

  useEffect(() => {
    if (!visible) {
      playedRef.current = false;
      return;
    }
    if (!withCelebration || prefersReducedMotion() || playedRef.current) return;
    playedRef.current = true;
    playStreakCelebrationSound();
  }, [visible, withCelebration]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 shadow-xl dark:bg-gray-900 dark:border dark:border-gray-800">
        {withCelebration && !prefersReducedMotion() ? <ConfettiLayer /> : null}
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div>
            <p className="text-lg font-black text-gray-900 dark:text-white">🎉 Milestone Unlocked</p>
            <p className="mt-3 text-gray-600 dark:text-gray-300">
              {message || 'You reached a new milestone! Keep going!'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Close
          </button>
        </div>
        <div className="relative z-10 mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
          >
            Got it
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              setTimeout(() => window.alert('Share to your network!'), 50);
            }}
            className="rounded-2xl border border-blue-600 px-4 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
          >
            Share
          </button>
        </div>
      </div>
    </div>
  );
};

export default MilestoneModal;
