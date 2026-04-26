import { useState } from 'react';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import { tokenStorage } from '../../utils/token.storage.utils';

interface ConnectedAccount {
  provider: 'google' | 'github';
  email: string;
  connectedAt: string;
}

export default function ConnectedAccounts() {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([
    // Mock data - replace with actual API call
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleConnect = async (provider: 'google' | 'github') => {
    setLoading(true);
    setError('');
    try {
      // Redirect to OAuth flow with a return URL
      const returnUrl = encodeURIComponent(window.location.href);
      window.location.href = `${
        import.meta.env.VITE_API_URL || '/api'
      }/auth/${provider}?return_url=${returnUrl}`;
    } catch (err) {
      setError(`Failed to connect ${provider} account`);
      setLoading(false);
    }
  };

  const handleUnlink = async (provider: 'google' | 'github') => {
    if (
      !confirm(
        `Are you sure you want to unlink your ${provider} account? You can reconnect it later.`
      )
    ) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Call API to unlink account
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || '/api'}/auth/unlink/${provider}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${tokenStorage.getAccessToken()}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to unlink account');
      }

      setAccounts((prev) => prev.filter((acc) => acc.provider !== provider));
      setSuccess(`Successfully unlinked ${provider} account`);
    } catch (err) {
      setError(`Failed to unlink ${provider} account`);
    } finally {
      setLoading(false);
    }
  };

  const getProviderIcon = (provider: 'google' | 'github') => {
    if (provider === 'google') {
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path
          fillRule="evenodd"
          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
          clipRule="evenodd"
        />
      </svg>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Connected Accounts
        </h3>
        <p className="text-sm text-gray-600">
          Link your social accounts for quick sign-in and enhanced security.
        </p>
      </div>

      {error && <Alert type="error">{error}</Alert>}
      {success && <Alert type="success">{success}</Alert>}

      <div className="space-y-4">
        {(['google', 'github'] as const).map((provider) => {
          const account = accounts.find((acc) => acc.provider === provider);
          const isConnected = !!account;

          return (
            <div
              key={provider}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-xl"
            >
              <div className="flex items-center gap-3">
                {getProviderIcon(provider)}
                <div>
                  <p className="font-medium text-gray-900 capitalize">
                    {provider}
                  </p>
                  {isConnected ? (
                    <p className="text-sm text-gray-600">{account.email}</p>
                  ) : (
                    <p className="text-sm text-gray-500">Not connected</p>
                  )}
                </div>
              </div>

              {isConnected ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUnlink(provider)}
                  loading={loading}
                >
                  Unlink
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => handleConnect(provider)}
                  loading={loading}
                >
                  Connect
                </Button>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-900 font-medium mb-1">
          💡 Why connect accounts?
        </p>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Sign in faster without entering your password</li>
          <li>Recover your account if you forget your password</li>
          <li>Enhanced security with multiple authentication methods</li>
        </ul>
      </div>
    </div>
  );
}
