import React from 'react';

interface QuorumProgressProps {
  currentParticipation: number;
  threshold: number;
  totalVotingPower: number;
}

const QuorumProgress: React.FC<QuorumProgressProps> = ({ currentParticipation, threshold, totalVotingPower }) => {
  const participationPercentage = totalVotingPower > 0 ? (currentParticipation / totalVotingPower) * 100 : 0;
  const thresholdRate = (threshold / totalVotingPower) * 100;
  const quorumReached = participationPercentage >= thresholdRate;

  return (
    <div data-testid="quorum-progress" className="space-y-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">Quorum Status</h3>
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-widest ${
          quorumReached ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
        }`}>
          {quorumReached ? 'Reached' : 'In Progress'}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm font-medium">
          <span className="text-gray-500">Participation</span>
          <span className="text-gray-900 font-bold">{participationPercentage.toFixed(2)}%</span>
        </div>
        
        <div className="relative h-4 w-full overflow-hidden rounded-full bg-gray-100">
          {/* Threshold Marker */}
          <div 
            className="absolute top-0 bottom-0 w-1 bg-red-400 z-10"
            style={{ left: `${thresholdRate}%` }}
            title={`Required: ${thresholdRate}%`}
          />
          
          {/* Progress Bar */}
          <div 
            className={`h-full transition-all duration-1000 ease-out ${
              quorumReached ? 'bg-green-500' : 'bg-amber-500'
            }`}
            style={{ width: `${Math.min(participationPercentage, 100)}%` }}
          />
        </div>
        
        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
          <span>0%</span>
          <span className="text-red-500">Quorum {thresholdRate.toFixed(0)}%</span>
          <span>100%</span>
        </div>
      </div>

      <p className="text-xs text-gray-500 leading-relaxed">
        A minimum participation of <span className="font-bold">{thresholdRate.toFixed(1)}%</span> ({threshold.toLocaleString()} VP) is required for this vote to be valid.
      </p>
    </div>
  );
};

export default QuorumProgress;
