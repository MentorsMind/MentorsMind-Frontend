import { Networks, Transaction, TransactionBuilder } from 'stellar-sdk';

export interface FreighterModule {
  isConnected(): Promise<boolean>;
  getPublicKey(): Promise<string>;
  signTransaction(xdr: string, opts?: { network?: string; accountToSign?: string }): Promise<string>;
  getNetwork(): Promise<string>;
  requestAccess(): Promise<string>;
}

export interface FreighterWalletInfo {
  publicKey: string;
  network: 'PUBLIC' | 'TESTNET';
  isConnected: boolean;
}

export class FreighterService {
  private freighter: FreighterModule | null = null;

  constructor() {
    this.initializeFreighter();
  }

  private initializeFreighter() {
    // Check if Freighter is available in the browser
    if (typeof window !== 'undefined' && (window as any).freighterApi) {
      this.freighter = (window as any).freighterApi;
    }
  }

  /**
   * Check if Freighter extension is installed
   */
  isInstalled(): boolean {
    return this.freighter !== null;
  }

  /**
   * Check if wallet is connected
   */
  async isConnected(): Promise<boolean> {
    if (!this.freighter) return false;
    try {
      return await this.freighter.isConnected();
    } catch (error) {
      console.error('Error checking Freighter connection:', error);
      return false;
    }
  }

  /**
   * Request access to the wallet and get public key
   */
  async connect(): Promise<FreighterWalletInfo> {
    if (!this.freighter) {
      throw new Error('Freighter extension not installed');
    }

    try {
      const publicKey = await this.freighter.requestAccess();
      const network = await this.freighter.getNetwork();
      
      return {
        publicKey,
        network: network as 'PUBLIC' | 'TESTNET',
        isConnected: true
      };
    } catch (error) {
      console.error('Error connecting to Freighter:', error);
      throw new Error('Failed to connect to Freighter wallet');
    }
  }

  /**
   * Get current public key if connected
   */
  async getPublicKey(): Promise<string | null> {
    if (!this.freighter) return null;
    
    try {
      const isConnected = await this.freighter.isConnected();
      if (!isConnected) return null;
      
      return await this.freighter.getPublicKey();
    } catch (error) {
      console.error('Error getting public key:', error);
      return null;
    }
  }

  /**
   * Get current network
   */
  async getNetwork(): Promise<'PUBLIC' | 'TESTNET' | null> {
    if (!this.freighter) return null;
    
    try {
      const network = await this.freighter.getNetwork();
      return network as 'PUBLIC' | 'TESTNET';
    } catch (error) {
      console.error('Error getting network:', error);
      return null;
    }
  }

  /**
   * Sign a Stellar transaction
   */
  async signTransaction(transaction: Transaction, accountToSign?: string): Promise<Transaction> {
    if (!this.freighter) {
      throw new Error('Freighter extension not installed');
    }

    try {
      const network = await this.getNetwork();
      const networkPassphrase = network === 'PUBLIC' ? Networks.PUBLIC : Networks.TESTNET;
      
      const xdr = transaction.toXDR();
      const signedXdr = await this.freighter.signTransaction(xdr, {
        network: networkPassphrase,
        accountToSign
      });

      return TransactionBuilder.fromXDR(signedXdr, networkPassphrase);
    } catch (error) {
      console.error('Error signing transaction:', error);
      if (error instanceof Error && error.message.includes('User declined')) {
        throw new Error('Transaction was rejected by user');
      }
      throw new Error('Failed to sign transaction');
    }
  }

  /**
   * Format address for display (truncated)
   */
  formatAddress(address: string): string {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  }

  /**
   * Get network display name
   */
  getNetworkDisplayName(network: 'PUBLIC' | 'TESTNET'): string {
    return network === 'PUBLIC' ? 'Mainnet' : 'Testnet';
  }
}

export const freighterService = new FreighterService();