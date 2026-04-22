import React from 'react';

interface VoteBreakdownProps {
  votesFor: number;
  votesAgainst: number;
  totalVotes: number;
}

const VoteBreakdown: React.FC<VoteBreakdownProps> = ({ votesFor, votesAgainst, totalVotes }) => {
  const forPercentage = totalVotes > 0 ? (votesFor / totalVotes) * 100 : 0;
  const againstPercentage = totalVotes > 0 ? (votesAgainst / totalVotes) * 100 : 0;

  return (
    <div className="space-y-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-bold text-gray-900">Vote Breakdown</h3>
      
      <div className="space-y-4">
        {/* Yes Votes */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <span className="text-green-600">Yes</span>
            <span className="text-gray-900">{votesFor.toLocaleString()} VP ({forPercentage.toFixed(1)}%)</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
            <div 
              className="h-full bg-green-500 transition-all duration-1000 ease-out"
              style={{ width: `${forPercentage}%` }}
            />
          </div>
        </div>

        {/* No Votes */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <span className="text-red-600">No</span>
            <span className="text-gray-900">{votesAgainst.toLocaleString()} VP ({againstPercentage.toFixed(1)}%)</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
            <div 
              className="h-full bg-red-500 transition-all duration-1000 ease-out"
              style={{ width: `${againstPercentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-50">
        <div className="flex justify-between text-sm text-gray-500">
          <span>Total Votes</span>
          <span className="font-semibold text-gray-900">{totalVotes.toLocaleString()} VP</span>
        </div>
      </div>
    </div>
  );
};

export default VoteBreakdown;
