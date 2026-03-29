import { useState, useCallback, useMemo } from 'react';

export interface LoanRecord {
  id: string;
  collateral: number;   // MNT
  borrowed: number;     // USDC
  repaid: number;       // USDC
  healthFactor: number; // %
  status: 'active' | 'repaid' | 'liquidated';
  openedAt: string;
}

export interface LoanState {
  mntBalance: number;
  usdcBalance: number;
  mntUsdcRate: number; // oracle price
  activeLoan: {
    collateral: number;
    borrowed: number;
    repaid: number;
  } | null;
  history: LoanRecord[];
}

const MOCK_STATE: LoanState = {
  mntBalance: 5_000,
  usdcBalance: 200,
  mntUsdcRate: 0.42,
  activeLoan: {
    collateral: 1_000,
    borrowed: 280,
    repaid: 0,
  },
  history: [
    { id: 'l1', collateral: 800, borrowed: 200, repaid: 200, healthFactor: 168, status: 'repaid', openedAt: '2026-02-10' },
    { id: 'l2', collateral: 500, borrowed: 180, repaid: 180, healthFactor: 117, status: 'liquidated', openedAt: '2026-01-05' },
  ],
};

// collateral value in USDC / outstanding debt * 100
export function calcHealthFactor(collateral: number, borrowed: number, repaid: number, rate: number): number {
  const outstanding = borrowed - repaid;
  if (outstanding <= 0) return Infinity;
  return (collateral * rate) / outstanding * 100;
}

export function useCollateralLoan() {
  const [state, setState] = useState<LoanState>(MOCK_STATE);

  // Open loan form
  const [collateralInput, setCollateralInput] = useState('');
  const [borrowInput, setBorrowInput] = useState('');

  // Add collateral
  const [addCollateralInput, setAddCollateralInput] = useState('');

  // Repay
  const [repayInput, setRepayInput] = useState('');

  const [txStatus, setTxStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const previewHealthFactor = useMemo(() => {
    const c = parseFloat(collateralInput) || 0;
    const b = parseFloat(borrowInput) || 0;
    if (!c || !b) return null;
    return calcHealthFactor(c, b, 0, state.mntUsdcRate);
  }, [collateralInput, borrowInput, state.mntUsdcRate]);

  const activeHealthFactor = useMemo(() => {
    if (!state.activeLoan) return null;
    const { collateral, borrowed, repaid } = state.activeLoan;
    return calcHealthFactor(collateral, borrowed, repaid, state.mntUsdcRate);
  }, [state.activeLoan, state.mntUsdcRate]);

  const simulate = (ms = 1200) =>
    new Promise<void>(r => setTimeout(r, ms));

  const openLoan = useCallback(async () => {
    const c = parseFloat(collateralInput);
    const b = parseFloat(borrowInput);
    if (!c || !b || c > state.mntBalance) return;
    setTxStatus('loading');
    await simulate();
    setState(prev => ({
      ...prev,
      mntBalance: prev.mntBalance - c,
      usdcBalance: prev.usdcBalance + b,
      activeLoan: { collateral: c, borrowed: b, repaid: 0 },
    }));
    setCollateralInput('');
    setBorrowInput('');
    setTxStatus('success');
    setTimeout(() => setTxStatus('idle'), 2500);
  }, [collateralInput, borrowInput, state.mntBalance]);

  const addCollateral = useCallback(async () => {
    const amount = parseFloat(addCollateralInput);
    if (!amount || amount > state.mntBalance || !state.activeLoan) return;
    setTxStatus('loading');
    await simulate();
    setState(prev => ({
      ...prev,
      mntBalance: prev.mntBalance - amount,
      activeLoan: prev.activeLoan
        ? { ...prev.activeLoan, collateral: prev.activeLoan.collateral + amount }
        : null,
    }));
    setAddCollateralInput('');
    setTxStatus('success');
    setTimeout(() => setTxStatus('idle'), 2500);
  }, [addCollateralInput, state.mntBalance, state.activeLoan]);

  const repayLoan = useCallback(async () => {
    const amount = parseFloat(repayInput);
    if (!amount || !state.activeLoan) return;
    const outstanding = state.activeLoan.borrowed - state.activeLoan.repaid;
    const actual = Math.min(amount, outstanding);
    setTxStatus('loading');
    await simulate();
    setState(prev => {
      if (!prev.activeLoan) return prev;
      const newRepaid = prev.activeLoan.repaid + actual;
      const fullyRepaid = newRepaid >= prev.activeLoan.borrowed;
      const record: LoanRecord = {
        id: `l${Date.now()}`,
        collateral: prev.activeLoan.collateral,
        borrowed: prev.activeLoan.borrowed,
        repaid: newRepaid,
        healthFactor: calcHealthFactor(prev.activeLoan.collateral, prev.activeLoan.borrowed, newRepaid, prev.mntUsdcRate),
        status: fullyRepaid ? 'repaid' : 'active',
        openedAt: new Date().toISOString().slice(0, 10),
      };
      return {
        ...prev,
        usdcBalance: prev.usdcBalance - actual,
        mntBalance: fullyRepaid ? prev.mntBalance + prev.activeLoan!.collateral : prev.mntBalance,
        activeLoan: fullyRepaid ? null : { ...prev.activeLoan, repaid: newRepaid },
        history: fullyRepaid ? [record, ...prev.history] : prev.history,
      };
    });
    setRepayInput('');
    setTxStatus('success');
    setTimeout(() => setTxStatus('idle'), 2500);
  }, [repayInput, state.activeLoan]);

  return {
    state,
    collateralInput, setCollateralInput,
    borrowInput, setBorrowInput,
    addCollateralInput, setAddCollateralInput,
    repayInput, setRepayInput,
    previewHealthFactor,
    activeHealthFactor,
    txStatus,
    openLoan,
    addCollateral,
    repayLoan,
  };
}
