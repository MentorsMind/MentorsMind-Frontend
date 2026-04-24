import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import NoteEditor from '../components/learner/NoteEditor';
import SessionHistoryCard from '../components/session/SessionHistoryCard';
import { SkeletonCard } from '../components/animations/SkeletonLoader';
import { useBookingHistory, TabKey, StatusFilter } from '../hooks/useBookingHistory';
import { useFeedback } from '../hooks/useFeedback';
import FeedbackForm from '../components/learner/FeedbackForm';
import FeedbackHistory from '../components/learner/FeedbackHistory';

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
  pending: 'warning', confirmed: 'default', completed: 'success', cancelled: 'danger', rescheduled: 'warning',
};

function EmptyState({ tab }: { tab: TabKey }) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 mb-4 rounded-full bg-indigo-50 flex items-center justify-center">
        <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      {tab === 'upcoming' ? (
        <>
          <p className="text-base font-semibold text-gray-900">No upcoming sessions</p>
          <p className="text-sm text-gray-500 mt-1 mb-4">Book a session with a mentor to get started.</p>
          <Button onClick={() => navigate('/mentors')}>Browse mentors</Button>
        </>
      ) : (
        <>
          <p className="text-base font-semibold text-gray-900">No past sessions yet</p>
          <p className="text-sm text-gray-500 mt-1 mb-4">Your completed sessions will appear here.</p>
          <Button onClick={() => navigate('/mentors')}>Find a mentor</Button>
        </>
      )}
    </div>
  );
}

export type SessionHistoryTab = TabKey | 'feedback';

export default function SessionHistory() {
  const {
    tab: bookingTab, switchTab: switchBookingTab,
    filters, updateFilter,
    bookings,
    totalCount,
    hasMore,
    loadMore,
    isLoading: isHookLoading,
    isInDisputeWindow,
  } = useBookingHistory();

  const { history, editFeedback, submitFeedback } = useFeedback();

  const [tab, setTab] = useState<SessionHistoryTab>('upcoming');

  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const showSkeleton = isLoading || isHookLoading;

  const handleLeaveReview = (id: string) => console.log('Leave review', id);
  const handleOpenDispute = (id: string) => console.log('Open dispute', id);
  const handleViewReceipt = (url: string) => window.open(url, '_blank');

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Your Learning History</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">Export Report</Button>
          <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => { setTab('upcoming'); switchBookingTab('upcoming'); }}
            className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${
              tab === 'upcoming' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => { setTab('past'); switchBookingTab('past'); }}
            className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${
              tab === 'past' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Past
          </button>
          <button
            onClick={() => setTab('feedback')}
            className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${
              tab === 'feedback' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Feedback
          </button>
        </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Time Invested</h2>
        <p className="text-2xl font-bold text-gray-900 mt-1">12.5 hours</p>
      </div>

      {tab === 'past' && (
        <div className="flex flex-wrap gap-3 items-end bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Status</label>
            <select
              value={filters.status}
              onChange={(e) => updateFilter('status', e.target.value as StatusFilter)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">From</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => updateFilter('dateFrom', e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">To</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => updateFilter('dateTo', e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
            />
          </div>
          {(filters.status !== 'all' || filters.dateFrom || filters.dateTo) && (
            <button
              onClick={() => { updateFilter('status', 'all'); updateFilter('dateFrom', ''); updateFilter('dateTo', ''); }}
              className="text-xs text-indigo-600 font-bold hover:text-indigo-700 pb-2.5"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {tab === 'feedback' ? (
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Post-session feedback</h3>
            <FeedbackForm onSubmit={submitFeedback} />
          </div>
          <div>
            <FeedbackHistory history={history} onEdit={editFeedback} />
          </div>
        </div>
      ) : showSkeleton ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <SkeletonCard key={i} variant="booking" />)}
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState tab={tab === 'feedback' ? 'past' : tab} />
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <SessionHistoryCard
              key={b.id}
              booking={b}
              inDisputeWindow={isInDisputeWindow(b)}
              onLeaveReview={handleLeaveReview}
              onOpenDispute={handleOpenDispute}
              onViewReceipt={handleViewReceipt}
            />
          ))}

          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button variant="outline" onClick={loadMore}>Load more sessions</Button>
            </div>
          )}
        </div>
      )}
      
      {totalCount > 0 && !showSkeleton && tab !== 'feedback' && (
        <p className="text-center text-xs text-gray-400 mt-4">
          Showing {bookings.length} of {totalCount} session{totalCount !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
