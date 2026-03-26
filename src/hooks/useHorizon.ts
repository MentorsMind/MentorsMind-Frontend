import { useState, useCallback, useRef } from 'react';
import axios from 'axios';

// Horizon REST API base — swap to testnet for dev
const HORIZON_BASE = 'https://horizon.stellar.org';

// Known asset price feeds (CoinGecko IDs)
const PRICE_IDS: Record<string, string> = {
  XLM: 'stellar',
  USDC: 'usd-coin',
  PYUSD: 'paypal-usd',
};

export interface HorizonBalance {
  asset_type: 'native' | 'credit_alphanum4' | 'credit_alphanum12';
  asset_code?: string;
  asset_issuer?: string;
  balance: string;
  limit?: string;
  buying_liabilities: string;
  selling_liabilities: string;
  is_authorized?: boolean;
}

export interface HorizonOperation {
  id: string;
  paging_token: string;
  type: string;
  type_i: number;
  created_at: string;
  transaction_hash: string;
  transaction_successful: boolean;
  // payment fields
  from?: string;
  to?: string;
  amount?: string;
  asset_type?: string;
  asset_code?: string;
  asset_issuer?: string;
  // create_account fields
  account?: string;
  funder?: string;
  starting_balance?: string;
  // path_payment fields
  source_amount?: string;
  source_asset_code?: string;
  // fee
  source_account?: string;
}

export interface HorizonAccount {
  id: string;
  account_id: string;
  sequence: string;
  subentry_count: number;
  balances: HorizonBalance[];
  last_modified_ledger: number;
}

export interface ParsedBalance {
  assetCode: string;
  assetIssuer?: string;
  balance: string;
  limit?: string;
  isNative: boolean;
  usdValue: number;
  totalUsd: number;
  isAuthorized: boolean;
}

export interface ParsedTransaction {
  id: string;
  hash: string;
  type: 'payment' | 'create_account' | 'path_payment' | 'escrow' | 'fee' | 'other';
  amount: string;
  assetCode: string;
  assetIssuer?: string;
  from: string;
  to: string;
  timestamp: Date;
  successful: boolean;
}

export interface HorizonState {
  balances: ParsedBalance[];
  transactions: ParsedTransaction[];
  accountId: string;
  subentryCount: number;
  loading: boolean;
  error: string | null;
  prices: Record<string, number>;
  totalUsd: number;
  minimumReserve: number;
  availableXlm: number;
}

// Minimum reserve: 1 XLM base + 0.5 XLM per subentry (trustline, offer, etc.)
const BASE_RESERVE = 1;
const SUBENTRY_RESERVE = 0.5;

function calcMinReserve(subentryCount: number): number {
  return BASE_RESERVE + subentryCount * SUBENTRY_RESERVE;
}

async function fetchPrices(codes: string[]): Promise<Record<string, number>> {
  const ids = codes
    .map(c => PRICE_IDS[c])
    .filter(Boolean)
    .join(',');
  if (!ids) return {};
  try {
    const { data } = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`,
      { timeout: 5000 }
    );
    const result: Record<string, number> = {};
    for (const code of codes) {
      const geckoId = PRICE_IDS[code];
      if (geckoId && data[geckoId]?.usd) {
        result[code] = data[geckoId].usd;
      }
    }
    return result;
  } catch {
    // Fallback prices if CoinGecko is unavailable
    return { XLM: 0.12, USDC: 1.0, PYUSD: 1.0 };
  }
}

function parseOperation(op: HorizonOperation, accountId: string): ParsedTransaction {
  let type: ParsedTransaction['type'] = 'other';
  let amount = '0';
  let assetCode = 'XLM';
  let assetIssuer: string | undefined;
  let from = op.source_account ?? accountId;
  let to = accountId;

  switch (op.type) {
    case 'payment':
      type = 'payment';
      amount = op.amount ?? '0';
      assetCode = op.asset_type === 'native' ? 'XLM' : (op.asset_code ?? 'XLM');
      assetIssuer = op.asset_issuer;
      from = op.from ?? from;
      to = op.to ?? to;
      break;
    case 'create_account':
      type = 'create_account';
      amount = op.starting_balance ?? '0';
      assetCode = 'XLM';
      from = op.funder ?? from;
      to = op.account ?? to;
      break;
    case 'path_payment_strict_send':
    case 'path_payment_strict_receive':
      type = 'path_payment';
      amount = op.amount ?? op.source_amount ?? '0';
      assetCode = op.asset_type === 'native' ? 'XLM' : (op.asset_code ?? 'XLM');
      assetIssuer = op.asset_issuer;
      from = op.from ?? from;
      to = op.to ?? to;
      break;
    case 'manage_buy_offer':
    case 'manage_sell_offer':
      type = 'escrow';
      assetCode = op.asset_code ?? 'XLM';
      break;
    default:
      type = 'other';
  }

  return {
    id: op.id,
    hash: op.transaction_hash,
    type,
    amount,
    assetCode,
    assetIssuer,
    from,
    to,
    timestamp: new Date(op.created_at),
    successful: op.transaction_successful,
  };
}

export function useHorizon(publicKey: string | undefined) {
  const [state, setState] = useState<HorizonState>({
    balances: [],
    transactions: [],
    accountId: publicKey ?? '',
    subentryCount: 0,
    loading: false,
    error: null,
    prices: {},
    totalUsd: 0,
    minimumReserve: BASE_RESERVE,
    availableXlm: 0,
  });

  const abortRef = useRef<AbortController | null>(null);

  const fetchAccount = useCallback(async () => {
    if (!publicKey) return;

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setState((prev: HorizonState) => ({ ...prev, loading: true, error: null }));

    try {
      // 1. Fetch account data
      const { data: account } = await axios.get<HorizonAccount>(
        `${HORIZON_BASE}/accounts/${publicKey}`,
        { signal: abortRef.current.signal, timeout: 10000 }
      );

      // 2. Fetch last 10 operations
      const { data: opsData } = await axios.get(
        `${HORIZON_BASE}/accounts/${publicKey}/operations?limit=10&order=desc`,
        { signal: abortRef.current.signal, timeout: 10000 }
      );
      const ops: HorizonOperation[] = opsData._embedded?.records ?? [];

      // 3. Fetch prices for all asset codes
      const assetCodes = account.balances.map((b: HorizonBalance) =>
        b.asset_type === 'native' ? 'XLM' : (b.asset_code ?? '')
      ).filter(Boolean);
      const prices = await fetchPrices(assetCodes);

      // 4. Parse balances
      const minReserve = calcMinReserve(account.subentry_count);
      const parsedBalances: ParsedBalance[] = account.balances.map((b: HorizonBalance) => {
        const code = b.asset_type === 'native' ? 'XLM' : (b.asset_code ?? 'UNKNOWN');
        const price = prices[code] ?? 0;
        const bal = parseFloat(b.balance);
        return {
          assetCode: code,
          assetIssuer: b.asset_issuer,
          balance: b.balance,
          limit: b.limit,
          isNative: b.asset_type === 'native',
          usdValue: price,
          totalUsd: bal * price,
          isAuthorized: b.is_authorized !== false,
        };
      });

      const totalUsd = parsedBalances.reduce((s, b) => s + b.totalUsd, 0);
      const xlmBalance = parsedBalances.find(b => b.isNative);
      const xlmAmount = xlmBalance ? parseFloat(xlmBalance.balance) : 0;
      const availableXlm = Math.max(0, xlmAmount - minReserve);

      // 5. Parse transactions
      const parsedTxs = ops.map(op => parseOperation(op, publicKey));

      setState({
        balances: parsedBalances,
        transactions: parsedTxs,
        accountId: account.account_id,
        subentryCount: account.subentry_count,
        loading: false,
        error: null,
        prices,
        totalUsd,
        minimumReserve: minReserve,
        availableXlm,
      });
    } catch (err: unknown) {
      if (axios.isCancel(err)) return;
      let msg = 'Failed to fetch account data';
      if (axios.isAxiosError(err)) {
        msg = err.response?.status === 404
          ? 'Account not found on Stellar network. Fund it with at least 1 XLM to activate.'
          : err.message;
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setState((prev: HorizonState) => ({ ...prev, loading: false, error: msg }));
    }
  }, [publicKey]);

  const addTrustline = useCallback(
    async (_assetCode: string, _assetIssuer: string): Promise<void> => {
      // Trustline submission requires signing — placeholder for SDK integration
      // In production: build ChangeTrustOp, sign with secret key, submit to Horizon
      throw new Error('Trustline submission requires Stellar SDK integration with a signing key.');
    },
    []
  );

  return { ...state, fetchAccount, addTrustline };
}
