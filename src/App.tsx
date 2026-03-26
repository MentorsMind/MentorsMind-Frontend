import { lazy, Suspense, useEffect, useState } from 'react';
import SkipNavigation from './components/a11y/SkipNavigation';
import LiveRegion from './components/a11y/LiveRegion';
import AccessibilityPanel from './components/a11y/AccessibilityPanel';
import { useReviews } from './hooks/useReviews';
import { usePerformance } from './hooks/usePerformance';
import { preloadCriticalResources } from './utils/performance.utils';
import MetricCard from './components/charts/MetricCard';
import { TimezoneProvider } from './contexts/TimeZoneProvider';


// Lazy load all components that are not needed on initial render
const MentorOnboarding = lazy(() => import('./components/onboarding/MentorOnboarding'));
const LearnerOnboarding = lazy(() => import('./pages/LearnerOnboarding'));
const MentorWallet = lazy(() => import('./pages/MentorWallet'));
const MentorSearch = lazy(() => import('./pages/MentorSearch'));
const LearningGoals = lazy(() => import('./pages/LearningGoals'));
// Fix: MentorProfileSetup does not have a default export; extract named export
const MentorProfileSetup = lazy(() =>
  import('./pages/MentorProfileSetup').then(module => ({ default: module.MentorProfileSetup }))
);
const RatingBreakdown = lazy(() => import('./components/reviews/RatingBreakdown'));
const ReviewForm = lazy(() => import('./components/reviews/ReviewForm'));
const ReviewList = lazy(() => import('./components/reviews/ReviewList'));
const LineChart = lazy(() => import('./components/charts/LineChart'));
const BarChart = lazy(() => import('./components/charts/BarChart'));
const PieChart = lazy(() => import('./components/charts/PieChart'));
const AreaChart = lazy(() => import('./components/charts/AreaChart'));

type AppView = 'onboarding' | 'learner' | 'wallet' | 'goals' | 'profile' | 'search' | 'analytics' | 'reviews';

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

  const preloaders: Record<AppView, () => Promise<unknown>> = {
    onboarding: () => import('./components/onboarding/MentorOnboarding'),
    learner: () => import('./pages/LearnerOnboarding'),
    wallet: () => import('./pages/MentorWallet'),
    goals: () => import('./pages/LearningGoals'),
    profile: () => import('./pages/MentorProfileSetup'),
    search: () => import('./pages/MentorSearch'),
    analytics: () => import('./components/charts/AreaChart'),
    reviews: () => import('./components/reviews/ReviewList'),
  };

  return (
    <TimezoneProvider>
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20">
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

          {/* Mobile navigation – uses same handler as desktop */}
          <div className="flex items-center gap-2 md:hidden">
            {[
              { id: 'search', label: 'Search' },
              { id: 'learner', label: 'Learner' },
              { id: 'onboarding', label: 'Mentor' },
              { id: 'profile', label: 'Profile' },
              { id: 'wallet', label: 'Wallet' },
              { id: 'analytics', label: 'Analytics' },
              { id: 'reviews', label: 'Reviews' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleViewChange(item.id as AppView, item.label)}
                onMouseEnter={() => preloaders[item.id as AppView]?.()}
                onFocus={() => preloaders[item.id as AppView]?.()}
                className={`rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                  view === item.id ? 'bg-white text-stellar shadow-sm' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Desktop navigation */}
          <div className="hidden items-center gap-2 rounded-2xl bg-gray-50 p-1 md:flex">
            {[
              { id: 'search', label: 'Search & Discovery' },
              { id: 'learner', label: 'Learner Onboarding' },
              { id: 'onboarding', label: 'Mentor Onboarding' },
              { id: 'goals', label: 'Goals' },
              { id: 'profile', label: 'Profile Setup' },
              { id: 'wallet', label: 'Wallet' },
              { id: 'analytics', label: 'Analytics' },
              { id: 'reviews', label: 'Reviews' },
            ].map((item) => (
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

      <main id="main-content" tabIndex={-1} className="max-w-7xl mx-auto px-4 pt-10 outline-none">
        <Suspense fallback={<div className="text-center py-20">Loading...</div>}>
          {view === 'onboarding' && <MentorOnboarding />}
          {view === 'learner' && <LearnerOnboarding />}
          {view === 'wallet' && <MentorWallet />}
          {view === 'goals' && <LearningGoals />}
          {view === 'profile' && <MentorProfileSetup />}
          {view === 'search' && <MentorSearch />}
          {view === 'analytics' && <AnalyticsDashboard />}
          {view === 'reviews' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Mentor Feedback</h2>
                  <p className="text-gray-500">See what the community is saying about your sessions.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForm(!showForm)}
                  aria-expanded={showForm}
                  aria-controls="review-form"
                  className="rounded-xl bg-stellar px-6 py-2.5 font-bold text-white shadow-lg shadow-stellar/20 transition-all hover:bg-stellar-dark"
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
          {dashboard.map((item) => (
            <div key={item.label} className="rounded-2xl bg-gray-50 p-3 text-center">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">{item.label}</div>
              <div className="mt-1 text-sm font-black text-gray-900">
                {item.value ?? '--'}
                {item.unit}
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
    </TimezoneProvider>
  );
}

export default App;
