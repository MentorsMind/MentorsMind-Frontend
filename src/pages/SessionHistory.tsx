import { useNavigate } from 'react-router-dom';
import { useBookingHistory, type TabKey, type StatusFilter } from '../hooks/useBookingHistory';
import SessionHistoryCard from '../components/session/SessionHistoryCard';
import Button from '../components/ui/Button';

// ─── Empty states ─────────────────────────────────────────────────────────────

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SessionHistory() {
  const {
    tab, switchTab,
    filters, updateFilter,
    bookings, totalCount, hasMore, loadMore,
    isLoading, isInDisputeWindow,
  } = useBookingHistory();

  const handleLeaveReview = (id: string) => alert(`Leave review for booking ${id}`);
  const handleOpenDispute = (id: string) => alert(`Open dispute for booking ${id}`);
  const handleViewReceipt = (id: string) => alert(`View receipt for booking ${id}`);

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'past',     label: 'Past' },
  ];

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sessions</h1>
        <p className="text-sm text-gray-500 mt-1">Manage and review your mentoring sessions</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => switchTab(key)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === key
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Filters — only for Past tab */}
      {tab === 'past' && (
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => updateFilter('status', e.target.value as StatusFilter)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => updateFilter('dateFrom', e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">To</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => updateFilter('dateTo', e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          {(filters.status !== 'all' || filters.dateFrom || filters.dateTo) && (
            <button
              onClick={() => { updateFilter('status', 'all'); updateFilter('dateFrom', ''); updateFilter('dateTo', ''); }}
              className="text-xs text-gray-500 hover:text-gray-700 underline pb-1.5"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Results count */}
      {totalCount > 0 && (
        <p className="text-xs text-gray-400">{totalCount} session{totalCount !== 1 ? 's' : ''}</p>
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
              <div className="flex gap-3">
                <div className="w-11 h-11 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState tab={tab} />
      ) : (
        <div className="space-y-3">
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
            <div className="flex justify-center pt-2">
              <Button variant="outline" onClick={loadMore}>Load more</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
