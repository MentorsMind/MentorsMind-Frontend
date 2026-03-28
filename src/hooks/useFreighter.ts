import { useState, useEffect, useCallback } from 'react';
import { freighterService, type FreighterWalletInfo } from '../services/freighter.service';
import { Transaction } from '@stellar/stellar-sdk';

export interface FreighterState {
  isInstalled: boolean;
  isConnected: boolean;
  isLoading: boolean;
  walletInfo: FreighterWalletInfo | null;
  error: string | null;
}

export function useFreighter() {
  const [state, setState] = useState<FreighterState>({
    isInstalled: false,
    isConnected: false,
    isLoading: true,
    walletInfo: null,
    error: null
  });

  // Check installation and connection status on mount
  useEffect(() => {
    checkFreighterStatus();
  }, []);

  const checkFreighterStatus = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const isInstalled = freighterService.isInstalled();
      
      if (!isInstalled) {
        setState({
          isInstalled: false,
          isConnected: false,
          isLoading: false,
          walletInfo: null,
          error: null
        });
        return;
      }

      const isConnected = await freighterService.isConnected();
      
      if (isConnected) {
        const publicKey = await freighterService.getPublicKey();
        const network = await freighterService.getNetwork();
        
        if (publicKey && network) {
          setState({
            isInstalled: true,
            isConnected: true,
            isLoading: false,
            walletInfo: {
              publicKey,
              network,
              isConnected: true
            },
            error: null
          });
        } else {
          setState({
            isInstalled: true,
            isConnected: false,
            isLoading: false,
            walletInfo: null,
            error: null
          });
        }
      } else {
        setState({
          isInstalled: true,
          isConnected: false,
          isLoading: false,
          walletInfo: null,
          error: null
        });
      }
    } catch (error) {
      setState({
        isInstalled: freighterService.isInstalled(),
        isConnected: false,
        isLoading: false,
        walletInfo: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }, []);

  const connect = useCallback(async () => {
    if (!state.isInstalled) {
      setState(prev => ({ ...prev, error: 'Freighter extension not installed' }));
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const walletInfo = await freighterService.connect();
      setState({
        isInstalled: true,
        isConnected: true,
        isLoading: false,
        walletInfo,
        error: null
      });
      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to connect wallet'
      }));
      return false;
    }
  }, [state.isInstalled]);

  const disconnect = useCallback(() => {
    setState({
      isInstalled: freighterService.isInstalled(),
      isConnected: false,
      isLoading: false,
      walletInfo: null,
      error: null
    });
  }, []);

  const signTransaction = useCallback(async (transaction: Transaction, accountToSign?: string) => {
    if (!state.isConnected || !state.walletInfo) {
      throw new Error('Wallet not connected');
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const signedTransaction = await freighterService.signTransaction(transaction, accountToSign);
      setState(prev => ({ ...prev, isLoading: false }));
      return signedTransaction;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign transaction';
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      throw error;
    }
  }, [state.isConnected, state.walletInfo]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const refreshConnection = useCallback(() => {
    checkFreighterStatus();
  }, [checkFreighterStatus]);

  return {
    // State
    isInstalled: state.isInstalled,
    isConnected: state.isConnected,
    isLoading: state.isLoading,
    walletInfo: state.walletInfo,
    error: state.error,
    
    // Actions
    connect,
    disconnect,
    signTransaction,
    clearError,
    refreshConnection,
    
    // Utilities
    formatAddress: freighterService.formatAddress.bind(freighterService),
    getNetworkDisplayName: freighterService.getNetworkDisplayName.bind(freighterService)
  };
}