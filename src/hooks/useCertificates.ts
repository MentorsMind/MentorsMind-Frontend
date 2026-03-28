import { useState, useEffect, useCallback } from 'react';
import type { LearningCertificate } from '../types/learner.types';

/** Simulated contract/API latency (ms) — replace with real Horizon/Soroban read. */
const FETCH_DELAY_MS = 700;

/**
 * Mock certificates for development until contract indexer is wired.
 * Replace `fetchCertificates` body with real RPC when available.
 */
async function fetchCertificates(learnerId: string): Promise<LearningCertificate[]> {
  if (!learnerId) {
    return [];
  }
  await new Promise((r) => setTimeout(r, FETCH_DELAY_MS));
  return [
    {
      id: 'cert-1',
      skillName: 'Stellar Smart Contracts (Soroban)',
      mentorName: 'Dr. Amina Okonkwo',
      sessionsCompleted: 12,
      issuedAt: '2025-11-18T14:30:00.000Z',
      status: 'verified',
      contractId: 'CDL...MOCK1',
      mintTxHash: 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef12345678',
      verificationToken: 'sb-learner-cert-stellar-001',
      mentorPublicKey: 'GDR...MENTOR1',
    },
    {
      id: 'cert-2',
      skillName: 'TypeScript & React Architecture',
      mentorName: 'Jordan Lee',
      sessionsCompleted: 8,
      issuedAt: '2025-09-02T10:00:00.000Z',
      status: 'verified',
      contractId: 'CDL...MOCK2',
      mintTxHash: 'b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567890',
      verificationToken: 'sb-learner-cert-react-002',
      mentorPublicKey: 'GBB...MENTOR2',
    },
    {
      id: 'cert-3',
      skillName: 'Legacy: Web3 Security Basics',
      mentorName: 'Sam Rivera',
      sessionsCompleted: 3,
      issuedAt: '2024-03-10T16:45:00.000Z',
      status: 'revoked',
      verificationToken: 'sb-learner-cert-revoked-003',
      mintTxHash: 'c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567890ab',
    },
  ];
}

export interface UseCertificatesResult {
  certificates: LearningCertificate[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useCertificates(learnerId: string): UseCertificatesResult {
  const [certificates, setCertificates] = useState<LearningCertificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchCertificates(learnerId);
        if (!cancelled) {
          setCertificates(data);
        }
      } catch {
        if (!cancelled) {
          setError('Could not load certificates. Try again later.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [learnerId, tick]);

  return { certificates, isLoading, error, refetch };
}
