import { useState, useEffect, useCallback } from 'react';
import { isConnected, getAddress, signTransaction } from '@stellar/freighter-api';
import { TransactionBuilder, Asset, Operation, Memo } from '@stellar/stellar-sdk';
import { getHorizonServer, STELLAR_CONFIG } from '../config/stellar.config';
import type { 
  StellarWallet, 
  Transaction, 
  WalletBalance,
  WalletSecuritySettings,
  WalletNotification 
} from '../types/wallet.types';

export const useWallet = () => {
  const [wallet, setWallet] = useState<StellarWallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<WalletNotification[]>([]);

  const connectWallet = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const connected = await isConnected();
      if (!connected) {
        throw new Error('Freighter wallet not found. Please install Freighter extension.');
      }

      const addressResult = await getAddress();
      if (addressResult.error) {
        throw new Error(addressResult.error.message || 'Failed to get wallet address');
      }

      const publicKey = addressResult.address;
      const walletData: StellarWallet = {
        publicKey,
        balance: [],
        createdAt: new Date(),
        lastSynced: new Date(),
        isBackedUp: true, // Assume Freighter handles backup
      };
      setWallet(walletData);
      return walletData;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBalance = useCallback(async () => {
    if (!wallet) return;
    setLoading(true);
    try {
      const server = getHorizonServer();
      const account = await server.loadAccount(wallet.publicKey);
      
      const balances: WalletBalance[] = account.balances.map(balance => ({
        assetCode: balance.asset_type === 'native' ? 'XLM' : (balance as any).asset_code!,
        assetIssuer: (balance as any).asset_issuer,
        balance: balance.balance,
        limit: (balance as any).limit,
        isNative: balance.asset_type === 'native',
      }));

      setWallet(prev => prev ? { ...prev, balance: balances, lastSynced: new Date() } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch balance');
    } finally {
      setLoading(false);
    }
  }, [wallet]);

  const fetchTransactions = useCallback(async (limit = 20) => {
    if (!wallet) return;
    setLoading(true);
    try {
      const server = getHorizonServer();
      const transactionsResponse = await server.transactions()
        .forAccount(wallet.publicKey)
        .limit(limit)
        .order('desc')
        .call();

      const transactions: Transaction[] = transactionsResponse.records.map(tx => {
        const operation = tx.operations?.[0]; // Get first operation
        return {
          id: tx.id,
          hash: tx.hash,
          type: operation?.type || 'payment',
          amount: operation?.amount || '0',
          assetCode: operation?.asset_type === 'native' ? 'XLM' : operation?.asset_code || 'XLM',
          assetIssuer: operation?.asset_issuer,
          from: operation?.from || '',
          to: operation?.to || '',
          memo: tx.memo,
          timestamp: new Date(tx.created_at),
          status: tx.successful ? 'completed' : 'failed',
          fee: tx.fee_charged.toString(),
        };
      });

      setTransactions(transactions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }, [wallet]);

  const sendPayment = useCallback(async (
    destination: string,
    amount: string,
    assetCode: string,
    memo?: string
  ) => {
    if (!wallet) throw new Error('No wallet connected');
    setLoading(true);
    setError(null);
    try {
      const server = getHorizonServer();
      const account = await server.loadAccount(wallet.publicKey);
      
      const asset = assetCode === 'XLM' 
        ? Asset.native() 
        : new Asset(assetCode, STELLAR_CONFIG.assets[assetCode as keyof typeof STELLAR_CONFIG.assets]?.issuer);

      const transaction = new TransactionBuilder(account, {
        fee: '100',
        networkPassphrase: STELLAR_CONFIG.network,
      })
        .addOperation(Operation.payment({
          destination,
          asset,
          amount,
        }))
        .addMemo(memo ? Memo.text(memo) : Memo.none())
        .setTimeout(30)
        .build();

      const signedResult = await signTransaction(transaction.toXDR(), {
        networkPassphrase: STELLAR_CONFIG.network,
      });

      if (signedResult.error) {
        throw new Error(signedResult.error.message || 'Transaction signing failed');
      }

      const signedTransaction = TransactionBuilder.fromXDR(signedResult.signedTxXdr, STELLAR_CONFIG.network);
      const result = await server.submitTransaction(signedTransaction);

      const newTransaction: Transaction = {
        id: result.hash,
        hash: result.hash,
        type: 'payment',
        amount,
        assetCode,
        from: wallet.publicKey,
        to: destination,
        memo,
        timestamp: new Date(),
        status: 'completed',
        fee: (result as any).fee_charged || '0.00001',
      };

      setTransactions(prev => [newTransaction, ...prev]);
      return newTransaction;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send payment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [wallet]);

  const backupWallet = useCallback(async () => {
    if (!wallet) throw new Error('No wallet to backup');
    // TODO: Generate mnemonic and secure backup
    setWallet(prev => prev ? { ...prev, isBackedUp: true } : null);
  }, [wallet]);

  const updateSecuritySettings = useCallback(async (settings: Partial<WalletSecuritySettings>) => {
    // TODO: Persist security settings
    console.log('Security settings updated:', settings);
  }, []);

  const markNotificationAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  }, []);

  useEffect(() => {
    if (wallet) {
      fetchBalance();
      fetchTransactions();
    }
  }, [wallet, fetchBalance, fetchTransactions]);

  return {
    wallet,
    transactions,
    loading,
    error,
    notifications,
    connectWallet,
    fetchBalance,
    fetchTransactions,
    sendPayment,
    backupWallet,
    updateSecuritySettings,
    markNotificationAsRead
  };
};
