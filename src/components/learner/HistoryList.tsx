import React from 'react';
import type { SessionHistoryItem } from '../../types/session.types';

interface HistoryListProps {
  sessions: SessionHistoryItem[];
}

const HistoryList: React.FC<HistoryListProps> = ({ sessions }) => {
  const getStatusColor = (status: SessionHistoryItem['status']) => {
    switch (status) {
      case 'completed': return 'bg-emerald-50 text-emerald-600';
      case 'cancelled': return 'bg-red-50 text-red-600';
      case 'no-show': return 'bg-gray-50 text-gray-600';
    }
  };

  const getOutcomeIcon = (outcome?: SessionHistoryItem['outcome']) => {
    if (!outcome) return null;
    switch (outcome) {
      case 'excellent': return '🌟';
      case 'good': return '👍';
      case 'needs-improvement': return '📝';
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Session History</h2>
      
      <div className="space-y-3">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="border border-gray-100 rounded-2xl p-4 hover:border-stellar/30 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-gray-900">{session.topic}</h3>
                  {session.outcome && (
                    <span className="text-lg" title={session.outcome}>
                      {getOutcomeIcon(session.outcome)}
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 mb-2">
                  with {session.mentorName}
                </p>
                
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                  <span>{new Date(session.date).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{session.duration} min</span>
                  <span>•</span>
                  <span>{session.amount} {session.currency}</span>
                </div>
                
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {session.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 bg-stellar/10 text-stellar text-xs font-medium rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(session.status)}`}>
                  {session.status}
                </span>
                
                {session.rating && (
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500">★</span>
                    <span className="text-sm font-bold text-gray-900">{session.rating}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryList;
