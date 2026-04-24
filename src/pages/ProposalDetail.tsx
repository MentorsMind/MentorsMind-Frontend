import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Share2, 
  MessageCircle, 
  ExternalLink, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Play,
  Copy,
  Check
} from 'lucide-react';
import VoteBreakdown from '../components/governance/VoteBreakdown';
import VoterList from '../components/governance/VoterList';
import TimelockCountdown from '../components/governance/TimelockCountdown';

interface Voter {
  address: string;
  choice: 'Yes' | 'No';
  power: number;
}

interface Proposal {
  id: string;
  title: string;
  description: string;
  proposer: string;
  status: 'Active' | 'Passed' | 'Failed' | 'Executed' | 'Queued';
  votesFor: number;
  votesAgainst: number;
  totalVotes: number;
  voters: Voter[];
  createdAt: string;
  expiresAt: string;
  timelockEndsAt?: string;
  discussionUrl?: string;
  ipfsHash?: string;
}

// Mock data generator
const getMockProposal = (id: string): Proposal => ({
  id,
  title: `Proposal #${id}: Implement Decentralized Identity Verification`,
  description: `
## Summary
This proposal aims to integrate a decentralized identity (DID) verification system into the MentorMinds platform. This will allow mentors and learners to verify their credentials without relying on a central authority.

## Background
Currently, identity verification is handled manually by the administration team, which is slow and not scalable. By moving to a DID-based system, we can automate this process and improve privacy.

## Proposed Changes
1.  **Integration with Ceramic Network**: Use Ceramic for storing decentralized identity documents.
2.  **Verifiable Credentials**: Implement W3C Verifiable Credentials for skill certifications.
3.  **UI Updates**: Add a "Verified" badge to mentor profiles who have completed the DID process.

## Benefits
-   **Increased Trust**: Users can be sure that the credentials they see are authentic.
-   **Privacy**: Users have full control over their own data.
-   **Scalability**: The verification process is automated and does not require manual intervention.
  `,
  proposer: 'GD...7X2Z',
  status: 'Queued',
  votesFor: 1250000,
  votesAgainst: 450000,
  totalVotes: 1700000,
  voters: [
    { address: 'GA...1A2B', choice: 'Yes', power: 500000 },
    { address: 'GB...3C4D', choice: 'No', power: 300000 },
    { address: 'GC...5E6F', choice: 'Yes', power: 250000 },
    { address: 'GD...7G8H', choice: 'Yes', power: 500000 },
    { address: 'GE...9I0J', choice: 'No', power: 150000 },
  ],
  createdAt: '2024-03-20T10:00:00Z',
  expiresAt: '2024-03-27T10:00:00Z',
  timelockEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days from now
  discussionUrl: 'https://forum.mentorminds.io/t/did-proposal/123',
  ipfsHash: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco'
});

const ProposalDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [copied, setCopied] = useState(false);
  const [executing, setExecuting] = useState(false);

  useEffect(() => {
    if (id) {
      // In a real app, fetch from API or on-chain
      setProposal(getMockProposal(id));
    }
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExecute = () => {
    setExecuting(true);
    // Simulate execution
    setTimeout(() => {
      setExecuting(false);
      if (proposal) {
        setProposal({ ...proposal, status: 'Executed' });
      }
    }, 3000);
  };

  if (!proposal) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-blue-100 text-blue-800';
      case 'Passed': return 'bg-green-100 text-green-800';
      case 'Failed': return 'bg-red-100 text-red-800';
      case 'Executed': return 'bg-purple-100 text-purple-800';
      case 'Queued': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active': return <Clock className="mr-1.5 h-4 w-4" />;
      case 'Passed': return <CheckCircle2 className="mr-1.5 h-4 w-4" />;
      case 'Failed': return <XCircle className="mr-1.5 h-4 w-4" />;
      case 'Executed': return <CheckCircle2 className="mr-1.5 h-4 w-4" />;
      case 'Queued': return <Clock className="mr-1.5 h-4 w-4" />;
      default: return null;
    }
  };

  const isReadyToExecute = proposal.status === 'Queued' && (!proposal.timelockEndsAt || new Date(proposal.timelockEndsAt) <= new Date());

  return (
    <div className="mx-auto max-w-5xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 px-4 md:px-0">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <button 
          onClick={() => navigate('/governance')}
          className="flex items-center text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Governance
        </button>
        
        <div className="flex gap-2">
          <button 
            onClick={handleShare}
            className="flex items-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold shadow-sm hover:bg-gray-50 transition-all active:scale-95"
          >
            {copied ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Share2 className="mr-2 h-4 w-4" />}
            {copied ? 'Copied!' : 'Share Proposal'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${getStatusColor(proposal.status)}`}>
                {getStatusIcon(proposal.status)}
                {proposal.status}
              </span>
              <span className="text-sm text-gray-500">ID: {proposal.id}</span>
            </div>
            <h1 className="text-3xl font-black text-gray-900 md:text-4xl leading-tight">
              {proposal.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center">
                <span className="mr-1.5 font-medium text-gray-400">Proposer:</span>
                <span className="font-mono text-gray-900">{proposal.proposer}</span>
              </div>
              <div className="h-1 w-1 rounded-full bg-gray-300" />
              <div>Created {new Date(proposal.createdAt).toLocaleDateString()}</div>
            </div>
          </div>

          <div className="prose prose-slate max-w-none rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold m-0">Description</h2>
              {proposal.ipfsHash && (
                <a 
                  href={`https://ipfs.io/ipfs/${proposal.ipfsHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-xs font-bold text-stellar hover:underline"
                >
                  View on IPFS <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              )}
            </div>
            <div className="whitespace-pre-wrap text-gray-600 leading-relaxed">
              {proposal.description}
            </div>
          </div>

          <VoterList voters={proposal.voters} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <VoteBreakdown 
            votesFor={proposal.votesFor} 
            votesAgainst={proposal.votesAgainst} 
            totalVotes={proposal.totalVotes} 
          />

          {proposal.status === 'Queued' && proposal.timelockEndsAt && (
            <TimelockCountdown timelockEndsAt={proposal.timelockEndsAt} />
          )}

          {proposal.status === 'Queued' && (
            <button
              onClick={handleExecute}
              disabled={!isReadyToExecute || executing}
              className={`w-full flex items-center justify-center rounded-2xl py-4 text-lg font-black shadow-lg transition-all ${
                isReadyToExecute 
                  ? 'bg-stellar text-white shadow-stellar/20 hover:bg-stellar-dark active:scale-95' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {executing ? (
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Play className="mr-2 h-5 w-5 fill-current" />
                  Execute Proposal
                </>
              )}
            </button>
          )}

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-gray-900">Discussion</h3>
            <p className="mb-4 text-sm text-gray-500">
              Join the community discussion about this proposal on our forum.
            </p>
            <a 
              href={proposal.discussionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center rounded-xl border border-stellar/20 bg-stellar/5 py-3 text-sm font-bold text-stellar hover:bg-stellar/10 transition-colors"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Forum Discussion
              <ExternalLink className="ml-2 h-3 w-3" />
            </a>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6">
            <h4 className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-400">Proposal Details</h4>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Created At</span>
                <span className="font-medium text-gray-900">{new Date(proposal.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Expires At</span>
                <span className="font-medium text-gray-900">{new Date(proposal.expiresAt).toLocaleString()}</span>
              </div>
              {proposal.timelockEndsAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Timelock Ends</span>
                  <span className="font-medium text-gray-900">{new Date(proposal.timelockEndsAt).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalDetail;
