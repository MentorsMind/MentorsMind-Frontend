import api from './api.client';
import type { RequestOptions } from '../types/api.types';

export interface PresenceStatus {
  userId: string;
  online: boolean;
  last_seen: string | null;
}

export interface UserOnlineStatus {
  online: boolean;
  last_seen: string | null;
}

export default class PresenceService {
  /** POST /presence/heartbeat — 204 No Content, do not parse body */
  async sendHeartbeat(): Promise<void> {
    await api.post('/v1/presence/heartbeat');
  }

  /** GET /users/:id/online — flat { online, last_seen }, no .data wrapper */
  async getUserOnlineStatus(userId: string, opts?: RequestOptions): Promise<UserOnlineStatus> {
    const res = await api.get(`/v1/users/${userId}/online`, { signal: opts?.signal });
    return res.data as UserOnlineStatus;
  }

  /** POST /users/online-status — flat { statuses: [...] }, no .data wrapper */
  async getBatchStatus(userIds: string[], opts?: RequestOptions): Promise<PresenceStatus[]> {
    const res = await api.post(
      '/v1/users/online-status',
      { userIds },
      { signal: opts?.signal },
    );
    return (res.data as { statuses: PresenceStatus[] }).statuses;
  }
}
