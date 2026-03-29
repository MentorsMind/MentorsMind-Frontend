import React, { useState, useMemo } from 'react';
import { Search, Filter, TrendingUp, Users, Shield, Plus, Wallet } from 'lucide-react';
import DelegationPanel from '../components/governance/DelegationPanel';
import ProposalCard from '../components/governance/ProposalCard';
import QuorumProgress from '../components/governance/QuorumProgress';
import VoteModal from '../components/governance/VoteModal';
import { Proposal, ProposalStatus } from '../types/governance.types';

const Governance: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<ProposalStatus | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProposalForVote, setSelectedProposalForVote] = useState<{ id: string; choice: 'Yes' | 'No' } | null>(null);

  // Mock data for metrics
  const metrics = {
    userVotingPower: {
      mntBalance: 1200,
      delegatedPower: 2710,
      total: 3910
    },
    totalVotingPower: 12400000,
    quorumThreshold: 1240000 // 10%
  };

  // Mock data for proposals
  const [proposals] = useState<Proposal[]>([
    {
      id: '1',
      title: 'Implement Decentralized Identity Verification',
      description: 'Full integration with Ceramic network...',
      proposer: 'GD...7X2Z',
      status: 'Queued',
      votesFor: 1250000,
      votesAgainst: 450000,
      totalVotes: 1700000,
      voters: [],
      createdAt: '2024-03-20T10:00:00Z',
      expiresAt: '2024-03-27T10:00:00Z',
      timelockEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
      discussionUrl: 'https://forum.mentorminds.io/t/123',
      ipfsHash: 'QmXoy...',
      quorumReached: true,
      quorumThreshold: 1240000
    },
    {
      id: '2',
      title: 'Update Mentor Reward Multiplier to 1.5x',
      description: 'Increase rewards for top-rated mentors...',
      proposer: 'GA...1A2B',
      status: 'Active',
      votesFor: 850000,
      votesAgainst: 120000,
      totalVotes: 970000,
      voters: [],
      createdAt: '2024-03-21T08:00:00Z',
      expiresAt: '2024-03-28T08:00:00Z',
      discussionUrl: 'https://forum.mentorminds.io/t/124',
      quorumReached: false,
      quorumThreshold: 1240000
    },
    {
      id: '3',
      title: 'DAO Treasury Allocation for Q2 2024',
      description: 'Budget for core development and marketing...',
      proposer: 'GB...3C4D',
      status: 'Passed',
      votesFor: 2100000,
      votesAgainst: 300000,
      totalVotes: 2400000,
      voters: [],
      createdAt: '2024-02-15T12:00:00Z',
      expiresAt: '2024-02-22T12:00:00Z',
      discussionUrl: 'https://forum.mentorminds.io/t/118',
      quorumReached: true,
      quorumThreshold: 1240000
    },
    {
      id: '4',
      title: 'Enable Cross-Chain Bridging for MNT',
      description: 'Support for Stellar-to-Ethereum bridging...',
      proposer: 'GC...5E6F',
      status: 'Failed',
      votesFor: 400000,
      votesAgainst: 900000,
      totalVotes: 1300000,
      voters: [],
      createdAt: '2024-01-10T14:00:00Z',
      expiresAt: '2024-01-17T14:00:00Z',
      discussionUrl: 'https://forum.mentorminds.io/t/105',
      quorumReached: true,
      quorumThreshold: 1240000
    },
    {
        id: '5',
        title: 'New Session Room UI Implementation',
        description: 'New design for the video session room...',
        proposer: 'GD...7X2Z',
        status: 'Executed',
        votesFor: 1800000,
        votesAgainst: 150000,
        totalVotes: 1950000,
        voters: [],
        createdAt: '2023-12-05T09:00:00Z',
        expiresAt: '2023-12-12T09:00:00Z',
        discussionUrl: 'https://forum.mentorminds.io/t/89',
        quorumReached: true,
        quorumThreshold: 1240000
      }
  ]);

  const filteredProposals = useMemo(() => {
    return proposals.filter(p => {
      const matchesFilter = activeFilter === 'All' || p.status === activeFilter;
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [proposals, activeFilter, searchQuery]);

  const handleVoteRequest = (id: string, choice: 'Yes' | 'No') => {
    setSelectedProposalForVote({ id, choice });
  };

  const currentParticipation = metrics.totalVotingPower * 0.12; 

  return (
    <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 px-4 md:px-8">
      <header className="py-12 flex flex-col lg:flex-row justify-between items-start gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-stellar text-white shadow-lg shadow-stellar/20">
              <Shield className="h-6 w-6" />
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-none">DAO Governance</h1>
          </div>
          <p className="text-lg text-gray-500 font-medium">Empowering the community to shape the future of MentorsMind.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <div className="p-6 rounded-3xl border border-gray-100 bg-white shadow-sm flex-1 min-w-[240px]">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="h-4 w-4 text-stellar" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Your Voting Power</span>
            </div>
            <div className="text-3xl font-black text-gray-900 tracking-tight">
              {metrics.userVotingPower.total.toLocaleString()} <span className="text-sm text-gray-400">VP</span>
            </div>
            <div className="mt-2 text-[10px] font-bold text-gray-500">
              {metrics.userVotingPower.mntBalance.toLocaleString()} MNT + {metrics.userVotingPower.delegatedPower.toLocaleString()} Delegated
            </div>
          </div>
          
          <button className="flex items-center justify-center gap-2 h-auto px-8 py-5 rounded-3xl bg-gray-900 text-white text-sm font-black shadow-xl shadow-gray-200 hover:scale-[1.02] active:scale-[0.98] transition-all">
            <Plus className="h-5 w-5" />
            Create Proposal
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <aside className="lg:col-span-4 space-y-8">
          <DelegationPanel />
          <QuorumProgress 
            currentParticipation={currentParticipation} 
            threshold={metrics.quorumThreshold} 
            totalVotingPower={metrics.totalVotingPower} 
          />
          
          <section className="p-8 rounded-3xl bg-linear-to-br from-stellar/5 to-stellar/20 border border-stellar/10 space-y-4">
            <TrendingUp className="h-8 w-8 text-stellar" />
            <h3 className="text-xl font-bold text-gray-900">Platform Stats</h3>
            <p className="text-sm text-gray-600 leading-relaxed font-medium">
              Over <span className="text-stellar font-bold">12M MNT</span> is currently locked in governance, representing 65% total supply activity.
            </p>
            <div className="pt-4 flex items-center gap-3 text-xs font-black uppercase tracking-widest text-stellar">
              <Users className="h-4 w-4" />
              <span>4,821 Voters Active</span>
            </div>
          </section>
        </aside>

        <main className="lg:col-span-8 space-y-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search proposals..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-white text-sm font-medium focus:outline-none focus:ring-4 focus:ring-stellar/10 transition-all"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
              <Filter className="h-4 w-4 text-gray-400 mr-2 shrink-0" />
              {(['All', 'Active', 'Passed', 'Failed', 'Executed', 'Queued'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setActiveFilter(status)}
                  className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                    activeFilter === status 
                      ? 'bg-stellar text-white shadow-lg shadow-stellar/30' 
                      : 'bg-white border border-gray-100 text-gray-500 hover:border-stellar/30'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {filteredProposals.length > 0 ? (
              filteredProposals.map((proposal) => (
                <ProposalCard 
                  key={proposal.id} 
                  {...proposal}
                  participationRate={(proposal.totalVotes / metrics.totalVotingPower) * 100}
                  onVote={handleVoteRequest}
                />
              ))
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 rounded-[2.5rem] border-2 border-dashed border-gray-100">
                <div className="p-6 rounded-3xl bg-gray-50 text-gray-300">
                  <Search className="h-10 w-10" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">No proposals found</h3>
                  <p className="text-gray-500 font-medium">Try adjusting your filters or search query.</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {selectedProposalForVote && (
        <VoteModal 
          isOpen={true}
          onClose={() => setSelectedProposalForVote(null)}
          choice={selectedProposalForVote.choice}
          votingPower={metrics.userVotingPower.total}
          proposal={proposals.find(p => p.id === selectedProposalForVote.id)!}
          onConfirm={async (choice) => {
            await new Promise(resolve => setTimeout(resolve, 2000));
            console.log(`Voting ${choice} on proposal ${selectedProposalForVote.id}`);
            setSelectedProposalForVote(null);
          }}
        />
      )}
    </div>
  );
};

export default Governance;
