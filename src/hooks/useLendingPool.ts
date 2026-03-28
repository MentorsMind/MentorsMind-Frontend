import { useState, useCallback } from 'react';
import { useFreighter } from './useFreighter';
import { TransactionBuilder, Networks, Keypair, Account, Operation } from '@stellar/stellar-sdk';
import toast from 'react-hot-toast';

export interface PoolStats {
  totalLiquidity: number;
  utilizationRate: number;
  currentAPY: number;
}

export interface ActiveLoan {
  amount: number;
  dueDate: string;
}

export interface TransactionRecord {
  id: string;
  type: 'deposit' | 'withdraw' | 'borrow' | 'repay';
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

export const useLendingPool = () => {
  const { signTransaction, isConnected, walletInfo } = useFreighter();
  
  // Mock State
  const [creditScore, setCreditScore] = useState<number>(750);
  const [activeLoan, setActiveLoan] = useState<ActiveLoan | null>({
    amount: 150,
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
  });
  const [poolStats, setPoolStats] = useState<PoolStats>({
    totalLiquidity: 125000,
    utilizationRate: 0.65,
    currentAPY: 8.5,
  });
  const [lpBalance, setLpBalance] = useState<number>(1000);
  const [availableCredit, setAvailableCredit] = useState<number>(500);
  
  const [history, setHistory] = useState<TransactionRecord[]>([
    {
      id: 'tx-1',
      type: 'deposit',
      amount: 1000,
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
    },
    {
      id: 'tx-2',
      type: 'borrow',
      amount: 150,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
    }
  ]);
  
  const [isProcessing, setIsProcessing] = useState(false);

  // Helper to simulate a stellar tx for Freighter to sign
  const simulateFreighterTx = async (action: string) => {
    if (!isConnected || !walletInfo) {
      toast.error('Please connect your Freighter wallet first.');
      throw new Error('Wallet not connected');
    }
    
    const dummyKeypair = Keypair.random();
    const mockAccount = new Account(dummyKeypair.publicKey(), "1");
    
    const tx = new TransactionBuilder(mockAccount, {
      fee: "100",
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.manageData({
          name: "Action",
          value: action,
        })
      )
      .setTimeout(30)
      .build();

    try {
      await signTransaction(tx);
    } catch (err: any) {
      console.error(err);
      throw new Error('Transaction cancelled by user');
    }
  };

  const handleDeposit = useCallback(async (amount: number) => {
    if (!isConnected) {
      toast.error('Connect Freighter to deposit');
      return;
    }
    setIsProcessing(true);
    try {
      await simulateFreighterTx('deposit'); 
      // Simulating a real wait for signing and submisssion
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setLpBalance(prev => prev + amount);
      setPoolStats(prev => ({
        ...prev,
        totalLiquidity: prev.totalLiquidity + amount,
        utilizationRate: prev.totalLiquidity > 0 ? prev.totalLiquidity * prev.utilizationRate / (prev.totalLiquidity + amount) : prev.utilizationRate
      }));
      setHistory(prev => [{
        id: `tx-${Date.now()}`,
        type: 'deposit',
        amount,
        date: new Date().toISOString(),
        status: 'completed'
      }, ...prev]);
      
      toast.success(`Successfully deposited $${amount} into the pool.`);
    } catch (err: any) {
      console.error(err);
      toast.error('Deposit failed: ' + (err.message || 'Unknown error'));
    } finally {
      setIsProcessing(false);
    }
  }, [isConnected]);

  const handleWithdraw = useCallback(async (amount: number) => {
    if (!isConnected) {
      toast.error('Connect Freighter to withdraw');
      return;
    }
    if (amount > lpBalance) {
      toast.error('Insufficient LP balance');
      return;
    }
    setIsProcessing(true);
    try {
      await simulateFreighterTx('withdraw');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setLpBalance(prev => prev - amount);
      setPoolStats(prev => ({
        ...prev,
        totalLiquidity: prev.totalLiquidity - amount,
      }));
      setHistory(prev => [{
        id: `tx-${Date.now()}`,
        type: 'withdraw',
        amount,
        date: new Date().toISOString(),
        status: 'completed'
      }, ...prev]);
      
      toast.success(`Successfully withdrew $${amount}.`);
    } catch (err: any) {
      toast.error('Withdrawal failed');
    } finally {
      setIsProcessing(false);
    }
  }, [isConnected, lpBalance]);

  const handleBorrow = useCallback(async (amount: number, sessionId: string) => {
    if (creditScore < 600) {
      toast.error('Credit score too low to borrow.');
      return;
    }
    if (amount > availableCredit) {
      toast.error('Amount exceeds available credit.');
      return;
    }
    if (activeLoan) {
      toast.error('Please repay your active loan before borrowing again.');
      return;
    }
    setIsProcessing(true);
    try {
      await simulateFreighterTx('borrow');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate async
      setActiveLoan({
        amount: amount * 1.05, // simple 5% fee included in owed amount
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      });
      setAvailableCredit(prev => prev - amount);
      setHistory(prev => [{
        id: `tx-${Date.now()}`,
        type: 'borrow',
        amount,
        date: new Date().toISOString(),
        status: 'completed'
      }, ...prev]);
      
      toast.success(`Successfully borrowed $${amount}. Your session is booked!`);
    } catch (err) {
      toast.error('Borrow request failed.');
    } finally {
      setIsProcessing(false);
    }
  }, [creditScore, availableCredit, activeLoan]);

  const handleRepay = useCallback(async () => {
    if (!activeLoan) return;
    setIsProcessing(true);
    // In a real app we'd trigger Freighter here too if repaying via crypto
    try {
      await simulateFreighterTx('repay');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setHistory(prev => [{
        id: `tx-${Date.now()}`,
        type: 'repay',
        amount: activeLoan.amount,
        date: new Date().toISOString(),
        status: 'completed'
      }, ...prev]);
      setAvailableCredit(prev => prev + (activeLoan.amount / 1.05)); // restore credit without fee
      setActiveLoan(null);
      
      toast.success(`Successfully repaid your loan of $${activeLoan.amount.toFixed(2)}.`);
    } catch (err) {
      toast.error('Repayment failed.');
    } finally {
      setIsProcessing(false);
    }
  }, [activeLoan]);

  return {
    creditScore,
    setCreditScore, // Exposing specifically for demoing tooltip
    activeLoan,
    poolStats,
    lpBalance,
    availableCredit,
    history,
    isProcessing,
    handleDeposit,
    handleWithdraw,
    handleBorrow,
    handleRepay,
  };
};
