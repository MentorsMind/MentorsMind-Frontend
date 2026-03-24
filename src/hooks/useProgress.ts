import { useCallback, useMemo, useState } from 'react';
import type { AchievementBadge, LearningProgressData } from '../types';

const INITIAL_PROGRESS: LearningProgressData = {
  sessionsCompleted: 18,
  timeInvestedHours: 42,
  learningStreakDays: 9,
  goalCompletionRate: 68,
  peerComparison: 14,
  milestoneCelebration: 'Milestone unlocked: 3 consecutive weeks of consistent prep and follow-through.',
  skillProgression: [
    { label: 'Jan', stellar: 22, soroban: 14, product: 28 },
    { label: 'Feb', stellar: 35, soroban: 22, product: 34 },
    { label: 'Mar', stellar: 48, soroban: 31, product: 41 },
    { label: 'Apr', stellar: 60, soroban: 44, product: 52 },
  ],
  goals: [
    { id: 'goal-1', title: 'Ship a production-ready learner feature', completedSteps: 4, totalSteps: 5, dueInWeeks: 2 },
    { id: 'goal-2', title: 'Improve Soroban testing confidence', completedSteps: 3, totalSteps: 5, dueInWeeks: 4 },
    { id: 'goal-3', title: 'Build a strong session follow-up habit', completedSteps: 5, totalSteps: 6, dueInWeeks: 1 },
  ],
  achievements: [
    { id: 'ach-1', title: 'Momentum Builder', description: 'Completed 10+ learning sessions.', unlocked: true, unlockedAt: '2026-03-10', icon: '🚀' },
    { id: 'ach-2', title: 'Prep Pro', description: 'Prepared agenda + notes for 5 sessions in a row.', unlocked: true, unlockedAt: '2026-03-21', icon: '📝' },
    { id: 'ach-3', title: 'Roadmap Finisher', description: 'Complete all steps in a learning path.', unlocked: false, icon: '🏁' },
  ],
};

export const useProgress = () => {
  const [progress] = useState(INITIAL_PROGRESS);

  const unlockedAchievements = useMemo(() => {
    return progress.achievements.filter((achievement) => achievement.unlocked);
  }, [progress.achievements]);

  const achievementProgress = useMemo(() => {
    return Math.round((unlockedAchievements.length / progress.achievements.length) * 100);
  }, [progress.achievements.length, unlockedAchievements.length]);

  const exportProgressReport = useCallback(() => {
    const report = [
      '# Learner Progress Report',
      '',
      `Sessions completed: ${progress.sessionsCompleted}`,
      `Time invested: ${progress.timeInvestedHours} hours`,
      `Learning streak: ${progress.learningStreakDays} days`,
      `Goal completion rate: ${progress.goalCompletionRate}%`,
      '',
      '## Goals',
      ...progress.goals.map(
        (goal) => `- ${goal.title}: ${goal.completedSteps}/${goal.totalSteps} steps complete`
      ),
    ].join('\n');

    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'learner-progress-report.md';
    link.click();
    URL.revokeObjectURL(url);
  }, [progress]);

  const nextAchievement = useMemo<AchievementBadge | undefined>(() => {
    return progress.achievements.find((achievement) => !achievement.unlocked);
  }, [progress.achievements]);

  return {
    progress,
    unlockedAchievements,
    achievementProgress,
    nextAchievement,
    exportProgressReport,
  };
};

