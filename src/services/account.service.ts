import { apiConfig } from '../config/api.config';
import { request } from '../utils/request.utils';
import type { RequestOptions } from '../types/api.types';
import type { User } from '../types';

export interface ActiveSession {
  id: string;
  deviceName: string;
  ipAddress: string;
  lastActive: string;
  locationFlag?: string;
  isCurrentSession: boolean;
}

export default class AccountService {
  // ─── Profile Updates ────────────────────────────────────────────────────────

  async updateProfile(payload: Partial<User>, opts?: RequestOptions): Promise<User> {
    return request<User>(
      { method: 'PATCH', url: apiConfig.url.account.profile, data: payload },
      opts
    );
  }

  async uploadAvatar(file: File, opts?: RequestOptions): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', file);

    return request<{ avatarUrl: string }>(
      {
        method: 'POST',
        url: apiConfig.url.account.avatar,
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
      opts
    );
  }

  // ─── Security & Password ──────────────────────────────────────────────────

  async changePassword(payload: { current: string; next: string }, opts?: RequestOptions): Promise<void> {
    return request<void>(
      { method: 'POST', url: apiConfig.url.account.password, data: payload },
      opts
    );
  }

  // ─── Active Sessions ──────────────────────────────────────────────────────

  async getActiveSessions(opts?: RequestOptions): Promise<ActiveSession[]> {
    return request<ActiveSession[]>(
      { method: 'GET', url: apiConfig.url.account.sessions },
      opts
    );
  }

  async revokeSession(sessionId: string, opts?: RequestOptions): Promise<void> {
    return request<void>(
      { method: 'DELETE', url: `${apiConfig.url.account.sessions}/${sessionId}` },
      opts
    );
  }

  async revokeAllOtherSessions(opts?: RequestOptions): Promise<void> {
    return request<void>(
      { method: 'DELETE', url: apiConfig.url.account.sessions },
      opts
    );
  }

  // ─── Account Deletion ─────────────────────────────────────────────────────

  async deleteAccount(opts?: RequestOptions): Promise<void> {
    return request<void>(
      { method: 'DELETE', url: apiConfig.url.account.profile },
      opts
    );
  }

  async requestDeletion(opts?: RequestOptions): Promise<{ deletion_scheduled_for: string }> {
    return request<{ deletion_scheduled_for: string }>(
      { method: 'POST', url: 'users/me/request-deletion' },
      opts
    );
  }

  async cancelDeletion(opts?: RequestOptions): Promise<void> {
    return request<void>(
      { method: 'POST', url: 'users/me/cancel-deletion' },
      opts
    );
  }
}
