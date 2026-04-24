import { useState } from 'react';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import { activateWallet } from '../../services/wallet.service';

interface WalletActivationCardProps {
  onActivated: () => void;
}

export default function WalletActivationCard({ onActivated }: WalletActivationCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleActivate = async () => {
    setLoading(true);
    setError('');
    try {
      await activateWallet();
      onActivated();
    } catch (err) {
      setError('Failed to activate wallet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-indigo-200 rounded-2xl p-8 text-center">
      <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg
          className="w-10 h-10 text-indigo-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
      </div>

      <h3 className="text-2xl font-bold text-gray-900 mb-2">
        Activate Your Stellar Wallet
      </h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Get started with blockchain payments by activating your Stellar wallet.
        You'll be able to receive payments in XLM, USDC, and PYUSD instantly.
      </p>

      {error && <Alert type="error" className="mb-4">{error}</Alert>}

      <div className="bg-white rounded-xl p-4 mb-6 text-left max-w-md mx-auto">
        <p className="text-sm font-semibold text-gray-900 mb-2">
          What is a Stellar wallet?
        </p>
        <ul className="text-sm text-gray-600 space-y-1">
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>Secure blockchain wallet for digital assets</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>Instant payments with near-zero fees</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>Full control over your funds</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>Transparent on-chain transactions</span>
          </li>
        </ul>
      </div>

      <Button onClick={handleActivate} loading={loading} size="lg">
        Activate Wallet
      </Button>

      <p className="text-xs text-gray-500 mt-4">
        By activating, you agree to our wallet terms and conditions
      </p>
    </div>
  );
}
