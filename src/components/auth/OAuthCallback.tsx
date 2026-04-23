import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get OAuth data from URL params
        const token = searchParams.get('token');
        const refreshToken = searchParams.get('refreshToken');
        const userData = searchParams.get('user');
        const errorParam = searchParams.get('error');
        const mergeRequired = searchParams.get('merge_required');

        if (errorParam) {
          if (errorParam === 'access_denied') {
            setError('You denied access. Please try again if you want to sign in with OAuth.');
          } else {
            setError(`Authentication failed: ${errorParam}`);
          }
          setProcessing(false);
          return;
        }

        if (mergeRequired === 'true') {
          // OAuth account is already linked to an existing email/password account
          const email = searchParams.get('email');
          setError(
            `An account with email ${email} already exists. Please sign in with your password and link your OAuth account from settings.`
          );
          setProcessing(false);
          setTimeout(() => navigate('/login'), 5000);
          return;
        }

        if (token && refreshToken && userData) {
          // Parse user data
          const parsedUser = JSON.parse(decodeURIComponent(userData));

          // Store session
          localStorage.setItem('mm_user', JSON.stringify(parsedUser));
          localStorage.setItem('mm_token', token);
          localStorage.setItem('mm_refresh_token', refreshToken);

          // Redirect based on role
          const redirectPath =
            parsedUser.role === 'mentor'
              ? '/mentor/dashboard'
              : '/learner/dashboard';

          // Force reload to update AuthContext
          window.location.replace(redirectPath);
        } else {
          setError('Invalid OAuth response. Please try again.');
          setProcessing(false);
        }
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError('Failed to process OAuth login. Please try again.');
        setProcessing(false);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
        {processing ? (
          <>
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Completing sign in...
            </h2>
            <p className="text-sm text-gray-600">
              Please wait while we set up your account.
            </p>
          </>
        ) : error ? (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Authentication Failed
            </h2>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Back to Login
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
