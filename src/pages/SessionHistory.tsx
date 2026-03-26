import React, { useState } from 'react';
import { useSessionHistory } from '../hooks/useSessionHistory';
import { useFeedback } from '../hooks/useFeedback';
import HistoryList from '../components/learner/HistoryList';
import LearningProgress from '../components/learner/LearningProgress';
import LearnerNotes from '../components/learner/LearnerNotes';
import FeedbackForm from '../components/learner/FeedbackForm';
import FeedbackHistory from '../components/learner/FeedbackHistory';

const SessionHistory: React.FC = () => {
  const { sessions, loading, exportReport } = useSessionHistory();
  const [activeTab, setActiveTab] = useState<'progress' | 'history' | 'notes' | 'feedback'>('progress');
  const feedback = useFeedback();

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
        {(['progress', 'history', 'notes', 'feedback'] as const).map((tab) => (
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
    </div>
  );
};

export default SessionHistory;
