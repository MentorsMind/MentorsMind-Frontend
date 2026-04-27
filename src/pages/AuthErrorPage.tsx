import { useSearchParams, useNavigate } from 'react-router-dom';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function AuthErrorPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const provider = searchParams.get('provider') ?? 'unknown';
  const error = searchParams.get('error');
  const mergeRequired = searchParams.get('merge_required') === 'true';
  const email = searchParams.get('email') ?? '';

  const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);

  let title = 'Authentication Failed';
  let message = `We couldn't sign you in with ${providerName}. Please try again.`;

  if (mergeRequired) {
    title = 'Account Already Exists';
    message = `An account with email ${email} already exists. Please sign in with your password and link your ${providerName} account from settings.`;
  } else if (error === 'access_denied') {
    message = 'You denied access. Please try again if you want to sign in with OAuth.';
  } else if (error) {
    message = `Authentication failed: ${error}`;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <button
          onClick={() => navigate('/login')}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    </div>
  );
}

