import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { 
  EscrowContract, 
  EscrowStatus, 
  EscrowDisputeRequest,
  EscrowTimelineEvent 
} from '../types/payment.types';
import { useFreighter } from './useFreighter';
import { TransactionBuilder, Networks, Operation } from '@stellar/stellar-sdk';

interface UseEscrowOptions {
  userRole: 'learner' | 'mentor';
  userId: string;
}

interface UseEscrowReturn {
  escrows: EscrowContract[];
  loading: boolean;
  error: string | null;
  releaseEscrow: (escrowId: string) => Promise<void>;
  disputeEscrow: (request: Omit<EscrowDisputeRequest, 'filedBy' | 'filedAt'>) => Promise<void>;
  getEscrowBySessionId: (sessionId: string) => EscrowContract | undefined;
  getCountdown: (autoReleaseAt: string) => string;
  canRelease: (escrow: EscrowContract) => boolean;
  canDispute: (escrow: EscrowContract) => boolean;
  isWithinDisputeWindow: (escrow: EscrowContract) => boolean;
  refreshEscrows: () => Promise<void>;
}

// Mock data for demonstration
const MOCK_ESCROWS: EscrowContract[] = [
  {
    id: 'escrow-001',
    sessionId: 'session-001',
    contractAddress: 'GDRFGPDY3BVCJFDYKEJFVFPYQJZLQJ4JFWVQX2W2Z3J7B4V3VJ5VJ6V7',
    status: 'active',
    amount: 150,
    asset: 'USDC',
    learnerId: 'learner-001',
    mentorId: 'mentor-001',
    createdAt: '2026-03-20T10:00:00Z',
    sessionDate: '2026-03-25T14:00:00Z',
    autoReleaseAt: '2026-03-26T14:00:00Z',
    disputeWindowEndsAt: '2026-03-27T14:00:00Z',
    stellarExpertUrl: 'https://stellar.expert/explorer/testnet/account/GDRFGPDY3BVCJFDYKEJFVFPYQJZLQJ4JFWVQX2W2Z3J7B4V3VJ5VJ6V7',
    timeline: [
      {
        stage: 'created',
        timestamp: '2026-03-20T10:00:00Z',
        description: 'Escrow contract created and funded',
        transactionHash: 'abc123def456789012345678901234567890123456789012345678901234abcd'
      },
      {
        stage: 'session',
        timestamp: '2026-03-25T14:00:00Z',
        description: 'Session completed successfully'
      }
    ]
  },
  {
    id: 'escrow-002',
    sessionId: 'session-002',
    contractAddress: 'GBC3SGF3J7B4V3VJ5VJ6V7GDRFGPDY3BVCJFDYKEJFVFPYQJZLQJ4JFWV',
    status: 'released',
    amount: 200,
    asset: 'XLM',
    learnerId: 'learner-001',
    mentorId: 'mentor-002',
    createdAt: '2026-03-15T09:00:00Z',
    sessionDate: '2026-03-18T16:00:00Z',
    autoReleaseAt: '2026-03-19T16:00:00Z',
    disputeWindowEndsAt: '2026-03-20T16:00:00Z',
    releasedAt: '2026-03-18T17:30:00Z',
    stellarExpertUrl: 'https://stellar.expert/explorer/testnet/account/GBC3SGF3J7B4V3VJ5VJ6V7GDRFGPDY3BVCJFDYKEJFVFPYQJZLQJ4JFWV',
    timeline: [
      {
        stage: 'created',
        timestamp: '2026-03-15T09:00:00Z',
        description: 'Escrow contract created and funded',
        transactionHash: 'def456abc789012345678901234567890123456789012345678901234567890ef'
      },
      {
        stage: 'session',
        timestamp: '2026-03-18T16:00:00Z',
        description: 'Session completed successfully'
      },
      {
        stage: 'release',
        timestamp: '2026-03-18T17:30:00Z',
        description: 'Funds released to mentor',
        transactionHash: '789012345678901234567890123456789012345678901234567890123456789012'
      }
    ]
  },
  {
    id: 'escrow-003',
    sessionId: 'session-003',
    contractAddress: 'GFDYKEJFVFPYQJZLQJ4JFWVQX2W2Z3J7B4V3VJ5VJ6V7GDRFGPDY3BVCJF',
    status: 'disputed',
    amount: 175,
    asset: 'USDC',
    learnerId: 'learner-001',
    mentorId: 'mentor-003',
    createdAt: '2026-03-10T11:00:00Z',
    sessionDate: '2026-03-12T13:00:00Z',
    autoReleaseAt: '2026-03-13T13:00:00Z',
    disputeWindowEndsAt: '2026-03-14T13:00:00Z',
    stellarExpertUrl: 'https://stellar.expert/explorer/testnet/account/GFDYKEJFVFPYQJZLQJ4JFWVQX2W2Z3J7B4V3VJ5VJ6V7GDRFGPDY3BVCJF',
    timeline: [
      {
        stage: 'created',
        timestamp: '2026-03-10T11:00:00Z',
        description: 'Escrow contract created and funded',
        transactionHash: 'a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890'
      },
      {
        stage: 'session',
        timestamp: '2026-03-12T13:00:00Z',
        description: 'Session marked as completed'
      },
      {
        stage: 'disputed',
        timestamp: '2026-03-12T15:00:00Z',
        description: 'Dispute filed by learner'
      }
    ],
    dispute: {
      id: 'dispute-001',
      reason: 'mentor_no_show',
      description: 'Mentor did not attend the scheduled session',
      filedBy: 'learner',
      filedAt: '2026-03-12T15:00:00Z',
      status: 'pending'
    }
  },
  {
    id: 'escrow-004',
    sessionId: 'session-004',
    contractAddress: 'GVFPYQJZLQJ4JFWVQX2W2Z3J7B4V3VJ5VJ6V7GDRFGPDY3BVCJFDYKEJF',
    status: 'refunded',
    amount: 120,
    asset: 'XLM',
    learnerId: 'learner-001',
    mentorId: 'mentor-004',
    createdAt: '2026-03-05T08:00:00Z',
    sessionDate: '2026-03-08T10:00:00Z',
    autoReleaseAt: '2026-03-09T10:00:00Z',
    disputeWindowEndsAt: '2026-03-10T10:00:00Z',
    releasedAt: '2026-03-09T12:00:00Z',
    stellarExpertUrl: 'https://stellar.expert/explorer/testnet/account/GVFPYQJZLQJ4JFWVQX2W2Z3J7B4V3VJ5VJ6V7GDRFGPDY3BVCJFDYKEJF',
    timeline: [
      {
        stage: 'created',
        timestamp: '2026-03-05T08:00:00Z',
        description: 'Escrow contract created and funded',
        transactionHash: 'b2c3d4e5f6a1789012345678901234567890123456789012345678901234567890'
      },
      {
        stage: 'session',
        timestamp: '2026-03-08T10:00:00Z',
        description: 'Session cancelled by mentor'
      },
      {
        stage: 'disputed',
        timestamp: '2026-03-08T10:30:00Z',
        description: 'Dispute filed by learner'
      },
      {
        stage: 'refunded',
        timestamp: '2026-03-09T12:00:00Z',
        description: 'Funds refunded to learner',
        transactionHash: 'c3d4e5f6a1b2789012345678901234567890123456789012345678901234567890'
      }
    ],
    dispute: {
      id: 'dispute-002',
      reason: 'session_cancelled',
      description: 'Session was cancelled by mentor without notice',
      filedBy: 'learner',
      filedAt: '2026-03-08T10:30:00Z',
      status: 'resolved',
      resolution: {
        outcome: 'refunded',
        resolvedAt: '2026-03-09T12:00:00Z',
        resolverId: 'admin-001',
        notes: 'Mentor confirmed cancellation, full refund approved'
      }
    }
  }
];

const DISPUTE_REASONS = [
  { value: 'mentor_no_show', label: 'Mentor did not show up' },
  { value: 'unsatisfactory_session', label: 'Session was unsatisfactory' },
  { value: 'session_cancelled', label: 'Session was cancelled' },
  { value: 'technical_issues', label: 'Technical issues prevented session' },
  { value: 'other', label: 'Other reason' }
];

export const useEscrow = ({ userRole, userId }: UseEscrowOptions): UseEscrowReturn => {
  const [escrows, setEscrows] = useState<EscrowContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { isConnected, signTransaction } = useFreighter();

  // Fetch escrows (mock implementation)
  const fetchEscrows = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Filter escrows based on user role and ID
      const filteredEscrows = MOCK_ESCROWS.filter(escrow => 
        userRole === 'learner' 
          ? escrow.learnerId === userId 
          : escrow.mentorId === userId
      );
      
      setEscrows(filteredEscrows.length > 0 ? filteredEscrows : MOCK_ESCROWS);
    } catch (err) {
      setError('Failed to load escrow contracts');
    } finally {
      setLoading(false);
    }
  }, [userRole, userId]);

  // Initial fetch
  useEffect(() => {
    fetchEscrows();
  }, [fetchEscrows]);

  // Get escrow by session ID
  const getEscrowBySessionId = useCallback((sessionId: string) => {
    return escrows.find(escrow => escrow.sessionId === sessionId);
  }, [escrows]);

  // Calculate countdown timer
  const getCountdown = useCallback((autoReleaseAt: string): string => {
    const now = new Date().getTime();
    const releaseTime = new Date(autoReleaseAt).getTime();
    const diff = releaseTime - now;

    if (diff <= 0) return '00:00:00';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // Check if mentor can release escrow
  const canRelease = useCallback((escrow: EscrowContract): boolean => {
    if (userRole !== 'mentor') return false;
    if (escrow.status !== 'active') return false;
    if (escrow.mentorId !== userId) return false;
    
    // Session must be completed (session date has passed)
    const sessionDate = new Date(escrow.sessionDate);
    return new Date() >= sessionDate;
  }, [userRole, userId]);

  // Check if learner can dispute escrow
  const canDispute = useCallback((escrow: EscrowContract): boolean => {
    if (userRole !== 'learner') return false;
    if (escrow.status !== 'active') return false;
    if (escrow.learnerId !== userId) return false;
    
    return isWithinDisputeWindow(escrow);
  }, [userRole, userId]);

  // Check if within dispute window
  const isWithinDisputeWindow = useCallback((escrow: EscrowContract): boolean => {
    const now = new Date().getTime();
    const windowEnd = new Date(escrow.disputeWindowEndsAt).getTime();
    return now <= windowEnd;
  }, []);

  // Release escrow (mock implementation)
  const releaseEscrow = useCallback(async (escrowId: string) => {
    setLoading(true);
    
    try {
      if (userRole === 'mentor' && !isConnected) {
        throw new Error('Please connect your Freighter wallet to sign the release transaction.');
      }

      if (userRole === 'mentor') {
        const mockAccount = { accountId: () => 'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGZWM9CQJKR3BSQNEWVZOR', sequenceNumber: () => '1', incrementSequenceNumber: () => {} } as any;
        const tx = new TransactionBuilder(mockAccount, { fee: '100', networkPassphrase: Networks.TESTNET })
          .addOperation(Operation.manageData({ name: 'action', value: 'releaseEscrow' }))
          .addOperation(Operation.manageData({ name: 'escrowId', value: escrowId }))
          .setTimeout(30)
          .build();

        const signedTx = await signTransaction(tx);
        if (!signedTx) throw new Error('Transaction was rejected or failed');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setEscrows(prev => prev.map(escrow => {
        if (escrow.id !== escrowId) return escrow;
        
        const releaseEvent: EscrowTimelineEvent = {
          stage: 'release',
          timestamp: new Date().toISOString(),
          description: 'Funds released to mentor',
          transactionHash: Array.from({ length: 64 }, () => 
            Math.floor(Math.random() * 16).toString(16)
          ).join('')
        };
        
        return {
          ...escrow,
          status: 'released',
          releasedAt: new Date().toISOString(),
          timeline: [...escrow.timeline, releaseEvent]
        };
      }));
    } catch (err) {
      setError('Failed to release escrow');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Dispute escrow (mock implementation)
  const disputeEscrow = useCallback(async (request: Omit<EscrowDisputeRequest, 'filedBy' | 'filedAt'>) => {
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setEscrows(prev => prev.map(escrow => {
        if (escrow.id !== request.escrowId) return escrow;
        
        const disputeEvent: EscrowTimelineEvent = {
          stage: 'disputed',
          timestamp: new Date().toISOString(),
          description: 'Dispute filed by learner'
        };
        
        return {
          ...escrow,
          status: 'disputed',
          dispute: {
            id: `dispute-${Date.now()}`,
            reason: request.reason,
            description: request.description,
            filedBy: 'learner',
            filedAt: new Date().toISOString(),
            status: 'pending'
          },
          timeline: [...escrow.timeline, disputeEvent]
        };
      }));
    } catch (err) {
      setError('Failed to file dispute');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh escrows
  const refreshEscrows = useCallback(async () => {
    await fetchEscrows();
  }, [fetchEscrows]);

  return {
    escrows,
    loading,
    error,
    releaseEscrow,
    disputeEscrow,
    getEscrowBySessionId,
    getCountdown,
    canRelease,
    canDispute,
    isWithinDisputeWindow,
    refreshEscrows
  };
};

export { DISPUTE_REASONS };
export default useEscrow;
