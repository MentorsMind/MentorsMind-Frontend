import React, { useEffect } from 'react';
import { useGovernance } from '../hooks/useGovernance';
import { useDelegation } from '../hooks/useDelegation';
import { useDashboard } from '../hooks/useDashboard';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { DashboardGrid } from '../components/dashboard/DashboardGrid';
import { Widget } from '../components/dashboard/Widget';
import { 
  Plus, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Users, 
  PieChart as PieIcon, 
  Target, 
  Search,
  ChevronRight,
  Vote
} from 'lucide-react';

const StatCard: React.FC<{
  label: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  color: string;
}> = ({ label, value, change, icon, color }) => (
  <div className="flex flex-col gap-2 p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm transition-all hover:shadow-md">
    <div className="flex justify-between items-start">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      {change && (
        <span className={`text-xs font-bold ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
          {change}
        </span>
      )}
    </div>
    <div>
      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</div>
      <div className="text-2xl font-black text-gray-900 dark:text-white">{value}</div>
    </div>
  </div>
);

const ProposalStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles = {
    Active: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200',
    Passed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200',
    Queued: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200',
    Defeated: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200',
  }[status] || 'bg-gray-100 text-gray-800';

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${styles}`}>
      {status === 'Active' && <Clock className="w-3 h-3" />}
      {status === 'Passed' && <CheckCircle2 className="w-3 h-3" />}
      {status === 'Defeated' && <XCircle className="w-3 h-3" />}
      {status}
    </span>
  );
};

const QuorumBar: React.FC<{ current: number; threshold: number }> = ({ current, threshold }) => {
  const percent = Math.min((current / threshold) * 100, 100);
  const isReached = current >= threshold;

  return (
    <div className="w-full space-y-1.5">
      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
        <span className={isReached ? 'text-green-600' : 'text-gray-500'}>Quorum: {current.toLocaleString()} / {threshold.toLocaleString()} VP</span>
        <span className={isReached ? 'text-green-600' : 'text-gray-400'}>{percent.toFixed(1)}%</span>
      </div>
      <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ${isReached ? 'bg-green-500' : 'bg-stellar'}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

const GovernanceDashboardContent: React.FC = () => {
  const { proposals, stats, recentVotes, isLoading, castVote } = useGovernance();
  const { totalPower, ownPower, receivedPower } = useDelegation();
  const { setRole, setLoading } = useDashboard();

  useEffect(() => {
    setRole('admin');
    setLoading(isLoading);
  }, [setRole, setLoading, isLoading]);

  return (
    <div className="p-6 pb-20 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            Governance Dashboard
            <span className="text-xs font-bold px-2 py-1 bg-stellar/10 text-stellar rounded-lg uppercase tracking-widest">
              DAO Alpha
            </span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">
            Shape the future of MentorsMind by participating in community decisions.
          </p>
        </div>

        <button className="flex items-center gap-2 rounded-2xl bg-stellar px-6 py-3 font-bold text-white shadow-lg shadow-stellar/20 transition-all hover:bg-stellar-dark active:scale-[0.98]">
          <Plus className="h-5 w-5" />
          Propose Change
        </button>
      </div>

      {/* Main Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Your Voting Power" 
          value={`${totalPower.toLocaleString()} VP`} 
          icon={<Vote className="w-6 h-6 text-indigo-600" />} 
          color="bg-indigo-50 dark:bg-indigo-900/20"
          change={receivedPower > 0 ? `+${receivedPower} delegated` : undefined}
        />
        <StatCard 
          label="Active Proposals" 
          value={stats.activeProposals} 
          icon={<Clock className="w-6 h-6 text-blue-600" />} 
          color="bg-blue-50 dark:bg-blue-900/20"
        />
        <StatCard 
          label="Participation rate" 
          value={`${stats.avgParticipation}%`} 
          icon={<Users className="w-6 h-6 text-green-600" />} 
          color="bg-green-50 dark:bg-green-900/20"
          change="+4.2%"
        />
        <StatCard 
          label="Passed Submissions" 
          value={stats.passedProposals} 
          icon={<CheckCircle2 className="w-6 h-6 text-purple-600" />} 
          color="bg-purple-50 dark:bg-purple-900/20"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Proposals List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent Proposals</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-stellar/30 transition-all shadow-sm"
                />
              </div>
              <button className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:bg-gray-50 transition-all shadow-sm">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"/></svg>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {proposals.map((proposal) => (
              <div 
                key={proposal.id}
                className="group relative p-6 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{proposal.id}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      <span className="text-[10px] font-bold text-stellar uppercase tracking-widest">{proposal.category}</span>
                      <ProposalStatusBadge status={proposal.status} />
                    </div>
                    
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white transition-colors group-hover:text-stellar">
                      {proposal.title}
                    </h4>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-0.5">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Against</span>
                            <div className="text-sm font-black text-red-500">{(proposal.votesAgainst / 1000).toFixed(1)}K VP</div>
                        </div>
                        <div className="space-y-0.5">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Abstain</span>
                            <div className="text-sm font-black text-gray-500">{(proposal.votesAbstain / 1000).toFixed(1)}K VP</div>
                        </div>
                        <div className="space-y-0.5">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">For</span>
                            <div className="text-sm font-black text-green-500">{(proposal.votesFor / 1000).toFixed(1)}K VP</div>
                        </div>
                    </div>

                    <QuorumBar current={proposal.totalVP} threshold={proposal.quorum} />
                  </div>

                  <div className="flex items-end md:items-center">
                    <button className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-900 text-gray-400 transition-all group-hover:bg-stellar group-hover:text-white group-hover:shadow-lg group-hover:shadow-stellar/30">
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>
                </div>
                
                {proposal.status === 'Active' && (
                  <div className="mt-6 pt-6 border-t border-gray-50 dark:border-gray-700 flex flex-wrap gap-2">
                    <button 
                      onClick={() => castVote(proposal.id, 'For')}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-green-50 text-green-600 border border-green-100 hover:bg-green-100 transition-all"
                    >
                      Vote For
                    </button>
                    <button 
                      onClick={() => castVote(proposal.id, 'Against')}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-all"
                    >
                      Vote Against
                    </button>
                    <button 
                      onClick={() => castVote(proposal.id, 'Abstain')}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-50 text-gray-600 border border-gray-100 hover:bg-gray-100 transition-all"
                    >
                      Abstain
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Insights & Activity */}
        <div className="space-y-8">
          {/* Voting Power Widget */}
          <div className="p-6 rounded-[2.5rem] bg-gradient-to-br from-stellar to-indigo-700 text-white shadow-xl shadow-stellar/20">
            <div className="flex items-center justify-between mb-6">
              <PieIcon className="w-5 h-5 text-white/70" />
              <button className="text-[10px] font-bold uppercase tracking-widest text-white/70 hover:text-white transition-all underline underline-offset-4"> Manage </button>
            </div>
            <div className="space-y-1">
              <div className="text-xs font-bold text-white/60 uppercase tracking-widest">Available Voting Power</div>
              <div className="text-4xl font-black">{totalPower.toLocaleString()}</div>
            </div>
            <div className="mt-8 space-y-3">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-white/70">Own Stake</span>
                <span>{ownPower.toLocaleString()} VP</span>
              </div>
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-white/70">Delegated to you</span>
                <span>{receivedPower.toLocaleString()} VP</span>
              </div>
              <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden mt-4">
                <div 
                  className="h-full bg-white opacity-40" 
                  style={{ width: `${(ownPower / totalPower) * 100}%` }} 
                />
              </div>
            </div>
          </div>

          {/* Activity Widget */}
          <section className="rounded-3xl border border-gray-100 bg-white dark:bg-gray-800 p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-stellar" />
              Recent Activity
            </h3>
            <div className="space-y-6">
              {recentVotes.map((vote) => (
                <div key={vote.id} className="flex gap-4 group">
                  <div className="relative">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                        vote.support === 'For' ? 'border-green-100 bg-green-50 text-green-600' : 
                        vote.support === 'Against' ? 'border-red-100 bg-red-50 text-red-600' : 
                        'border-gray-100 bg-gray-50 text-gray-600'
                    }`}>
                        {vote.support.charAt(0)}
                    </div>
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-gray-50 dark:bg-gray-700/50 group-last:hidden" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900 dark:text-white">{vote.voter}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">
                      Voted <span className="font-bold">{vote.support}</span> on <span className="font-bold">#{vote.proposalId}</span>
                    </div>
                    <div className="text-[10px] text-gray-400 mt-1 uppercase font-medium">{new Date(vote.timestamp).toLocaleTimeString()}</div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-3 rounded-xl border border-gray-100 dark:border-gray-700 text-xs font-bold text-gray-500 hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
              View Governance History
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </section>

          {/* Tips Card */}
          <div className="p-6 rounded-3xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/50">
            <h4 className="text-sm font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              Voting Reward Tip
            </h4>
            <p className="text-xs text-blue-700 dark:text-blue-400/80 leading-relaxed">
              Participating in governance increases your community reputation and grants you exclusive "Visionary" badges on your profile.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const GovernanceDashboard: React.FC = () => (
  <DashboardLayout>
    <GovernanceDashboardContent />
  </DashboardLayout>
);

export default GovernanceDashboard;
