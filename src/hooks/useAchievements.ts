import { useCallback, useMemo, useState, useEffect } from 'react';
import { useProgress } from './useProgress';
import type { AchievementBadge, LearningProgressData } from '../types';

export interface AchievementSummary {
  totalHours: number;
  streakDays: number;
  streakWeeks: number;
  leaderboardOptIn: boolean;
  unlockedAchievements: AchievementBadge[];
  currentProgressPercent: number;
  nextAchievement?: AchievementBadge;
  milestoneCelebration?: string;
}

export const useAchievements = () => {
  const {
    progress: baseProgress,
    unlockedAchievements: baseUnlocked,
    achievementProgress: basePercent,
    nextAchievement: baseNext,
    exportProgressReport,
  } = useProgress();

  const [achievements, setAchievements] = useState<AchievementBadge[]>(baseProgress.achievements);
  const [milestoneCelebration, setMilestoneCelebration] = useState<string | undefined>(
    baseProgress.milestoneCelebration
  );
  const [isMilestoneModalVisible, setIsMilestoneModalVisible] = useState(false);
  const [isLeaderboardOptIn, setIsLeaderboardOptIn] = useState(false);

  useEffect(() => {
    setAchievements(baseProgress.achievements);
  }, [baseProgress.achievements]);

  const streakDays = baseProgress.learningStreakDays;
  const streakWeeks = Math.floor(streakDays / 7);

  const totalHours = baseProgress.timeInvestedHours;

  const unlocked = useMemo(
    () => achievements.filter((achievement) => achievement.unlocked),
    [achievements]
  );

  const progressPercent = useMemo(() => {
    if (!achievements.length) return 0;
    return Math.round((unlocked.length / achievements.length) * 100);
  }, [achievements.length, unlocked.length]);

  const next = useMemo(() => achievements.find((achievement) => !achievement.unlocked), [achievements]);

  const unlockAchievement = useCallback(
    (id: string) => {
      const target = achievements.find((achievement) => achievement.id === id);
      if (!target || target.unlocked) return;

      const updated = achievements.map((achievement) =>
        achievement.id === id
          ? {
              ...achievement,
              unlocked: true,
              unlockedAt: new Date().toISOString(),
            }
          : achievement
      );

      setAchievements(updated);
      const message = `🎉 Achievement unlocked: ${target.title}`;
      setMilestoneCelebration(message);
      setIsMilestoneModalVisible(true);
    },
    [achievements]
  );

  const toggleLeaderboardOptIn = useCallback(() => {
    setIsLeaderboardOptIn((previous) => !previous);
  }, []);

  const closeMilestoneModal = useCallback(() => {
    setIsMilestoneModalVisible(false);
  }, []);

  const exportProgressCard = useCallback(() => {
    if (typeof document === 'undefined') return;

    const width = 820;
    const height = 520;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#4f46e5');
    gradient.addColorStop(1, '#06b6d4');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Inter, system-ui';
    ctx.fillText('MentorMinds Progress Card', 40, 55);

    ctx.font = 'bold 20px Inter, system-ui';
    ctx.fillText(`Learning streak: ${streakDays} days (${streakWeeks} weeks)`, 40, 110);
    ctx.fillText(`Total hours: ${totalHours}h`, 40, 145);
    ctx.fillText(`Achievements: ${unlocked.length}/${achievements.length} (${progressPercent}%)`, 40, 180);

    ctx.font = '16px Inter, system-ui';
    const summary = `Next badge: ${next?.title ?? 'Complete all badges'}`;
    ctx.fillText(summary, 40, 220);

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'mentorminds-progress-card.png';
    link.click();
  }, [streakDays, streakWeeks, totalHours, unlocked.length, achievements.length, progressPercent, next?.title]);

  return {
    progress: baseProgress,
    unlockedAchievements: unlocked,
    achievementPercent: progressPercent,
    nextAchievement: next ?? baseNext,
    milestoneCelebration,
    isMilestoneModalVisible,
    isLeaderboardOptIn,
    streakDays,
    streakWeeks,
    totalHours,
    unlockAchievement,
    toggleLeaderboardOptIn,
    exportProgressCard,
    closeMilestoneModal,
    exportProgressReport,
  };
};

export default useAchievements;
