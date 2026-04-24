import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AggregatedData, ChartDatum } from '../types/charts.types';
import type { EarningsBySession } from '../types';
import { useMentorWallet } from './useMentorWallet';

const MOCK_SESSION_EARNINGS: EarningsBySession[] = [
  { sessionId: 's1', studentName: 'Alex M.', topic: 'React Hooks', date: '2026-03-20', duration: 60, grossAmount: 120, platformFee: 6, netAmount: 114, asset: 'USDC' },
  { sessionId: 's2', studentName: 'Priya K.', topic: 'Solidity Basics', date: '2026-03-18', duration: 45, grossAmount: 80, platformFee: 4, netAmount: 76, asset: 'USDC' },
  { sessionId: 's3', studentName: 'Jordan L.', topic: 'DeFi Architecture', date: '2026-03-12', duration: 90, grossAmount: 200, platformFee: 10, netAmount: 190, asset: 'XLM' },
  { sessionId: 's4', studentName: 'Sam C.', topic: 'Smart Contract Audit', date: '2026-02-22', duration: 60, grossAmount: 160, platformFee: 8, netAmount: 152, asset: 'USDC' },
  { sessionId: 's5', studentName: 'Riley T.', topic: 'TypeScript Patterns', date: '2026-01-10', duration: 45, grossAmount: 90, platformFee: 4.5, netAmount: 85.5, asset: 'USDC' },
  { sessionId: 's6', studentName: 'Alex M.', topic: 'React Advanced', date: '2025-12-25', duration: 75, grossAmount: 150, platformFee: 7.5, netAmount: 142.5, asset: 'USDC' },
  { sessionId: 's7', studentName: 'Casey N.', topic: 'Rust Programming', date: '2025-11-20', duration: 60, grossAmount: 110, platformFee: 5.5, netAmount: 104.5, asset: 'USDC' },
  { sessionId: 's8', studentName: 'Jordan L.', topic: 'Blockchain Scaling', date: '2025-10-15', duration: 90, grossAmount: 220, platformFee: 11, netAmount: 209, asset: 'XLM' },
];

function monthLabel(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

function normalizeDate(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function buildMonthSeries(sessions: EarningsBySession[]): ChartDatum[] {
  const totals = sessions.reduce<Record<string, { USDC: number; XLM: number }>>((accumulator, session) => {
    const key = monthLabel(new Date(session.date));
    const assetKey = session.asset === 'USDC' ? 'USDC' : 'XLM';
    accumulator[key] = accumulator[key] ?? { USDC: 0, XLM: 0 };
    accumulator[key][assetKey] += session.netAmount;
    return accumulator;
  }, {});

  return Object.entries(totals).flatMap(([label, values]) => ([
    { date: label, value: values.USDC, asset: 'USDC' },
    { date: label, value: values.XLM, asset: 'XLM' },
  ]));
}

function buildWeeklySeries(sessions: EarningsBySession[]): ChartDatum[] {
  const totals = sessions.reduce<Record<string, number>>((accumulator, session) => {
    const date = new Date(session.date);
    const weekLabel = `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    accumulator[weekLabel] = (accumulator[weekLabel] ?? 0) + 1;
    return accumulator;
  }, {});

  return Object.entries(totals).map(([date, value]) => ({ date, value }));
}

export function useEarningsData(dateRange?: { start: Date; end: Date }) {
  const { wallet } = useMentorWallet();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AggregatedData>({
    monthlyEarnings: [],
    weeklySessions: [],
    topLearners: [],
    skillBreakdown: [],
    metrics: {
      avgDuration: 0,
      totalSessions: 0,
      platformFees: 0,
      currentPeriodTotal: 0,
      previousPeriodTotal: 0,
      periodChange: 0,
    },
  });

  const currentRange = useMemo(() => {
    if (dateRange) return dateRange;
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 6);
    return { start, end };
  }, [dateRange]);

  const computeAggregatedData = useCallback((sessions: EarningsBySession[]) => {
    const filteredSessions = sessions.filter((session) => {
      const sessionDate = normalizeDate(new Date(session.date));
      return sessionDate >= normalizeDate(currentRange.start) && sessionDate <= normalizeDate(currentRange.end);
    });

    const learnerTotals = filteredSessions.reduce<Record<string, number>>((accumulator, session) => {
      accumulator[session.studentName] = (accumulator[session.studentName] ?? 0) + session.netAmount;
      return accumulator;
    }, {});

    const skillTotals = filteredSessions.reduce<Record<string, number>>((accumulator, session) => {
      accumulator[session.topic] = (accumulator[session.topic] ?? 0) + session.netAmount;
      return accumulator;
    }, {});

    const totalSessions = filteredSessions.length;
    const totalGross = filteredSessions.reduce((total, session) => total + session.grossAmount, 0);
    const totalFees = filteredSessions.reduce((total, session) => total + session.platformFee, 0);
    const previousPeriodTotal = totalGross * 0.78;

    return {
      monthlyEarnings: buildMonthSeries(filteredSessions),
      weeklySessions: buildWeeklySeries(filteredSessions),
      topLearners: Object.entries(learnerTotals)
        .sort((left, right) => right[1] - left[1])
        .slice(0, 5)
        .map(([date, value]) => ({ date, value })),
      skillBreakdown: Object.entries(skillTotals)
        .sort((left, right) => right[1] - left[1])
        .slice(0, 6)
        .map(([date, value]) => ({ date, value })),
      metrics: {
        avgDuration: totalSessions
          ? Math.round(filteredSessions.reduce((total, session) => total + session.duration, 0) / totalSessions)
          : 0,
        totalSessions,
        platformFees: totalFees,
        currentPeriodTotal: totalGross,
        previousPeriodTotal,
        periodChange: previousPeriodTotal ? ((totalGross - previousPeriodTotal) / previousPeriodTotal) * 100 : 0,
      },
    };
  }, [currentRange.end, currentRange.start]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setData(computeAggregatedData([...MOCK_SESSION_EARNINGS, ...(wallet.sessionEarnings || [])]));
      setLoading(false);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [computeAggregatedData, wallet.sessionEarnings]);

  const exportCSV = useCallback(() => {
    const rows = [
      ['Date', 'Learner', 'Topic', 'Duration', 'Gross', 'Fee', 'Net', 'Asset'],
      ...MOCK_SESSION_EARNINGS.map((session) => [
        session.date,
        session.studentName,
        session.topic,
        String(session.duration),
        String(session.grossAmount),
        String(session.platformFee),
        String(session.netAmount),
        session.asset,
      ]),
    ];
    const blob = new Blob([rows.map((row) => row.join(',')).join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mentor-earnings.csv';
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  return {
    data,
    loading,
    dateRange: currentRange,
    exportCSV,
  };
}

export default useEarningsData;
