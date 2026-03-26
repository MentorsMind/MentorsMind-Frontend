import { useState, useCallback, useEffect } from 'react';
import type { Session, SessionStatus } from '../types';

export interface ExtendedSession extends Session {
  notes?: string;
  cancelReason?: string;
  checklist: boolean[];
  feedback?: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  learnerAvatar?: string;
  learnerBio?: string;
    mentorTimezone?: string; 
}

export interface MentorSessionsData {
  upcoming: ExtendedSession[];
  completed: ExtendedSession[];
  loading: boolean;
}

const MOCK_SESSIONS: ExtendedSession[] = [
  {
    id: 's1',
    learnerId: 'u1',
    learnerName: 'Alice Johnson',
    learnerAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=48&h=48&fit=crop&crop=face',
    topic: 'Stellar Smart Contracts Introduction',
    startTime: new Date(Date.now() + 3600000).toISOString(),
    duration: 60,
    status: 'pending',
    price: 50,
    currency: 'XLM',
    checklist: [false, true, false],
    paymentStatus: 'pending' as const,
    mentorTimezone: 'America/New_York',
  },
  {
    id: 's2',
    learnerId: 'u2',
    learnerName: 'Bob Smith',
    learnerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=48&h=48&fit=crop&crop=face',
    topic: 'Soroban Development Best Practices',
    startTime: new Date(Date.now() + 86400000).toISOString(),
    duration: 45,
    status: 'confirmed',
    price: 75,
    currency: 'XLM',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    checklist: [true, true, false],
    paymentStatus: 'paid' as const,
    notes: 'Learner struggled with Rust syntax - recommended additional resources.',
    mentorTimezone: 'America/New_York',
  },
  {
    id: 's3',
    learnerId: 'u3',
    learnerName: 'Carol Davis',
    topic: 'Advanced Stellar SDK Usage',
    startTime: new Date(Date.now() - 86400000).toISOString(),
    duration: 90,
    status: 'completed',
    price: 100,
    currency: 'XLM',
    checklist: [true, true, true],
    paymentStatus: 'paid' as const,
    feedback: 'Great session! Mentor was very knowledgeable.',
    notes: 'Covered custom Soroban contracts and testing.',
    mentorTimezone: 'America/New_York',
  },
];

export const useMentorSessions = () => {
  const [data, setData] = useState<MentorSessionsData>({
    upcoming: [],
    completed: [],
    loading: true,
  });

  useEffect(() => {
    // Mock fetch
    setTimeout(() => {
      const now = new Date().toISOString();
      const upcoming = MOCK_SESSIONS.filter(s => new Date(s.startTime) > new Date(now));
      const completed = MOCK_SESSIONS.filter(s => s.status === 'completed');
      setData({ upcoming, completed, loading: false });
    }, 500);
  }, []);

  const updateSession = useCallback((updater: (sessions: ExtendedSession[]) => ExtendedSession[]) => {
    setData(prev => ({
      ...prev,
      upcoming: updater(prev.upcoming),
      completed: updater(prev.completed),
    }));
  }, []);

  const updateStatus = useCallback((id: string, status: SessionStatus) => {
    updateSession(sessions => 
      sessions.map(s => s.id === id ? { ...s, status } : s)
    );
  }, [updateSession]);

  const reschedule = useCallback((id: string, newStartTime: string) => {
    updateSession(sessions => 
      sessions.map(s => s.id === id ? { ...s, startTime: newStartTime, status: 'rescheduled' as SessionStatus } : s)
    );
  }, [updateSession]);

  const cancelWithReason = useCallback((id: string, reason: string) => {
    updateSession(sessions => 
      sessions.map(s => s.id === id ? { ...s, status: 'cancelled' as SessionStatus, cancelReason: reason } : s)
    );
  }, [updateSession]);

  const completeSession = useCallback((id: string) => {
    updateSession(sessions => 
      sessions.map(s => s.id === id ? { ...s, status: 'completed' as SessionStatus, paymentStatus: 'paid' as const } : s)
    );
  }, [updateSession]);

  const updateNotes = useCallback((id: string, notes: string) => {
    updateSession(sessions => 
      sessions.map(s => s.id === id ? { ...s, notes } : s)
    );
  }, [updateSession]);

  const toggleChecklist = useCallback((id: string, index: number) => {
    updateSession(sessions => 
      sessions.map(s => s.id === id ? {
        ...s,
        checklist: s.checklist.map((checked, i) => i === index ? !checked : checked)
      } : s)
    );
  }, [updateSession]);

  const refresh = useCallback(() => {
    setData(prev => ({ ...prev, loading: true }));
    // Simulate refresh
    setTimeout(() => setData(prev => ({ ...prev, loading: false })), 300);
  }, []);

  return {
    data,
    updateStatus,
    reschedule,
    cancelWithReason,
    completeSession,
    updateNotes,
    toggleChecklist,
    refresh,
  };
};

