import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'learner' | 'mentor';
  stellarPublicKey?: string;
  emailVerified: boolean;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (email: string, password: string, name: string, role: 'learner' | 'mentor') => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    // Check for existing session on mount
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const rememberMe = localStorage.getItem('rememberMe') === 'true';
        
        if (storedUser && rememberMe) {
          const user = JSON.parse(storedUser);
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          setState((prev: AuthState) => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        setState((prev: AuthState) => ({ ...prev, isLoading: false }));
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string, rememberMe = false) => {
    setState((prev: AuthState) => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock validation
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Mock user data
      const user: User = {
        id: 'user-' + Date.now(),
        email,
        name: email.split('@')[0],
        role: 'learner',
        emailVerified: true,
      };

      if (rememberMe) {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('rememberMe', 'true');
      } else {
        sessionStorage.setItem('user', JSON.stringify(user));
      }

      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState((prev: AuthState) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      }));
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string, role: 'learner' | 'mentor') => {
    setState((prev: AuthState) => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock validation
      if (!email || !password || !name) {
        throw new Error('All fields are required');
      }

      // Mock Stellar wallet creation
      const stellarPublicKey = 'G' + Math.random().toString(36).substring(2, 15).toUpperCase();

      const user: User = {
        id: 'user-' + Date.now(),
        email,
        name,
        role,
        stellarPublicKey,
        emailVerified: false,
      };

      sessionStorage.setItem('user', JSON.stringify(user));

      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState((prev: AuthState) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      }));
      throw error;
    }
  };

  const logout = async () => {
    setState((prev: AuthState) => ({ ...prev, isLoading: true }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      localStorage.removeItem('user');
      localStorage.removeItem('rememberMe');
      sessionStorage.removeItem('user');

      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState((prev: AuthState) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Logout failed',
      }));
    }
  };

  const forgotPassword = async (email: string) => {
    setState((prev: AuthState) => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!email) {
        throw new Error('Email is required');
      }

      setState((prev: AuthState) => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState((prev: AuthState) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to send reset email',
      }));
      throw error;
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    setState((prev: AuthState) => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!token || !newPassword) {
        throw new Error('Invalid reset token or password');
      }

      setState((prev: AuthState) => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState((prev: AuthState) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Password reset failed',
      }));
      throw error;
    }
  };

  const verifyEmail = async (token: string) => {
    setState((prev: AuthState) => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!token) {
        throw new Error('Invalid verification token');
      }

      if (state.user) {
        const updatedUser = { ...state.user, emailVerified: true };
        setState((prev: AuthState) => ({
          ...prev,
          user: updatedUser,
          isLoading: false,
        }));
      }
    } catch (error) {
      setState((prev: AuthState) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Email verification failed',
      }));
      throw error;
    }
  };

  const resendVerification = async () => {
    setState((prev: AuthState) => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!state.user?.email) {
        throw new Error('No user email found');
      }

      setState((prev: AuthState) => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState((prev: AuthState) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to resend verification',
      }));
      throw error;
    }
  };

  const clearError = () => {
    setState((prev: AuthState) => ({ ...prev, error: null }));
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        verifyEmail,
        resendVerification,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
