import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '../types';
import * as authService from '../services/auth.service';
import { TOKEN_KEY, REFRESH_TOKEN } from '../config/app.config';
import { WebSocketService, WebSocketConfig } from '../services/websocket.service';
import { apiConfig } from '../config/api.config';
import { tokenStorage } from '../utils/token.storage.utils';

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
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  clearError: () => void;
  /** Refresh the stored user object (e.g. after enabling/disabling MFA) */
  refreshUser: () => Promise<void>;
  /** Refresh the access token using refresh token */
  refreshToken: () => Promise<string | null>;
  /** Patch the stored user object locally (e.g. after avatar upload) */
  updateUser: (patch: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function persistSession(user: User, token: string, refreshToken: string) {
  localStorage.setItem('mm_user', JSON.stringify(user));
  tokenStorage.setTokens(token, refreshToken);
}

function clearSession() {
  localStorage.removeItem('mm_user');
  tokenStorage.clearTokens();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mfaPending, setMfaPending] = useState<MFAPendingState | null>(null);
  const [webSocket, setWebSocket] = useState<WebSocketService | null>(null);

  useEffect(() => {
    // Restore session from storage, then verify with backend.
    // Using async/await with try/finally guarantees setLoading(false) always runs,
    // even if JSON.parse throws synchronously or the network call fails unexpectedly.
    const restoreSession = async () => {
      try {
        const stored = localStorage.getItem('mm_user');
        const token = tokenStorage.getAccessToken();
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
      initializeWebSocket(token);
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
    initializeWebSocket(token);
  };

  const register = async (firstName: string, lastName: string, email: string, password: string, role: 'mentor' | 'learner') => {
    setError(null);
    try {
      const { user, token, refreshToken } = await authService.register(firstName, lastName, email, password, role);
      persistSession(user, token, refreshToken);
      setUser(user);
      initializeWebSocket(token);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(errorMessage);
      throw err;
    }
  };

  const logout = async () => {
    if (webSocket) {
      webSocket.disconnect();
      setWebSocket(null);
    }
    await authService.logout();
    clearSession();
    setMfaPending(null);
    setUser(null);
    setError(null);
  };
  
  const verifyEmail = async (token: string) => {
    setError(null);
    try {
      await authService.verifyEmail(token);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Email verification failed.';
      setError(errorMessage);
      throw err;
    }
  };

  const resendVerification = async () => {
    setError(null);
    try {
      await authService.resendVerification();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resend verification email.';
      setError(errorMessage);
      throw err;
    }
  };

  const clearError = () => {
    setError(null);
  };

  const refreshUser = async () => {
    const freshUser = await authService.getMe();
    setUser(freshUser);
    localStorage.setItem('mm_user', JSON.stringify(freshUser));
  };

  const refreshToken = async (): Promise<string | null> => {
    const refreshTokenValue = localStorage.getItem(REFRESH_TOKEN);
    if (!refreshTokenValue) return null;

    try {
      const { token, refreshToken: newRefreshToken } = await authService.refreshToken(refreshTokenValue);
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(REFRESH_TOKEN, newRefreshToken);
      return token;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // If refresh fails, logout
      clearSession();
      setUser(null);
      return null;
    }
  };

  const initializeWebSocket = (token: string) => {
    if (webSocket) {
      webSocket.disconnect();
    }
    const config: WebSocketConfig = {
      url: apiConfig.wsURL,
      onTokenRefresh: refreshToken,
    };
    const ws = new WebSocketService(config);
    setWebSocket(ws);
    ws.connect(token).catch(console.error);
  const updateUser = (patch: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...patch };
      localStorage.setItem('mm_user', JSON.stringify(updated));
      return updated;
    });
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
      verifyEmail,
      resendVerification,
      clearError, 
      refreshUser,
      updateUser,
      refreshToken
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
