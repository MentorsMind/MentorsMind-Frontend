import React, { lazy, useEffect, useState, Suspense } from 'react';
import { Routes, Route, Link, useParams } from 'react-router-dom';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { useHorizon } from './hooks/useHorizon';
import OfflineBanner from './components/ui/OfflineBanner';
import NetworkErrorToast from './components/ui/NetworkErrorToast';
import SkipNavigation from './components/a11y/SkipNavigation';
import NotificationCenter from './components/notifications/NotificationCenter';
import LiveRegion from './components/a11y/LiveRegion';
import AccessibilityPanel from './components/a11y/AccessibilityPanel';
import CookieBanner from './components/compliance/CookieBanner';
import TermsAcceptance from './components/compliance/TermsAcceptance';
import { useReviews } from './hooks/useReviews';
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
const loadCreditScore = () => import('./pages/CreditScore');
const loadMentorAnalyticsPage = () => import('./pages/MentorAnalytics');
const loadLearnerAnalyticsPage = () => import('./pages/LearnerAnalytics');
const loadPlatformStats = () => import('./pages/PlatformStats');
const loadPrivacyPolicy = () => import('./pages/PrivacyPolicy');
const loadTermsOfService = () => import('./pages/TermsOfService');
const loadISAMarketplace = () => import('./pages/ISAMarketplace');
const loadPortfolio = () => import('./pages/Portfolio');
const loadTreasuryDashboard = () => import('./pages/TreasuryDashboard');

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
const LineChart = lazy(loadLineChart);
const BarChart = lazy(loadBarChart);
const PieChart = lazy(loadPieChart);
const AreaChart = lazy(loadAreaChart);
const CreditScore = lazy(loadCreditScore);
const MentorAnalyticsPage = lazy(loadMentorAnalyticsPage);
const LearnerAnalyticsPage = lazy(loadLearnerAnalyticsPage);
const PlatformStatsPage = lazy(loadPlatformStats);
const PrivacyPolicyPage = lazy(loadPrivacyPolicy);
const TermsOfServicePage = lazy(loadTermsOfService);
const ISAMarketplacePage = lazy(loadISAMarketplace);
const Portfolio = lazy(loadPortfolio);
const TreasuryDashboard = lazy(loadTreasuryDashboard);

const TERMS_ACCEPTANCE_KEY = 'mm_terms_acceptance';
const UNSUPPORTED_COUNTRIES = new Set(['IR', 'KP', 'SY', 'CU']);

type AppView =
  | "onboarding"
  | "learner"
  | "wallet"
  | "portfolio"
  | "search"
  | "reviews"
  | "analytics"
  | "profile"
  | "sessions"
  | "settings"
  | "goals"
  | "dashboard"
  | "learner-profile";
type AppView = 'onboarding' | 'learner' | 'wallet' | 'search' | 'reviews' | 'analytics' | 'profile' | 'sessions' | 'settings' | 'goals' | 'dashboard' | 'learner-profile' | 'treasury';

const earningsData = [
  { label: "Jan", earnings: 1200, sessions: 8 },
  { label: "Feb", earnings: 1800, sessions: 12 },
  { label: "Mar", earnings: 1500, sessions: 10 },
  { label: "Apr", earnings: 2200, sessions: 15 },
  { label: "May", earnings: 2800, sessions: 18 },
  { label: "Jun", earnings: 3100, sessions: 21 },
];

const sessionsByCategory = [
  { label: "Web Dev", value: 42 },
  { label: "Blockchain", value: 28 },
  { label: "Design", value: 18 },
  { label: "DevOps", value: 12 },
];

const ratingTrend = [
  { label: "Jan", rating: 4.2 },
  { label: "Feb", rating: 4.4 },
  { label: "Mar", rating: 4.3 },
  { label: "Apr", rating: 4.6 },
  { label: "May", rating: 4.7 },
  { label: "Jun", rating: 4.8 },
  { label: 'Jan', rating: 4.2 },
  { label: 'Feb', rating: 4.4 },
  { label: 'Mar', rating: 4.3 },
  { label: 'Apr', rating: 4.6 },
  { label: 'May', rating: 4.5 },
  { label: 'Jun', rating: 4.8 },
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const isOnline = useOnlineStatus();
  const perf = usePerformance();

  useEffect(() => {
    const accepted = localStorage.getItem(TERMS_ACCEPTANCE_KEY);
    if (accepted === 'true') {
      setIsTermsAccepted(true);
    }
  }, []);

  const handleTermsAccept = () => {
    localStorage.setItem(TERMS_ACCEPTANCE_KEY, 'true');
    setIsTermsAccepted(true);
  };
function AnalyticsDashboard() {
  // Local fallback for individual widgets so one broken chart doesn't crash the whole page
  const WidgetErrorFallback = (
    <div className="flex items-center justify-center h-64 bg-red-50 border border-red-100 rounded-2xl text-sm text-red-600 font-medium">
      Unable to load chart data.
    </div>
  );

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

function SessionJoinDeepLink() {
  const { token } = useParams<{ token: string }>();

  return (
    <SessionRoom
      sessionId={token ?? 'invite'}
      sessionTopic="MentorMinds Session Invite"
      mentorName="Mentor"
    />
  );
}

function App() {
  const isOnline = useOnlineStatus();
  const [view, setView] = useState<AppView>("onboarding");
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
  } = useReviews("m1");

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

  const preloaders: Record<AppView, () => Promise<unknown>> = {
    onboarding: loadMentorOnboarding,
    learner: loadLearnerOnboarding,
    wallet: loadMentorWallet,
    portfolio: loadPortfolio,
    search: loadMentorSearch,
    reviews: loadReviewList,
    analytics: loadAreaChart,
    profile: loadMentorProfileSetup,
  const preloaders: Record<AppView, () => Promise<any>> = {
    onboarding: loadMentorOnboarding,
    learner: loadLearnerOnboarding,
    wallet: loadMentorWallet,
    search: loadMentorSearch,
    sessions: loadMentorSessions,
    settings: loadSettings,
    analytics: loadMentorAnalyticsPage,
    profile: loadMentorProfileSetup,
    goals: loadLearningGoals,
    reviews: loadReviewList,
    dashboard: () => Promise.resolve(),
    'learner-profile': loadLearnerProfile,
    treasury: loadTreasuryDashboard,
  };

  useEffect(() => {
    preloadCriticalResources();
    Object.values(preloaders).forEach(p => p());
  }, []);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex justify-between items-end">
              <div>
                <h1 className="text-4xl font-black text-gray-900 leading-none">Dashboard</h1>
                <p className="text-gray-500 mt-2">Welcome back! Here's what's happening with your sessions.</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentView('treasury')}
                  className="px-6 py-3 bg-gray-900 text-white rounded-2xl text-sm font-bold shadow-xl shadow-gray-200 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  View Treasury
                </button>
                <button className="px-6 py-3 bg-linear-to-r from-stellar to-blue-600 text-white rounded-2xl text-sm font-bold shadow-xl shadow-stellar/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                  Withdraw Funds
                </button>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard title="Total Earnings" value="12,450" change={12.5} prefix="$" />
              <MetricCard title="Active Sessions" value="24" change={8.2} />
              <MetricCard title="Avg. Rating" value="4.8" change={2.1} />
              <MetricCard title="Student Reach" value="1,840" change={15.4} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xs">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-bold">Earnings Overview</h2>
                  <select className="bg-gray-50 border-none rounded-xl text-xs font-bold px-4 py-2 focus:ring-2 focus:ring-stellar/20">
                    <option>Last 6 Months</option>
                    <option>Last Year</option>
                  </select>
                </div>
                <AreaChart 
                  data={earningsData as any} 
                  series={[{ key: 'earnings', name: 'Earnings' }]}
                  title="Monthly Revenue"
                />
              </div>
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
          onRetry={() => window.dispatchEvent(new Event("online"))}
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
          <div className="flex items-center gap-3">
            <NotificationCenter />
          </div>
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
            path="/dashboard"
            element={
              <Suspense fallback={fallback}>
                <MentorDashboard />
              </Suspense>
            }
          />
          <Route
            path="/wallet"
            element={
              <Suspense fallback={fallback}>
                <MentorWallet isOnline={isOnline} />
              </Suspense>
            }
          />
          <Route
            path="/search"
            element={
              <Suspense fallback={fallback}>
                <MentorSearch isOnline={isOnline} />
              </Suspense>
            }
          />
          <Route
            path="/sessions"
            element={
              <Suspense fallback={fallback}>
                <MentorSessions isOnline={isOnline} />
              </Suspense>
            }
          />
          <Route
            path="/sessions/join/:token"
            element={
              <Suspense fallback={fallback}>
                <SessionJoinDeepLink />
              </Suspense>
            }
          />
          <Route
            path="/mentor/analytics"
            element={
              <Suspense fallback={fallback}>
                <MentorAnalyticsPage />
              </Suspense>
            }
          />
          <Route
            path="/learner/analytics"
            element={
              <Suspense fallback={fallback}>
                <LearnerAnalyticsPage />
              </Suspense>
            }
          />
          <Route
            path="/stats"
            element={
              <Suspense fallback={fallback}>
                <PlatformStatsPage />
              </Suspense>
            }
          />
          <Route
            path="/privacy"
            element={
              <Suspense fallback={fallback}>
                <PrivacyPolicyPage />
              </Suspense>
            }
          />
          <Route
            path="/terms"
            element={
              <Suspense fallback={fallback}>
                <TermsOfServicePage />
              </Suspense>
            }
          />
          <Route
            path="/settings"
            element={
              <Suspense fallback={fallback}>
                <Settings />
              </Suspense>
            }
          />
          <Route
            path="/isa-marketplace"
            element={
              <Suspense fallback={fallback}>
                <ISAMarketplacePage />
              </Suspense>
            }
          />
          <Route
            path="/portfolio"
            element={
              <Suspense fallback={fallback}>
                <Portfolio />
              </Suspense>
            }
          />
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
            path="/credit-score"
            element={
              <Suspense fallback={fallback}>
                <CreditScore />
              </Suspense>
            }
          />
          <Route
            path="*"
            element={
              <Suspense fallback={fallback}>
                <>
                  {view === "settings" ? (
                    <Settings />
                  ) : view === "onboarding" ? (
                    <MentorOnboarding />
                  ) : view === "learner" ? (
                    <LearnerOnboarding />
                  ) : view === "wallet" ? (
                    <MentorWallet isOnline={isOnline} />
                  ) : view === "portfolio" ? (
                    <Portfolio />
                  ) : view === "goals" ? (
                    <LearningGoals />
                  ) : view === "sessions" ? (
                    <MentorSessions isOnline={isOnline} />
                  ) : view === "profile" ? (
                    <MentorProfileSetup />
                  ) : view === "search" ? (
                    <MentorSearch isOnline={isOnline} />
                  ) : view === "analytics" ? (
                    <AnalyticsDashboard />
                  ) : view === "dashboard" ? (
                    <MentorDashboard />
                  ) : view === "learner-profile" ? (
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
                          {showForm ? "Cancel Review" : "Write a Review"}
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
                              setAnnouncement("Your review has been submitted.");
                            }}
                            onCancel={() => setShowForm(false)}
                          />
                        </div>
                      )}

                      <RatingBreakdown stats={stats} />

              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xs">
                <h2 className="text-xl font-bold mb-8">Sessions by Topic</h2>
                <PieChart data={sessionsByCategory} title="Topic Distribution" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xs">
                <h2 className="text-xl font-bold mb-8">Rating Trend</h2>
                <LineChart 
                  data={ratingTrend as any} 
                  series={[{ key: 'rating', name: 'Rating' }]}
                  title="Satisfaction Score"
                />
              </div>
              <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xs overflow-hidden">
                <h2 className="text-xl font-bold mb-8">Recent Reviews</h2>
                <ReviewList 
                  reviews={[]} 
                  stats={{ average: 0, totalReviews: 0, distribution: [], trends: { labels: [], values: [] } }} 
                  onVoteHelpful={() => {}} 
                  onFilterChange={() => {}} 
                  currentFilter={null} 
                  onAddResponse={() => {}} 
                  currentPage={1} 
                  totalPages={1} 
                  onPageChange={() => {}} 
                />
              </div>
            </div>
          </div>
        );
      case 'onboarding': return <MentorOnboarding />;
      case 'learner': return <LearnerOnboarding />;
      case 'wallet': return <MentorWallet />;
      case 'search': return <MentorSearch />;
      case 'sessions': return <MentorSessions />;
      case 'settings': return <Settings />;
      case 'analytics': return <MentorAnalyticsPage />;
      case 'profile': return <MentorProfileSetup />;
      case 'goals': return <LearningGoals />;
      case 'learner-profile': return <LearnerProfile />;
      case 'treasury': return <TreasuryDashboard />;
      default: return null;
    }
  };
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
          Budget: {budgetStatus.jsBudgetKb}KB JS / {budgetStatus.chunkBudgetKb}KB chunks /{" "}
          {budgetStatus.imageBudgetKb}KB images
        </div>
      </aside>

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-stellar/10 selection:text-stellar">
      <SkipNavigation />
      {!isOnline && <OfflineBanner />}
      <NetworkErrorToast 
        message="Unable to connect to service" 
        onRetry={() => window.location.reload()} 
        onClose={() => console.log('toast closed')} 
      />
      <LiveRegion message="" />
      
      {!isTermsAccepted && <TermsAcceptance isOpen={!isTermsAccepted} onAccept={handleTermsAccept} />}
      <CookieBanner />

      <main id="main-content" className="relative">
        <Suspense fallback={
          <div className="h-screen flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-stellar/20 border-t-stellar rounded-full animate-spin" />
          </div>
        }>
          <Routes>
            <Route path="/" element={renderView()} />
            <Route path="/governance" element={<Governance />} />
            <Route path="/governance/proposals/:id" element={<ProposalDetail />} />
            <Route path="/treasury" element={<TreasuryDashboard />} />
            <Route path="/learner-profile" element={<LearnerProfile />} />
          </Routes>
        </Suspense>
      </main>

      <AccessibilityPanel isOpen={false} onClose={() => {}} />
    </div>
  );
};

export default App;