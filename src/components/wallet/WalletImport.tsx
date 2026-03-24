import { useState } from 'react';

interface WalletImportProps {
  onImport: (secretKey: string, nickname?: string) => Promise<void>;
  onCancel: () => void;
}

export const WalletImport = ({ onImport, onCancel }: WalletImportProps) => {
  const [importMethod, setImportMethod] = useState<'secret' | 'mnemonic'>('secret');
  const [secretKey, setSecretKey] = useState('');
  const [mnemonic, setMnemonic] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateSecretKey = (key: string): boolean => {
    // Stellar secret keys start with 'S' and are 56 characters
    return key.startsWith('S') && key.length === 56;
  };

  const handleImport = async () => {
    setError(null);
    
    if (importMethod === 'secret') {
      if (!validateSecretKey(secretKey)) {
        setError('Invalid secret key format. Secret keys should start with "S" and be 56 characters long.');
        return;
      }
      
      setLoading(true);
      try {
        await onImport(secretKey, nickname || undefined);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to import wallet');
      } finally {
        setLoading(false);
      }
    } else {
      // TODO: Implement mnemonic import
      setError('Mnemonic import is not yet implemented');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Import Existing Wallet</h2>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div className="text-sm text-yellow-800">
            <p className="font-semibold mb-1">Security Warning</p>
            <p>Only import wallets on devices you trust. Never share your secret key or mnemonic phrase with anyone.</p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">Import Method</label>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setImportMethod('secret')}
            className={`p-4 border-2 rounded-lg text-left transition-all ${
              importMethod === 'secret'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-semibold mb-1">Secret Key</div>
            <div className="text-sm text-gray-600">Import using your 56-character secret key</div>
          </button>
          
          <button
            onClick={() => setImportMethod('mnemonic')}
            className={`p-4 border-2 rounded-lg text-left transition-all ${
              importMethod === 'mnemonic'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-semibold mb-1">Mnemonic Phrase</div>
            <div className="text-sm text-gray-600">Import using 12 or 24 word phrase</div>
          </button>
        </div>
      </div>

      {importMethod === 'secret' && (
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secret Key <span className="text-red-500">*</span>
            </label>
            <textarea
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value.trim())}
              placeholder="S..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Your secret key should start with 'S' and be 56 characters long
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wallet Nickname (Optional)
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g., My Imported Wallet"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={50}
            />
          </div>
        </div>
      )}

      {importMethod === 'mnemonic' && (
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mnemonic Phrase <span className="text-red-500">*</span>
            </label>
            <textarea
              value={mnemonic}
              onChange={(e) => setMnemonic(e.target.value)}
              placeholder="Enter your 12 or 24 word mnemonic phrase..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Separate each word with a space
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wallet Nickname (Optional)
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g., My Imported Wallet"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={50}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="flex space-x-3">
        <button
          onClick={onCancel}
          disabled={loading}
          className="flex-1 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleImport}
          disabled={loading || (importMethod === 'secret' ? !secretKey : !mnemonic)}
          className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Importing...' : 'Import Wallet'}
        </button>
      </div>
    </div>
  );
};
