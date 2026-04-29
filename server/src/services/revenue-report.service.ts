export type PaymentStatus = 'completed' | 'pending' | 'failed';
export type PaymentType = 'session' | 'refund' | 'deposit' | 'fee';

export interface PaymentTransaction {
  id: string;
  type: PaymentType;
  mentorId: string;
  mentorName: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  date: string;
  stellarTxHash: string;
  description: string;
  sessionId: string;
  sessionTopic: string;
}

export interface GetTransactionsParams {
  from: string;
  to: string;
  status?: PaymentStatus;
  page?: number;
  limit?: number;
}

// Flat list shape
export type FlatTransactionsResult = PaymentTransaction[];

// Paginated shape
export interface PaginatedTransactionsResult {
  transactions: PaymentTransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type GetTransactionsResult = FlatTransactionsResult | PaginatedTransactionsResult;

// Mock data — replace with real DB queries
const MOCK_TRANSACTIONS: PaymentTransaction[] = [
  {
    id: 'tx1',
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
  },
  {
    id: 'tx2',
    type: 'session',
    mentorId: 'm2',
    mentorName: 'Alex Rivera',
    amount: 50,
    currency: 'XLM',
    status: 'completed',
    date: '2026-03-18T14:00:00Z',
    stellarTxHash: 'b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3',
    description: 'Session: Stellar Wallet Integration Basics',
    sessionId: 's2',
    sessionTopic: 'Stellar Wallet Integration Basics',
  },
  {
    id: 'tx3',
    type: 'session',
    mentorId: 'm3',
    mentorName: 'Nina Okafor',
    amount: 100,
    currency: 'XLM',
    status: 'pending',
    date: '2026-03-22T09:00:00Z',
    stellarTxHash: 'c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4',
    description: 'Session: DeFi Protocol Architecture on Stellar',
    sessionId: 's3',
    sessionTopic: 'DeFi Protocol Architecture on Stellar',
  },
  {
    id: 'tx4',
    type: 'session',
    mentorId: 'm1',
    mentorName: 'Dr. Sarah Chen',
    amount: 75,
    currency: 'XLM',
    status: 'failed',
    date: '2026-03-15T11:00:00Z',
    stellarTxHash: 'd4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5',
    description: 'Session: JavaScript SDK for Stellar',
    sessionId: 's4',
    sessionTopic: 'JavaScript SDK for Stellar',
  },
  {
    id: 'tx5',
    type: 'refund',
    mentorId: 'm2',
    mentorName: 'Alex Rivera',
    amount: 50,
    currency: 'XLM',
    status: 'completed',
    date: '2026-03-12T16:45:00Z',
    stellarTxHash: 'e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6',
    description: 'Refund: Cancelled session - Stellar Wallet Integration',
    sessionId: 's5',
    sessionTopic: 'Stellar Wallet Integration',
  },
  {
    id: 'tx6',
    type: 'session',
    mentorId: 'm4',
    mentorName: 'Kwame Mensah',
    amount: 120,
    currency: 'XLM',
    status: 'completed',
    date: '2026-03-10T13:30:00Z',
    stellarTxHash: 'f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1',
    description: 'Session: Advanced Anchor Protocols',
    sessionId: 's6',
    sessionTopic: 'Advanced Anchor Protocols',
  },
];

export class RevenueReportService {
  /**
   * Returns transactions for the given date range and optional status filter.
   * The return type is intentionally a union — callers must handle both shapes.
   * When page/limit are provided, returns a paginated result; otherwise a flat array.
   */
  async getTransactions(params: GetTransactionsParams): Promise<GetTransactionsResult> {
    const { from, to, status, page, limit } = params;

    let results = MOCK_TRANSACTIONS.filter((tx) => {
      const inRange = tx.date >= from && tx.date <= to + 'T23:59:59Z';
      const matchesStatus = status ? tx.status === status : true;
      return inRange && matchesStatus;
    });

    // Return paginated shape when pagination params are present
    if (page !== undefined && limit !== undefined) {
      const total = results.length;
      const totalPages = Math.max(1, Math.ceil(total / limit));
      const offset = (page - 1) * limit;
      const transactions = results.slice(offset, offset + limit);

      return {
        transactions,
        pagination: { page, limit, total, totalPages },
      };
    }

    // Otherwise return flat array
    return results;
  }
}
