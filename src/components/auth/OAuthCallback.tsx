import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { tokenStorage } from '../../utils/token.storage.utils';
import * as authService from '../../services/auth.service';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    // 1. Extract tokens from URL search params immediately
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const provider = params.get('provider') ?? 'unknown';
    const errorParam = params.get('error');
    const mergeRequired = params.get('merge_required');

    // 2. Strip tokens from URL before any render or state update
    window.history.replaceState({}, '', '/auth/callback');

    // 3. Handle error cases
    if (errorParam) {
      navigate(`/auth/error?provider=${encodeURIComponent(provider)}&error=${encodeURIComponent(errorParam)}`, { replace: true });
      return;
    }

    if (mergeRequired === 'true') {
      const email = params.get('email') ?? '';
      navigate(`/auth/error?provider=${encodeURIComponent(provider)}&merge_required=true&email=${encodeURIComponent(email)}`, { replace: true });
      return;
    }

    if (!accessToken) {
      navigate(`/auth/error?provider=${encodeURIComponent(provider)}`, { replace: true });
      return;
    }

    // 4. Process valid tokens
    const processCallback = async () => {
      try {
        // Store tokens in the same secure storage as email/password login
        tokenStorage.setTokens(accessToken, refreshToken ?? '');

        // Fetch user data using the newly stored access token
        const user = await authService.getMe();

        // Hydrate auth context
        setSession(user, accessToken, refreshToken ?? '');

        // Redirect to role-specific dashboard
        const redirectPath = user.role === 'mentor' ? '/mentor/dashboard' : '/learner/dashboard';
        navigate(redirectPath, { replace: true });
      } catch (err) {
        console.error('OAuth callback error:', err);
        // Clear any partially stored tokens
        tokenStorage.clearTokens();
        navigate(`/auth/error?provider=${encodeURIComponent(provider)}`, { replace: true });
      }
    };

    processCallback();
  }, [navigate, setSession]);

  // Minimal loading UI — tokens are already stripped from URL by this point
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Completing sign in…</h2>
        <p className="text-sm text-gray-600">Please wait while we set up your account.</p>
      </div>
    </div>
  );
}

