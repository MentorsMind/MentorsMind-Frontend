import React, { useState } from 'react';
import { useFeedback } from '../hooks/useFeedback';
import { useEscrow } from '../hooks/useEscrow';
import { useAuthUser } from '../hooks/useAuthUser';
import {
  useLearnerSessions,
  useCancelSession,
  useRescheduleSession,
} from '../hooks/queries/useSessions';
import HistoryList from '../components/learner/HistoryList';
import LearningProgress from '../components/learner/LearningProgress';
import LearnerNotes from '../components/learner/LearnerNotes';
import FeedbackForm from '../components/learner/FeedbackForm';
import FeedbackHistory from '../components/learner/FeedbackHistory';
import EscrowStatus from '../components/payment/EscrowStatus';
import EscrowTimeline from '../components/payment/EscrowTimeline';
import { EmptyState } from '../components/ui/EmptyState';
import { CalendarX, MessageSquareDashed, ShieldAlert } from 'lucide-react';
import type { Session } from '../types';

type Tab = 'progress' | 'history' | 'notes' | 'feedback' | 'escrow';
type StatusFilter = 'upcoming' | 'past' | 'cancelled';

const SessionHistory: React.FC = () => {
  const { user } = useAuthUser();

  const [activeTab, setActiveTab] = useState<Tab>('progress');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('upcoming');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Session | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  // ─── Queries ──────────────────────────────────────────────────────────────

  const {
    data,
    isLoading,
    isError,
    isFetching,
  } = useLearnerSessions({ status: statusFilter, limit: 20 });

  const sessions = data?.data ?? [];

  // ─── Mutations ────────────────────────────────────────────────────────────

  const cancelSession = useCancelSession();
  const rescheduleSession = useRescheduleSession();

  // ─── Escrow ────────────────────────────────────────────────────────────────

  const {
    escrows,
    loading: escrowLoading,
    disputeEscrow,
    getCountdown,
    canRelease,
    canDispute,
    isWithinDisputeWindow,
  } = useEscrow({ userRole: 'learner', userId: user?.id ?? 'learner-001' });

  const feedback = useFeedback();

  // ─── Export ────────────────────────────────────────────────────────────────

  const exportReport = () => {
    const csv = [
      ['Date', 'Mentor', 'Type', 'Duration', 'Status'],
      ...sessions.map((s) => [
        new Date(s.startTime).toLocaleDateString(),
        s.mentorName,
        s.sessionType,
        `${s.duration}min`,
        s.status,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'session-history.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─── Cancel flow ─────────────────────────────────────────────────────────

  const handleConfirmCancel = async () => {
    if (!cancelTarget || !cancelReason.trim()) return;
    await cancelSession.mutateAsync({
      id: cancelTarget.id,
      payload: { reason: cancelReason },
    });
    setCancelTarget(null);
    setCancelReason('');
  };

  // ─── Loading / error ──────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  // ─── Helper for empty state text ──────────────────────────────────────────

  const getHistoryEmptyStateText = (status: StatusFilter) => {
    switch (status) {
      case 'upcoming':
        return "You have no upcoming sessions. Book a mentor to continue learning.";
      case 'past':
        return "You haven't completed any sessions yet.";
      case 'cancelled':
        return "You have no cancelled sessions.";
      default:
        return "No sessions found.";
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-700">
      <div className="flex flex-wrap justify-between items-center gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">
            Your Learning <span className="text-stellar">Hub</span>
          </h1>
          <p className="text-gray-500 font-medium">
            Track progress, manage notes, and capture session feedback in one workspace.
          </p>
        </div>

        <button
          onClick={exportReport}
          className="px-6 py-3 bg-stellar text-white rounded-xl font-bold hover:bg-stellar/90 transition-all shadow-lg shadow-stellar/20"
        >
          Export Report
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-gray-100 pb-2 mb-6 overflow-x-auto whitespace-nowrap">
        {(['progress', 'history', 'notes', 'feedback', 'escrow'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab
                ? 'bg-stellar text-white shadow-lg shadow-stellar/20'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'progress' && <LearningProgress />}

      {activeTab === 'history' && (
        <div className="space-y-4">
          {/* Status filter */}
          <div className="flex gap-2">
            {(['upcoming', 'past', 'cancelled'] as StatusFilter[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-1.5 rounded-xl text-sm font-bold transition-all ${
                  statusFilter === s
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          {isError && (
            <p className="text-sm text-red-600">Failed to load sessions. Please refresh.</p>
          )}

          <div className={isFetching && !isLoading ? 'opacity-60 transition-opacity' : ''}>
            {!isLoading && sessions.length === 0 ? (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm mt-6">
                <EmptyState
                  variant="card"
                  icon={<CalendarX className="w-10 h-10" />}
                  title="No sessions found"
                  description={getHistoryEmptyStateText(statusFilter)}
                  actionLabel={statusFilter === 'upcoming' ? "Find a Mentor" : undefined}
                  onAction={statusFilter === 'upcoming' ? () => window.location.href = '/mentors' : undefined}
                />
              </div>
            ) : (
              <HistoryList
                sessions={sessions}
                onCancel={(session) => setCancelTarget(session)}
                onReschedule={(session, newSlotId) =>
                  rescheduleSession.mutate({ id: session.id, payload: { slotId: newSlotId } })
                }
              />
            )}
          </div>
        </div>
      )}

      {activeTab === 'notes' && <LearnerNotes />}

      {activeTab === 'feedback' && (
        <div className="space-y-6">
          <FeedbackForm {...feedback} />
          {feedback.history.length === 0 ? (
             <div className="bg-white rounded-3xl border border-gray-100 shadow-sm">
               <EmptyState
                 variant="card"
                 icon={<MessageSquareDashed className="w-10 h-10" />}
                 title="No feedback yet"
                 description="Complete a session and leave a review to see your feedback history here."
               />
             </div>
          ) : (
             <FeedbackHistory history={feedback.history} onEdit={feedback.editFeedback} />
          )}
        </div>
      )}

      {activeTab === 'escrow' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Escrow Contracts</h2>
              <p className="text-sm text-gray-500">Manage your session payment escrows</p>
            </div>
            {escrows.length > 0 && (
              <select
                value={selectedSessionId || ''}
                onChange={(e) => setSelectedSessionId(e.target.value || null)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-stellar"
              >
                <option value="">All Escrows</option>
                {escrows.map((escrow) => (
                  <option key={escrow.id} value={escrow.sessionId}>
                    Session {escrow.sessionId} — {escrow.amount} {escrow.asset}
                  </option>
                ))}
              </select>
            )}
          </div>

          {escrowLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-48 bg-gray-200 rounded-2xl" />
              <div className="h-64 bg-gray-200 rounded-2xl" />
            </div>
          ) : escrows.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm">
              <EmptyState
                variant="card"
                icon={<ShieldAlert className="w-10 h-10" />}
                title="No active escrows"
                description="Your Stellar payments are held securely in escrow during active sessions. Book a session to see your contracts here."
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {(selectedSessionId
                ? escrows.filter((e) => e.sessionId === selectedSessionId)
                : escrows
              ).map((escrow) => (
                <div key={escrow.id} className="space-y-4">
                  <EscrowStatus
                    escrow={escrow}
                    userRole="learner"
                    onDispute={() => {
                      const reason = window.prompt(
                        'Reason (mentor_no_show, unsatisfactory_session, session_cancelled, technical_issues, other):',
                      );
                      if (reason) {
                        const description = window.prompt('Please describe the issue:');
                        if (description) {
                          disputeEscrow({ escrowId: escrow.id, sessionId: escrow.sessionId, reason, description });
                        }
                      }
                    }}
                    getCountdown={getCountdown}
                    canRelease={canRelease(escrow)}
                    canDispute={canDispute(escrow)}
                    isWithinDisputeWindow={isWithinDisputeWindow(escrow)}
                  />
                  <EscrowTimeline escrow={escrow} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cancel confirmation modal */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
            onClick={() => setCancelTarget(null)}
          />
          <div className="relative z-10 w-full max-w-md bg-white rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-black text-gray-900 mb-1">Cancel session?</h3>
            <p className="text-sm text-gray-500 mb-4">
              {cancelTarget.mentorName} · {new Date(cancelTarget.startTime).toLocaleString()}
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Please provide a cancellation reason..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none focus:border-stellar min-h-24 mb-4"
            />
            {cancelSession.isError && (
              <p className="text-sm text-red-600 mb-3">Failed to cancel. Please try again.</p>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setCancelTarget(null)}
                className="px-4 py-2 text-sm font-bold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50"
              >
                Keep session
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={!cancelReason.trim() || cancelSession.isPending}
                className="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50"
              >
                {cancelSession.isPending ? 'Cancelling...' : 'Confirm cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionHistory;