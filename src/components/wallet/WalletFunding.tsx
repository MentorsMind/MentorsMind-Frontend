import { useState } from 'react';
import type { FundingMethod } from '../../types/wallet.types';

interface WalletFundingProps {
  publicKey: string;
  onFundingComplete?: () => void;
}

export const WalletFunding = ({ publicKey, onFundingComplete }: WalletFundingProps) => {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [amount, setAmount] = useState('');

  const fundingMethods: FundingMethod[] = [
    {
      id: 'testnet',
      type: 'testnet',
      name: 'Testnet Friendbot',
      description: 'Get free testnet XLM for development',
      minAmount: '10000',
      maxAmount: '10000',
      fee: '0'
    },
    {
      id: 'crypto',
      type: 'crypto',
      name: 'Crypto Transfer',
      description: 'Transfer from another wallet or exchange',
      fee: 'Network fee applies'
    },
    {
      id: 'fiat',
      type: 'fiat',
      name: 'Buy with Card',
      description: 'Purchase XLM with credit/debit card',
      minAmount: '50',
      maxAmount: '5000',
      fee: '2.5%'
    }
  ];

  const handleFund = async () => {
    if (!selectedMethod) return;
    
    // TODO: Implement actual funding logic
    console.log('Funding wallet:', { method: selectedMethod, amount });
    
    if (selectedMethod === 'testnet') {
      // Call Stellar testnet friendbot
      alert('Testnet funding initiated! Your wallet will be funded shortly.');
    }
    
    onFundingComplete?.();
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Fund Your Wallet</h2>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>Your Wallet Address:</strong>
        </p>
        <p className="font-mono text-sm mt-1 break-all">{publicKey}</p>
      </div>

      <div className="space-y-4 mb-6">
        {fundingMethods.map((method) => (
          <div
            key={method.id}
            onClick={() => setSelectedMethod(method.id)}
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              selectedMethod === method.id
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{method.name}</h3>
                <p className="text-gray-600 text-sm mt-1">{method.description}</p>
                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                  {method.minAmount && (
                    <span>Min: {method.minAmount} XLM</span>
                  )}
                  {method.maxAmount && (
                    <span>Max: {method.maxAmount} XLM</span>
                  )}
                  <span>Fee: {method.fee}</span>
                </div>
              </div>
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedMethod === method.id
                    ? 'border-blue-600 bg-blue-600'
                    : 'border-gray-300'
                }`}
              >
                {selectedMethod === method.id && (
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedMethod && selectedMethod !== 'testnet' && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount (XLM)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="0"
            step="0.0000001"
          />
        </div>
      )}

      <button
        onClick={handleFund}
        disabled={!selectedMethod || (selectedMethod !== 'testnet' && !amount)}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {selectedMethod === 'testnet' ? 'Get Testnet XLM' : 'Continue to Payment'}
      </button>
    </div>
  );
};
