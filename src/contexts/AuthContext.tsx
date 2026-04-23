import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../types';
import * as authService from '../services/auth.service';
import { TOKEN_KEY, REFRESH_TOKEN } from '../config/app.config';

export interface MFAPendingState {
  mfa_token: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  mfaPending: MFAPendingState | null;
  login: (email: string, password: string) => Promise<{ mfaRequired: boolean }>;
  completeMFAChallenge: (totp: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string, role: 'mentor' | 'learner') => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  /** Refresh the stored user object (e.g. after enabling/disabling MFA) */
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function persistSession(user: User, token: string, refreshToken: string) {
  localStorage.setItem('mm_user', JSON.stringify(user));
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(REFRESH_TOKEN, refreshToken);
}

function clearSession() {
  localStorage.removeItem('mm_user');
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mfaPending, setMfaPending] = useState<MFAPendingState | null>(null);

  useEffect(() => {
    // Restore session from storage, then verify with backend.
    // Using async/await with try/finally guarantees setLoading(false) always runs,
    // even if JSON.parse throws synchronously or the network call fails unexpectedly.
    const restoreSession = async () => {
      try {
        const stored = localStorage.getItem('mm_user');
        const token = localStorage.getItem(TOKEN_KEY);
        if (stored && token) {
          // Optimistically restore user from storage while we verify with backend
          setUser(JSON.parse(stored));
          try {
            const freshUser = await authService.getMe();
            setUser(freshUser);
            localStorage.setItem('mm_user', JSON.stringify(freshUser));
          } catch {
            // Token expired or network failure — clear everything and show login
            clearSession();
            setUser(null);
          }
        }
      } finally {
        // Always dismiss the loading screen regardless of outcome
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email: string, password: string): Promise<{ mfaRequired: boolean }> => {
    setError(null);
    try {
      const result = await authService.login(email, password);
      if ('mfa_required' in result && result.mfa_required) {
        setMfaPending({ mfa_token: result.mfa_token });
        return { mfaRequired: true };
      }
      const { user, token, refreshToken } = result as authService.MFALoginResponse;
      persistSession(user, token, refreshToken);
      setUser(user);
      return { mfaRequired: false };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(errorMessage);
      throw err;
    }
  };

  const completeMFAChallenge = async (totp: string) => {
    if (!mfaPending) throw new Error('No MFA challenge in progress');
    const { user, token, refreshToken } = await authService.mfaVerify(mfaPending.mfa_token, totp);
    setMfaPending(null);
    persistSession(user, token, refreshToken);
    setUser(user);
  };

  const register = async (firstName: string, lastName: string, email: string, password: string, role: 'mentor' | 'learner') => {
    setError(null);
    try {
      const { user, token, refreshToken } = await authService.register(firstName, lastName, email, password, role);
      persistSession(user, token, refreshToken);
      setUser(user);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(errorMessage);
      throw err;
    }
  };

  const logout = async () => {
    await authService.logout();
    clearSession();
    setMfaPending(null);
    setUser(null);
    setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  const refreshUser = async () => {
    const freshUser = await authService.getMe();
    setUser(freshUser);
    localStorage.setItem('mm_user', JSON.stringify(freshUser));
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isAuthenticated: !!user,
      isLoading: loading,
      error, 
      mfaPending, 
      login, 
      completeMFAChallenge, 
      register, 
      logout, 
      clearError, 
      refreshUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
