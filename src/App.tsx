import React, { lazy, Suspense, useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import SkipNavigation from './components/a11y/SkipNavigation';
import LiveRegion from './components/a11y/LiveRegion';
import AccessibilityPanel from './components/a11y/AccessibilityPanel';
import InstallPrompt from './components/mobile/InstallPrompt';
import MobileDashboard from './components/mobile/MobileDashboard';
import OfflineBanner from './components/ui/OfflineBanner';
import NetworkErrorToast from './components/ui/NetworkErrorToast';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { usePerformance } from './hooks/usePerformance';
import { useReviews } from './hooks/useReviews';
import { preloadCriticalResources } from './utils/performance.utils';
import MentorWallet from './pages/MentorWallet';

const loadMentorOnboarding = () => import('./components/onboarding/MentorOnboarding');
const loadLearnerOnboarding = () => import('./pages/LearnerOnboarding');
const loadMentorSearch = () => import('./pages/MentorSearch');
const loadMentorSessions = () => import('./pages/MentorSessions');
const loadSettings = () => import('./pages/Settings');
const loadMentorProfileSetup = () => import('./pages/MentorProfileSetup');
const loadLearningGoals = () => import('./pages/LearningGoals');
const loadGovernance = () => import('./pages/Governance');
const loadProposalDetail = () => import('./pages/ProposalDetail');
const loadRatingBreakdown = () => import('./components/reviews/RatingBreakdown');
const loadReviewForm = () => import('./components/reviews/ReviewForm');
const loadReviewList = () => import('./components/reviews/ReviewList');
const loadMentorPublicProfile = () => import('./pages/MentorPublicProfile');
const loadLearnerProfile = () => import('./pages/LearnerProfile');
const loadMentorDashboard = () => import('./pages/MentorDashboard');

const MentorPublicProfile = lazy(loadMentorPublicProfile);
const LearnerProfile = lazy(() =>
  loadLearnerProfile().then((m) => ({ default: m.LearnerProfilePage }))
);
const MentorOnboarding = lazy(loadMentorOnboarding);
const LearnerOnboarding = lazy(loadLearnerOnboarding);
const MentorSearch = lazy(loadMentorSearch);
const MentorSessions = lazy(loadMentorSessions);
const Settings = lazy(loadSettings);
const Governance = lazy(loadGovernance);
const ProposalDetail = lazy(loadProposalDetail);
const MentorProfileSetup = lazy(() =>
  loadMentorProfileSetup().then((m) => ({ default: m.MentorProfileSetup }))
);
const LearningGoals = lazy(loadLearningGoals);
const MentorDashboard = lazy(loadMentorDashboard);
const RatingBreakdown = lazy(loadRatingBreakdown);
const ReviewForm = lazy(loadReviewForm);
const ReviewList = lazy(loadReviewList);

type AppView =
  | 'onboarding'
  | 'learner'
  | 'wallet'
  | 'search'
  | 'reviews'
  | 'analytics'
  | 'profile'
  | 'sessions'
  | 'settings'
  | 'goals'
  | 'dashboard'
  | 'learner-profile';

function AnalyticsDashboard() {
  return (
    <div className="space-y-6 pb-10">
      <div>
        <h2 className="mb-1 text-3xl font-bold">Analytics</h2>
        <p className="text-gray-500">Your platform metrics at a glance.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="text-sm text-gray-500">Total Earnings</div>
          <div className="mt-2 text-2xl font-bold">$12,400</div>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="text-sm text-gray-500">Sessions</div>
          <div className="mt-2 text-2xl font-bold">84</div>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="text-sm text-gray-500">Avg. Rating</div>
          <div className="mt-2 text-2xl font-bold">4.8★</div>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="text-sm text-gray-500">Students</div>
          <div className="mt-2 text-2xl font-bold">136</div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold">Performance Summary</h3>
        <p className="mt-2 text-sm text-gray-600">
          Track sessions, learner engagement, wallet activity, and profile growth from one place.
        </p>
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
  const [networkError, setNetworkError] = useState<string | null>(null);

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

  useEffect(() => {
    preloadCriticalResources();
  }, []);

  useEffect(() => {
    const handleNetworkError = (e: Event) => {
      const customEvent = e as CustomEvent<{ message?: string }>;
      setNetworkError(customEvent.detail?.message || 'A network error occurred.');
    };

    window.addEventListener('api-network-error', handleNetworkError);
    return () => window.removeEventListener('api-network-error', handleNetworkError);
  }, []);

  const handleViewChange = (next: AppView, label: string) => {
    setView(next);
    setAnnouncement(`Navigated to ${label}`);
  };

  const fallback = (
    <div className="flex h-64 items-center justify-center">Loading...</div>
  );

  return (
    <div
      className={`min-h-screen bg-gray-50 font-sans text-gray-900 pb-20 ${
        !isOnline ? 'pt-10' : ''
      }`}
    >
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

      <nav
        id="main-nav"
        aria-label="Main navigation"
        className="sticky top-0 z-50 border-b border-gray-100 bg-white"
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stellar font-bold text-white">
              M
            </div>
            <span className="text-xl font-bold tracking-tight">
              MentorMinds <span className="text-stellar">Stellar</span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => setA11yOpen(true)}
            aria-label="Open accessibility settings"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-stellar/20 bg-stellar/10 text-stellar"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
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

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-1 py-2 md:hidden">
          {[
            { id: 'onboarding', label: 'Mentor Onboarding' },
            { id: 'goals', label: 'Goals' },
            { id: 'wallet', label: 'Wallet' },
            { id: 'analytics', label: 'Analytics' },
            { id: 'reviews', label: 'Reviews' },
            { id: 'profile', label: 'Profile' },
            { id: 'search', label: 'Search' },
            { id: 'sessions', label: 'Sessions' },
            { id: 'settings', label: 'Settings' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleViewChange(item.id as AppView, item.label)}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-bold transition-all ${
                view === item.id
                  ? 'bg-white text-stellar shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

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
            { id: 'learner-profile', label: 'Learner Profile' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleViewChange(item.id as AppView, item.label)}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition-all ${
                view === item.id
                  ? 'bg-white text-stellar shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto max-w-7xl px-4 pt-10 outline-none"
      >
        <Routes>
          <Route
            path="/mentors/:id"
            element={
              <Suspense fallback={fallback}>
                <MentorPublicProfile />
              </Suspense>
            }
          />
          <Route
            path="/governance/proposals/:id"
            element={
              <Suspense fallback={fallback}>
                <ProposalDetail />
              </Suspense>
            }
          />
          <Route
            path="/governance"
            element={
              <Suspense fallback={fallback}>
                <Governance />
              </Suspense>
            }
          />
          <Route
            path="*"
            element={
              <Suspense fallback={fallback}>
                <>
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
                  ) : view === 'learner-profile' ? (
                    <LearnerProfile />
                  ) : (
                    <div className="space-y-10">
                      <div className="flex items-end justify-between">
                        <div>
                          <h2 className="mb-2 text-3xl font-bold">
                            Mentor Feedback
                            {!isOnline && (
                              <span className="ml-3 inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                                Offline Cache
                              </span>
                            )}
                          </h2>
                          <p className="text-gray-500">
                            See what the community is saying about your sessions.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setShowForm(!showForm)}
                          disabled={!isOnline}
                          aria-expanded={showForm}
                          aria-controls="review-form"
                          className={`rounded-xl px-6 py-2.5 font-bold transition-all ${
                            !isOnline
                              ? 'cursor-not-allowed bg-gray-200 text-gray-400'
                              : 'bg-stellar text-white hover:bg-stellar-dark'
                          }`}
                        >
                          {showForm ? 'Cancel Review' : 'Write a Review'}
                        </button>
                      </div>

                      {showForm && (
                        <div id="review-form">
                          <ReviewForm
                            onSubmit={(data: any) => {
                              addReview({
                                ...data,
                                reviewerId: `user-${Date.now()}`,
                              });
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
                </>
              </Suspense>
            }
          />
        </Routes>
      </main>

      <InstallPrompt />
      <MobileDashboard />

      <aside className="fixed bottom-16 left-4 z-40 hidden w-72 rounded-[1.5rem] border border-gray-100 bg-white/95 p-4 shadow-xl backdrop-blur md:block">
        <div className="text-xs font-bold uppercase tracking-[0.18em] text-stellar">
          Performance Monitor
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          {dashboard.map(
            (item: { label: string; value: number | string | null; unit?: string }) => (
              <div key={item.label} className="rounded-2xl bg-gray-50 p-3 text-center">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                  {item.label}
                </div>
                <div className="mt-1 text-sm font-black text-gray-900">
                  {item.value ?? '--'}
                  {item.unit}
                </div>
              </div>
            )
          )}
        </div>

        <div className="mt-3 text-[11px] text-gray-500">
          Budget: {budgetStatus.jsBudgetKb}KB JS / {budgetStatus.chunkBudgetKb}KB chunks / {budgetStatus.imageBudgetKb}KB images
        </div>
      </aside>

      <footer className="fixed bottom-0 left-0 right-0 border-t border-gray-100 bg-white/80 py-4 text-center text-[10px] text-gray-400 backdrop-blur-sm">
        Demo Version 1.0 • Built with Vite, React & Tailwind CSS • Powered by Stellar
      </footer>
    </div>
  );
}

export default App;