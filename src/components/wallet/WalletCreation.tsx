import { useState } from 'react';
import type { WalletCreationStep } from '../../types/wallet.types';

interface WalletCreationProps {
  onComplete: (nickname?: string) => void;
  onCancel: () => void;
}

export const WalletCreation = ({ onComplete, onCancel }: WalletCreationProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [nickname, setNickname] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const steps: WalletCreationStep[] = [
    {
      step: 1,
      title: 'Welcome',
      description: 'Create your Stellar wallet to start managing your assets',
      completed: false
    },
    {
      step: 2,
      title: 'Name Your Wallet',
      description: 'Give your wallet a memorable name',
      completed: false
    },
    {
      step: 3,
      title: 'Security Information',
      description: 'Important information about keeping your wallet secure',
      completed: false
    },
    {
      step: 4,
      title: 'Confirmation',
      description: 'Review and create your wallet',
      completed: false
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(nickname || undefined);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    if (currentStep === 2) return agreedToTerms;
    return true;
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          {steps.map((step, index) => (
            <div key={step.step} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  index <= currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step.step}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-16 h-1 ${
                    index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <h2 className="text-2xl font-bold">{steps[currentStep].title}</h2>
        <p className="text-gray-600">{steps[currentStep].description}</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        {currentStep === 0 && (
          <div className="space-y-4">
            <p>Welcome to Stellar Wallet Management!</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Securely store and manage your Stellar assets</li>
              <li>Send and receive payments instantly</li>
              <li>Track your transaction history</li>
              <li>Support for multiple assets</li>
            </ul>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-4">
            <label className="block">
              <span className="text-gray-700">Wallet Nickname (Optional)</span>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="e.g., My Main Wallet"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                maxLength={50}
              />
            </label>
            <p className="text-sm text-gray-500">
              This helps you identify your wallet if you have multiple wallets.
            </p>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">Important Security Information</h3>
              <ul className="list-disc list-inside space-y-2 text-yellow-700 text-sm">
                <li>Your secret key will be generated and must be backed up securely</li>
                <li>Never share your secret key with anyone</li>
                <li>Store your backup in a safe place - we cannot recover it for you</li>
                <li>You are solely responsible for the security of your wallet</li>
              </ul>
            </div>
            <label className="flex items-start space-x-2">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1"
              />
              <span className="text-sm text-gray-700">
                I understand that I am responsible for securing my wallet and that lost secret keys cannot be recovered.
              </span>
            </label>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Review Your Wallet Details</h3>
            <div className="bg-gray-50 rounded p-4 space-y-2">
              <div>
                <span className="text-gray-600">Wallet Name:</span>
                <span className="ml-2 font-medium">{nickname || 'Unnamed Wallet'}</span>
              </div>
              <div>
                <span className="text-gray-600">Network:</span>
                <span className="ml-2 font-medium">Stellar Mainnet</span>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              After creation, you'll be prompted to backup your secret key. Please do this immediately.
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button
          onClick={currentStep === 0 ? onCancel : handleBack}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          {currentStep === 0 ? 'Cancel' : 'Back'}
        </button>
        <button
          onClick={handleNext}
          disabled={!canProceed()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {currentStep === steps.length - 1 ? 'Create Wallet' : 'Next'}
        </button>
      </div>
    </div>
  );
};
