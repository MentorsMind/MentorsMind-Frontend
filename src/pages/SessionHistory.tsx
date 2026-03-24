import React, { useState } from 'react';
import { useSessionHistory } from '../hooks/useSessionHistory';
import HistoryList from '../components/learner/HistoryList';
import LearningAnalytics from '../components/learner/LearningAnalytics';
import TimeInvested from '../components/learner/TimeInvested';

const SessionHistory: React.FC = () => {
  const { sessions, analytics, loading, exportReport } = useSessionHistory();
  const [activeTab, setActiveTab] = useState<'history' | 'analytics'>('history');

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
            Your Learning <span className="text-stellar">Journey</span>
          </h1>
          <p className="text-gray-500 font-medium">
            Track your progress and analyze your learning patterns
          </p>
        </div>

        <button
          onClick={exportReport}
          className="px-6 py-3 bg-stellar text-white rounded-xl font-bold hover:bg-stellar/90 transition-all shadow-lg shadow-stellar/20"
        >
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <TimeInvested
          totalMinutes={analytics.totalTimeInvested}
          averageSessionDuration={analytics.averageSessionDuration}
          totalSessions={analytics.totalSessions}
        />

        <div className="lg:col-span-3">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Consistency Score
                </div>
                <div className="text-3xl font-black text-gray-900">
                  {analytics.learningVelocity.consistencyScore}%
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Skills Learning
                </div>
                <div className="text-3xl font-black text-gray-900">
                  {analytics.skillProgress.length}
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Mentors Worked With
                </div>
                <div className="text-3xl font-black text-gray-900">
                  {analytics.mentorInteractions.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 border-b border-gray-100 pb-2 mb-6">
        {(['history', 'analytics'] as const).map((tab) => (
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

      {activeTab === 'history' ? (
        <HistoryList sessions={sessions} />
      ) : (
        <LearningAnalytics analytics={analytics} />
      )}
    </div>
  );
};

export default SessionHistory;
