import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sendHeartbeat, HeartbeatManager } from '../services/presence.service';
import api from '../services/api';
import { tokenStorage } from '../utils/token.storage.utils';
import * as authService from '../services/auth.service';

// Mock dependencies
vi.mock('../services/api');
vi.mock('../utils/token.storage.utils');
vi.mock('../services/auth.service');

const mockApi = vi.mocked(api);
const mockTokenStorage = vi.mocked(tokenStorage);
const mockAuthService = vi.mocked(authService);

describe('Presence Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('sendHeartbeat', () => {
    it('should succeed on 204 No Content response', async () => {
      mockApi.post.mockResolvedValueOnce({ status: 204 });
      
      const result = await sendHeartbeat();
      
      expect(result).toEqual({ success: true });
      expect(mockApi.post).toHaveBeenCalledWith('/presence/heartbeat', null, {
        validateStatus: expect.any(Function),
      });
    });

    it('should handle 401 and retry with refreshed token', async () => {
      // First call fails with 401
      const error401 = {
        response: { status: 401 },
        message: 'Unauthorized'
      };
      mockApi.post.mockRejectedectedOnce(error401);
      
      // Mock refresh token
      mockTokenStorage.getRefreshToken.mockReturnValue('refresh-token');
      mockAuthService.refreshToken.mockResolvedValue({
        token: 'new-access-token',
        refreshToken: 'new-refresh-token'
      });
      
      // Second call succeeds
      mockApi.post.mockResolvedValueOnce({ status: 204 });
      
      const result = await sendHeartbeat();
      
      expect(result).toEqual({ success: true });
      expect(mockTokenStorage.setTokens).toHaveBeenCalledWith('new-access-token', 'new-refresh-token');
      expect(mockApi.post).toHaveBeenCalledTimes(2);
    });

    it('should handle 401 when no refresh token available', async () => {
      const error401 = {
        response: { status: 401 },
        message: 'Unauthorized'
      };
      mockApi.post.mockRejectedectedOnce(error401);
      mockTokenStorage.getRefreshToken.mockReturnValue(null);
      
      const result = await sendHeartbeat();
      
      expect(result).toEqual({ success: false });
      expect(mockAuthService.refreshToken).not.toHaveBeenCalled();
    });

    it('should handle 429 rate limiting with retry-after header', async () => {
      const error429 = {
        response: { 
          status: 429,
          headers: { 'retry-after': '120' }
        },
        message: 'Too Many Requests'
      };
      mockApi.post.mockRejectedectedOnce(error429);
      
      const result = await sendHeartbeat();
      
      expect(result).toEqual({ success: false, retryAfter: 120 });
    });

    it('should handle 429 rate limiting with default 60 seconds', async () => {
      const error429 = {
        response: { 
          status: 429,
          headers: {}
        },
        message: 'Too Many Requests'
      };
      mockApi.post.mockRejectedectedOnce(error429);
      
      const result = await sendHeartbeat();
      
      expect(result).toEqual({ success: false, retryAfter: 60 });
    });

    it('should handle other errors', async () => {
      const error = {
        message: 'Network Error'
      };
      mockApi.post.mockRejectedectedOnce(error);
      
      const result = await sendHeartbeat();
      
      expect(result).toEqual({ success: false });
    });
  });

  describe('HeartbeatManager', () => {
    let manager: HeartbeatManager;

    beforeEach(() => {
      manager = new HeartbeatManager();
    });

    afterEach(() => {
      manager.stop();
    });

    it('should start and stop heartbeat manager', () => {
      expect(manager.isActive).toBe(false);
      
      manager.start(1000);
      expect(manager.isActive).toBe(true);
      
      manager.stop();
      expect(manager.isActive).toBe(false);
    });

    it('should not start if already running', () => {
      manager.start(1000);
      const consoleSpy = vi.spyOn(console, 'warn');
      
      manager.start(1000);
      
      expect(consoleSpy).toHaveBeenCalledWith('Heartbeat manager is already running');
      consoleSpy.mockRestore();
    });

    it('should send heartbeat immediately when started', async () => {
      mockApi.post.mockResolvedValue({ status: 204 });
      
      manager.start(1000);
      
      // Should have called heartbeat immediately
      await vi.runAllTimersAsync();
      expect(mockApi.post).toHaveBeenCalledTimes(1);
    });

    it('should handle rate limiting and retry after delay', async () => {
      const error429 = {
        response: { 
          status: 429,
          headers: { 'retry-after': '5' }
        },
        message: 'Too Many Requests'
      };
      mockApi.post.mockRejectedectedOnce(error429);
      mockApi.post.mockResolvedValue({ status: 204 });
      
      manager.start(1000);
      
      // Initial call fails with rate limit
      await vi.runAllTimersAsync();
      expect(mockApi.post).toHaveBeenCalledTimes(1);
      
      // Advance time by retry-after delay
      await vi.advanceTimersByTimeAsync(5000);
      expect(mockApi.post).toHaveBeenCalledTimes(2); // Should have retried
    });
  });
});
