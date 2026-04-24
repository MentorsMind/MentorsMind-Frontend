/**
 * Unit tests for usePasskey hook
 *
 * All WebAuthn service calls are mocked so no real browser API or network
 * requests are made.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePasskey } from '../usePasskey';

// ─── Mock the webauthn service ────────────────────────────────────────────────

vi.mock('../../services/webauthn.service', () => ({
  isBiometricSupported: vi.fn(),
  registerPasskey: vi.fn(),
  authenticateWithPasskey: vi.fn(),
  listPasskeys: vi.fn(),
  removePasskey: vi.fn(),
}));

import * as webauthnService from '../../services/webauthn.service';

const mockDevice = {
  id: 'device-1',
  name: 'My iPhone',
  registeredAt: '2024-01-15T10:00:00.000Z',
  lastUsedAt: '2024-03-01T08:30:00.000Z',
};

const mockAuthResult = {
  user: { id: 'u1', email: 'test@example.com', name: 'Test User', role: 'learner' as const, createdAt: '2024-01-01T00:00:00.000Z' },
  token: 'access-token',
  refreshToken: 'refresh-token',
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('usePasskey', () => {
  beforeEach(() => {
    vi.mocked(webauthnService.isBiometricSupported).mockResolvedValue(true);
    vi.mocked(webauthnService.listPasskeys).mockResolvedValue([mockDevice]);
    vi.mocked(webauthnService.registerPasskey).mockResolvedValue(mockDevice);
    vi.mocked(webauthnService.authenticateWithPasskey).mockResolvedValue(mockAuthResult);
    vi.mocked(webauthnService.removePasskey).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ── Initial state ──────────────────────────────────────────────────────────

  it('starts with checkingSupport=true and resolves support flag', async () => {
    const { result } = renderHook(() => usePasskey());
    expect(result.current.checkingSupport).toBe(true);

    await waitFor(() => expect(result.current.checkingSupport).toBe(false));
    expect(result.current.isSupported).toBe(true);
    expect(webauthnService.isBiometricSupported).toHaveBeenCalledOnce();
  });

  it('sets isSupported=false when platform authenticator is unavailable', async () => {
    vi.mocked(webauthnService.isBiometricSupported).mockResolvedValue(false);
    const { result } = renderHook(() => usePasskey());

    await waitFor(() => expect(result.current.checkingSupport).toBe(false));
    expect(result.current.isSupported).toBe(false);
  });

  it('loads passkeys on mount', async () => {
    const { result } = renderHook(() => usePasskey());

    await waitFor(() => expect(result.current.loadingPasskeys).toBe(false));
    expect(result.current.passkeys).toEqual([mockDevice]);
    expect(webauthnService.listPasskeys).toHaveBeenCalledOnce();
  });

  // ── Registration flow ──────────────────────────────────────────────────────

  it('registers a passkey and appends it to the list', async () => {
    vi.mocked(webauthnService.listPasskeys).mockResolvedValue([]);
    const newDevice = { ...mockDevice, id: 'device-2', name: 'MacBook Pro' };
    vi.mocked(webauthnService.registerPasskey).mockResolvedValue(newDevice);

    const { result } = renderHook(() => usePasskey());
    await waitFor(() => expect(result.current.loadingPasskeys).toBe(false));

    let returned: typeof newDevice | null = null;
    await act(async () => {
      returned = await result.current.register('MacBook Pro') as typeof newDevice;
    });

    expect(webauthnService.registerPasskey).toHaveBeenCalledWith('MacBook Pro');
    expect(returned).toEqual(newDevice);
    expect(result.current.passkeys).toContainEqual(newDevice);
    expect(result.current.status).toBe('success');
    expect(result.current.error).toBeNull();
  });

  it('sets error state when registration fails', async () => {
    vi.mocked(webauthnService.registerPasskey).mockRejectedValue(
      new DOMException('User cancelled', 'NotAllowedError'),
    );

    const { result } = renderHook(() => usePasskey());
    await waitFor(() => expect(result.current.loadingPasskeys).toBe(false));

    await act(async () => {
      await result.current.register('My Device');
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toMatch(/cancelled/i);
  });

  it('returns null and sets error when registration throws a generic error', async () => {
    vi.mocked(webauthnService.registerPasskey).mockRejectedValue(new Error('Server error'));

    const { result } = renderHook(() => usePasskey());
    await waitFor(() => expect(result.current.loadingPasskeys).toBe(false));

    let returned: unknown;
    await act(async () => {
      returned = await result.current.register('My Device');
    });

    expect(returned).toBeNull();
    expect(result.current.error).toBe('Server error');
  });

  // ── Authentication flow ────────────────────────────────────────────────────

  it('authenticates with passkey and returns auth result', async () => {
    const { result } = renderHook(() => usePasskey());
    await waitFor(() => expect(result.current.loadingPasskeys).toBe(false));

    let authResult: typeof mockAuthResult | null = null;
    await act(async () => {
      authResult = await result.current.authenticate() as typeof mockAuthResult;
    });

    expect(webauthnService.authenticateWithPasskey).toHaveBeenCalledOnce();
    expect(authResult).toEqual(mockAuthResult);
    expect(result.current.status).toBe('success');
  });

  it('sets error state when authentication fails', async () => {
    vi.mocked(webauthnService.authenticateWithPasskey).mockRejectedValue(
      new DOMException('Timed out', 'NotAllowedError'),
    );

    const { result } = renderHook(() => usePasskey());
    await waitFor(() => expect(result.current.loadingPasskeys).toBe(false));

    await act(async () => {
      await result.current.authenticate();
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toMatch(/cancelled|timed out/i);
  });

  it('returns null when authentication fails', async () => {
    vi.mocked(webauthnService.authenticateWithPasskey).mockRejectedValue(new Error('fail'));

    const { result } = renderHook(() => usePasskey());
    await waitFor(() => expect(result.current.loadingPasskeys).toBe(false));

    let authResult: unknown;
    await act(async () => {
      authResult = await result.current.authenticate();
    });

    expect(authResult).toBeNull();
  });

  // ── Removal ────────────────────────────────────────────────────────────────

  it('removes a passkey and updates the list', async () => {
    const { result } = renderHook(() => usePasskey());
    await waitFor(() => expect(result.current.passkeys).toHaveLength(1));

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.remove('device-1');
    });

    expect(webauthnService.removePasskey).toHaveBeenCalledWith('device-1');
    expect(success).toBe(true);
    expect(result.current.passkeys).toHaveLength(0);
    expect(result.current.status).toBe('success');
  });

  it('sets error state when removal fails', async () => {
    vi.mocked(webauthnService.removePasskey).mockRejectedValue(new Error('Not found'));

    const { result } = renderHook(() => usePasskey());
    await waitFor(() => expect(result.current.passkeys).toHaveLength(1));

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.remove('device-1');
    });

    expect(success).toBe(false);
    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe('Not found');
    // List should be unchanged
    expect(result.current.passkeys).toHaveLength(1);
  });

  // ── clearError ─────────────────────────────────────────────────────────────

  it('clears the error via clearError()', async () => {
    vi.mocked(webauthnService.registerPasskey).mockRejectedValue(new Error('oops'));

    const { result } = renderHook(() => usePasskey());
    await waitFor(() => expect(result.current.loadingPasskeys).toBe(false));

    await act(async () => { await result.current.register('x'); });
    expect(result.current.error).toBeTruthy();

    act(() => { result.current.clearError(); });
    expect(result.current.error).toBeNull();
  });
});
