export type ProposalStatus = 'Active' | 'Passed' | 'Failed' | 'Executed' | 'Queued';

export interface Voter {
  address: string;
  choice: 'Yes' | 'No';
  power: number;
  timestamp: string;
}

export interface Proposal {
  id: string;
  title: string;
  description: string;
  proposer: string;
  status: ProposalStatus;
  votesFor: number;
  votesAgainst: number;
  totalVotes: number;
  voters: Voter[];
  createdAt: string;
  expiresAt: string;
  timelockEndsAt?: string;
  discussionUrl?: string;
  ipfsHash?: string;
  quorumReached: boolean;
  quorumThreshold: number;
}

export interface GovernanceMetrics {
  totalMntSupply: number;
  circulatingMntSupply: number;
  totalVotingPower: number;
  userVotingPower: {
    mntBalance: number;
    delegatedPower: number;
    total: number;
  };
}
