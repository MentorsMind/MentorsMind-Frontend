import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../types';
import * as authService from '../services/auth.service';

export interface MFAPendingState {
  mfa_token: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  /** Set when the backend returns mfa_required:true — holds the temporary mfa_token */
  mfaPending: MFAPendingState | null;
  login: (email: string, password: string) => Promise<{ mfaRequired: boolean }>;
  /** Complete the MFA challenge after login */
  completeMFAChallenge: (totp: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: 'mentor' | 'learner') => Promise<void>;
  logout: () => Promise<void>;
  /** Refresh the stored user object (e.g. after enabling/disabling MFA) */
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function persistSession(user: User, token: string, refreshToken: string) {
  localStorage.setItem('mm_user', JSON.stringify(user));
  localStorage.setItem('mm_token', token);
  localStorage.setItem('mm_refresh_token', refreshToken);
}

function clearSession() {
  localStorage.removeItem('mm_user');
  localStorage.removeItem('mm_token');
  localStorage.removeItem('mm_refresh_token');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mfaPending, setMfaPending] = useState<MFAPendingState | null>(null);

  useEffect(() => {
    // Restore session from storage, then verify with backend
    const stored = localStorage.getItem('mm_user');
    const token = localStorage.getItem('mm_token');
    if (stored && token) {
      setUser(JSON.parse(stored));
      // Silently refresh user data from backend
      authService.getMe()
        .then((freshUser) => {
          setUser(freshUser);
          localStorage.setItem('mm_user', JSON.stringify(freshUser));
        })
        .catch(() => {
          clearSession();
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ mfaRequired: boolean }> => {
    const result = await authService.login(email, password);
    if ('mfa_required' in result && result.mfa_required) {
      setMfaPending({ mfa_token: result.mfa_token });
      return { mfaRequired: true };
    }
    const { user, token, refreshToken } = result as authService.MFALoginResponse;
    persistSession(user, token, refreshToken);
    setUser(user);
    return { mfaRequired: false };
  };

  const completeMFAChallenge = async (totp: string) => {
    if (!mfaPending) throw new Error('No MFA challenge in progress');
    const { user, token, refreshToken } = await authService.mfaVerify(mfaPending.mfa_token, totp);
    setMfaPending(null);
    persistSession(user, token, refreshToken);
    setUser(user);
  };

  const register = async (name: string, email: string, password: string, role: 'mentor' | 'learner') => {
    const { user, token, refreshToken } = await authService.register(name, email, password, role);
    persistSession(user, token, refreshToken);
    setUser(user);
  };

  const logout = async () => {
    await authService.logout();
    clearSession();
    setMfaPending(null);
    setUser(null);
  };

  const refreshUser = async () => {
    const freshUser = await authService.getMe();
    setUser(freshUser);
    localStorage.setItem('mm_user', JSON.stringify(freshUser));
  };

  return (
    <AuthContext.Provider value={{ user, loading, mfaPending, login, completeMFAChallenge, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
