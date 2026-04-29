import api from './api';
import { tokenStorage } from '../utils/token.storage.utils';

/**
 * Presence service for handling heartbeat functionality
 * Handles 204 No Content responses, token refresh, and rate limiting
 */

export interface HeartbeatResult {
  success: boolean;
  retryAfter?: number; // seconds to wait before next retry
}

/**
 * Sends a heartbeat to the server to maintain presence
 * 
 * Features:
 * - Handles 204 No Content responses properly (no JSON parsing)
 * - Automatic token refresh on 401 with one retry
 * - Rate limiting handling with 60-second backoff on 429
 * - Console.warn logging for failures (no UI errors)
 * 
 * @returns Promise<HeartbeatResult> - Result of the heartbeat operation
 */
export async function sendHeartbeat(): Promise<HeartbeatResult> {
  try {
    // First attempt - expect 204 No Content
    await api.post('/presence/heartbeat', null, {
      validateStatus: (status) => status === 204,
    });

    return { success: true };
  } catch (error: any) {
    // Handle 401 Unauthorized - token expired
    if (error.response?.status === 401) {
      console.warn('Heartbeat failed: Token expired, attempting refresh');
      
      try {
        // Attempt to refresh the token
        const refreshToken = tokenStorage.getRefreshToken();
        if (!refreshToken) {
          console.warn('Heartbeat failed: No refresh token available');
          return { success: false };
        }

        // Use the auth service to refresh token
        const { refreshToken: authRefreshToken } = await import('./auth.service');
        const { token: newToken, refreshToken: newRefreshToken } = await authRefreshToken(refreshToken);
        
        // Update stored tokens
        tokenStorage.setTokens(newToken, newRefreshToken);

        // Retry the heartbeat with new token
        await api.post('/presence/heartbeat', null, {
          validateStatus: (status) => status === 204,
        });

        console.warn('Heartbeat succeeded after token refresh');
        return { success: true };
      } catch (refreshError: any) {
        console.warn('Heartbeat failed: Token refresh failed', refreshError.message);
        return { success: false };
      }
    }

    // Handle 429 Too Many Requests - rate limited
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'] 
        ? parseInt(error.response.headers['retry-after'], 10)
        : 60; // Default to 60 seconds if header not present

      console.warn(`Heartbeat rate limited. Retrying after ${retryAfter} seconds`);
      return { success: false, retryAfter };
    }

    // Handle other errors
    console.warn('Heartbeat failed:', error.message || 'Unknown error');
    return { success: false };
  }
}

/**
 * Heartbeat manager class for continuous heartbeat operations
 */
export class HeartbeatManager {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;
  private retryTimeout: NodeJS.Timeout | null = null;
  private readonly defaultInterval = 30000; // 30 seconds default

  /**
   * Start sending heartbeats at regular intervals
   * 
   * @param intervalMs - Interval in milliseconds between heartbeats
   */
  start(intervalMs: number = this.defaultInterval): void {
    if (this.isRunning) {
      console.warn('Heartbeat manager is already running');
      return;
    }

    this.isRunning = true;
    console.log('Starting heartbeat manager');

    // Send first heartbeat immediately
    this.sendHeartbeatWithRetry();

    // Set up regular interval
    this.intervalId = setInterval(() => {
      this.sendHeartbeatWithRetry();
    }, intervalMs);
  }

  /**
   * Stop the heartbeat manager
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }

    console.log('Heartbeat manager stopped');
  }

  /**
   * Send heartbeat with automatic retry logic for rate limiting
   */
  private async sendHeartbeatWithRetry(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    try {
      const result = await sendHeartbeat();

      if (!result.success && result.retryAfter) {
        // Schedule retry after rate limit delay
        this.retryTimeout = setTimeout(() => {
          this.sendHeartbeatWithRetry();
        }, result.retryAfter * 1000);
      }
    } catch (error) {
      console.warn('Unexpected error in heartbeat manager:', error);
    }
  }

  /**
   * Check if the heartbeat manager is currently running
   */
  get isActive(): boolean {
    return this.isRunning;
  }
}

// Export singleton instance
export const heartbeatManager = new HeartbeatManager();
