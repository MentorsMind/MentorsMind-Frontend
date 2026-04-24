import { useState, useEffect, useCallback, useRef } from 'react';
import { getStellarErrorMessage } from '../utils/stellar.utils';

export type TransactionStep = 'idle' | 'submitting' | 'pending' | 'confirmed' | 'error';

interface TransactionState {
  step: TransactionStep;
  txHash?: string;
  error?: string;
  errorCode?: string;
  ledgerCloseCountdown: number;
  escrowAddress?: string;
}

const LEDGER_CLOSE_AVG_TIME = 5; // seconds

export const useStellarTransaction = () => {
  const [state, setState] = useState<TransactionState>({
    step: 'idle',
    ledgerCloseCountdown: LEDGER_CLOSE_AVG_TIME,
  });

  const countdownInterval = useRef<NodeJS.Timeout | null>(null);

  const startCountdown = useCallback(() => {
    setState(prev => ({ ...prev, ledgerCloseCountdown: LEDGER_CLOSE_AVG_TIME }));
    
    if (countdownInterval.current) clearInterval(countdownInterval.current);
    
    countdownInterval.current = setInterval(() => {
      setState(prev => {
        if (prev.ledgerCloseCountdown <= 1) {
          // If it reaches 0 before it's confirmed, just keep it at 1 or handle overflow
          // In a real app, we might restart or show "Waiting for network..."
          return { ...prev, ledgerCloseCountdown: 1 };
        }
        return { ...prev, ledgerCloseCountdown: prev.ledgerCloseCountdown - 1 };
      });
    }, 1000);
  }, []);

  const stopCountdown = useCallback(() => {
    if (countdownInterval.current) {
      clearInterval(countdownInterval.current);
      countdownInterval.current = null;
    }
  }, []);

  const submitTransaction = useCallback(async (processTx: () => Promise<{ hash: string, escrow?: string }>) => {
    setState(prev => ({ 
      ...prev, 
      step: 'submitting', 
      error: undefined, 
      errorCode: undefined 
    }));

    try {
      // Simulate initial submission delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const result = await processTx();

      setState(prev => ({ 
        ...prev, 
        step: 'pending', 
        txHash: result.hash,
        escrowAddress: result.escrow
      }));
      
      startCountdown();

      // Simulate ledger close delay (avg 3-5s)
      const simulationDelay = 2000 + Math.random() * 3000;
      await new Promise(resolve => setTimeout(resolve, simulationDelay));

      stopCountdown();
      setState(prev => ({ ...prev, step: 'confirmed' }));
      
    } catch (err: any) {
      stopCountdown();
      const errorCode = err?.errorCode || 'unknown_error';
      setState(prev => ({ 
        ...prev, 
        step: 'error', 
        error: getStellarErrorMessage(errorCode),
        errorCode: errorCode
      }));
    }
  }, [startCountdown, stopCountdown]);

  const reset = useCallback(() => {
    stopCountdown();
    setState({
      step: 'idle',
      ledgerCloseCountdown: LEDGER_CLOSE_AVG_TIME,
    });
  }, [stopCountdown]);

  useEffect(() => {
    return () => stopCountdown();
  }, [stopCountdown]);

  return {
    ...state,
    submitTransaction,
    reset,
  };
};
