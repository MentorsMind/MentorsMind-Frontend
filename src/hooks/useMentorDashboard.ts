import { useState, useCallback } from 'react';
import type { MentorDashboardData, SessionStatus } from '../types';

const MOCK_DATA: MentorDashboardData = {
  upcomingSessions: [
    {
      id: 's1',
      learnerId: 'u1',
      learnerName: 'Alice Johnson',
      topic: 'Stellar Smart Contracts Introduction',
      startTime: new Date(Date.now() + 3600000).toISOString(),
      duration: 60,
      status: 'pending',
      price: 50,
      currency: 'XLM',
    },
    {
      id: 's2',
      learnerId: 'u2',
      learnerName: 'Bob Smith',
      topic: 'Soroban Development Best Practices',
      startTime: new Date(Date.now() + 86400000).toISOString(),
      duration: 45,
      status: 'confirmed',
      price: 75,
      currency: 'XLM',
      meetingLink: 'https://meet.google.com/abc-defg-hij',
    },
  ],
  earnings: {
    totalEarned: 1250.50,
    pendingPayout: 125.00,
    history: [
      { date: '2026-03-17', amount: 50 },
      { date: '2026-03-18', amount: 75 },
      { date: '2026-03-19', amount: 0 },
      { date: '2026-03-20', amount: 100 },
      { date: '2026-03-21', amount: 50 },
      { date: '2026-03-22', amount: 125 },
      { date: '2026-03-23', amount: 80 },
    ],
  },
  performance: {
    averageRating: 4.9,
    completionRate: 98,
    totalSessions: 42,
  },
  recentReviews: [
    {
      id: 'r1',
      mentorId: 'm1',
      reviewerId: 'u1',
      reviewerName: 'Alice Johnson',
      rating: 5,
      comment: 'Excellent session! Very clear explanations about Stellar assets.',
      date: '2 days ago',
      helpfulCount: 3,
      isVerified: true,
    },
  ],
  activities: [
    {
      id: 'a1',
      type: 'booking',
      title: 'New Session Request',
      description: 'Alice Johnson requested a session for tomorrow.',
      timestamp: '10 mins ago',
    },
    {
      id: 'a2',
      type: 'payment',
      title: 'Payment Received',
      description: 'Received 75 XLM for the session with Bob Smith.',
      timestamp: '2 hours ago',
    },
  ],
  profileCompletion: 85,
  pendingMessagesCount: 3,
};

export const useMentorDashboard = () => {
  const [data, setData] = useState<MentorDashboardData>(MOCK_DATA);
  const [loading] = useState(false);

  const updateSessionStatus = useCallback((sessionId: string, status: SessionStatus) => {
    setData(prev => ({
      ...prev,
      upcomingSessions: prev.upcomingSessions.map(s => 
        s.id === sessionId ? { ...s, status } : s
      ),
    }));
  }, []);

  const confirmSession = useCallback((sessionId: string) => {
    updateSessionStatus(sessionId, 'confirmed');
  }, [updateSessionStatus]);

  const cancelSession = useCallback((sessionId: string) => {
    updateSessionStatus(sessionId, 'cancelled');
  }, [updateSessionStatus]);

  const rescheduleSession = useCallback((sessionId: string, newTime: string = new Date().toISOString()) => {
    setData(prev => ({
      ...prev,
      upcomingSessions: prev.upcomingSessions.map(s => 
        s.id === sessionId ? { ...s, startTime: newTime, status: 'rescheduled' } : s
      ),
    }));
  }, []);

  const exportEarningsCSV = useCallback(() => {
    const headers = ['Date', 'Amount (XLM)'];
    const rows = data.earnings.history.map(h => `${h.date},${h.amount}`);
    const csvContent = [headers.join(','), ...rows].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `earnings_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [data.earnings.history]);

  return {
    data,
    loading,
    confirmSession,
    cancelSession,
    rescheduleSession,
    exportEarningsCSV,
  };
};
