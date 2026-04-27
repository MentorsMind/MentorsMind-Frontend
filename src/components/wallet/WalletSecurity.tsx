import { useState } from 'react';
import type { WalletSecuritySettings } from '../../types/wallet.types';

interface WalletSecurityProps {
  settings: WalletSecuritySettings;
  onUpdate: (settings: Partial<WalletSecuritySettings>) => void;
}

export const WalletSecurity = ({ settings, onUpdate }: WalletSecurityProps) => {
  const [localSettings, setLocalSettings] = useState(settings);
  const [newTrustedAddress, setNewTrustedAddress] = useState('');
  const [showAddAddress, setShowAddAddress] = useState(false);

  const handleToggle = (key: keyof WalletSecuritySettings) => {
    const updated = { ...localSettings, [key]: !localSettings[key] };
    setLocalSettings(updated);
    onUpdate({ [key]: updated[key] });
  };

  const handleTimeoutChange = (timeout: number) => {
    const updated = { ...localSettings, autoLockTimeout: timeout };
    setLocalSettings(updated);
    onUpdate({ autoLockTimeout: timeout });
  };

  const handleAddTrustedAddress = () => {
    if (!newTrustedAddress.trim()) return;
    
    // Basic validation for Stellar address
    if (!newTrustedAddress.startsWith('G') || newTrustedAddress.length !== 56) {
      alert('Invalid Stellar address format');
      return;
    }

    const updated = {
      ...localSettings,
      trustedAddresses: [...localSettings.trustedAddresses, newTrustedAddress]
    };
    setLocalSettings(updated);
    onUpdate({ trustedAddresses: updated.trustedAddresses });
    setNewTrustedAddress('');
    setShowAddAddress(false);
  };

  const handleRemoveTrustedAddress = (address: string) => {
    const updated = {
      ...localSettings,
      trustedAddresses: localSettings.trustedAddresses.filter(a => a !== address)
    };
    setLocalSettings(updated);
    onUpdate({ trustedAddresses: updated.trustedAddresses });
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Security Settings</h2>

      <div className="space-y-6">
        {/* Transaction Password */}
        <div className="bg-background rounded-lg shadow p-6 border border-border">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">Transaction Password</h3>
              <p className="text-sm text-muted-foreground">
                Require password confirmation before sending transactions
              </p>
            </div>
            <button
              onClick={() => handleToggle('requirePasswordForTransactions')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                localSettings.requirePasswordForTransactions ? 'bg-primary' : 'bg-border'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-primary-foreground transition-transform ${
                  localSettings.requirePasswordForTransactions ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Biometric Authentication */}
        <div className="bg-background rounded-lg shadow p-6 border border-border">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">Biometric Authentication</h3>
              <p className="text-sm text-muted-foreground">
                Use fingerprint or face recognition to unlock wallet
              </p>
            </div>
            <button
              onClick={() => handleToggle('biometricEnabled')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                localSettings.biometricEnabled ? 'bg-primary' : 'bg-border'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-primary-foreground transition-transform ${
                  localSettings.biometricEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Auto-Lock Timeout */}
        <div className="bg-background rounded-lg shadow p-6 border border-border">
          <h3 className="font-semibold text-lg mb-3">Auto-Lock Timeout</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Automatically lock wallet after period of inactivity
          </p>
          <div className="space-y-2">
            {[
              { value: 60, label: '1 minute' },
              { value: 300, label: '5 minutes' },
              { value: 900, label: '15 minutes' },
              { value: 1800, label: '30 minutes' },
              { value: 0, label: 'Never' }
            ].map(({ value, label }) => (
              <label
                key={value}
                className="flex items-center space-x-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-surface transition-colors"
              >
                <input
                  type="radio"
                  name="timeout"
                  checked={localSettings.autoLockTimeout === value}
                  onChange={() => handleTimeoutChange(value)}
                  className="w-4 h-4 text-primary"
                />
                <span className="text-sm font-medium">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Trusted Addresses */}
        <div className="bg-background rounded-lg shadow p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg">Trusted Addresses</h3>
              <p className="text-sm text-muted-foreground">
                Skip confirmation for transactions to these addresses
              </p>
            </div>
            <button
              onClick={() => setShowAddAddress(!showAddAddress)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors text-sm font-medium"
            >
              Add Address
            </button>
          </div>

          {showAddAddress && (
            <div className="mb-4 p-4 bg-surface rounded-lg">
              <label className="block text-sm font-medium text-text mb-2">
                Stellar Address
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTrustedAddress}
                  onChange={(e) => setNewTrustedAddress(e.target.value)}
                  placeholder="G..."
                  className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-text focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
                />
                <button
                  onClick={handleAddTrustedAddress}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowAddAddress(false);
                    setNewTrustedAddress('');
                  }}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-surface transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {localSettings.trustedAddresses.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No trusted addresses added yet
            </p>
          ) : (
            <div className="space-y-2">
              {localSettings.trustedAddresses.map((address) => (
                <div
                  key={address}
                  className="flex items-center justify-between p-3 bg-surface rounded-lg"
                >
                  <p className="font-mono text-sm truncate flex-1 mr-4">
                    {address.substring(0, 12)}...{address.substring(address.length - 12)}
                  </p>
                  <button
                    onClick={() => handleRemoveTrustedAddress(address)}
                    className="text-destructive hover:opacity-80 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Additional Security Info */}
        <div className="bg-accent border border-primary/20 rounded-lg p-4">
          <h4 className="font-semibold text-accent-foreground mb-2">Security Best Practices</h4>
          <ul className="text-sm text-accent-foreground/80 space-y-1">
            <li>• Always verify recipient addresses before sending</li>
            <li>• Keep your secret key and backup phrase secure</li>
            <li>• Enable all available security features</li>
            <li>• Use a strong, unique password</li>
            <li>• Be cautious of phishing attempts</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
