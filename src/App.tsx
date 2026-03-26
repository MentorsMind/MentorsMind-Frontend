import React, { lazy, useEffect, useState, Suspense } from 'react';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import OfflineBanner from './components/ui/OfflineBanner';
import NetworkErrorToast from './components/ui/NetworkErrorToast';

import SkipNavigation from './components/a11y/SkipNavigation';
import LiveRegion from './components/a11y/LiveRegion';
import AccessibilityPanel from './components/a11y/AccessibilityPanel';
import { useReviews } from './hooks/useReviews';
import { usePerformance } from './hooks/usePerformance';
import { preloadCriticalResources } from './utils/performance.utils';
import MetricCard from './components/charts/MetricCard';
const loadMentorOnboarding = () => import('./components/onboarding/MentorOnboarding');
const loadLearnerOnboarding = () => import('./pages/LearnerOnboarding');
const loadMentorWallet = () => import('./pages/MentorWallet');
const loadMentorSearch = () => import('./pages/MentorSearch');
const loadMentorSessions = () => import('./pages/MentorSessions');
const loadSettings = () => import('./pages/Settings');
const loadMentorProfileSetup = () => import('./pages/MentorProfileSetup');
const loadLearningGoals = () => import('./pages/LearningGoals');
const loadGovernance = () => import('./pages/Governance');
const loadRatingBreakdown = () => import('./components/reviews/RatingBreakdown');
const loadReviewForm = () => import('./components/reviews/ReviewForm');
const loadReviewList = () => import('./components/reviews/ReviewList');
const loadLineChart = () => import('./components/charts/LineChart');
const loadBarChart = () => import('./components/charts/BarChart');
const loadPieChart = () => import('./components/charts/PieChart');
const loadAreaChart = () => import('./components/charts/AreaChart');

const MentorOnboarding = lazy(loadMentorOnboarding);
const LearnerOnboarding = lazy(loadLearnerOnboarding);
const MentorWallet = lazy(loadMentorWallet);
const MentorSearch = lazy(loadMentorSearch);
const MentorSessions = lazy(loadMentorSessions);
const Settings = lazy(loadSettings);
const MentorProfileSetup = lazy(() => loadMentorProfileSetup().then(m => ({ default: m.MentorProfileSetup })));
const LearningGoals = lazy(loadLearningGoals);
const MentorDashboard = lazy(() => import('./pages/MentorDashboard'));
const RatingBreakdown = lazy(loadRatingBreakdown);
const ReviewForm = lazy(loadReviewForm);
const ReviewList = lazy(loadReviewList);
const LineChart = lazy(loadLineChart);
const BarChart = lazy(loadBarChart);
const PieChart = lazy(loadPieChart);
const AreaChart = lazy(loadAreaChart);

type AppView = 'onboarding' | 'learner' | 'wallet' | 'search' | 'reviews' | 'analytics' | 'profile' | 'sessions' | 'settings' | 'goals' | 'dashboard';

const earningsData = [
  { label: 'Jan', earnings: 1200, sessions: 8 },
  { label: 'Feb', earnings: 1800, sessions: 12 },
  { label: 'Mar', earnings: 1500, sessions: 10 },
  { label: 'Apr', earnings: 2200, sessions: 15 },
  { label: 'May', earnings: 2800, sessions: 18 },
  { label: 'Jun', earnings: 3100, sessions: 21 },
];

const sessionsByCategory = [
  { label: 'Web Dev', value: 42 },
  { label: 'Blockchain', value: 28 },
  { label: 'Design', value: 18 },
  { label: 'DevOps', value: 12 },
];

const ratingTrend = [
  { label: 'Jan', rating: 4.2 },
  { label: 'Feb', rating: 4.4 },
  { label: 'Mar', rating: 4.3 },
  { label: 'Apr', rating: 4.6 },
  { label: 'May', rating: 4.7 },
  { label: 'Jun', rating: 4.8 },
];

function AnalyticsDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div>
        <h2 className="text-3xl font-bold mb-1">Analytics</h2>
        <p className="text-gray-500">Your platform metrics at a glance.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Total Earnings" value="$12,400" change={18.2} changeLabel="vs last month" prefix="" />
        <MetricCard title="Sessions" value={84} change={12.5} changeLabel="vs last month" />
        <MetricCard title="Avg. Rating" value="4.8" change={2.1} changeLabel="vs last month" suffix="★" />
        <MetricCard title="Students" value={136} change={-3.4} changeLabel="vs last month" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <AreaChart
          data={earningsData}
          series={[{ key: 'earnings', name: 'Earnings' }]}
          title="Monthly Earnings"
          description="Cumulative earnings over time"
          xAxisKey="label"
          valuePrefix="$"
          exportable
          exportFilename="earnings-chart"
        />
        <LineChart
          data={ratingTrend}
          series={[{ key: 'rating', name: 'Avg Rating' }]}
          title="Rating Trend"
          description="Average session rating per month"
          xAxisKey="label"
          zoomable
          exportable
          exportFilename="rating-trend"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <BarChart
          data={earningsData}
          series={[{ key: 'sessions', name: 'Sessions' }]}
          title="Sessions per Month"
          xAxisKey="label"
          exportable
          exportFilename="sessions-bar"
        />
        <PieChart
          data={sessionsByCategory}
          title="Sessions by Category"
          description="Proportional breakdown of session types"
          donut
          exportable
          exportFilename="sessions-pie"
        />
      </div>
    </div>
  );
}
function App() {
  const isOnline = useOnlineStatus();
  const [view, setView] = useState<AppView>('onboarding');
  const [showForm, setShowForm] = useState(false);
  const [a11yOpen, setA11yOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const { dashboard, budgetStatus } = usePerformance();

  const {
    reviews,
    stats,
    addReview,
    voteHelpful,
    addMentorResponse,
    filterRating,
    setFilterRating,
    currentPage,
    totalPages,
    paginate,
  } = useReviews('m1');

  const handleViewChange = (next: AppView, label: string) => {
    setView(next);
    setAnnouncement(`Navigated to ${label}`);
  };

  useEffect(() => {
    preloadCriticalResources();
  }, []);

  const [networkError, setNetworkError] = useState<string | null>(null);

  useEffect(() => {
    const handleNetworkError = (e: any) => {
      setNetworkError(e.detail?.message || 'A network error occurred.');
    };
    window.addEventListener('api-network-error', handleNetworkError);
    return () => window.removeEventListener('api-network-error', handleNetworkError);
  }, []);

  const preloaders: Record<AppView, () => Promise<unknown>> = {

    search: loadMentorSearch,
    learner: loadLearnerOnboarding,
    onboarding: loadMentorOnboarding,
    profile: loadMentorProfileSetup,
    wallet: loadMentorWallet,
    analytics: loadAreaChart,
    reviews: loadReviewList,
    sessions: loadMentorSessions,
    settings: loadSettings,
    goals: loadLearningGoals,
    dashboard: () => Promise.resolve(), // Assuming static or handled elsewhere
  };

  return (
    <div className={`min-h-screen bg-gray-50 font-sans text-gray-900 pb-20 ${!isOnline ? 'pt-10' : ''}`}>
      <OfflineBanner />
      {networkError && (
        <NetworkErrorToast 
          message={networkError} 
          onRetry={() => window.dispatchEvent(new Event('online'))} 
          onClose={() => setNetworkError(null)} 
        />
      )}
      <SkipNavigation />


      <LiveRegion message={announcement} />
      <AccessibilityPanel isOpen={a11yOpen} onClose={() => setA11yOpen(false)} />

        <nav id="main-nav" aria-label="Main navigation" className="sticky top-0 z-50 border-b border-gray-100 bg-white">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stellar font-bold text-white">
                M
              </div>
              <span className="text-xl font-bold tracking-tight">
                MentorMinds <span className="text-stellar">Stellar</span>
              </span>
            </div>
            <span className="text-xl font-bold tracking-tight">
              MentorMinds <span className="text-stellar">Stellar</span>
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar md:hidden py-2 px-1">
            <button
              onClick={() => setView('onboarding')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                view === 'onboarding' ? 'bg-white shadow-sm text-stellar' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Mentor Onboarding
            </button>
            <button
              onClick={() => setView('goals')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                view === 'goals' ? 'bg-white shadow-sm text-stellar' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Goals
            </button>
            <button
              onClick={() => setView('wallet')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                view === 'wallet' ? 'bg-white shadow-sm text-stellar' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Wallet
            </button>
            <button
              onClick={() => setView('analytics')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                view === 'analytics' ? 'bg-white shadow-sm text-stellar' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setView('reviews')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                view === 'reviews' ? 'bg-white shadow-sm text-stellar' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Ratings & Reviews
            </button>
            <button
              onClick={() => setView('profile')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                view === 'profile' ? 'bg-white shadow-sm text-stellar' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Profile Setup
            </button>
            <button
              onClick={() => handleViewChange('search', 'Search & Discovery')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                view === 'search' ? 'bg-white shadow-sm text-stellar' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="3" strokeWidth="2" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                />
              </svg>
            </button>
            <button
              onClick={() => handleViewChange('sessions', 'Manage Sessions')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                view === 'sessions' ? 'bg-white shadow-sm text-stellar' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Manage Sessions
            </button>
            <button
              onClick={() => handleViewChange('settings', 'Settings')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                view === 'settings' ? 'bg-white shadow-sm text-stellar' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Settings
            </button>
          </div>
        </nav>

          <div className="hidden items-center gap-2 rounded-2xl bg-gray-50 p-1 md:flex">
            {[
              { id: 'search', label: 'Search & Booking' },
              { id: 'learner', label: 'Learner Onboarding' },
              { id: 'onboarding', label: 'Mentor Onboarding' },
              { id: 'sessions', label: 'Manage Sessions' },
              { id: 'profile', label: 'Profile Setup' },
              { id: 'wallet', label: 'Wallet' },
              { id: 'settings', label: 'Settings' },
              { id: 'analytics', label: 'Analytics' },
              { id: 'reviews', label: 'Reviews' },
            ].map((item: { id: string; label: string }) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleViewChange(item.id as AppView, item.label)}
                onMouseEnter={() => preloaders[item.id as AppView]?.()}
                onFocus={() => preloaders[item.id as AppView]?.()}
                className={`rounded-xl px-4 py-2 text-sm font-bold transition-all ${
                  view === item.id ? 'bg-white text-stellar shadow-sm' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setA11yOpen(true)}
            aria-label="Open accessibility settings"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-stellar/20 bg-stellar/10 text-stellar"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="3" strokeWidth="2" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
              />
            </svg>
          </button>
        </div>
      </nav>

      {/* Main content area */}
      <main id="main-content" tabIndex={-1} className="max-w-7xl mx-auto px-4 pt-10 outline-none">
        <Suspense fallback={<div className="flex h-64 items-center justify-center">Loading...</div>}>
          {view === 'settings' ? (
            <Settings />
          ) : view === 'onboarding' ? (
            <MentorOnboarding />
          ) : view === 'learner' ? (
            <LearnerOnboarding />
          ) : view === 'wallet' ? (
            <MentorWallet isOnline={isOnline} />
          ) : view === 'goals' ? (
            <LearningGoals />
          ) : view === 'sessions' ? (
            <MentorSessions isOnline={isOnline} />
          ) : view === 'profile' ? (
            <MentorProfileSetup />
          ) : view === 'search' ? (
            <MentorSearch isOnline={isOnline} />
          ) : view === 'analytics' ? (
            <AnalyticsDashboard />
          ) : view === 'dashboard' ? (
            <MentorDashboard />
          ) : (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-bold mb-2">
                  Mentor Feedback
                  {!isOnline && (
                    <span className="ml-3 inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                      <svg className="mr-1.5 h-2 w-2 text-amber-400" fill="currentColor" viewBox="0 0 8 8">
                        <circle cx="4" cy="4" r="3" />
                      </svg>
                      Offline Cache
                    </span>
                  )}
                </h2>
                <p className="text-gray-500">See what the community is saying about your sessions.</p>

              </div>
              <button
                type="button"
                onClick={() => setShowForm(!showForm)}
                disabled={!isOnline}
                aria-expanded={showForm}
                aria-controls="review-form"
                className={`rounded-xl px-6 py-2.5 font-bold shadow-lg transition-all ${
                  !isOnline 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' 
                    : 'bg-stellar text-white shadow-stellar/20 hover:bg-stellar-dark'
                }`}
              >
                {showForm ? 'Cancel Review' : 'Write a Review'}
              </button>

            </div>

            {showForm && (
              <div id="review-form">
                <ReviewForm
                  onSubmit={(data) => {
                    addReview({ ...data, reviewerId: `user-${Date.now()}` });
                    setShowForm(false);
                    setAnnouncement('Your review has been submitted.');
                  }}
                  onCancel={() => setShowForm(false)}
                />
              </div>
            )}

            <RatingBreakdown stats={stats} />

            <div className="rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-sm md:p-12">
              <ReviewList
                reviews={reviews}
                stats={stats}
                onVoteHelpful={voteHelpful}
                onFilterChange={setFilterRating}
                currentFilter={filterRating}
                onAddResponse={addMentorResponse}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={paginate}
              />
            </div>
          </div>
        )}
        </Suspense>
      </main>

      <aside className="fixed bottom-16 left-4 z-40 hidden w-72 rounded-[1.5rem] border border-gray-100 bg-white/95 p-4 shadow-xl backdrop-blur md:block">
        <div className="text-xs font-bold uppercase tracking-[0.18em] text-stellar">Performance Monitor</div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {dashboard.map((item: { label: string; value: number | string | null; unit?: string }) => (
            <div key={item.label} className="rounded-2xl bg-gray-50 p-3 text-center">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">{item.label}</div>
              <div className="mt-1 text-sm font-black text-gray-900">
                {item.value ?? '--'}{item.unit}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-[11px] text-gray-500">
          Budget: {budgetStatus.jsBudgetKb}KB JS / {budgetStatus.chunkBudgetKb}KB chunks / {budgetStatus.imageBudgetKb}KB images
        </div>
      </aside>

      <footer className="fixed bottom-0 left-0 right-0 border-t border-gray-100 bg-white/80 py-4 text-center text-[10px] text-gray-400 backdrop-blur-sm">
        Demo Version 1.0 • Built with Vite, React & Tailwind CSS • Powered by Stellar
      </footer>
      </div>
    </NotificationProvider>
  );
}
