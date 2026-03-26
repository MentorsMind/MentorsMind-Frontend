import { useState, useCallback, useMemo, useEffect } from 'react';
import type { AggregatedData, ChartDatum } from '../types/charts.types';
import type { EarningsBySession, WalletState, TxType } from '../types';
import { format, startOfMonth, endOfMonth, subMonths, eachWeekOfInterval, getWeek, addDays, parseISO } from 'date-fns';
import { useMentorWallet } from './useMentorWallet';
import { useMentorDashboard } from './useMentorDashboard';

const MOCK_SESSION_EARNINGS: EarningsBySession[] = [
  { sessionId: 's1', studentName: 'Alex M.', topic: 'React Hooks', date: '2026-03-20', duration: 60, grossAmount: 120, platformFee: 6, netAmount: 114, asset: 'USDC' },
  { sessionId: 's2', studentName: 'Priya K.', topic: 'Solidity Basics', date: '2026-03-18', duration: 45, grossAmount: 80, platformFee: 4, netAmount: 76, asset: 'USDC' },
  { sessionId: 's3', studentName: 'Jordan L.', topic: 'DeFi Architecture', date: '2026-03-12', duration: 90, grossAmount: 200, platformFee: 10, netAmount: 190, asset: 'XLM' },
  { sessionId: 's4', studentName: 'Sam C.', topic: 'Smart Contract Audit', date: '2026-03-22', duration: 60, grossAmount: 160, platformFee: 8, netAmount: 152, asset: 'USDC' },
  { sessionId: 's5', studentName: 'Riley T.', topic: 'TypeScript Patterns', date: '2026-03-10', duration: 45, grossAmount: 90, platformFee: 4.5, netAmount: 85.5, asset: 'USDC' },
  { sessionId: 's6', studentName: 'Alex M.', topic: 'React Advanced', date: '2026-02-25', duration: 75, grossAmount: 150, platformFee: 7.5, netAmount: 142.5, asset: 'USDC' },
  { sessionId: 's7', studentName: 'Casey N.', topic: 'Rust Programming', date: '2026-02-20', duration: 60, grossAmount: 110, platformFee: 5.5, netAmount: 104.5, asset: 'USDC' },
  { sessionId: 's8', studentName: 'Jordan L.', topic: 'Blockchain Scaling', date: '2026-02-15', duration: 90, grossAmount: 220, platformFee: 11, netAmount: 209, asset: 'XLM' },
  // Add more historical data...
];

const PLATFORM_FEE_RATE = 0.05;

export function useEarningsData(dateRange?: { start: Date; end: Date }) {
  const { wallet } = useMentorWallet();
  const { data: dashboardData } = useMentorDashboard();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AggregatedData>({
    monthlyEarnings: [],
    weeklySessions: [],
    topLearners: [],
    skillBreakdown: [],
    metrics: { avgDuration: 0, totalSessions: 0, platformFees: 0, currentPeriodTotal: 0, previousPeriodTotal: 0, periodChange: 0 },
  });

  const currentRange = useMemo(() => {
    const now = new Date();
    const defaultStart = startOfMonth(subMonths(now, 5)); // Last 6 months
    const defaultEnd = endOfMonth(now);
    return dateRange || { start: defaultStart, end: defaultEnd };
  }, [dateRange]);

  const computeAggregatedData = useCallback((sessions: EarningsBySession[]) => {
    const filteredSessions = sessions.filter(s => {
      const sessionDate = parseISO(s.date);
      return sessionDate >= currentRange.start && sessionDate <= currentRange.end;
    });

    // Monthly earnings by asset (stacked)
    const monthlyEarnings: ChartDatum[] = [];
    const months = eachWeekOfInterval(currentRange, { step: 4 }); // Monthly-ish
    for (let i = 0; i < months.length; i++) {
      const monthStart = months[i]!;
      const monthEnd = addDays(monthStart!, 27);
      const monthSessions = filteredSessions.filter(s => {
        const d = parseISO(s.date);
        return d >= monthStart! && d <= monthEnd;
      });
      const usdc = monthSessions.filter(s => s.asset === 'USDC').reduce((sum, s) => sum + s.netAmount, 0);
      const xlm = monthSessions.filter(s => s.asset === 'XLM').reduce((sum, s) => sum + s.netAmount, 0);
      monthlyEarnings.push(
        { date: format(monthStart!, 'MMM yy'), value: usdc + xlm, asset: 'USDC', category: 'USDC', value2: usdc },
        { date: format(monthStart!, 'MMM yy'), value: xlm, asset: 'XLM', category: 'XLM', value2: xlm }
      );
    }

    // Weekly sessions
    const weeks = eachWeekOfInterval(currentRange, { step: 1 });
    const weeklySessions: ChartDatum[] = weeks.map((weekStart: Date, idx: number) => ({
      date: format(weekStart!, 'MMM dd'),
      value: (Math.random() * 5 + 2) * (idx + 1), // Mock weekly count
      category: `Week ${getWeek(weekStart!)}`,
    }));

    // Top 5 learners
    const learnerTotals = filteredSessions.reduce((acc, s) => {
      acc[s.studentName] = (acc[s.studentName] || 0) + s.netAmount;
      return acc;
    }, {} as Record<string, number>);
    const sortedLearners = Object.entries(learnerTotals)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([learner, value], idx) => ({
        date: learner,
        value,
        category: learner,
      }));

    // Skill/topic breakdown
    const skillTotals = filteredSessions.reduce((acc, s) => {
      acc[s.topic] = (acc[s.topic] || 0) + s.netAmount;
      return acc;
    }, {} as Record<string, number>);
    const sortedSkills = Object.entries(skillTotals)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 6)
      .map(([topic, value]) => ({ date: topic, value, category: topic }));

    // Metrics
    const totalSessions = filteredSessions.length;
    const totalGross = filteredSessions.reduce((sum, s) => sum + s.grossAmount, 0);
    const totalFees = filteredSessions.reduce((sum, s) => sum + s.platformFee, 0);
    const avgDuration = totalSessions ? filteredSessions.reduce((sum, s) => sum + s.duration, 0) / totalSessions : 0;

    // Previous period comparison
    const prevStart = subMonths(currentRange.start, 1);
    const prevEnd = subMonths(currentRange.end, 1);
    const prevSessions = MOCK_SESSION_EARNINGS.filter(s => {
      const d = parseISO(s.date);
      return d >= prevStart && d <= prevEnd;
    });
    const prevTotal = prevSessions.reduce((sum, s) => sum + s.netAmount, 0);

    const metrics = {
      avgDuration: Math.round(avgDuration),
      totalSessions,
      platformFees: totalFees,
      currentPeriodTotal: totalGross,
      previousPeriodTotal: prevTotal,
      periodChange: prevTotal ? ((totalGross - prevTotal) / prevTotal * 100) : 0,
    };

    return { monthlyEarnings, weeklySessions, topLearners: sortedLearners, skillBreakdown: sortedSkills, metrics };
  }, [currentRange]);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      const aggregated = computeAggregatedData([...MOCK_SESSION_EARNINGS, ...(wallet.sessionEarnings || [])]);
      setData(aggregated);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [currentRange, wallet.sessionEarnings, computeAggregatedData]);

  const exportCSV = useCallback(() => {
    const rows = [
      ['Date', 'Learner', 'Topic', 'Duration', 'Gross', 'Fee', 'Net', 'Asset'],
      ...MOCK_SESSION_EARNINGS.map(s => [
        s.date, s.studentName, s.topic, s.duration, s.grossAmount, s.platformFee, s.netAmount, s.asset
      ])
    ];
    const csv = rows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mentor_earnings_${format(currentRange.start, 'yyyy-MM')}_to_${format(currentRange.end, 'yyyy-MM')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [currentRange]);

  return {
    data,
    loading,
    dateRange: currentRange,
    exportCSV,
  };
}

