/**
 * Tests for ThemeProvider and useTheme hook.
 * Feature: dark-mode-theme-support
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor, cleanup, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as fc from 'fast-check';
import { ThemeProvider, useTheme, type ThemePreference, type ResolvedTheme } from '../contexts/ThemeContext';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function TestConsumer() {
  const { preference, resolved, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="preference">{preference}</span>
      <span data-testid="resolved">{resolved}</span>
      <button onClick={() => setTheme('light')}>set-light</button>
      <button onClick={() => setTheme('dark')}>set-dark</button>
      <button onClick={() => setTheme('system')}>set-system</button>
    </div>
  );
}

function renderWithProvider(
  props: { initialPreference?: ThemePreference; isAuthenticated?: boolean } = {}
) {
  return render(
    <ThemeProvider {...props}>
      <TestConsumer />
    </ThemeProvider>
  );
}

// ─── localStorage mock helpers ────────────────────────────────────────────────

const LS_KEY = 'mm_theme_preference';

function setLocalStorage(value: string | null) {
  if (value === null) {
    localStorage.removeItem(LS_KEY);
  } else {
    localStorage.setItem(LS_KEY, value);
  }
}

// ─── matchMedia mock ──────────────────────────────────────────────────────────

function mockMatchMedia(prefersDark: boolean) {
  const listeners: ((e: MediaQueryListEvent) => void)[] = [];
  const mq = {
    matches: prefersDark,
    addEventListener: vi.fn((_: string, cb: (e: MediaQueryListEvent) => void) => {
      listeners.push(cb);
    }),
    removeEventListener: vi.fn((_: string, cb: (e: MediaQueryListEvent) => void) => {
      const idx = listeners.indexOf(cb);
      if (idx !== -1) listeners.splice(idx, 1);
    }),
    dispatchChange: (newMatches: boolean) => {
      listeners.forEach((cb) => cb({ matches: newMatches } as MediaQueryListEvent));
    },
  };
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn(() => mq),
  });
  return mq;
}

// ─── theme.service mock ───────────────────────────────────────────────────────

vi.mock('../services/theme.service', () => ({
  persistThemePreference: vi.fn().mockResolvedValue(undefined),
}));

import { persistThemePreference } from '../services/theme.service';
const mockPersist = persistThemePreference as ReturnType<typeof vi.fn>;

// ─── toast mock ───────────────────────────────────────────────────────────────

vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn() },
  error: vi.fn(),
}));

import toast from 'react-hot-toast';
const mockToastError = (toast as unknown as { error: ReturnType<typeof vi.fn> }).error;

// ─── Unit Tests ───────────────────────────────────────────────────────────────

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    mockMatchMedia(false);
  });

  afterEach(() => {
    document.documentElement.classList.remove('dark');
  });

  it('initializes with initialPreference prop (highest priority)', () => {
    renderWithProvider({ initialPreference: 'dark' });
    expect(screen.getByTestId('preference').textContent).toBe('dark');
    expect(screen.getByTestId('resolved').textContent).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('initializes from localStorage when no initialPreference', () => {
    setLocalStorage('dark');
    renderWithProvider();
    expect(screen.getByTestId('preference').textContent).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('falls back to system preference when no localStorage or initialPreference', () => {
    mockMatchMedia(true); // OS is dark
    renderWithProvider();
    expect(screen.getByTestId('preference').textContent).toBe('system');
    expect(screen.getByTestId('resolved').textContent).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('applies .dark class when resolved theme is dark', () => {
    renderWithProvider({ initialPreference: 'dark' });
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('removes .dark class when resolved theme is light', () => {
    document.documentElement.classList.add('dark');
    renderWithProvider({ initialPreference: 'light' });
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('setTheme updates preference and resolved state', async () => {
    renderWithProvider({ initialPreference: 'light' });
    await userEvent.click(screen.getByText('set-dark'));
    expect(screen.getByTestId('preference').textContent).toBe('dark');
    expect(screen.getByTestId('resolved').textContent).toBe('dark');
  });

  it('setTheme writes to localStorage', async () => {
    renderWithProvider({ initialPreference: 'light' });
    await userEvent.click(screen.getByText('set-dark'));
    expect(localStorage.getItem(LS_KEY)).toBe('dark');
  });

  it('setTheme calls persistThemePreference when authenticated', async () => {
    renderWithProvider({ initialPreference: 'light', isAuthenticated: true });
    await userEvent.click(screen.getByText('set-dark'));
    expect(mockPersist).toHaveBeenCalledWith('dark');
  });

  it('setTheme does NOT call persistThemePreference when unauthenticated', async () => {
    renderWithProvider({ initialPreference: 'light', isAuthenticated: false });
    await userEvent.click(screen.getByText('set-dark'));
    expect(mockPersist).not.toHaveBeenCalled();
  });

  it('shows error toast when persistThemePreference fails', async () => {
    mockPersist.mockRejectedValueOnce(new Error('Network error'));
    renderWithProvider({ initialPreference: 'light', isAuthenticated: true });
    await userEvent.click(screen.getByText('set-dark'));
    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith("Couldn't save theme preference.");
    });
  });

  it('retains locally applied theme even when API fails', async () => {
    mockPersist.mockRejectedValueOnce(new Error('Network error'));
    renderWithProvider({ initialPreference: 'light', isAuthenticated: true });
    await userEvent.click(screen.getByText('set-dark'));
    await waitFor(() => {
      expect(screen.getByTestId('resolved').textContent).toBe('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });

  it('listens for system preference changes when preference is "system"', async () => {
    const mq = mockMatchMedia(false); // starts light
    renderWithProvider({ initialPreference: 'system' });
    expect(screen.getByTestId('resolved').textContent).toBe('light');

    act(() => {
      mq.dispatchChange(true); // OS switches to dark
    });

    expect(screen.getByTestId('resolved').textContent).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('stops listening for system changes when preference changes away from "system"', async () => {
    const mq = mockMatchMedia(false);
    renderWithProvider({ initialPreference: 'system' });

    await userEvent.click(screen.getByText('set-dark'));

    // Now OS changes — should NOT affect resolved since preference is 'dark'
    act(() => {
      mq.dispatchChange(false);
    });

    expect(screen.getByTestId('resolved').textContent).toBe('dark');
  });
});

describe('useTheme', () => {
  it('throws when used outside ThemeProvider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow(
      'useTheme must be used within a ThemeProvider'
    );
    consoleError.mockRestore();
  });
});

// ─── Property-Based Tests ─────────────────────────────────────────────────────

describe('Property 2: System preference is respected on first visit', () => {
  // Feature: dark-mode-theme-support, Property 2: System preference is respected on first visit
  // Validates: Requirements 2.1, 2.2, 2.3

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    document.documentElement.classList.remove('dark');
  });

  it('resolved theme matches system preference when no stored preference exists', () => {
    fc.assert(
      fc.property(fc.constantFrom('light', 'dark') as fc.Arbitrary<'light' | 'dark'>, (systemPref) => {
        localStorage.clear();
        document.documentElement.classList.remove('dark');
        mockMatchMedia(systemPref === 'dark');

        const { unmount } = render(
          <ThemeProvider>
            <TestConsumer />
          </ThemeProvider>
        );

        const resolved = document.querySelector('[data-testid="resolved"]')?.textContent as ResolvedTheme;
        const expected: ResolvedTheme = systemPref;
        unmount();

        return resolved === expected;
      }),
      { numRuns: 100 }
    );
  });
});

describe('Property 3: Runtime system preference change is reflected', () => {
  // Feature: dark-mode-theme-support, Property 3: Runtime system preference change is reflected
  // Validates: Requirements 2.4

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    document.documentElement.classList.remove('dark');
  });

  it('resolved theme updates when OS preference changes and stored preference is "system"', () => {
    fc.assert(
      fc.property(fc.constantFrom('light', 'dark') as fc.Arbitrary<'light' | 'dark'>, (newSystemPref) => {
        document.documentElement.classList.remove('dark');
        const mq = mockMatchMedia(newSystemPref === 'light'); // start opposite

        const { unmount } = render(
          <ThemeProvider initialPreference="system">
            <TestConsumer />
          </ThemeProvider>
        );

        act(() => {
          mq.dispatchChange(newSystemPref === 'dark');
        });

        const resolved = document.querySelector('[data-testid="resolved"]')?.textContent as ResolvedTheme;
        unmount();

        return resolved === newSystemPref;
      }),
      { numRuns: 100 }
    );
  });
});

describe('Property 4: setTheme applies the .dark class correctly', () => {
  // Feature: dark-mode-theme-support, Property 4: setTheme applies the .dark class correctly
  // Validates: Requirements 3.3, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    document.documentElement.classList.remove('dark');
  });

  it('.dark class presence matches resolved theme for any preference', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('light', 'dark', 'system') as fc.Arbitrary<ThemePreference>,
        fc.constantFrom('light', 'dark') as fc.Arbitrary<'light' | 'dark'>,
        async (pref, systemPref) => {
          cleanup();
          document.documentElement.classList.remove('dark');
          mockMatchMedia(systemPref === 'dark');

          const { container, unmount } = render(
            <ThemeProvider initialPreference="light">
              <TestConsumer />
            </ThemeProvider>
          );

          await act(async () => {
            within(container).getByText(`set-${pref}`).click();
          });

          const resolvedText = container.querySelector('[data-testid="resolved"]')?.textContent as ResolvedTheme;
          const hasDark = document.documentElement.classList.contains('dark');
          unmount();

          return (resolvedText === 'dark') === hasDark;
        }
      ),
      { numRuns: 100 }
    );
  }, 30000);
});

describe('Property 9: Unauthenticated preference is persisted to localStorage', () => {
  // Feature: dark-mode-theme-support, Property 9: Unauthenticated preference is persisted to localStorage
  // Validates: Requirements 4.5

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    mockMatchMedia(false);
  });

  afterEach(() => {
    document.documentElement.classList.remove('dark');
  });

  it('setTheme writes preference to localStorage for unauthenticated users', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('light', 'dark', 'system') as fc.Arbitrary<ThemePreference>,
        async (pref) => {
          cleanup();
          localStorage.clear();
          document.documentElement.classList.remove('dark');

          const { container, unmount } = render(
            <ThemeProvider isAuthenticated={false}>
              <TestConsumer />
            </ThemeProvider>
          );

          await act(async () => {
            within(container).getByText(`set-${pref}`).click();
          });

          const stored = localStorage.getItem(LS_KEY);
          unmount();

          return stored === pref;
        }
      ),
      { numRuns: 100 }
    );
  });
});
