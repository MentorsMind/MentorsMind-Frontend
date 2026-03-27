import React, { useState } from 'react';
import { useSessionHistory } from '../hooks/useSessionHistory';
import { useFeedback } from '../hooks/useFeedback';
import { useEscrow } from '../hooks/useEscrow';
import HistoryList from '../components/learner/HistoryList';
import LearningProgress from '../components/learner/LearningProgress';
import LearnerNotes from '../components/learner/LearnerNotes';
import FeedbackForm from '../components/learner/FeedbackForm';
import FeedbackHistory from '../components/learner/FeedbackHistory';
import EscrowStatus from '../components/payment/EscrowStatus';
import EscrowTimeline from '../components/payment/EscrowTimeline';

const SessionHistory: React.FC = () => {
  const { sessions, loading, exportReport } = useSessionHistory();
  const [activeTab, setActiveTab] = useState<'progress' | 'history' | 'notes' | 'feedback' | 'escrow'>('progress');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const feedback = useFeedback();
  
  // Escrow hook for learner view
  const {
    escrows,
    loading: escrowLoading,
    releaseEscrow,
    disputeEscrow,
    getEscrowBySessionId,
    getCountdown,
    canRelease,
    canDispute,
    isWithinDisputeWindow
  } = useEscrow({ userRole: 'learner', userId: 'learner-001' });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

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

      <div className="flex items-center gap-4 border-b border-gray-100 pb-2 mb-6">
        {(['progress', 'history', 'notes', 'feedback', 'escrow'] as const).map((tab) => (
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
      {activeTab === 'history' && <HistoryList sessions={sessions} />}
      {activeTab === 'notes' && <LearnerNotes />}
      {activeTab === 'feedback' && (
        <div className="space-y-6">
          <FeedbackForm {...feedback} />
          <FeedbackHistory history={feedback.history} onEdit={feedback.editFeedback} />
        </div>
      )}
      {activeTab === 'escrow' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Escrow Contracts</h2>
              <p className="text-sm text-gray-500">Manage your session payment escrows</p>
            </div>
            <select
              value={selectedSessionId || ''}
              onChange={(e) => setSelectedSessionId(e.target.value || null)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-stellar"
            >
              <option value="">All Escrows</option>
              {escrows.map((escrow) => (
                <option key={escrow.id} value={escrow.sessionId}>
                  Session {escrow.sessionId} - {escrow.amount} {escrow.asset}
                </option>
              ))}
            </select>
          </div>

          {escrowLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-48 bg-gray-200 rounded-2xl" />
              <div className="h-64 bg-gray-200 rounded-2xl" />
            </div>
          ) : escrows.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
              <p className="text-gray-500">No escrow contracts found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {(selectedSessionId 
                ? escrows.filter(e => e.sessionId === selectedSessionId)
                : escrows
              ).map((escrow) => (
                <div key={escrow.id} className="space-y-4">
                  <EscrowStatus
                    escrow={escrow}
                    userRole="learner"
                    onDispute={() => {
                      // Show dispute modal or form
                      const reason = window.prompt('Enter dispute reason (mentor_no_show, unsatisfactory_session, session_cancelled, technical_issues, other):');
                      if (reason) {
                        const description = window.prompt('Please describe the issue:');
                        if (description) {
                          disputeEscrow({
                            escrowId: escrow.id,
                            sessionId: escrow.sessionId,
                            reason,
                            description
                          });
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
    </div>
  );
};

export default SessionHistory;
