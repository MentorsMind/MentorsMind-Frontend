import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import toast from 'react-hot-toast';
import { persistThemePreference } from '../services/theme.service';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export interface ThemeContextType {
  /** The user's stored preference (light | dark | system) */
  preference: ThemePreference;
  /** The currently active resolved theme (light | dark) */
  resolved: ResolvedTheme;
  /** Change the preference; triggers persistence */
  setTheme: (preference: ThemePreference) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const LS_KEY = 'mm_theme_preference';

function readLocalStorage(): ThemePreference | null {
  try {
    const stored = localStorage.getItem(LS_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
  } catch {
    // SecurityError in private browsing — ignore
  }
  return null;
}

function writeLocalStorage(preference: ThemePreference): void {
  try {
    localStorage.setItem(LS_KEY, preference);
  } catch {
    // SecurityError in private browsing — ignore
  }
}

function getSystemPreference(): ResolvedTheme {
  try {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
  } catch {
    // matchMedia not supported
  }
  return 'light';
}

function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference === 'system') return getSystemPreference();
  return preference;
}

function applyThemeClass(resolved: ResolvedTheme): void {
  if (resolved === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

interface ThemeProviderProps {
  children: ReactNode;
  /**
   * Optional initial preference from the authenticated user's profile.
   * Takes highest priority in the resolution chain.
   */
  initialPreference?: ThemePreference;
  /** Optional user id — when truthy, theme changes are persisted to the backend. */
  isAuthenticated?: boolean;
}

export function ThemeProvider({
  children,
  initialPreference,
  isAuthenticated = false,
}: ThemeProviderProps) {
  // Resolve initial preference synchronously so the class is applied before paint.
  const [preference, setPreference] = useState<ThemePreference>(() => {
    if (initialPreference) return initialPreference;
    const ls = readLocalStorage();
    if (ls) return ls;
    // Fall back to 'system' so runtime OS changes are tracked (getSystemPreference handles matchMedia absence)
    return 'system';
  });

  const [resolved, setResolved] = useState<ResolvedTheme>(() => resolveTheme(preference));

  // Apply class synchronously on first render (before effects run) via a ref trick.
  const didApplyInitial = useRef(false);
  if (!didApplyInitial.current) {
    applyThemeClass(resolveTheme(preference));
    didApplyInitial.current = true;
  }

  // When initialPreference prop changes (e.g. after auth loads), update state.
  useEffect(() => {
    if (initialPreference) {
      setPreference(initialPreference);
      const r = resolveTheme(initialPreference);
      setResolved(r);
      applyThemeClass(r);
      writeLocalStorage(initialPreference);
    }
  }, [initialPreference]);

  // Listen for OS-level preference changes when the stored preference is 'system'.
  useEffect(() => {
    if (preference !== 'system') return;
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      const r: ResolvedTheme = e.matches ? 'dark' : 'light';
      setResolved(r);
      applyThemeClass(r);
    };

    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [preference]);

  const setTheme = useCallback(
    (newPreference: ThemePreference) => {
      const newResolved = resolveTheme(newPreference);

      // Apply immediately (synchronous DOM update).
      applyThemeClass(newResolved);
      setPreference(newPreference);
      setResolved(newResolved);

      // Always persist to localStorage.
      writeLocalStorage(newPreference);

      // Persist to backend if authenticated.
      if (isAuthenticated) {
        Promise.resolve(persistThemePreference(newPreference)).catch(() => {
          toast.error("Couldn't save theme preference.");
        });
      }
    },
    [isAuthenticated]
  );

  return (
    <ThemeContext.Provider value={{ preference, resolved, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ─── Export context for useTheme hook ─────────────────────────────────────────

export { ThemeContext };

// Re-export useTheme so consumers can import it from either location.
export { useTheme } from '../hooks/useTheme';
