import { useState } from "react";
import AccessibilityPanel from "./components/a11y/AccessibilityPanel";
import LiveRegion from "./components/a11y/LiveRegion";
import SkipNavigation from "./components/a11y/SkipNavigation";
import AreaChart from "./components/charts/AreaChart";
import BarChart from "./components/charts/BarChart";
import LineChart from "./components/charts/LineChart";
import MetricCard from "./components/charts/MetricCard";
import PieChart from "./components/charts/PieChart";
import MentorOnboarding from "./components/onboarding/MentorOnboarding";
import MentorWallet from './pages/MentorWallet';
import RatingBreakdown from "./components/reviews/RatingBreakdown";
import ReviewForm from "./components/reviews/ReviewForm";
import ReviewList from "./components/reviews/ReviewList";
import { useReviews } from "./hooks/useReviews";
import LearnerOnboarding from "./pages/LearnerOnboarding";
import MentorDashboard from "./pages/MentorDashboard";
import MentorSearch from "./pages/MentorSearch";
import SearchPage from "./pages/SearchPage";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./config/queryClient";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

function App() {
  const [view, setView] = useState<
    | "onboarding"
    | "learner"
    | "dashboard"
    | "search"
    | "reviews"
    | "analytics"
    | "mentor-search"
    | "wallet"
  >("onboarding");
  // const [view, setView] = useState<'onboarding' | 'learner' | 'wallet' | 'reviews' | 'analytics' | 'search'>('search');
  const [showForm, setShowForm] = useState(false);
  const [a11yOpen, setA11yOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");

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

  const handleViewChange = (next: typeof view, label: string) => {
    setView(next);
    setAnnouncement(`Navigated to ${label}`);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20">
        {/* Skip navigation links — visible on focus for keyboard users */}
        <SkipNavigation />

        {/* Screen reader live region for dynamic announcements */}
        <LiveRegion message={announcement} />

        {/* Accessibility settings modal */}
        <AccessibilityPanel
          isOpen={a11yOpen}
          onClose={() => setA11yOpen(false)}
        />

        {/* Primary navigation */}
        <nav
          id="main-nav"
          aria-label="Main navigation"
          className="bg-white border-b border-gray-100 sticky top-0 z-50"
        >
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 bg-stellar rounded-lg flex items-center justify-center text-white font-bold"
                aria-hidden="true"
              >
                M
              </div>
              <button>
                <span className="font-bold text-xl tracking-tight">
                  MentorMinds <span className="text-stellar">Stellar</span>
                </span>
                Mentor Onboarding
              </button>
              <button
                onClick={() => setView("learner")}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  view === "learner"
                    ? "bg-white shadow-sm text-stellar"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                Learner Onboarding
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
                onClick={() => setView("dashboard")}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  view === "dashboard"
                    ? "bg-white shadow-sm text-stellar"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                Mentor Dashboard
              </button>
              <button
                onClick={() => setView("search")}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  view === "search"
                    ? "bg-white shadow-sm text-stellar"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                Find Mentors
              </button>
              <button
                onClick={() => setView("analytics")}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  view === "analytics"
                    ? "bg-white shadow-sm text-stellar"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                Analytics
              </button>
              <button
                onClick={() => setView("reviews")}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  view === "reviews"
                    ? "bg-white shadow-sm text-stellar"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                Ratings & Reviews
              </button>
              <button
                onClick={() => setView("search")}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  view === "search"
                    ? "bg-white shadow-sm text-stellar"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                Search & Discovery
              </button>
            </div>

            {/* View switcher */}
            <div
              role="tablist"
              aria-label="Application views"
              className="flex items-center gap-4 bg-gray-50 p-1 rounded-xl"
            >
              {(
                [
                  { id: "onboarding", label: "Mentor Onboarding" },
                  { id: "learner", label: "Learner Onboarding" },
                  { id: "analytics", label: "Analytics" },
                  { id: "reviews", label: "Ratings & Reviews" },
                ] as { id: typeof view; label: string }[]
              ).map(({ id, label }) => (
                <button
                  key={id}
                  role="tab"
                  aria-selected={view === id}
                  aria-controls="main-content"
                  onClick={() => handleViewChange(id, label)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stellar focus-visible:ring-offset-1 ${
                    view === id
                      ? "bg-white shadow-sm text-stellar"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Accessibility settings trigger */}
            <button
              onClick={() => setA11yOpen(true)}
              aria-label="Open accessibility settings"
              title="Accessibility settings"
              className="w-8 h-8 rounded-full bg-stellar/10 border border-stellar/20 flex items-center justify-center text-stellar hover:bg-stellar/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stellar focus-visible:ring-offset-2"
            >
              <svg
                className="w-4 h-4"
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
        </nav>

        {/* Main content area */}
        <main
          id="main-content"
          tabIndex={-1}
          className="max-w-7xl mx-auto px-4 pt-10 outline-none"
        >
          {view === "onboarding" ? (
            <MentorOnboarding />
          ) : view === "learner" ? (
            <LearnerOnboarding />
          ) : view === "dashboard" ? (
            <MentorDashboard />
          ) : view === "mentor-search" ? (
            <MentorSearch />
          ) : view === 'wallet' ? (
          <MentorWallet />
        ) : view === "analytics" ? (
            <AnalyticsDashboard />
          ) : view === "search" ? (
            <SearchPage />
          ) : (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Mentor Feedback</h2>
                  <p className="text-gray-500">
                    See what the community is saying about your sessions.
                  </p>
                </div>
                <button
                  onClick={() => setShowForm(!showForm)}
                  aria-expanded={showForm}
                  aria-controls="review-form"
                  className="px-6 py-2.5 bg-stellar text-white font-bold rounded-xl hover:bg-stellar-dark shadow-lg shadow-stellar/20 transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stellar focus-visible:ring-offset-2"
                >
                  {showForm ? "Cancel Review" : "Write a Review"}
                </button>
              </div>

              {showForm && (
                <div id="review-form">
                  <ReviewForm
                    onSubmit={(data) => {
                      addReview({ ...data, reviewerId: "user-" + Date.now() });
                      setShowForm(false);
                      setAnnouncement("Your review has been submitted.");
                    }}
                    onCancel={() => setShowForm(false)}
                  />
                </div>
              )}

              <RatingBreakdown stats={stats} />

              <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 md:p-12">
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
        </main>

        {/* Footer */}
        <footer
          role="contentinfo"
          className="fixed bottom-0 left-0 right-0 py-4 text-center text-[10px] text-gray-400 bg-white/80 backdrop-blur-sm border-t border-gray-100"
        >
          Demo Version 1.0 • Built with Vite, React &amp; Tailwind CSS • Powered
          by Stellar
        </footer>
      </div>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

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
];

function AnalyticsDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div>
        <h2 className="text-3xl font-bold mb-1">Analytics</h2>
        <p className="text-gray-500">Your platform metrics at a glance.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Earnings"
          value="$12,400"
          change={18.2}
          changeLabel="vs last month"
          prefix=""
        />
        <MetricCard
          title="Sessions"
          value={84}
          change={12.5}
          changeLabel="vs last month"
        />
        <MetricCard
          title="Avg. Rating"
          value="4.8"
          change={2.1}
          changeLabel="vs last month"
          suffix="★"
        />
        <MetricCard
          title="Students"
          value={136}
          change={-3.4}
          changeLabel="vs last month"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <AreaChart
          data={earningsData}
          series={[{ key: "earnings", name: "Earnings" }]}
          title="Monthly Earnings"
          description="Cumulative earnings over time"
          xAxisKey="label"
          valuePrefix="$"
          exportable
          exportFilename="earnings-chart"
        />
        <LineChart
          data={ratingTrend}
          series={[{ key: "rating", name: "Avg Rating" }]}
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
          series={[{ key: "sessions", name: "Sessions" }]}
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

export default App;
