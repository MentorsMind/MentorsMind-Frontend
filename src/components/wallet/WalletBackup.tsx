import { useState } from 'react';
import type { WalletBackup as WalletBackupType } from '../../types/wallet.types';

interface WalletBackupProps {
  backup: WalletBackupType;
  onBackupComplete: () => void;
}

export const WalletBackup = ({ backup, onBackupComplete }: WalletBackupProps) => {
  const [step, setStep] = useState<'view' | 'verify'>('view');
  const [verificationInput, setVerificationInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(backup.secretKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const content = `Stellar Wallet Backup
Created: ${backup.createdAt.toISOString()}

Public Key: ${backup.publicKey}
Secret Key: ${backup.secretKey}

⚠️ IMPORTANT SECURITY INFORMATION ⚠️
- Never share your secret key with anyone
- Store this file in a secure location
- Anyone with access to your secret key can access your funds
- We cannot recover your secret key if you lose it
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stellar-wallet-backup-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloaded(true);
  };

  const handleVerify = () => {
    if (verificationInput.trim() === backup.secretKey) {
      onBackupComplete();
    } else {
      alert('The secret key you entered does not match. Please try again.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Backup Your Wallet</h2>
        <p className="text-gray-600">
          {step === 'view' 
            ? 'Save your secret key in a secure location. You will need it to recover your wallet.'
            : 'Verify that you have correctly saved your secret key.'
          }
        </p>
      </div>

      {step === 'view' && (
        <>
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="font-semibold text-red-800 mb-1">Critical Security Warning</h3>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Your secret key is the ONLY way to access your wallet</li>
                  <li>• We cannot recover your secret key if you lose it</li>
                  <li>• Anyone with your secret key can access your funds</li>
                  <li>• Never share your secret key with anyone</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-3">
              <label className="text-gray-400 text-sm font-medium">Secret Key</label>
              <button
                onClick={handleCopy}
                className="text-blue-400 hover:text-blue-300 text-sm flex items-center space-x-1"
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <p className="font-mono text-white text-sm break-all bg-gray-800 p-4 rounded">
              {backup.secretKey}
            </p>
          </div>

          <div className="space-y-3 mb-6">
            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center space-x-2 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span className="font-semibold">
                {downloaded ? 'Downloaded' : 'Download Backup File'}
              </span>
            </button>
          </div>

          <button
            onClick={() => setStep('verify')}
            disabled={!copied && !downloaded}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            I've Saved My Secret Key
          </button>
        </>
      )}

      {step === 'verify' && (
        <>
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter your secret key to verify
            </label>
            <input
              type="text"
              value={verificationInput}
              onChange={(e) => setVerificationInput(e.target.value)}
              placeholder="Paste your secret key here"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setStep('view')}
              className="flex-1 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleVerify}
              disabled={!verificationInput.trim()}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Verify & Complete
            </button>
          </div>
        </>
      )}
    </div>
  );
};
