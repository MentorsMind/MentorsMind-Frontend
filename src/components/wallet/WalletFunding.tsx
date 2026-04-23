import { useState, useEffect } from 'react';
import type { FundingMethod } from '../../types/wallet.types';
import { StellarFundingService, type FundingStatus } from '../../services/stellar.funding.service';
import { getExplorerUrl } from '../../config/stellar.config';

interface WalletFundingProps {
  publicKey: string;
  onFundingComplete?: () => void;
}

export const WalletFunding = ({ publicKey, onFundingComplete }: WalletFundingProps) => {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [fundingStatus, setFundingStatus] = useState<FundingStatus>({ status: 'idle', message: '' });
  const [currentBalance, setCurrentBalance] = useState<string>('0');
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    // Check initial balance
    checkBalance();
    
    // Set up payment monitoring
    let closeStream: (() => void) | undefined;
    
    const setupMonitoring = async () => {
      setIsMonitoring(true);
      closeStream = await StellarFundingService.monitorAccountPayments(
        publicKey,
        (payment) => {
          console.log('Payment received:', payment);
          checkBalance();
          setFundingStatus({
            status: 'success',
            message: 'Payment received!',
          });
        },
        (error) => {
          console.error('Payment monitoring error:', error);
        }
      );
    };

    setupMonitoring();

    return () => {
      if (closeStream) {
        closeStream();
      }
      setIsMonitoring(false);
    };
  }, [publicKey]);

  const checkBalance = async () => {
    const balanceStatus = await StellarFundingService.checkAccountBalance(publicKey);
    if (balanceStatus.balance) {
      setCurrentBalance(balanceStatus.balance);
    }
  };

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
    
    setFundingStatus({ status: 'pending', message: 'Processing...' });
    
    if (selectedMethod === 'testnet') {
      const result = await StellarFundingService.fundTestnetAccount(publicKey);
      setFundingStatus(result);
      
      if (result.status === 'success') {
        await checkBalance();
        setTimeout(() => {
          onFundingComplete?.();
        }, 2000);
      }
    } else if (selectedMethod === 'crypto') {
      setFundingStatus({
        status: 'pending',
        message: 'Waiting for incoming transfer. Send XLM to the address above.',
      });
    } else if (selectedMethod === 'fiat') {
      setFundingStatus({
        status: 'pending',
        message: 'Redirecting to payment provider...',
      });
      // TODO: Integrate with on-ramp provider (e.g., MoonPay, Ramp Network)
      setTimeout(() => {
        setFundingStatus({
          status: 'error',
          message: 'Fiat on-ramp integration coming soon. Please use testnet or crypto transfer.',
        });
      }, 1500);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Fund Your Wallet</h2>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>Your Wallet Address:</strong>
        </p>
        <p className="font-mono text-sm mt-1 break-all">{publicKey}</p>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-sm text-blue-800">
            <strong>Current Balance:</strong> {parseFloat(currentBalance).toFixed(7)} XLM
          </p>
          <button
            onClick={checkBalance}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Refresh
          </button>
        </div>
      </div>

      {fundingStatus.status !== 'idle' && (
        <div
          className={`rounded-lg p-4 mb-6 ${
            fundingStatus.status === 'success'
              ? 'bg-green-50 border border-green-200'
              : fundingStatus.status === 'error'
              ? 'bg-red-50 border border-red-200'
              : 'bg-yellow-50 border border-yellow-200'
          }`}
        >
          <div className="flex items-start">
            {fundingStatus.status === 'pending' && (
              <svg
                className="animate-spin h-5 w-5 text-yellow-600 mr-3 mt-0.5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            {fundingStatus.status === 'success' && (
              <svg
                className="h-5 w-5 text-green-600 mr-3 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {fundingStatus.status === 'error' && (
              <svg
                className="h-5 w-5 text-red-600 mr-3 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <div className="flex-1">
              <p
                className={`text-sm font-medium ${
                  fundingStatus.status === 'success'
                    ? 'text-green-800'
                    : fundingStatus.status === 'error'
                    ? 'text-red-800'
                    : 'text-yellow-800'
                }`}
              >
                {fundingStatus.message}
              </p>
              {fundingStatus.txHash && (
                <a
                  href={getExplorerUrl(fundingStatus.txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 underline mt-1 inline-block"
                >
                  View transaction
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {isMonitoring && selectedMethod === 'crypto' && fundingStatus.status === 'pending' && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <svg
              className="animate-pulse h-5 w-5 text-purple-600 mr-3"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path
                fillRule="evenodd"
                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm text-purple-800">
              Monitoring for incoming payments in real-time...
            </p>
          </div>
        </div>
      )}

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
