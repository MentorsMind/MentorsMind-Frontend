import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { exportToCSV, downloadTextFile } from '../utils/export.utils';
import type { PaymentTransaction, PaymentStatus } from '../types';

export type TransactionType = 'payment' | 'escrow' | 'swap' | 'fee' | 'staking';
export type SortField = 'date' | 'amount' | 'status';
export type SortDirection = 'asc' | 'desc';

export interface TransactionFilters {
  search: string;
  type: TransactionType[];
  asset: string;
  status: PaymentStatus[];
  dateFrom: string;
  dateTo: string;
  amountMin: string;
  amountMax: string;
}

const ITEMS_PER_PAGE = 20;

const MOCK_TRANSACTIONS: PaymentTransaction[] = [
  {
    id: 'tx01',
    type: 'session',
    mentorId: 'm1',
    mentorName: 'Dr. Sarah Chen',
    amount: 75,
    currency: 'XLM',
    status: 'completed',
    date: '2026-03-20T10:30:00Z',
    stellarTxHash: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
    description: 'Session: Soroban Smart Contracts Deep Dive',
    sessionId: 's1',
    sessionTopic: 'Soroban Smart Contracts Deep Dive',
    transactionType: 'payment',
    memo: 'mentor-payment',
  },
  {
    id: 'tx02',
    type: 'session',
    mentorId: 'm2',
    mentorName: 'Alex Rivera',
    amount: 50,
    currency: 'USDC',
    status: 'completed',
    date: '2026-03-18T14:00:00Z',
    stellarTxHash: 'b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3',
    description: 'Swap to USDC for session payout',
    sessionId: 's2',
    sessionTopic: 'Stellar Wallet Integration Basics',
    transactionType: 'swap',
    memo: 'asset-swap',
  },
  {
    id: 'tx03',
    type: 'session',
    mentorId: 'm3',
    mentorName: 'Nina Okafor',
    amount: 100,
    currency: 'XLM',
    status: 'pending',
    date: '2026-03-22T09:00:00Z',
    stellarTxHash: 'c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4',
    description: 'Escrow lock for DeFi protocol architecture',
    sessionId: 's3',
    sessionTopic: 'DeFi Protocol Architecture on Stellar',
    transactionType: 'escrow',
    memo: 'escrow-session',
  },
  {
    id: 'tx04',
    type: 'refund',
    mentorId: 'm2',
    mentorName: 'Alex Rivera',
    amount: 50,
    currency: 'XLM',
    status: 'refunded',
    date: '2026-03-12T16:45:00Z',
    stellarTxHash: 'e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6',
    description: 'Refund: Cancelled session',
    sessionId: 's5',
    sessionTopic: 'Stellar Wallet Integration',
    transactionType: 'fee',
    memo: 'refund-process',
  },
  {
    id: 'tx05',
    type: 'subscription',
    mentorId: 'm6',
    mentorName: 'Priya Sharma',
    amount: 60,
    currency: 'PYUSD',
    status: 'completed',
    date: '2026-03-10T13:30:00Z',
    stellarTxHash: 'f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1',
    description: 'Staking fee for mentor reserve wallet',
    sessionTopic: 'Advanced Anchor Protocols',
    transactionType: 'staking',
    memo: 'stake-lock',
  },
  {
    id: 'tx06',
    type: 'session',
    mentorId: 'm1',
    mentorName: 'Dr. Sarah Chen',
    amount: 80,
    currency: 'USDC',
    status: 'completed',
    date: '2026-02-25T09:30:00Z',
    stellarTxHash: 'e1f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f1',
    description: 'Subscription payment for mentoring bundle',
    sessionId: 's11',
    sessionTopic: 'Stellar Account Management',
    transactionType: 'payment',
    memo: 'subscription-cycle',
  },
  {
    id: 'tx07',
    type: 'session',
    mentorId: 'm4',
    mentorName: 'Kwame Mensah',
    amount: 120,
    currency: 'XLM',
    status: 'completed',
    date: '2026-03-05T15:00:00Z',
    stellarTxHash: 'c9d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d9',
    description: 'Payment for liquidity pool design session',
    sessionId: 's9',
    sessionTopic: 'Liquidity Pool Design',
    transactionType: 'payment',
    memo: 'liquidity-session',
  },
];

const AVAILABLE_ASSETS = ['XLM', 'USDC', 'PYUSD'];
const AVAILABLE_TYPES: TransactionType[] = ['payment', 'escrow', 'swap', 'fee', 'staking'];
const AVAILABLE_STATUSES: PaymentStatus[] = ['pending', 'processing', 'completed', 'failed', 'refunded'];

export const useTransactionHistory = () => {
  const [filters, setFilters] = useState<TransactionFilters>({
    search: '',
    type: [],
    asset: '',
    status: [],
    dateFrom: '',
    dateTo: '',
    amountMin: '',
    amountMax: '',
  });
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(MOCK_TRANSACTIONS);
  const pollingRef = useRef<number | null>(null);

  useEffect(() => {
    pollingRef.current = window.setInterval(() => {
      setTransactions((prev) =>
        prev.map((tx) => {
          if (tx.status === 'pending') {
            return { ...tx, status: 'processing' as PaymentStatus };
          }
          if (tx.status === 'processing') {
            return { ...tx, status: 'completed' as PaymentStatus };
          }
          return tx;
        })
      );
    }, 4500);

    return () => {
      if (pollingRef.current) {
        window.clearInterval(pollingRef.current);
      }
    };
  }, []);

  const filtered = useMemo(() => {
    let result = [...transactions];

    if (filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      result = result.filter((tx) =>
        tx.description.toLowerCase().includes(q) ||
        tx.stellarTxHash.toLowerCase().includes(q) ||
        (tx.memo?.toLowerCase().includes(q) ?? false)
      );
    }

    if (filters.type.length > 0) {
      result = result.filter((tx) => filters.type.includes(tx.transactionType ?? 'payment'));
    }

    if (filters.asset) {
      result = result.filter((tx) => tx.currency === filters.asset);
    }

    if (filters.status.length > 0) {
      result = result.filter((tx) => filters.status.includes(tx.status));
    }

    if (filters.dateFrom) {
      result = result.filter((tx) => tx.date >= `${filters.dateFrom}T00:00:00Z`);
    }

    if (filters.dateTo) {
      result = result.filter((tx) => tx.date <= `${filters.dateTo}T23:59:59Z`);
    }

    if (filters.amountMin) {
      result = result.filter((tx) => tx.amount >= parseFloat(filters.amountMin));
    }

    if (filters.amountMax) {
      result = result.filter((tx) => tx.amount <= parseFloat(filters.amountMax));
    }

    result.sort((a, b) => {
      if (sortField === 'date') {
        return sortDirection === 'asc'
          ? a.date.localeCompare(b.date)
          : b.date.localeCompare(a.date);
      }
      if (sortField === 'amount') {
        return sortDirection === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      }
      return sortDirection === 'asc'
        ? a.status.localeCompare(b.status)
        : b.status.localeCompare(a.status);
    });

    return result;
  }, [transactions, filters, sortField, sortDirection]);

  const pendingTransactions = useMemo(
    () => filtered.filter((tx) => tx.status === 'pending' || tx.status === 'processing'),
    [filtered]
  );

  const displayedTransactions = useMemo(
    () => filtered.slice(0, visibleCount),
    [filtered, visibleCount]
  );

  const monthlyGroups = useMemo(() => {
    const groups: Record<string, { month: string; total: number; transactions: PaymentTransaction[] }> = {};
    displayedTransactions.forEach((tx) => {
      const date = new Date(tx.date);
      const month = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!groups[month]) {
        groups[month] = { month, total: 0, transactions: [] };
      }
      groups[month].transactions.push(tx);
      groups[month].total += tx.amount;
    });
    return Object.values(groups);
  }, [displayedTransactions]);

  const hasMore = displayedTransactions.length < filtered.length;

  const loadMore = useCallback(() => {
    setVisibleCount((current) => Math.min(filtered.length, current + ITEMS_PER_PAGE));
  }, [filtered.length]);

  const updateFilters = useCallback((changes: Partial<TransactionFilters>) => {
    setFilters((prev) => ({ ...prev, ...changes }));
    setVisibleCount(ITEMS_PER_PAGE);
  }, []);

  const toggleType = useCallback((value: TransactionType) => {
    setFilters((prev) => {
      const hasType = prev.type.includes(value);
      return {
        ...prev,
        type: hasType ? prev.type.filter((item) => item !== value) : [...prev.type, value],
      };
    });
    setVisibleCount(ITEMS_PER_PAGE);
  }, []);

  const toggleStatus = useCallback((value: PaymentStatus) => {
    setFilters((prev) => {
      const hasStatus = prev.status.includes(value);
      return {
        ...prev,
        status: hasStatus ? prev.status.filter((item) => item !== value) : [...prev.status, value],
      };
    });
    setVisibleCount(ITEMS_PER_PAGE);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      type: [],
      asset: '',
      status: [],
      dateFrom: '',
      dateTo: '',
      amountMin: '',
      amountMax: '',
    });
    setVisibleCount(ITEMS_PER_PAGE);
  }, []);

  const setSort = useCallback((field: SortField) => {
    setSortField((current) => {
      if (current === field) {
        setSortDirection((direction) => (direction === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortDirection('desc');
      }
      return field;
    });
  }, []);

  const exportCsv = useCallback(() => {
    const headers = ['Date', 'Type', 'Description', 'Amount', 'Asset', 'Status', 'TX Hash'];
    const rows = filtered.map((tx) => [
      new Date(tx.date).toLocaleDateString(),
      tx.transactionType ?? 'payment',
      tx.description,
      tx.amount.toString(),
      tx.currency,
      tx.status,
      tx.stellarTxHash,
    ]);
    exportToCSV(`transaction_history_${new Date().toISOString().split('T')[0]}`, headers, rows);
  }, [filtered]);

  const downloadReceipt = useCallback((tx: PaymentTransaction) => {
    const text = [
      'MentorsMind Transaction Receipt',
      `Transaction ID: ${tx.id}`,
      `Date: ${new Date(tx.date).toLocaleString()}`,
      `Type: ${tx.transactionType ?? 'payment'}`,
      `Status: ${tx.status}`,
      `Amount: ${tx.amount} ${tx.currency}`,
      `Description: ${tx.description}`,
      `TX Hash: ${tx.stellarTxHash}`,
      `Memo: ${tx.memo ?? 'N/A'}`,
      `Explorer: https://stellar.expert/explorer/public/tx/${tx.stellarTxHash}`,
    ].join('\n');

    downloadTextFile(`receipt_${tx.id}_${new Date().toISOString().split('T')[0]}.txt`, text);
  }, []);

  return {
    filters,
    sortField,
    sortDirection,
    visibleCount,
    displayedTransactions,
    pendingTransactions,
    monthlyGroups,
    hasMore,
    availableAssets: AVAILABLE_ASSETS,
    availableTypes: AVAILABLE_TYPES,
    availableStatuses: AVAILABLE_STATUSES,
    updateFilters,
    toggleType,
    toggleStatus,
    clearFilters,
    setSort,
    loadMore,
    exportCsv,
    downloadReceipt,
  };
};
