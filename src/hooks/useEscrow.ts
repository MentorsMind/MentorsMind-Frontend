import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { 
  EscrowContract, 
  EscrowStatus, 
  EscrowDisputeRequest,
  EscrowTimelineEvent 
} from '../types/payment.types';
import { listPayments } from '../services/payment.service';
import { 
  releaseFunds, 
  disputeEscrow as disputeEscrowContract, 
  getEscrow 
} from '../services/escrow.service';
import { useFreighter } from './useFreighter';
import { STELLAR_CONFIG } from '../config/stellar.config';

interface UseEscrowOptions {
  userRole: 'mentee' | 'mentor';
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
  const [, setTick] = useState(0);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { walletInfo, signTransaction } = useFreighter();

  // Drive re-renders every second so countdown displays update
  useEffect(() => {
    countdownIntervalRef.current = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);

    return () => {
      if (countdownIntervalRef.current !== null) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
  }, []);

  // Fetch escrows (real implementation)
  const fetchEscrows = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch payments from backend
      const payments = await listPayments();
      
      // Filter for payments that have an escrow and belong to the user
      // Note: In a real app, the API should handle filtering, but we follow the previous mock logic
      const paymentsWithEscrow = payments.filter(p => p.escrowId);
      
      // Map payments to EscrowContract type
      // For more detailed data, we could fetch from the Soroban contract for each,
      // but to avoid excessive RPC calls, we map the available payment data
      const mappedEscrows: EscrowContract[] = await Promise.all(paymentsWithEscrow.map(async (p) => {
        let contractDetails = null;
        try {
          if (p.escrowId) {
            contractDetails = await getEscrow(Number(p.escrowId));
          }
        } catch (e) {
          console.error(`Failed to fetch contract details for escrow ${p.escrowId}`, e);
        }

        const createdAt = p.createdAt || new Date().toISOString();
        const sessionDate = contractDetails ? new Date(contractDetails.createdAt).toISOString() : createdAt; // Fallback
        
        // Calculate release and dispute windows (72h after session by default)
        const sessionTime = new Date(sessionDate).getTime();
        const autoReleaseAt = new Date(sessionTime + 24 * 60 * 60 * 1000).toISOString(); // 24h
        const disputeWindowEndsAt = new Date(sessionTime + 48 * 60 * 60 * 1000).toISOString(); // 48h

        return {
          id: p.escrowId || p.id,
          sessionId: p.sessionId,
          contractAddress: STELLAR_CONFIG.contractId, // Platform escrow contract
          status: (contractDetails?.status.toLowerCase() as EscrowStatus) || (p.status as EscrowStatus) || 'active',
          amount: Number(p.amount),
          asset: p.asset,
          learnerId: contractDetails?.learner || '',
          mentorId: contractDetails?.mentor || '',
          createdAt: createdAt,
          sessionDate: sessionDate,
          autoReleaseAt: autoReleaseAt,
          disputeWindowEndsAt: disputeWindowEndsAt,
          stellarExpertUrl: p.stellarTxHash ? `https://stellar.expert/explorer/testnet/tx/${p.stellarTxHash}` : undefined,
          timeline: [
            {
              stage: 'created',
              timestamp: createdAt,
              description: 'Escrow contract created and funded',
              transactionHash: p.stellarTxHash
            }
          ]
        };
      }));
      
      setEscrows(mappedEscrows);
    } catch (err) {
      console.error('Escrow fetch error:', err);
      setError('Failed to load escrow contracts');
    } finally {
      setLoading(false);
    }
  }, []);

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
    if (escrow.mentorId && escrow.mentorId !== userId) return false;
    
    // Session must be completed (session date has passed)
    const sessionDate = new Date(escrow.sessionDate);
    return new Date() >= sessionDate;
  }, [userRole, userId]);

  // Check if mentee can dispute escrow
  const canDispute = useCallback((escrow: EscrowContract): boolean => {
    if (userRole !== 'mentee') return false;
    if (escrow.status !== 'active') return false;
    if (escrow.learnerId && escrow.learnerId !== userId) return false;
    
    return isWithinDisputeWindow(escrow);
  }, [userRole, userId]);

  // Check if within dispute window
  const isWithinDisputeWindow = useCallback((escrow: EscrowContract): boolean => {
    const now = new Date().getTime();
    const windowEnd = new Date(escrow.disputeWindowEndsAt).getTime();
    return now <= windowEnd;
  }, []);

  // Release escrow (real implementation)
  const releaseEscrow = useCallback(async (escrowId: string) => {
    if (!walletInfo?.publicKey) {
      setError('Wallet not connected');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Wrapper function to bridge useFreighter's signTransaction and escrow.service's expectation
      const signXdr = async (xdr: string) => {
        const { Transaction } = await import('@stellar/stellar-sdk');
        const tx = new Transaction(xdr, STELLAR_CONFIG.network);
        const signedXdr = await signTransaction(tx);
        return signedXdr;
      };

      await releaseFunds(
        Number(escrowId),
        walletInfo.publicKey,
        signXdr
      );
      
      // Refresh list after successful release
      await fetchEscrows();
    } catch (err) {
      console.error('Release escrow error:', err);
      setError('Failed to release escrow');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [walletInfo, signTransaction, fetchEscrows]);

  // Dispute escrow (real implementation)
  const disputeEscrow = useCallback(async (request: Omit<EscrowDisputeRequest, 'filedBy' | 'filedAt'>) => {
    if (!walletInfo?.publicKey) {
      setError('Wallet not connected');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const signXdr = async (xdr: string) => {
        const { Transaction } = await import('@stellar/stellar-sdk');
        const tx = new Transaction(xdr, STELLAR_CONFIG.network);
        const signedXdr = await signTransaction(tx);
        return signedXdr;
      };

      await disputeEscrowContract(
        Number(request.escrowId),
        walletInfo.publicKey,
        signXdr
      );
      
      // Refresh list after successful dispute
      await fetchEscrows();
    } catch (err) {
      console.error('Dispute escrow error:', err);
      setError('Failed to file dispute');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [walletInfo, signTransaction, fetchEscrows]);

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
