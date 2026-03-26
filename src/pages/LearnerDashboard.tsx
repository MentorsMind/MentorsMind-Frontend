import React, { useEffect } from 'react';
import { useReminders } from '../hooks/useReminders';
import { useRecommendations } from '../hooks/useRecommendations';
import { useDashboard } from '../hooks/useDashboard';
import { usePostSessionReview } from '../hooks/usePostSessionReview';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { DashboardGrid } from '../components/dashboard/DashboardGrid';
import { Widget } from '../components/dashboard/Widget';
import ReminderSettings from '../components/learner/ReminderSettings';
import UpcomingReminders from '../components/learner/UpcomingReminders';
import LearningRecommendations from '../components/learner/LearningRecommendations';
import SessionPrep from '../components/learner/SessionPrep';
import RecommendedMentors from '../components/learner/RecommendedMentors';
import PostSessionReview from '../components/session/PostSessionReview';
import type { Session, SessionHistoryItem } from '../types';

// Mock upcoming sessions
const MOCK_SESSIONS: Session[] = [
  {
    id: 's1',
    learnerId: 'l1',
    learnerName: 'Emma',
    topic: 'React Design Patterns & Clean Code',
    startTime: new Date(Date.now() + 3600000 * 2).toISOString(),
    duration: 60,
    status: 'confirmed',
    price: 50,
    currency: 'XLM',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
  },
  {
    id: 's2',
    learnerId: 'l1',
    learnerName: 'Emma',
    topic: 'Advanced TypeScript: Utility Types',
    startTime: new Date(Date.now() + 86400000 * 1.5).toISOString(),
    duration: 45,
    status: 'pending',
    price: 40,
    currency: 'USDC',
  },
];

// Mock completed sessions eligible for post-session review (ended > 1 hour ago)
const MOCK_COMPLETED_SESSIONS: SessionHistoryItem[] = [
  {
    id: 'cs1',
    mentorId: 'm1',
    mentorName: 'Dr. Sarah Chen',
    topic: 'Stellar Smart Contracts Deep Dive',
    date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    duration: 60,
    status: 'completed',
    skills: ['Stellar', 'Soroban', 'TypeScript'],
    amount: 50,
    currency: 'XLM',
  },
];

const LearnerDashboardContent: React.FC = () => {
  const {
    settings,
    upcomingReminders,
    history,
    updateSettings,
    snoozeReminder,
    dismissReminder,
    addCustomTime,
    removeCustomTime,
  } = useReminders(MOCK_SESSIONS);

  const {
    mentors,
    isLoading: isLoadingRecommendations,
    toggleMentorBookmark,
    setMentorFeedback,
    dismissMentor,
    refreshRecommendations,
  } = useRecommendations();

  const { setRole, setLoading, widgets } = useDashboard();

  const { pendingSession, submitted, updatedRating, submitReview, dismissForNow, close } =
    usePostSessionReview(MOCK_COMPLETED_SESSIONS);

  useEffect(() => {
    setRole('learner');
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [setRole, setLoading]);

  return (
    <div className="p-6 space-y-8">
      {pendingSession && (
        <PostSessionReview
          session={pendingSession}
          submitted={submitted}
          updatedRating={updatedRating}
          onSubmit={submitReview}
          onDismiss={dismissForNow}
          onClose={close}
        />
      )}

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Learner Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
            You have {MOCK_SESSIONS.length} upcoming sessions this week.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="bg-white dark:bg-gray-800 px-6 py-3 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center text-green-500 font-bold">
              128
            </div>
            <div className="text-xs">
              <div className="font-bold text-gray-900 dark:text-white leading-none">XLM</div>
              <div className="text-gray-400 dark:text-gray-500">Balance</div>
            </div>
          </div>
        </div>
      </header>

      <DashboardGrid>
        {widgets
          .filter((w) => w.visible)
          .sort((a, b) => a.order - b.order)
          .map((widget) => (
            <Widget key={widget.id} config={widget}>
              {widget.id === 'stats' && (
                <UpcomingReminders
                  reminders={upcomingReminders}
                  history={history}
                  onSnooze={(id: string) => snoozeReminder(id)}
                  onDismiss={(id: string) => dismissReminder(id)}
                />
              )}
              {widget.id === 'sessions' && <SessionPrep />}
              {widget.id === 'earnings' && (
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
                  <h3 className="text-lg font-bold mb-2 text-white">Next Session Prep</h3>
                  <p className="text-white/80 text-sm mb-4">
                    Review tips to make the most of your time.
                  </p>
                  <button className="w-full py-2 bg-white text-blue-600 font-bold rounded-xl hover:bg-gray-50 transition-all">
                    Prep Toolkit
                  </button>
                </div>
              )}
              {widget.id === 'activity' && (
                <ReminderSettings
                  settings={settings}
                  onUpdate={updateSettings}
                  onAddCustomTime={addCustomTime}
                  onRemoveCustomTime={removeCustomTime}
                />
              )}
            </Widget>
          ))}
      </DashboardGrid>

      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Recommended for you</h2>
            <p className="text-gray-500 text-sm mt-1">
              Personalized mentor suggestions based on your goals
            </p>
          </div>
          <button
            onClick={refreshRecommendations}
            className="px-4 py-2 text-sm font-medium text-stellar hover:bg-stellar/10 rounded-lg transition-colors"
          >
            Refresh
          </button>
        </div>
        <RecommendedMentors
          mentors={mentors}
          onBookmark={toggleMentorBookmark}
          onFeedback={setMentorFeedback}
          onDismiss={dismissMentor}
          isLoading={isLoadingRecommendations}
        />
      </section>

      <LearningRecommendations />
    </div>
  );
};

const LearnerDashboard: React.FC = () => (
  <DashboardLayout>
    <LearnerDashboardContent />
  </DashboardLayout>
);

export default LearnerDashboard;
