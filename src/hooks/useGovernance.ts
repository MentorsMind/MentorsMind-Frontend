import { useState, useMemo, useCallback } from 'react';

export interface Proposal {
  id: string;
  title: string;
  proposer: string;
  status: 'Active' | 'Passed' | 'Queued' | 'Defeated';
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  totalVP: number;
  quorum: number;
  endDate: string;
  category: string;
}

export interface GovernanceStats {
  totalProposals: number;
  activeProposals: number;
  passedProposals: number;
  avgParticipation: number;
  totalVoters: number;
  quorumReached: number;
}

export interface VoteRecord {
  id: string;
  voter: string;
  proposalId: string;
  proposalTitle: string;
  support: 'For' | 'Against' | 'Abstain';
  weight: number;
  timestamp: string;
}

const MOCK_PROPOSALS: Proposal[] = [
  {
    id: 'MM-104',
    title: 'Implement Decentralized Identity Verification via Soroban',
    proposer: 'GB...XYZ7',
    status: 'Queued',
    votesFor: 1720000,
    votesAgainst: 150000,
    votesAbstain: 50000,
    totalVP: 1920000,
    quorum: 1500000,
    endDate: '2024-04-15T12:00:00Z',
    category: 'Protocol'
  },
  {
    id: 'MM-105',
    title: 'Update Mentor Reward Multiplier for STEM Category',
    proposer: 'GD...ABC4',
    status: 'Active',
    votesFor: 850000,
    votesAgainst: 420000,
    votesAbstain: 100000,
    totalVP: 1370000,
    quorum: 1500000,
    endDate: '2024-03-30T18:30:00Z',
    category: 'Economics'
  },
  {
    id: 'MM-103',
    title: 'DAO Treasury Allocation for Q2 2024',
    proposer: 'GA...TREA',
    status: 'Passed',
    votesFor: 2100000,
    votesAgainst: 300000,
    votesAbstain: 100000,
    totalVP: 2500000,
    quorum: 1500000,
    endDate: '2024-03-10T10:00:00Z',
    category: 'Treasury'
  },
  {
    id: 'MM-102',
    title: 'Lowering Minimum Stake for New Mentors',
    proposer: 'GC...LOW8',
    status: 'Defeated',
    votesFor: 600000,
    votesAgainst: 1800000,
    votesAbstain: 200000,
    totalVP: 2600000,
    quorum: 1500000,
    endDate: '2024-02-25T15:00:00Z',
    category: 'Onboarding'
  }
];

const MOCK_VOTES: VoteRecord[] = [
  { id: 'v1', voter: 'GA...123', proposalId: 'MM-105', proposalTitle: 'Update Mentor Reward Multiplier', support: 'For', weight: 12500, timestamp: '2024-03-27T14:20:00Z' },
  { id: 'v2', voter: 'GB...456', proposalId: 'MM-105', proposalTitle: 'Update Mentor Reward Multiplier', support: 'Against', weight: 5400, timestamp: '2024-03-27T13:45:00Z' },
  { id: 'v3', voter: 'GC...789', proposalId: 'MM-104', proposalTitle: 'Implement Decentralized Identity', support: 'For', weight: 45000, timestamp: '2024-03-26T10:15:00Z' },
];

export function useGovernance() {
  const [proposals, setProposals] = useState<Proposal[]>(MOCK_PROPOSALS);
  const [recentVotes, setRecentVotes] = useState<VoteRecord[]>(MOCK_VOTES);
  const [isLoading, setIsLoading] = useState(false);

  const stats: GovernanceStats = useMemo(() => {
    return {
      totalProposals: proposals.length + 84, // +84 legacy
      activeProposals: proposals.filter(p => p.status === 'Active').length,
      passedProposals: proposals.filter(p => p.status === 'Passed').length + 72,
      avgParticipation: 64.2,
      totalVoters: 1248,
      quorumReached: 98.4
    };
  }, [proposals]);

  const addProposal = useCallback((newProposal: Partial<Proposal>) => {
    const proposal: Proposal = {
      id: `MM-${Math.floor(Math.random() * 1000)}`,
      title: newProposal.title || 'Untitled Proposal',
      proposer: 'Me (GD...SIGN)',
      status: 'Active',
      votesFor: 0,
      votesAgainst: 0,
      votesAbstain: 0,
      totalVP: 0,
      quorum: 1500000,
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      category: newProposal.category || 'General',
      ...newProposal
    };
    setProposals(prev => [proposal, ...prev]);
  }, []);

  const castVote = useCallback(async (proposalId: string, support: 'For' | 'Against' | 'Abstain') => {
    setIsLoading(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setRecentVotes(prev => [
      {
        id: `v-${Date.now()}`,
        voter: 'Me (GD...SIGN)',
        proposalId,
        proposalTitle: proposals.find(p => p.id === proposalId)?.title || 'Unknown',
        support,
        weight: 1200, // User's VP
        timestamp: new Date().toISOString()
      },
      ...prev
    ]);

    setProposals(prev => prev.map(p => {
      if (p.id === proposalId) {
        return {
          ...p,
          votesFor: support === 'For' ? p.votesFor + 1200 : p.votesFor,
          votesAgainst: support === 'Against' ? p.votesAgainst + 1200 : p.votesAgainst,
          votesAbstain: support === 'Abstain' ? p.votesAbstain + 1200 : p.votesAbstain,
          totalVP: p.totalVP + 1200
        };
      }
      return p;
    }));

    setIsLoading(false);
  }, [proposals]);

  return {
    proposals,
    recentVotes,
    stats,
    isLoading,
    addProposal,
    castVote
  };
}
