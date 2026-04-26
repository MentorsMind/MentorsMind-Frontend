import { apiConfig } from "../config/api.config";
import type { RequestOptions } from "../types/api.types";
import type { Session, BookingPayload, CancelPayload, ReschedulePayload } from "../types";
import { request } from "../utils/request.utils";

export default class SessionService {
  // ─── Book ────────────────────────────────────────────────────────────────

  async createSession(payload: BookingPayload, opts?: RequestOptions) {
    return request<Session>(
      { method: "POST", url: apiConfig.url.sessions, data: payload },
      opts,
    );
  }

  // ─── Single session (detail view) ────────────────────────────────────────

  async getSession(id: string, opts?: RequestOptions) {
    return request<Session>(
      { method: "GET", url: `${apiConfig.url.sessions}/${id}` },
      opts,
    );
  }

  // ─── Learner session list ─────────────────────────────────────────────────

  async getLearnerSessions(
    params?: { status?: "upcoming" | "past" | "cancelled"; page?: number; limit?: number },
    opts?: RequestOptions,
  ) {
    const query = params
      ? "?" + new URLSearchParams(params as Record<string, string>).toString()
      : "";
    return request<{ data: Session[]; total: number; totalPages: number }>(
      { method: "GET", url: `${apiConfig.url.sessions}/learner${query}` },
      opts,
    );
  }

  // ─── Mentor session list ──────────────────────────────────────────────────

  async getMentorSessions(
    params?: { status?: "upcoming" | "past" | "cancelled"; page?: number; limit?: number },
    opts?: RequestOptions,
  ) {
    const query = params
      ? "?" + new URLSearchParams(params as Record<string, string>).toString()
      : "";
    return request<{ data: Session[]; total: number; totalPages: number }>(
      { method: "GET", url: `${apiConfig.url.sessions}/mentor${query}` },
      opts,
    );
  }

  // ─── Cancel ───────────────────────────────────────────────────────────────

  async cancelSession(id: string, payload: CancelPayload, opts?: RequestOptions) {
    return request<Session>(
      { method: "PATCH", url: `${apiConfig.url.sessions}/${id}/cancel`, data: payload },
      opts,
    );
  }

  // ─── Reschedule ───────────────────────────────────────────────────────────

  async rescheduleSession(id: string, payload: ReschedulePayload, opts?: RequestOptions) {
    return request<Session>(
      { method: "PATCH", url: `${apiConfig.url.sessions}/${id}/reschedule`, data: payload },
      opts,
    );
  }

  // ─── Mark complete (mentor only) ──────────────────────────────────────────

  async completeSession(id: string, opts?: RequestOptions) {
    return request<Session>(
      { method: "PATCH", url: `${apiConfig.url.sessions}/${id}/complete` },
      opts,
    );
  }
}