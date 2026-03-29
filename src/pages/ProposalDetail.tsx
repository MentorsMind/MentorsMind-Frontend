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
  Check,
  Shield,
  Calendar,
  User,
  Hash
} from 'lucide-react';
import VoteBreakdown from '../components/governance/VoteBreakdown';
import VoterList from '../components/governance/VoterList';
import TimelockCountdown from '../components/governance/TimelockCountdown';
import QuorumProgress from '../components/governance/QuorumProgress';
import VoteModal from '../components/governance/VoteModal';
import { Proposal } from '../types/governance.types';

const ProposalDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [copied, setCopied] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [showVoteModal, setShowVoteModal] = useState<{ choice: 'Yes' | 'No' } | null>(null);

  // Mock metrics for quorum
  const totalVotingPower = 12400000;

  useEffect(() => {
    if (id) {
      // Mock fetch
      setProposal({
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
          { address: 'GA...1A2B', choice: 'Yes', power: 500000, timestamp: '2024-03-21T10:00:00Z' },
          { address: 'GB...3C4D', choice: 'No', power: 300000, timestamp: '2024-03-22T08:00:00Z' },
          { address: 'GC...5E6F', choice: 'Yes', power: 250000, timestamp: '2024-03-22T14:30:00Z' },
          { address: 'GD...7G8H', choice: 'Yes', power: 500000, timestamp: '2024-03-23T09:15:00Z' },
          { address: 'GE...9I0J', choice: 'No', power: 150000, timestamp: '2024-03-24T16:45:00Z' },
        ],
        createdAt: '2024-03-20T10:00:00Z',
        expiresAt: '2024-03-27T10:00:00Z',
        timelockEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
        discussionUrl: 'https://forum.mentorminds.io/t/did-proposal/123',
        ipfsHash: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
        quorumReached: true,
        quorumThreshold: 1240000
      });
    }
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExecute = () => {
    setExecuting(true);
    setTimeout(() => {
      setExecuting(false);
      if (proposal) {
        setProposal({ ...proposal, status: 'Executed' });
      }
    }, 3000);
  };

  if (!proposal) return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-12 h-12 border-4 border-stellar/20 border-t-stellar rounded-full animate-spin" />
    </div>
  );

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'Active': return { color: 'bg-blue-100 text-blue-800', icon: <Clock className="mr-1.5 h-4 w-4" /> };
      case 'Passed': return { color: 'bg-green-100 text-green-800', icon: <CheckCircle2 className="mr-1.5 h-4 w-4" /> };
      case 'Failed': return { color: 'bg-red-100 text-red-800', icon: <XCircle className="mr-1.5 h-4 w-4" /> };
      case 'Executed': return { color: 'bg-purple-100 text-purple-800', icon: <CheckCircle2 className="mr-1.5 h-4 w-4" /> };
      case 'Queued': return { color: 'bg-amber-100 text-amber-800', icon: <Clock className="mr-1.5 h-4 w-4" /> };
      default: return { color: 'bg-gray-100 text-gray-800', icon: null };
    }
  };

  const { color, icon } = getStatusDisplay(proposal.status);
  const isReadyToExecute = proposal.status === 'Queued' && (!proposal.timelockEndsAt || new Date(proposal.timelockEndsAt) <= new Date());

  return (
    <div className="mx-auto max-w-6xl pb-20 px-4 md:px-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Navigation Header */}
      <nav className="py-8 flex items-center justify-between">
        <button 
          onClick={() => navigate('/governance')}
          className="group flex items-center text-sm font-bold text-gray-500 hover:text-stellar transition-colors"
        >
          <div className="p-2 rounded-xl bg-white border border-gray-100 shadow-sm mr-3 group-hover:border-stellar/30 group-hover:bg-stellar/5 transition-all">
            <ArrowLeft className="h-4 w-4" />
          </div>
          Back to Dashboard
        </button>
        
        <button 
          onClick={handleShare}
          className="flex items-center rounded-2xl border border-gray-100 bg-white px-5 py-2.5 text-xs font-black uppercase tracking-widest shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          {copied ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Share2 className="mr-2 h-4 w-4" />}
          {copied ? 'Copied' : 'Share'}
        </button>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-8">
          <section className="space-y-6">
            <div className="flex flex-wrap items-center gap-4">
              <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest ${color}`}>
                {icon}
                {proposal.status}
              </span>
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <Hash className="h-3 w-3" />
                ID: {proposal.id}
              </div>
            </div>
            
            <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-[1.1]">
              {proposal.title}
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
                <div className="p-2.5 rounded-xl bg-stellar/5 text-stellar">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">Proposer</span>
                  <span className="text-xs font-black text-gray-900 font-mono tracking-tighter">{proposal.proposer}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
                <div className="p-2.5 rounded-xl bg-stellar/5 text-stellar">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">Created</span>
                  <span className="text-xs font-black text-gray-900">{new Date(proposal.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
                <div className="p-2.5 rounded-xl bg-stellar/5 text-stellar">
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">Quorum</span>
                  <span className={`text-xs font-black ${proposal.quorumReached ? 'text-green-600' : 'text-amber-600'}`}>
                    {proposal.quorumReached ? 'Met' : 'Required'}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">Description</h2>
              {proposal.ipfsHash && (
                <a 
                  href={`https://ipfs.io/ipfs/${proposal.ipfsHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-[10px] font-black uppercase tracking-widest text-stellar hover:underline"
                >
                  IPFS Record <ExternalLink className="ml-1.5 h-3 w-3" />
                </a>
              )}
            </div>
            <div className="p-10 prose prose-slate max-w-none">
              <div className="whitespace-pre-wrap text-gray-600 leading-relaxed font-medium">
                {proposal.description}
              </div>
            </div>
          </section>

          <VoterList voters={proposal.voters} />
        </div>

        {/* Sidebar Info & Actions */}
        <aside className="lg:col-span-4 space-y-8">
          <VoteBreakdown 
            votesFor={proposal.votesFor} 
            votesAgainst={proposal.votesAgainst} 
            totalVotes={proposal.totalVotes} 
          />

          <QuorumProgress 
            currentParticipation={proposal.totalVotes}
            threshold={proposal.quorumThreshold}
            totalVotingPower={totalVotingPower}
          />

          {proposal.status === 'Active' && (
            <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={() => setShowVoteModal({ choice: 'Yes' })}
                className="w-full py-4 rounded-2xl bg-green-600 text-white font-black text-sm shadow-xl shadow-green-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Vote Yes
              </button>
              <button 
                onClick={() => setShowVoteModal({ choice: 'No' })}
                className="w-full py-4 rounded-2xl bg-red-600 text-white font-black text-sm shadow-xl shadow-red-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Vote No
              </button>
            </div>
          )}

          {proposal.status === 'Queued' && (
            <div className="space-y-6">
              <TimelockCountdown timelockEndsAt={proposal.timelockEndsAt!} />
              <button
                onClick={handleExecute}
                disabled={!isReadyToExecute || executing}
                className={`w-full flex items-center justify-center rounded-2xl py-5 text-sm font-black shadow-xl transition-all ${
                  isReadyToExecute 
                    ? 'bg-stellar text-white shadow-stellar/20 hover:scale-[1.02] active:scale-[0.98]' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {executing ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4 fill-current" />
                    Execute Proposal
                  </>
                )}
              </button>
            </div>
          )}

          <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-gray-900 leading-tight">Join the Discussion</h3>
            <p className="text-sm text-gray-500 font-medium">
              Share your thoughts and read what others are saying about this proposal on the community forum.
            </p>
            <a 
              href={proposal.discussionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center rounded-2xl bg-stellar text-white py-4 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-stellar/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Forum Thread
              <ExternalLink className="ml-2 h-3.5 w-3.5 opacity-50" />
            </a>
          </div>
        </aside>
      </div>

      {showVoteModal && (
        <VoteModal 
          isOpen={true}
          onClose={() => setShowVoteModal(null)}
          choice={showVoteModal.choice}
          votingPower={3910} // Using same mock VP as dashboard
          proposal={{ id: proposal.id, title: proposal.title }}
          onConfirm={async () => {
             await new Promise(r => setTimeout(r, 2000));
             setShowVoteModal(null);
             // In real app, refresh state
          }}
        />
      )}
    </div>
  );
};

export default ProposalDetail;
