import { Networks, Horizon } from '@stellar/stellar-sdk';

export const STELLAR_CONFIG = {
  network: Networks.TESTNET, // Change to PUBLIC for mainnet
  horizonUrl: 'https://horizon-testnet.stellar.org', // Change to https://horizon.stellar.org for mainnet
  freighterNetwork: 'TESTNET', // Change to 'PUBLIC' for mainnet
  explorerUrl: 'https://stellar.expert/explorer/testnet/tx/', // Change to public for mainnet
  assets: {
    XLM: {
      code: 'XLM',
      issuer: undefined, // Native asset
      name: 'Stellar Lumens',
      icon: '🚀',
    },
    USDC: {
      code: 'USDC',
      issuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN', // Circle USDC on testnet
      name: 'USD Coin',
      icon: '💵',
    },
    PYUSD: {
      code: 'PYUSD',
      issuer: 'GDFXQDQCWYTGY3KJ6XC2DO7X67SG4Z6U7Z3ENFDLSDHP2V4N4S4P7OAH', // PayPal USD on testnet
      name: 'PayPal USD',
      icon: '🅿️',
    },
  },
  contractId: import.meta.env.VITE_ESCROW_CONTRACT_ID ?? '', // Escrow contract ID
  platformFeeAccount: import.meta.env.VITE_PLATFORM_FEE_ACCOUNT ?? '', // Platform fee collection account
  escrowTimeout: 30 * 1000, // 30 seconds for ledger close
  pollingInterval: 2000, // Poll every 2 seconds
  maxPollingAttempts: 30, // Max 60 seconds polling
} as const;

const requiredEnv: Array<[string, string]> = [
  ['VITE_ESCROW_CONTRACT_ID', STELLAR_CONFIG.contractId],
  ['VITE_PLATFORM_FEE_ACCOUNT', STELLAR_CONFIG.platformFeeAccount],
];
requiredEnv.forEach(([key, value]) => {
  if (!value) console.error(`[stellar.config] Missing required env var: ${key}`);
});

export const getHorizonServer = () => new Horizon.Server(STELLAR_CONFIG.horizonUrl);

export const getAsset = (code: keyof typeof STELLAR_CONFIG.assets) => {
  const asset = STELLAR_CONFIG.assets[code];
  if (!asset) throw new Error(`Unknown asset: ${code}`);
  return asset;
};

export const getExplorerUrl = (txHash: string) => `${STELLAR_CONFIG.explorerUrl}${txHash}`;