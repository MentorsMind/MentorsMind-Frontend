import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { ApiError } from "../services/api.error";
import AuthService from "../services/auth.service";
import { User, UserRole } from "../types";
import { clientStorage, sessionStore } from "../utils/client.storage.utils";
import { setGlobalLogoutHandler } from "../utils/global.logout.utils";
import { tokenStorage } from "../utils/token.storage.utils";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  fieldErrors: Record<string, string>;
}

interface AuthContextType extends AuthState {
  login: (
    email: string,
    password: string,
    rememberMe?: boolean,
  ) => Promise<void>;
  register: (
    email: string,
    password: string,
    name: string,
    role: "learner" | "mentor",
  ) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const authService = new AuthService();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    fieldErrors: {},
  });

  useEffect(() => {
    // Check for existing session on mount
    const checkAuth = async () => {
      try {
        // Check if tokens exist
        if (tokenStorage.hasTokens()) {
          // Validate tokens via user data
          const userRes = await authService.me();
          const storedUser = clientStorage.getUser("user");

          // const rememberMe = clientStorage.getRememberMe("rememberMe");

          if (userRes && storedUser) {
            const user = storedUser;

            setState({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
              fieldErrors: {},
            });
          } else {
            // Token invalid, clear everything
            tokenStorage.cleaTokens();
            clientStorage.clearUser("user");
            clientStorage.clearRememberMe("rememberMe");

            setState((prev: AuthState) => ({ ...prev, isLoading: false }));
          }
        } else {
          setState((prev: AuthState) => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error(error);
        // Token validation failed
        tokenStorage.cleaTokens();
        clientStorage.clearUser("user");
        clientStorage.clearRememberMe("rememberMe");

        setState((prev: AuthState) => ({ ...prev, isLoading: false }));
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string, rememberMe = false) => {
    setState((prev: AuthState) => ({ ...prev, isLoading: true, error: null }));

    // Mock validation
    if (!email || !password) {
      throw new Error("Email and password are required");
    }
    try {
      const res = await authService.login(email, password);

      // Store tokens
      tokenStorage.setTokens(res.accessToken, res.refreshToken);

      // Fetch current user data
      const me = await authService.me();
      const user: User = {
        id: me.id,
        email: me.email,
        name: me.name,
        role: me.role,
        emailVerified: me.emailVerified,
      };

      // Handle rememberMe
      if (rememberMe) {
        clientStorage.setUser("user", user);
        clientStorage.setRememberMe("rememberMe", true);
      } else {
        sessionStore.setUser("user", user);
      }

      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        fieldErrors: {},
      });
    } catch (error) {
      const fieldErrors: Record<string, string> = {};
      let errMsg = "Login failed";

      if (error instanceof ApiError) {
        errMsg = error.message;
        if (error.validationErrors) {
          Object.assign(fieldErrors, error.validationErrors);
        }
      } else if (error instanceof Error) {
        errMsg = error.message;
      }

      setState((prev: AuthState) => ({
        ...prev,
        isLoading: false,
        error: Object.keys(fieldErrors).length ? null : errMsg,
      }));
      throw error;
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    role: UserRole,
  ) => {
    setState((prev: AuthState) => ({
      ...prev,
      isLoading: true,
      error: null,
      fieldErrors: {},
    }));

    if (!email || !password || !name) {
      throw new Error("All fields are required");
    }

    try {
      // Call real API
      const res = await authService.signup(email, password, name, role);

      // Store token
      tokenStorage.setTokens(res.accessToken, res.refreshToken);

      // Mock Stellar wallet creation
      const stellarPublicKey =
        "G" + Math.random().toString(36).substring(2, 15).toUpperCase();

      // Fetch user data
      const userRes = await authService.me();

      const user: User = {
        id: userRes.id,
        email: userRes.email,
        name: userRes.email,
        role: userRes.role,
        stellarPublicKey,
        emailVerified: userRes.emailVerified,
      };

      sessionStore.setUser("user", user);

      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        fieldErrors: {},
      });
    } catch (error) {
      catchError(error, setState, "Registration failed");

      throw error;
    }
  };

  const logout = async () => {
    setState((prev: AuthState) => ({ ...prev, isLoading: true }));

    try {
      // API call
      await authService.logout();

      tokenStorage.cleaTokens();
      clientStorage.clearUser("user");
      clientStorage.clearRememberMe("user");
      sessionStore.clearUser("user");

      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        fieldErrors: {},
      });
    } catch (error) {
      catchError(error, setState, "Logout failed");

      // setState((prev: AuthState) => ({
      //   ...prev,
      //   isLoading: false,
      //   error: error instanceof Error ? error.message : "Logout failed",
      // }));
    }
  };

  const forgotPassword = async (email: string) => {
    setState((prev: AuthState) => ({ ...prev, isLoading: true, error: null }));

    const signal = new AbortSignal();

    if (!email) {
      throw new Error("Email is required");
    }

    try {
      // API call
      await authService.forgotPassword(email, { signal });

      setState((prev: AuthState) => ({ ...prev, isLoading: false }));
    } catch (error) {
      catchError(error, setState, "Failed to send reset email");
      // setState((prev: AuthState) => ({
      //   ...prev,
      //   isLoading: false,
      //   error:
      //     error instanceof Error ? error.message : "Failed to send reset email",
      // }));
      throw error;
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    if (!token || !newPassword) {
      throw new Error("Invalid reset token or password");
    }

    const signal = new AbortSignal();
    setState((prev: AuthState) => ({ ...prev, isLoading: true, error: null }));

    try {
      // API call
      await authService.resetPassword(token, newPassword, { signal });

      setState((prev: AuthState) => ({ ...prev, isLoading: false }));
    } catch (error) {
      catchError(error, setState, "Password reset failed");

      // setState((prev: AuthState) => ({
      //   ...prev,
      //   isLoading: false,
      //   error: error instanceof Error ? error.message : "Password reset failed",
      // }));
      throw error;
    }
  };

  const verifyEmail = async (token: string) => {
    if (!token) {
      throw new Error("Invalid verification token");
    }

    setState((prev: AuthState) => ({ ...prev, isLoading: true, error: null }));
    const signal = new AbortSignal();

    try {
      // API call
      const isVerifiedEmail = await authService.verifyEmail(token, { signal });

      if (isVerifiedEmail && state.user) {
        const updatedUser = { ...state.user, emailVerified: true };

        setState((prev: AuthState) => ({
          ...prev,
          user: updatedUser,
          isLoading: false,
        }));

        clientStorage.setUser("user", updatedUser);
      }

      // Update stored user
    } catch (error) {
      catchError(error, setState, "Email verification failed");
      // setState((prev: AuthState) => ({
      //   ...prev,
      //   isLoading: false,
      //   error:
      //     error instanceof Error ? error.message : "Email verification failed",
      // }));
      throw error;
    }
  };

  const resendVerification = async () => {
    setState((prev: AuthState) => ({ ...prev, isLoading: true, error: null }));

    if (!state.user?.email) {
      throw new Error("No user email found");
    }

    const signal = new AbortSignal();

    try {
      // API call
      const isVerifiedEmail = await authService.resendVerification(
        state.user.email,
        { signal },
      );

      setState((prev: AuthState) => ({
        ...prev,
        isLoading: false,
        user: prev.user
          ? { ...prev.user, emailVerified: isVerifiedEmail }
          : null,
      }));
    } catch (error) {
      catchError(error, setState, "Failed to resend verification");
      // setState((prev: AuthState) => ({
      //   ...prev,
      //   isLoading: false,
      //   error:
      //     error instanceof Error
      //       ? error.message
      //       : "Failed to resend verification",
      // }));
      throw error;
    }
  };

  const clearError = () => {
    setState((prev: AuthState) => ({ ...prev, error: null }));
  };

  const forceLogout = useCallback(() => {
    tokenStorage.cleaTokens();
    clientStorage.clearUser("user");
    clientStorage.clearRememberMe("rememberMe");
    sessionStore.clearUser("user");

    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: "Your session has expired. Please sign in again.",
      fieldErrors: {},
    });
  }, []);

  // Register forceLogout globally once on mount
  useEffect(() => {
    setGlobalLogoutHandler(forceLogout);
  }, [forceLogout]);

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

function catchError(
  error: unknown,
  setState: Dispatch<SetStateAction<AuthState>>,
  errMsg: string,
) {
  const fieldErrors: Record<string, string> = {};

  if (error instanceof ApiError) {
    errMsg = error.message;
    if (error.validationErrors) {
      Object.assign(fieldErrors, error.validationErrors);
    }
  } else if (error instanceof Error) {
    errMsg = error.message;
  }

  setState((prev) => ({
    ...prev,
    isLoading: false,
    error: Object.keys(fieldErrors).length ? null : errMsg,
  }));
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
