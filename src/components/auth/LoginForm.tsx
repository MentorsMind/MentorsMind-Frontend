import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Fingerprint, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { usePasskey } from '../../hooks/usePasskey';
import { TOKEN_KEY, REFRESH_TOKEN } from '../../config/app.config';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import OAuthButtons from './OAuthButtons';

export default function LoginForm() {
  const { login, error: authError, clearError } = useAuth();
  const navigate = useNavigate();
  const { isSupported, checkingSupport, authenticate, status: passkeyStatus, error: passkeyError, clearError: clearPasskeyError } = usePasskey();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ── Password login ─────────────────────────────────────────────────────────
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    clearError();
    clearPasskeyError();
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      const { mfaRequired } = await login(email, password);
      if (mfaRequired) {
        navigate('/auth/mfa-challenge');
      } else {
        navigate('/learner/dashboard');
      }
    } catch {
      // Error is already set in context, just handle navigation
    } finally {
      setLoading(false);
    }
  };

  // ── Passkey login ──────────────────────────────────────────────────────────
  const handlePasskeyLogin = async () => {
    setError('');
    clearPasskeyError();
    const result = await authenticate();
    if (result) {
      // Persist session the same way the password login does via AuthContext
      localStorage.setItem('mm_user', JSON.stringify(result.user));
      localStorage.setItem(TOKEN_KEY, result.token);
      localStorage.setItem(REFRESH_TOKEN, result.refreshToken);
      // Force a full reload so AuthContext picks up the new session
      window.location.replace('/learner/dashboard');
    }
  };

  const passkeyLoading = passkeyStatus === 'loading';
  const displayError = error || authError || passkeyError || '';

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md bg-background rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <span className="text-4xl">⭐</span>
          <h1 className="text-2xl font-bold text-text mt-2">Welcome back</h1>
          <p className="text-muted-foreground text-sm mt-1">Sign in to your MentorMinds account</p>
        </div>

        {displayError && <Alert type="error" className="mb-4">{displayError}</Alert>}

        {/* OAuth Buttons */}
        <OAuthButtons mode="login" disabled={loading || passkeyLoading} />

        {/* Passkey / biometric sign-in */}
        {!checkingSupport && isSupported && (
          <div className="mb-6">
            <button
              type="button"
              onClick={handlePasskeyLogin}
              disabled={passkeyLoading || loading}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-3
                border-2 border-indigo-200 rounded-xl text-sm font-semibold text-indigo-700
                bg-indigo-50 hover:bg-indigo-100 transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              aria-label="Sign in with biometric / passkey"
            >
              {passkeyLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Fingerprint className="w-4 h-4" />
              )}
              {passkeyLoading ? 'Verifying…' : 'Sign in with biometrics'}
            </button>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium">or use password</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-sm text-indigo-600 hover:underline">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" loading={loading} className="w-full">
            Sign in
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-600 font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
