import { useState, useCallback, useMemo } from 'react';
import type { SessionHistoryItem, LearningAnalytics } from '../types/session.types';

const MOCK_SESSIONS: SessionHistoryItem[] = [
  {
    id: 'sh1',
    mentorId: 'm1',
    mentorName: 'Sarah Chen',
    topic: 'Stellar Smart Contracts Basics',
    date: '2026-03-20T14:00:00Z',
    duration: 60,
    status: 'completed',
    rating: 5,
    skills: ['Stellar', 'Smart Contracts'],
    amount: 50,
    currency: 'XLM',
    outcome: 'excellent',
  },
  {
    id: 'sh2',
    mentorId: 'm2',
    mentorName: 'John Davis',
    topic: 'Soroban Development',
    date: '2026-03-18T10:00:00Z',
    duration: 45,
    status: 'completed',
    rating: 4,
    skills: ['Soroban', 'Rust'],
    amount: 75,
    currency: 'XLM',
    outcome: 'good',
  },
  {
    id: 'sh3',
    mentorId: 'm1',
    mentorName: 'Sarah Chen',
    topic: 'Advanced Stellar Concepts',
    date: '2026-03-15T16:00:00Z',
    duration: 90,
    status: 'completed',
    rating: 5,
    skills: ['Stellar', 'Architecture'],
    amount: 100,
    currency: 'XLM',
    outcome: 'excellent',
  },
];

export const useSessionHistory = () => {
  const [sessions] = useState<SessionHistoryItem[]>(MOCK_SESSIONS);
  const [loading] = useState(false);

  const analytics = useMemo<LearningAnalytics>(() => {
    const completed = sessions.filter(s => s.status === 'completed');
    const totalTime = completed.reduce((sum, s) => sum + s.duration, 0);
    const totalSpent = completed.reduce((sum, s) => sum + s.amount, 0);

    const skillMap = new Map<string, { count: number; time: number }>();
    completed.forEach(s => {
      s.skills.forEach(skill => {
        const current = skillMap.get(skill) || { count: 0, time: 0 };
        skillMap.set(skill, {
          count: current.count + 1,
          time: current.time + s.duration,
        });
      });
    });

    const mentorMap = new Map<string, { count: number; time: number; ratings: number[]; last: string }>();
    completed.forEach(s => {
      const current = mentorMap.get(s.mentorId) || { count: 0, time: 0, ratings: [], last: s.date };
      mentorMap.set(s.mentorId, {
        count: current.count + 1,
        time: current.time + s.duration,
        ratings: s.rating ? [...current.ratings, s.rating] : current.ratings,
        last: s.date > current.last ? s.date : current.last,
      });
    });

    return {
      totalSessions: completed.length,
      totalTimeInvested: totalTime,
      totalSpent,
      averageSessionDuration: completed.length > 0 ? totalTime / completed.length : 0,
      completionRate: sessions.length > 0 ? (completed.length / sessions.length) * 100 : 0,
      skillProgress: Array.from(skillMap.entries()).map(([skill, data]) => ({
        skill,
        sessionsCount: data.count,
        timeInvested: data.time,
        level: data.count >= 5 ? 'advanced' : data.count >= 2 ? 'intermediate' : 'beginner',
        progress: Math.min(100, (data.count / 10) * 100),
      })),
      mentorInteractions: Array.from(mentorMap.entries()).map(([id, data]) => {
        const mentor = sessions.find(s => s.mentorId === id);
        return {
          mentorId: id,
          mentorName: mentor?.mentorName || 'Unknown',
          sessionsCount: data.count,
          totalTime: data.time,
          averageRating: data.ratings.length > 0 ? data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length : 0,
          lastSession: data.last,
        };
      }),
      sessionFrequency: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        values: [2, 1, 3, 0, 2, 1, 0],
      },
      learningVelocity: {
        weeklyAverage: 2.5,
        monthlyTrend: 15,
        consistencyScore: 85,
      },
      spendingAnalytics: {
        byMentor: Array.from(mentorMap.entries()).map(([id, data]) => {
          const mentor = sessions.find(s => s.mentorId === id);
          const spent = completed.filter(s => s.mentorId === id).reduce((sum, s) => sum + s.amount, 0);
          return { name: mentor?.mentorName || 'Unknown', amount: spent };
        }),
        bySkill: Array.from(skillMap.entries()).map(([skill, data]) => {
          const spent = completed.filter(s => s.skills.includes(skill)).reduce((sum, s) => sum + s.amount, 0);
          return { skill, amount: spent };
        }),
        monthlyTrend: [
          { month: 'Jan', amount: 150 },
          { month: 'Feb', amount: 200 },
          { month: 'Mar', amount: 225 },
        ],
      },
    };
  }, [sessions]);

  const exportReport = useCallback(() => {
    const headers = ['Date', 'Mentor', 'Topic', 'Duration (min)', 'Amount', 'Rating', 'Status'];
    const rows = sessions.map(s => 
      `${s.date},${s.mentorName},"${s.topic}",${s.duration},${s.amount},${s.rating || 'N/A'},${s.status}`
    );
    const csv = [headers.join(','), ...rows].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `learning-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [sessions]);

  return {
    sessions,
    analytics,
    loading,
    exportReport,
  };
};
