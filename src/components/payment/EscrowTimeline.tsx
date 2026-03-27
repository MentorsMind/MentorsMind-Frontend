import React from 'react';
import type { EscrowContract, EscrowTimelineStage } from '../../types/payment.types';

interface EscrowTimelineProps {
  escrow: EscrowContract;
}

const stageConfig: Record<EscrowTimelineStage, { label: string; icon: string; color: string }> = {
  created: {
    label: 'Escrow Created',
    icon: '📝',
    color: 'bg-blue-500'
  },
  session: {
    label: 'Session Completed',
    icon: '🎓',
    color: 'bg-purple-500'
  },
  release: {
    label: 'Funds Released',
    icon: '💰',
    color: 'bg-green-500'
  },
  disputed: {
    label: 'Dispute Filed',
    icon: '⚠️',
    color: 'bg-red-500'
  },
  refunded: {
    label: 'Funds Refunded',
    icon: '↩️',
    color: 'bg-gray-500'
  }
};

const EscrowTimeline: React.FC<EscrowTimelineProps> = ({ escrow }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays}d ago`;
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths}mo ago`;
  };

  // Get all timeline stages including future ones
  const getTimelineStages = () => {
    const stages: EscrowTimelineStage[] = ['created', 'session'];
    
    if (escrow.status === 'disputed') {
      stages.push('disputed');
    } else if (escrow.status === 'refunded') {
      stages.push('disputed', 'refunded');
    } else if (escrow.status === 'released') {
      stages.push('release');
    }
    
    return stages;
  };

  const timelineStages = getTimelineStages();
  const completedStages = new Set(escrow.timeline.map(t => t.stage));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="font-bold text-gray-900">Escrow Timeline</h3>
        <p className="text-xs text-gray-500 mt-1">Track your payment journey</p>
      </div>

      <div className="p-6">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-100" />

          {/* Timeline events */}
          <div className="space-y-6">
            {escrow.timeline.map((event, index) => {
              const config = stageConfig[event.stage];
              const isLast = index === escrow.timeline.length - 1;
              
              return (
                <div key={`${event.stage}-${index}`} className="relative flex gap-4">
                  {/* Icon */}
                  <div className={`relative z-10 w-10 h-10 rounded-full ${config.color} flex items-center justify-center text-white shadow-lg flex-shrink-0`}>
                    <span className="text-lg">{config.icon}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">{config.label}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">{event.description}</p>
                        
                        {event.transactionHash && (
                          <a
                            href={`https://stellar.expert/explorer/testnet/tx/${event.transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 mt-2 text-[10px] text-stellar hover:underline"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            View Transaction
                          </a>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-medium text-gray-600">{formatTimeAgo(event.timestamp)}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{formatDate(event.timestamp)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Future stages */}
            {escrow.status === 'active' && (
              <>
                <div className="relative flex gap-4 opacity-50">
                  <div className="relative z-10 w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 flex-shrink-0">
                    <span className="text-lg">💰</span>
                  </div>
                  <div className="flex-1 pt-2">
                    <h4 className="font-medium text-gray-400 text-sm">Funds Release</h4>
                    <p className="text-xs text-gray-400 mt-0.5">Auto-release at {formatDate(escrow.autoReleaseAt)}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Status summary */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                escrow.status === 'active' ? 'bg-amber-500 animate-pulse' :
                escrow.status === 'released' ? 'bg-green-500' :
                escrow.status === 'disputed' ? 'bg-red-500' :
                'bg-gray-500'
              }`} />
              <span className="text-sm font-medium text-gray-700">
                Current Status: <span className="capitalize">{escrow.status}</span>
              </span>
            </div>
            <span className="text-xs text-gray-400">
              {escrow.timeline.length} event{escrow.timeline.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EscrowTimeline;
