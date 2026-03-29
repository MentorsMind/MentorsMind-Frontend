import { Account, Networks, Operation, TransactionBuilder } from '@stellar/stellar-sdk';
import { useCallback, useMemo, useState } from 'react';
import type { MultiSeriesDataPoint } from '../types/charts.types';

export type SignatureMode = 'freighter' | 'preview';
export type AcceptanceState = 'idle' | 'connecting' | 'awaiting-signature' | 'accepted' | 'error';

export interface ISAOffer {
  id: string;
  title: string;
  funderName: string;
  fundedAmount: number;
  sharePercent: number;
  capMultiple: number;
  durationMonths: number;
  targetRole: string;
  useOfFunds: string;
  timelineLabel: string;
  status: 'open' | 'accepted';
}

export interface ISAAgreement {
  id: string;
  learnerName: string;
  funderName: string;
  title: string;
  fundedAmount: number;
  repaidAmount: number;
  remainingCap: number;
  totalCap: number;
  sharePercent: number;
  capMultiple: number;
  durationMonths: number;
  monthsLeft: number;
  signatureLabel: string;
  signatureMode: SignatureMode;
  status: 'active' | 'completed';
  completedAt?: string;
}

export interface FunderPortfolioItem {
  id: string;
  learnerName: string;
  track: string;
  fundedAmount: number;
  returnedAmount: number;
  remainingCap: number;
  sharePercent: number;
  capMultiple: number;
  monthsLeft: number;
  status: 'Active' | 'Cap reached';
  nextPayoutAmount: number;
}

export interface ISAExplainerStep {
  title: string;
  detail: string;
}

export interface ISAFAQItem {
  question: string;
  answer: string;
}

interface FreighterApiLike {
  requestAccess?: () => Promise<string>;
  signTransaction?: (xdr: string, opts?: { network?: string; accountToSign?: string }) => Promise<string>;
}

const previewSignatureDelayMs = 900;

const initialOffers: ISAOffer[] = [
  {
    id: 'isa-react-launch',
    title: 'React Launch Sprint',
    funderName: 'North Star Learning Pool',
    fundedAmount: 6000,
    sharePercent: 8,
    capMultiple: 1.7,
    durationMonths: 18,
    targetRole: 'Frontend engineer',
    useOfFunds: 'Mentorship, interview prep, and portfolio polish',
    timelineLabel: 'Starts repayments after first paid role',
    status: 'open',
  },
  {
    id: 'isa-data-apprentice',
    title: 'Data Apprentice Track',
    funderName: 'Signal Capital',
    fundedAmount: 4200,
    sharePercent: 6,
    capMultiple: 1.5,
    durationMonths: 15,
    targetRole: 'Junior data analyst',
    useOfFunds: 'SQL coaching, capstone review, and referrals',
    timelineLabel: 'Repayments begin once monthly income clears threshold',
    status: 'open',
  },
  {
    id: 'isa-stellar-builder',
    title: 'Stellar Builder Residency',
    funderName: 'Anchor Collective',
    fundedAmount: 7800,
    sharePercent: 9,
    capMultiple: 1.8,
    durationMonths: 20,
    targetRole: 'Web3 product engineer',
    useOfFunds: 'Protocol mentoring, demos, and demo-day support',
    timelineLabel: 'Quarterly reporting with monthly earnings share',
    status: 'open',
  },
];

const initialRepaymentHistory: MultiSeriesDataPoint[] = [
  { label: 'Jan', sharedAmount: 120, reportedIncome: 1600 },
  { label: 'Feb', sharedAmount: 146, reportedIncome: 1950 },
  { label: 'Mar', sharedAmount: 171, reportedIncome: 2280 },
  { label: 'Apr', sharedAmount: 208, reportedIncome: 2780 },
  { label: 'May', sharedAmount: 236, reportedIncome: 3150 },
  { label: 'Jun', sharedAmount: 263, reportedIncome: 3505 },
];

const initialActiveAgreement: ISAAgreement = {
  id: 'active-isa-2026',
  learnerName: 'Amara',
  funderName: 'North Star Learning Pool',
  title: 'Frontend Launch ISA',
  fundedAmount: 4500,
  repaidAmount: 1860,
  remainingCap: 5790,
  totalCap: 7650,
  sharePercent: 7,
  capMultiple: 1.7,
  durationMonths: 18,
  monthsLeft: 10,
  signatureLabel: 'Freighter | GDU2...A8PK',
  signatureMode: 'freighter',
  status: 'active',
};

const completedAgreement: ISAAgreement = {
  id: 'isa-complete-2025',
  learnerName: 'Kemi',
  funderName: 'Anchor Collective',
  title: 'Design Systems Accelerator',
  fundedAmount: 3000,
  repaidAmount: 5400,
  remainingCap: 0,
  totalCap: 5400,
  sharePercent: 8,
  capMultiple: 1.8,
  durationMonths: 14,
  monthsLeft: 0,
  signatureLabel: 'Freighter | GCO3...91XT',
  signatureMode: 'freighter',
  status: 'completed',
  completedAt: 'June 2026',
};

const initialPortfolioItems: FunderPortfolioItem[] = [
  {
    id: 'portfolio-1',
    learnerName: 'Amara',
    track: 'Frontend Launch ISA',
    fundedAmount: 4500,
    returnedAmount: 1860,
    remainingCap: 5790,
    sharePercent: 7,
    capMultiple: 1.7,
    monthsLeft: 10,
    status: 'Active',
    nextPayoutAmount: 263,
  },
  {
    id: 'portfolio-2',
    learnerName: 'David',
    track: 'Data Apprentice Track',
    fundedAmount: 4200,
    returnedAmount: 960,
    remainingCap: 5340,
    sharePercent: 6,
    capMultiple: 1.5,
    monthsLeft: 12,
    status: 'Active',
    nextPayoutAmount: 148,
  },
  {
    id: 'portfolio-3',
    learnerName: 'Kemi',
    track: 'Design Systems Accelerator',
    fundedAmount: 3000,
    returnedAmount: 5400,
    remainingCap: 0,
    sharePercent: 8,
    capMultiple: 1.8,
    monthsLeft: 0,
    status: 'Cap reached',
    nextPayoutAmount: 0,
  },
];

const initialPortfolioReturns: MultiSeriesDataPoint[] = [
  { label: 'Jan', returned: 210, deployed: 11700 },
  { label: 'Feb', returned: 296, deployed: 11700 },
  { label: 'Mar', returned: 338, deployed: 11700 },
  { label: 'Apr', returned: 402, deployed: 11700 },
  { label: 'May', returned: 471, deployed: 11700 },
  { label: 'Jun', returned: 563, deployed: 11700 },
];

const explainerSteps: ISAExplainerStep[] = [
  {
    title: '1. Receive an offer',
    detail: 'Funders propose capital with a share percentage, repayment cap, and time window so learners know the exact downside and upside boundaries.',
  },
  {
    title: '2. Sign with Freighter',
    detail: 'Learners review the agreement, connect Freighter, and sign the acceptance payload before any capital is considered active.',
  },
  {
    title: '3. Share earnings until the cap is reached',
    detail: 'Repayments track income over time and stop when the cap multiple is satisfied or the agreement duration ends.',
  },
];

const faqItems: ISAFAQItem[] = [
  {
    question: 'When do repayments begin?',
    answer: 'Repayments begin only after the agreed earnings threshold is reached, so learners do not owe anything while they are still ramping.',
  },
  {
    question: 'What does the cap multiple mean?',
    answer: 'The cap multiple limits the total repayment. A 1.7x cap on a $6,000 ISA means the learner never repays more than $10,200.',
  },
  {
    question: 'What do funders see?',
    answer: 'Funders can monitor active agreements, how much capital is deployed, how much has returned, and which ISAs are approaching completion.',
  },
  {
    question: 'Why use Freighter for acceptance?',
    answer: 'Freighter provides a wallet-backed signature flow so agreement acceptance can be tied to a learner-controlled Stellar identity.',
  },
];

const formatAddress = (address: string) => `${address.slice(0, 4)}...${address.slice(-4)}`;

const getFreighterApi = (): FreighterApiLike | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  return ((window as Window & { freighterApi?: FreighterApiLike }).freighterApi ?? null);
};

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export const useISA = () => {
  const [offers, setOffers] = useState(initialOffers);
  const [activeAgreement, setActiveAgreement] = useState<ISAAgreement>(initialActiveAgreement);
  const [portfolioItems, setPortfolioItems] = useState(initialPortfolioItems);
  const [acceptingOfferId, setAcceptingOfferId] = useState<string | null>(null);
  const [acceptanceState, setAcceptanceState] = useState<AcceptanceState>('idle');
  const [acceptanceMessage, setAcceptanceMessage] = useState('Freighter detected signatures will be used when available.');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [signatureMode, setSignatureMode] = useState<SignatureMode>(getFreighterApi() ? 'freighter' : 'preview');

  const signOfferAcceptance = useCallback(async (offer: ISAOffer) => {
    const freighterApi = getFreighterApi();

    if (freighterApi?.requestAccess && freighterApi?.signTransaction) {
      const publicKey = await freighterApi.requestAccess();
      const account = new Account(publicKey, '0');
      const transaction = new TransactionBuilder(account, {
        fee: '100',
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          Operation.manageData({
            name: 'isa-accept',
            value: offer.id,
          }),
        )
        .setTimeout(0)
        .build();

      setAcceptanceState('awaiting-signature');
      await freighterApi.signTransaction(transaction.toXDR(), {
        network: Networks.TESTNET,
        accountToSign: publicKey,
      });

      setWalletAddress(publicKey);
      setSignatureMode('freighter');
      return {
        signatureMode: 'freighter' as const,
        signatureLabel: `Freighter | ${formatAddress(publicKey)}`,
      };
    }

    await wait(previewSignatureDelayMs);
    setSignatureMode('preview');

    return {
      signatureMode: 'preview' as const,
      signatureLabel: 'Preview signature | local sandbox',
    };
  }, []);

  const acceptOffer = useCallback(
    async (offerId: string) => {
      const offer = offers.find((candidate) => candidate.id === offerId);

      if (!offer) {
        return;
      }

      setAcceptingOfferId(offerId);
      setAcceptanceState('connecting');
      setAcceptanceMessage('Connecting the agreement signature flow...');

      try {
        const signatureResult = await signOfferAcceptance(offer);
        const totalCap = Math.round(offer.fundedAmount * offer.capMultiple);
        const seededRepaid = Math.round(totalCap * 0.22);
        const monthsLeft = Math.max(offer.durationMonths - 2, 0);

        setOffers((currentOffers) =>
          currentOffers.map((currentOffer) =>
            currentOffer.id === offerId ? { ...currentOffer, status: 'accepted' } : currentOffer,
          ),
        );

        setActiveAgreement({
          id: `active-${offer.id}`,
          learnerName: 'You',
          funderName: offer.funderName,
          title: offer.title,
          fundedAmount: offer.fundedAmount,
          repaidAmount: seededRepaid,
          remainingCap: totalCap - seededRepaid,
          totalCap,
          sharePercent: offer.sharePercent,
          capMultiple: offer.capMultiple,
          durationMonths: offer.durationMonths,
          monthsLeft,
          signatureLabel: signatureResult.signatureLabel,
          signatureMode: signatureResult.signatureMode,
          status: 'active',
        });

        setPortfolioItems((currentItems) => [
          {
            id: `portfolio-${offer.id}`,
            learnerName: 'You',
            track: offer.title,
            fundedAmount: offer.fundedAmount,
            returnedAmount: seededRepaid,
            remainingCap: totalCap - seededRepaid,
            sharePercent: offer.sharePercent,
            capMultiple: offer.capMultiple,
            monthsLeft,
            status: 'Active',
            nextPayoutAmount: Math.round((seededRepaid / 6) * 10) / 10,
          },
          ...currentItems,
        ]);

        setAcceptanceState('accepted');
        setAcceptanceMessage(
          signatureResult.signatureMode === 'freighter'
            ? 'Offer accepted. Freighter signature captured for the agreement.'
            : 'Offer accepted in preview mode. Install Freighter to sign with a live wallet.',
        );
      } catch (error) {
        setAcceptanceState('error');
        setAcceptanceMessage(error instanceof Error ? error.message : 'The ISA acceptance flow could not be completed.');
      } finally {
        setAcceptingOfferId(null);
      }
    },
    [offers, signOfferAcceptance],
  );

  const portfolioSummary = useMemo(() => {
    const totalDeployed = portfolioItems.reduce((sum, item) => sum + item.fundedAmount, 0);
    const totalReturned = portfolioItems.reduce((sum, item) => sum + item.returnedAmount, 0);
    const activeCount = portfolioItems.filter((item) => item.status === 'Active').length;
    const avgReturnMultiple = totalDeployed === 0 ? 0 : totalReturned / totalDeployed;

    return {
      totalDeployed,
      totalReturned,
      activeCount,
      avgReturnMultiple,
    };
  }, [portfolioItems]);

  const signatureHint =
    signatureMode === 'freighter'
      ? walletAddress
        ? `Wallet connected: ${formatAddress(walletAddress)}`
        : 'Freighter is available for agreement signatures.'
      : 'Preview signature mode is active because Freighter is not detected in this browser.';

  return {
    offers,
    activeAgreement,
    completedAgreement,
    repaymentHistory: initialRepaymentHistory,
    portfolioItems,
    portfolioReturns: initialPortfolioReturns,
    portfolioSummary,
    explainerSteps,
    faqItems,
    acceptingOfferId,
    acceptanceState,
    acceptanceMessage,
    signatureMode,
    signatureHint,
    acceptOffer,
  };
};
