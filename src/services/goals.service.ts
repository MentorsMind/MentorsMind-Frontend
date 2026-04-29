import { apiConfig } from '../config/api.config';
import type { RequestOptions } from '../types/api.types';
import type {
  Goal,
  GoalsListResponse,
  CreateGoalPayload,
  UpdateGoalPayload,
} from '../types';
import { request } from '../utils/request.utils';

/**
 * GoalsService – API client for goal management endpoints.
 *
 * All methods return the parsed `data` from the API response
 * (via the `request` wrapper).
 */
export default class GoalsService {
  // ── List goals ──────────────────────────────────────────────────────────────

  async getGoals(opts?: RequestOptions): Promise<GoalsListResponse> {
    return request<GoalsListResponse>(
      { method: 'GET', url: `${apiConfig.url.goals}` },
      opts
    );
  }

  // ── Get single goal ─────────────────────────────────────────────────────────

  async getGoal(id: string, opts?: RequestOptions): Promise<Goal> {
    return request<Goal>(
      { method: 'GET', url: `${apiConfig.url.goals}/${id}` },
      opts
    );
  }

  // ── Create goal ─────────────────────────────────────────────────────────────

  async createGoal(payload: CreateGoalPayload, opts?: RequestOptions): Promise<Goal> {
    return request<Goal>(
      { method: 'POST', url: `${apiConfig.url.goals}`, data: payload },
      opts
    );
  }

  // ── Update goal ─────────────────────────────────────────────────────────────

  async updateGoal(id: string, patch: UpdateGoalPayload, opts?: RequestOptions): Promise<Goal> {
    return request<Goal>(
      { method: 'PATCH', url: `${apiConfig.url.goals}/${id}`, data: patch },
      opts
    );
  }

  // ── Delete goal ─────────────────────────────────────────────────────────────

  async deleteGoal(id: string, opts?: RequestOptions): Promise<void> {
    return request<void>(
      { method: 'DELETE', url: `${apiConfig.url.goals}/${id}` },
      opts
    );
  }

  // ── Update progress ─────────────────────────────────────────────────────────

  async updateProgress(id: string, progress: number, opts?: RequestOptions): Promise<{ goalId: string; progress: number }> {
    return request<{ goalId: string; progress: number }>(
      { method: 'PUT', url: `${apiConfig.url.goals}/${id}/progress`, data: { progress } },
      opts
    );
  }

  // ── Link session ─────────────────────────────────────────────────────────────

  async linkSession(id: string, sessionId: string, opts?: RequestOptions): Promise<{ goalId: string; sessionId: string; linked: boolean }> {
    return request<{ goalId: string; sessionId: string; linked: boolean }>(
      { method: 'POST', url: `${apiConfig.url.goals}/${id}/link-session`, data: { sessionId } },
      opts
    );
  }

  // ── Unlink session ───────────────────────────────────────────────────────────

  async unlinkSession(id: string, sessionId: string, opts?: RequestOptions): Promise<{ goalId: string; sessionId: string; unlinked: boolean }> {
    // Using DELETE with params in body (alternatively could use URL params)
    return request<{ goalId: string; sessionId: string; unlinked: boolean }>(
      { method: 'DELETE', url: `${apiConfig.url.goals}/${id}/link-session/${sessionId}` },
      opts
    );
  }
}
