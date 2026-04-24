import { useMemo } from 'react';
import type { RadarDatum } from '../components/charts/RadarChart';
import type { MultiSeriesDataPoint } from '../types/charts.types';

interface LearningSession {
  id: string;
  mentor: string;
  skill: string;
  completedAt: string;
  durationMinutes: number;
  amountUsd: number;
  ratingGiven: number;
}

interface MentorComparison {
  mentor: string;
  ratingGiven: number;
  sessionsCompleted: number;
  skillsLearned: number;
}

interface LearnerInvestmentSummary {
  totalUsd: number;
  estimatedSalaryLift: number;
  roiPercent: number;
}

export interface LearnerAnalyticsState {
  timeInvestedBySkill: MultiSeriesDataPoint[];
  learningVelocity: MultiSeriesDataPoint[];
  mentorComparison: MentorComparison[];
  goalCompletionTrend: MultiSeriesDataPoint[];
  skillProgression: RadarDatum[];
  bestLearningDay: string;
  investment: LearnerInvestmentSummary;
  summary: {
    learnerName: string;
    totalHours: number;
    completionRate: number;
    roiPercent: number;
    topSkill: string;
    bestDay: string;
  };
}

const SKILLS = ['React', 'System Design', 'Communication', 'Stellar', 'Product Thinking'];
const MENTORS = ['Ada Bloom', 'Chris N.', 'Maya T.', 'Olu F.'];

const LEARNING_SESSIONS: LearningSession[] = (() => {
  const base = new Date('2025-07-03T18:00:00Z');

  return Array.from({ length: 56 }, (_, index) => {
    const completedAt = new Date(base);
    completedAt.setUTCDate(base.getUTCDate() + index * 4);
    completedAt.setUTCHours(15 + (index % 5), 0, 0, 0);

    return {
      id: `learning-session-${index + 1}`,
      mentor: MENTORS[index % MENTORS.length],
      skill: SKILLS[index % SKILLS.length],
      completedAt: completedAt.toISOString(),
      durationMinutes: 45 + (index % 4) * 15,
      amountUsd: 75 + (index % 5) * 18,
      ratingGiven: Number((4 + (index % 6) * 0.15).toFixed(1)),
    };
  });
})();

const GOAL_SERIES = [
  { label: 'Oct', set: 6, completed: 2 },
  { label: 'Nov', set: 8, completed: 3 },
  { label: 'Dec', set: 9, completed: 5 },
  { label: 'Jan', set: 11, completed: 6 },
  { label: 'Feb', set: 12, completed: 8 },
  { label: 'Mar', set: 14, completed: 10 },
];

const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function useLearnerAnalytics(): LearnerAnalyticsState {
  return useMemo(() => {
    const timeInvestedMap = LEARNING_SESSIONS.reduce<Record<string, number>>((accumulator, session) => {
      accumulator[session.skill] = (accumulator[session.skill] ?? 0) + session.durationMinutes / 60;
      return accumulator;
    }, {});
    const timeInvestedBySkill = Object.entries(timeInvestedMap).map(([label, hours]) => ({
      label,
      hours: Number(hours.toFixed(1)),
    }));

    const learningVelocity = Array.from({ length: 8 }, (_, index) => {
      const weekSessions = LEARNING_SESSIONS.filter((session) => Math.floor(Number(session.id.split('-').pop())) % 8 === index).length;
      return {
        label: `W${index + 1}`,
        sessions: weekSessions + (index % 3),
      };
    });

    const mentorComparison = MENTORS.map((mentor) => {
      const sessions = LEARNING_SESSIONS.filter((session) => session.mentor === mentor);
      const skillsLearned = new Set(sessions.map((session) => session.skill)).size;
      const ratingGiven = sessions.reduce((total, session) => total + session.ratingGiven, 0) / Math.max(sessions.length, 1);

      return {
        mentor,
        ratingGiven: Number(ratingGiven.toFixed(1)),
        sessionsCompleted: sessions.length,
        skillsLearned,
      };
    });

    const goalCompletionTrend = GOAL_SERIES.map((item) => ({
      label: item.label,
      completed: item.completed,
      set: item.set,
      completionRate: Math.round((item.completed / item.set) * 100),
    }));

    const skillProgression = SKILLS.map((skill, index) => ({
      label: skill,
      score: 52 + index * 9,
    }));

    const sessionsByWeekday = LEARNING_SESSIONS.reduce<Record<number, number>>((accumulator, session) => {
      const day = new Date(session.completedAt).getUTCDay();
      accumulator[day] = (accumulator[day] ?? 0) + 1;
      return accumulator;
    }, {});
    const [bestLearningDayIndex] = Object.entries(sessionsByWeekday).sort((left, right) => right[1] - left[1])[0] ?? ['0', 0];
    const bestLearningDay = WEEKDAY_NAMES[Number(bestLearningDayIndex)] ?? 'Wednesday';

    const totalUsd = LEARNING_SESSIONS.reduce((total, session) => total + session.amountUsd, 0);
    const estimatedSalaryLift = 9200;
    const roiPercent = Math.round((estimatedSalaryLift / Math.max(totalUsd, 1)) * 100);
    const topSkill = [...timeInvestedBySkill].sort((left, right) => Number(right.hours) - Number(left.hours))[0]?.label ?? SKILLS[0];
    const completionRate = goalCompletionTrend[goalCompletionTrend.length - 1]?.completionRate ?? 0;

    return {
      timeInvestedBySkill,
      learningVelocity,
      mentorComparison,
      goalCompletionTrend,
      skillProgression,
      bestLearningDay,
      investment: {
        totalUsd,
        estimatedSalaryLift,
        roiPercent,
      },
      summary: {
        learnerName: 'Aisha Bello',
        totalHours: Math.round(LEARNING_SESSIONS.reduce((total, session) => total + session.durationMinutes, 0) / 60),
        completionRate,
        roiPercent,
        topSkill,
        bestDay: bestLearningDay,
      },
    };
  }, []);
}

export default useLearnerAnalytics;
