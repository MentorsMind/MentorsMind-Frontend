import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, CheckCircle2, XCircle, ArrowRight, TrendingUp } from 'lucide-react';
import { ProposalStatus } from '../../types/governance.types';

interface ProposalCardProps {
  id: string;
  title: string;
  status: ProposalStatus;
  votesFor: number;
  votesAgainst: number;
  totalVotes: number;
  expiresAt: string;
  participationRate: number;
  quorumReached: boolean;
  proposer: string;
  onVote?: (id: string, choice: 'Yes' | 'No') => void;
}

const ProposalCard: React.FC<ProposalCardProps> = ({ 
  id, 
  title, 
  status, 
  votesFor, 
  votesAgainst, 
  totalVotes, 
  expiresAt, 
  participationRate,
  quorumReached,
  proposer,
  onVote
}) => {
  const getStatusDisplay = () => {
    switch (status) {
      case 'Active': return { color: 'bg-blue-100 text-blue-800', icon: <Clock className="mr-1 h-3 w-3" /> };
      case 'Passed': return { color: 'bg-green-100 text-green-800', icon: <CheckCircle2 className="mr-1 h-3 w-3" /> };
      case 'Failed': return { color: 'bg-red-100 text-red-800', icon: <XCircle className="mr-1 h-3 w-3" /> };
      case 'Executed': return { color: 'bg-purple-100 text-purple-800', icon: <CheckCircle2 className="mr-1 h-3 w-3" /> };
      case 'Queued': return { color: 'bg-amber-100 text-amber-800', icon: <Clock className="mr-1 h-3 w-3" /> };
      default: return { color: 'bg-gray-100 text-gray-800', icon: null };
    }
  };

  const { color, icon } = getStatusDisplay();
  const forPercentage = totalVotes > 0 ? (votesFor / totalVotes) * 100 : 0;
  const againstPercentage = totalVotes > 0 ? (votesAgainst / totalVotes) * 100 : 0;

  return (
    <div className="group rounded-3xl border border-gray-100 bg-white p-6 shadow-sm shadow-gray-200/50 hover:border-stellar/30 hover:bg-stellar/[0.02] hover:shadow-xl hover:shadow-stellar/10 transition-all duration-300">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${color}`}>
              {icon}
              {status}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Proposal #{id}</span>
            <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-lg font-mono">
              {`By ${proposer.slice(0, 4)}...${proposer.slice(-4)}`}
            </span>
          </div>
          
          <h3 className="text-xl font-black text-gray-900 leading-snug group-hover:text-stellar transition-colors">
            {title}
          </h3>

          <div className="flex flex-wrap items-center gap-6 pt-2">
            <div className="space-y-1">
              <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">Engagement</span>
              <div className="flex items-center gap-2">
                <div className={`h-1.5 w-12 rounded-full ${quorumReached ? 'bg-green-100' : 'bg-amber-100'}`}>
                  <div className={`h-full rounded-full ${quorumReached ? 'bg-green-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(participationRate, 100)}%` }} />
                </div>
                <span className="text-xs font-black text-gray-900">{participationRate.toFixed(1)}%</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">Total Votes</span>
              <span className="text-xs font-black text-gray-900">{totalVotes.toLocaleString()} <span className="text-gray-400">VP</span></span>
            </div>

            <div className="space-y-1">
              <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">Expires</span>
              <span className="text-xs font-black text-gray-900">{new Date(expiresAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="md:w-48 space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
              <span className="text-green-600">Yes</span>
              <span className="text-gray-900">{forPercentage.toFixed(0)}%</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: `${forPercentage}%` }} />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
              <span className="text-red-600">No</span>
              <span className="text-gray-900">{againstPercentage.toFixed(0)}%</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-red-500 rounded-full" style={{ width: `${againstPercentage}%` }} />
            </div>
          </div>

          {status === 'Active' && onVote && (
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button 
                onClick={(e) => { e.preventDefault(); onVote(id, 'Yes'); }}
                className="py-2.5 rounded-xl border border-green-100 bg-green-50 text-[10px] font-black uppercase tracking-widest text-green-700 hover:bg-green-100 hover:border-green-200 active:scale-95 transition-all"
              >
                Vote Yes
              </button>
              <button 
                onClick={(e) => { e.preventDefault(); onVote(id, 'No'); }}
                className="py-2.5 rounded-xl border border-red-100 bg-red-50 text-[10px] font-black uppercase tracking-widest text-red-700 hover:bg-red-100 hover:border-red-200 active:scale-95 transition-all"
              >
                Vote No
              </button>
            </div>
          )}
        </div>
      </div>

      <Link 
        to={`/governance/proposals/${id}`}
        className="mt-6 flex items-center justify-center w-full py-3 rounded-2xl border border-gray-100 text-xs font-bold text-gray-500 group-hover:bg-stellar group-hover:text-white group-hover:border-stellar transition-all active:scale-98"
      >
        View Details 
        <ArrowRight className="ml-2 h-4 w-4" />
      </Link>
    </div>
  );
};

export default ProposalCard;
