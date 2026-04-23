import { getHorizonServer } from '../config/stellar.config';

export interface FundingStatus {
  status: 'idle' | 'pending' | 'success' | 'error';
  message: string;
  txHash?: string;
  balance?: string;
}

interface PaymentRecord {
  id: string;
  type: string;
  amount?: string;
  asset_type?: string;
  from?: string;
  to?: string;
  created_at: string;
}

export class StellarFundingService {
  /**
   * Fund a testnet account using Stellar Friendbot
   */
  static async fundTestnetAccount(publicKey: string): Promise<FundingStatus> {
    try {
      const response = await fetch(
        `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Friendbot error: ${errorText}`);
      }

      const result = await response.json();
      
      return {
        status: 'success',
        message: 'Account funded successfully with 10,000 XLM',
        txHash: result.hash,
        balance: '10000'
      };
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to fund account',
      };
    }
  }

  /**
   * Check account balance and funding status
   */
  static async checkAccountBalance(publicKey: string): Promise<FundingStatus> {
    try {
      const server = getHorizonServer();
      const account = await server.loadAccount(publicKey);
      
      const xlmBalance = account.balances.find(
        (balance) => balance.asset_type === 'native'
      );

      const balance = xlmBalance && 'balance' in xlmBalance ? xlmBalance.balance : '0';

      return {
        status: 'success',
        message: `Current balance: ${balance} XLM`,
        balance
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return {
          status: 'idle',
          message: 'Account not yet funded',
          balance: '0'
        };
      }
      
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to check balance',
      };
    }
  }

  /**
   * Monitor account for incoming payments
   */
  static async monitorAccountPayments(
    publicKey: string,
    onPayment: (payment: PaymentRecord) => void,
    onError: (error: Error) => void
  ): Promise<() => void> {
    const server = getHorizonServer();
    
    try {
      const closeStream = server
        .payments()
        .forAccount(publicKey)
        .cursor('now')
        .stream({
          onmessage: (payment: PaymentRecord) => {
            onPayment(payment);
          },
          onerror: (err: Error | MessageEvent) => {
            const error = err instanceof Error ? err : new Error('Stream error');
            onError(error);
          }
        });

      return closeStream;
    } catch (err) {
      onError(err instanceof Error ? err : new Error('Failed to monitor payments'));
      return () => {};
    }
  }

  /**
   * Get recent transactions for an account
   */
  static async getRecentTransactions(publicKey: string, limit: number = 10): Promise<unknown[]> {
    try {
      const server = getHorizonServer();
      const transactions = await server
        .transactions()
        .forAccount(publicKey)
        .order('desc')
        .limit(limit)
        .call();

      return transactions.records;
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      return [];
    }
  }

  /**
   * Validate if account exists and is funded
   */
  static async isAccountFunded(publicKey: string): Promise<boolean> {
    try {
      const server = getHorizonServer();
      await server.loadAccount(publicKey);
      return true;
    } catch {
      return false;
    }
  }
}
