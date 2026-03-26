import React, { useState, useEffect } from 'react';
import { useMentorDashboard } from '../hooks/useMentorDashboard';
import { useDashboard } from '../hooks/useDashboard';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { DashboardGrid } from '../components/dashboard/DashboardGrid';
import { Widget } from '../components/dashboard/Widget';
import UpcomingSessions from '../components/mentor/UpcomingSessions';
import EarningsOverview from '../components/mentor/EarningsOverview';
import PerformanceMetrics from '../components/mentor/PerformanceMetrics';
import RecentReviews from '../components/mentor/RecentReviews';
import ActivityFeed from '../components/mentor/ActivityFeed';
import { useSessionCountdown } from '../hooks/useSessionCountdown';

const POLL_INTERVAL_MS = 30_000;

// Inner component so hooks can use session data
const MentorDashboardInner: React.FC<{ nextSessionTime?: string }> = ({ nextSessionTime }) => {
  const countdown = useSessionCountdown(nextSessionTime ?? new Date(0).toISOString());
  return countdown.isStartingSoon && !countdown.isStarted && nextSessionTime ? (
    <div className="flex items-center gap-3 px-5 py-3 mb-6 bg-amber-50 border border-amber-200 rounded-2xl text-amber-700 text-sm font-bold animate-in slide-in-from-top-2 duration-300">
      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
      Session starting soon — your next session begins in under 15 minutes.
    </div>
  ) : null;
};

const MentorDashboardContent: React.FC = () => {
  const {
    data,
    confirmSession,
    cancelSession,
    rescheduleSession,
    exportEarningsCSV,
  } = useMentorDashboard();

  const { setRole, setLoading, widgets } = useDashboard();
  const [isAvailable, setIsAvailable] = useState(true);
  const [lastPolled, setLastPolled] = useState<Date>(new Date());

  // 30s polling indicator
  useEffect(() => {
    const interval = setInterval(() => setLastPolled(new Date()), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  const nextSession = data.upcomingSessions?.[0];
  const nextSessionTime = nextSession?.startTime;

  useEffect(() => {
    setRole('mentor');
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [setRole, setLoading]);

  return (
    <div className="p-6">
      <div className="flex flex-wrap justify-between items-center gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Mentor Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Welcome back! Here's what's happening today.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-2 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="w-12 h-12 bg-gray-50 dark:bg-gray-900 rounded-xl flex flex-col items-center justify-center border border-gray-100 dark:border-gray-700">
            <span className="text-[10px] font-bold text-gray-400 uppercase leading-none">Mar</span>
            <span className="text-lg font-black text-gray-900 dark:text-white">23</span>
          </div>
          <div className="pr-4">
            <div className="text-xs font-bold text-gray-400 uppercase">Availability</div>
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-xs font-bold text-gray-900 dark:text-gray-100">{isAvailable ? 'Active Now' : 'Offline'}</span>
            </div>
          </div>
          <button 
            onClick={() => setIsAvailable(!isAvailable)}
            className={`${isAvailable ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'} text-white p-2 rounded-lg hover:opacity-80 transition-all`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            </svg>
          </button>
        </div>
      </div>

      <DashboardGrid>
        {widgets.filter(w => w.visible).sort((a, b) => a.order - b.order).map(widget => (
          <Widget key={widget.id} config={widget}>
            {widget.id === 'stats' && <PerformanceMetrics metrics={data.performance} />}
            {widget.id === 'sessions' && <UpcomingSessions sessions={data.upcomingSessions} onConfirm={confirmSession} onCancel={cancelSession} onReschedule={rescheduleSession} />}
            {widget.id === 'earnings' && <EarningsOverview earnings={data.earnings} onExport={exportEarningsCSV} />}
            {widget.id === 'activity' && <ActivityFeed activities={data.activities} />}
          </Widget>
        ))}
      </DashboardGrid>
    </div>
  );
};

const MentorDashboard: React.FC = () => (
  <DashboardLayout>
    <MentorDashboardContent />
  </DashboardLayout>
);

export default MentorDashboard;
