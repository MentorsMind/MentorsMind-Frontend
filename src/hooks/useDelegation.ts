import { useState, useMemo, useCallback } from 'react';

type DelegationStatus = 'idle' | 'pending' | 'awaiting-signature' | 'signing' | 'success' | 'error';

export interface IncomingDelegation {
  address: string;
  power: number;
}

export interface DelegationHookResult {
  delegateTo: string | null;
  candidate: string;
  candidateEns?: string;
  isValid: boolean;
  validationError: string | null;
  willChainBeLimited: boolean;
  ownPower: number;
  receivedPower: number;
  totalPower: number;
  incomingDelegations: IncomingDelegation[];
  status: DelegationStatus;
  transferInFlight: boolean;
  setCandidate: (value: string) => void;
  resolveEnsName: (name: string) => void;
  delegate: () => Promise<void>;
  removeDelegation: () => Promise<void>;
}

const FAKE_ENS = {
  'alice.eth': 'GABCDE12345FAKEADDRESS000000000000000000000000',
  'bob.eth': 'GBOBDELEGATE0000000000000000000000000000000',
  'carol.eth': 'GCAROLDELEGATE00000000000000000000000000000',
};

const CHAIN_LIMITED_ADDRESSES = new Set([
  'GBOBDELEGATE0000000000000000000000000000000',
  'GCAROLDELEGATE00000000000000000000000000000',
]);

const MOCK_INCOMING: IncomingDelegation[] = [
  { address: 'G1DELEGATOR0000000000000000000000000000000', power: 1420 },
  { address: 'G2DELEGATOR0000000000000000000000000000000', power: 860 },
  { address: 'G3DELEGATOR0000000000000000000000000000000', power: 430 },
];

const isStellarAddress = (candidate: string): boolean =>
  /^G[A-Z2-7]{55}$/i.test(candidate.trim());

const normalizeAddress = (value: string) => value.trim();

export function useDelegation(): DelegationHookResult {
  const [delegateTo, setDelegateTo] = useState<string | null>(null);
  const [candidate, setCandidate] = useState('');
  const [candidateEns, setCandidateEns] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<DelegationStatus>('idle');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [transferInFlight, setTransferInFlight] = useState(false);

  const incomingDelegations = useMemo(() => MOCK_INCOMING, []);
  const ownPower = 1200;
  const receivedPower = useMemo(
    () => incomingDelegations.reduce((acc, item) => acc + item.power, 0),
    [incomingDelegations],
  );

  const totalPower = useMemo(() => {
    if (!delegateTo) return ownPower + receivedPower;
    return 0 + receivedPower;
  }, [delegateTo, ownPower, receivedPower]);

  const resolvedCandidate = useMemo(() => {
    const value = normalizeAddress(candidate);
    if (isStellarAddress(value)) return value;
    if (value.endsWith('.eth') && FAKE_ENS[value]) return FAKE_ENS[value];
    return null;
  }, [candidate]);

  const willChainBeLimited = useMemo(() => {
    if (!resolvedCandidate) return false;
    return CHAIN_LIMITED_ADDRESSES.has(resolvedCandidate);
  }, [resolvedCandidate]);

  const isValid = useMemo(() => {
    if (candidate.length === 0) return false;
    if (isStellarAddress(candidate)) return true;
    if (candidate.endsWith('.eth') && FAKE_ENS[candidate]) return true;
    return false;
  }, [candidate]);

  const resolveEnsName = useCallback((name: string) => {
    if (FAKE_ENS[name]) {
      setCandidateEns(name);
      setCandidate(FAKE_ENS[name]);
      setValidationError(null);
    } else {
      setCandidateEns(undefined);
      setValidationError('ENS name not found.');
    }
  }, []);

  const validateCandidate = useCallback(() => {
    const value = candidate.trim();
    if (!value) {
      setValidationError('Enter an address or ENS name.');
      return false;
    }

    if (isStellarAddress(value)) {
      setValidationError(null);
      setCandidateEns(undefined);
      return true;
    }

    if (value.endsWith('.eth')) {
      if (!FAKE_ENS[value]) {
        setValidationError('ENS name not found.');
        return false;
      }
      setValidationError(null);
      return true;
    }

    setValidationError('Invalid Stellar address or ENS-style name.');
    return false;
  }, [candidate]);

  const delegate = useCallback(async () => {
    if (!validateCandidate()) return;

    const resolved = isStellarAddress(candidate) ? normalizeAddress(candidate) : FAKE_ENS[candidate.trim()];
    if (!resolved) {
      setValidationError('Unable to resolve delegation address.');
      return;
    }

    setStatus('awaiting-signature');
    await new Promise((resolve) => setTimeout(resolve, 400));

    setStatus('signing');
    await new Promise((resolve) => setTimeout(resolve, 800));

    setTransferInFlight(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setDelegateTo(resolved);
    setStatus('success');

    setTimeout(() => setTransferInFlight(false), 1100);
  }, [candidate, validateCandidate]);

  const removeDelegation = useCallback(async () => {
    if (!delegateTo) return;
    setStatus('awaiting-signature');
    await new Promise((resolve) => setTimeout(resolve, 250));

    setStatus('signing');
    await new Promise((resolve) => setTimeout(resolve, 850));

    setDelegateTo(null);
    setStatus('success');
    setTransferInFlight(true);

    setTimeout(() => setTransferInFlight(false), 800);
  }, [delegateTo]);

  return {
    delegateTo,
    candidate,
    candidateEns,
    isValid,
    validationError,
    willChainBeLimited,
    ownPower,
    receivedPower,
    totalPower,
    incomingDelegations,
    status,
    transferInFlight,
    setCandidate,
    resolveEnsName,
    delegate,
    removeDelegation,
  };
}
