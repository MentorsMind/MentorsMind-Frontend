import { apiConfig } from "../config/api.config";
import type { RequestOptions } from "../types/api.types";
import type { MentorProfile, TimeSlot, PricingSettings, Review } from "../types";
import { request } from "../utils/request.utils";

export default class MentorService {
  // ─── List ────────────────────────────────────────────────────────────────

  async getMentors(
    params?: { page?: number; limit?: number; search?: string; [key: string]: unknown },
    opts?: RequestOptions,
  ) {
    const query = params ? "?" + new URLSearchParams(params as Record<string, string>).toString() : "";
    return request<{ data: MentorProfile[]; total: number; page: number; totalPages: number }>(
      { method: "GET", url: `${apiConfig.url.mentors}${query}` },
      opts,
    );
  }

  // ─── Single mentor (public profile) ─────────────────────────────────────

  async getMentor(id: string, opts?: RequestOptions) {
    return request<MentorProfile>(
      { method: "GET", url: `${apiConfig.url.mentors}/${id}` },
      opts,
    );
  }

  // ─── Create ──────────────────────────────────────────────────────────────

  async add(args: Partial<MentorProfile>, opts?: RequestOptions) {
    return request<MentorProfile>(
      { method: "POST", url: apiConfig.url.mentors, data: args },
      opts,
    );
  }

  // ─── Update profile ──────────────────────────────────────────────────────

  async updateMentor(id: string, data: Partial<MentorProfile>, opts?: RequestOptions) {
    return request<MentorProfile>(
      { method: "PATCH", url: `${apiConfig.url.mentors}/${id}`, data },
      opts,
    );
  }

  // ─── Photo upload ────────────────────────────────────────────────────────

  async uploadPhoto(id: string, file: File, opts?: RequestOptions) {
    const formData = new FormData();
    formData.append("photo", file);
    return request<{ url: string }>(
      {
        method: "POST",
        url: `${apiConfig.url.mentors}/${id}/photo`,
        data: formData,
        // Let the browser set Content-Type with boundary for multipart
        headers: { "Content-Type": undefined as unknown as string },
      },
      opts,
    );
  }

  // ─── Availability ─────────────────────────────────────────────────────────

  async getAvailability(id: string, opts?: RequestOptions) {
    return request<{ slots: TimeSlot[]; timezone: string }>(
      { method: "GET", url: `${apiConfig.url.mentors}/${id}/availability` },
      opts,
    );
  }

  async saveAvailability(
    id: string,
    payload: { slots: TimeSlot[]; timezone: string },
    opts?: RequestOptions,
  ) {
    return request<{ slots: TimeSlot[]; timezone: string }>(
      { method: "PUT", url: `${apiConfig.url.mentors}/${id}/availability`, data: payload },
      opts,
    );
  }

  // ─── Pricing ──────────────────────────────────────────────────────────────

  async getPricing(id: string, opts?: RequestOptions) {
    return request<PricingSettings>(
      { method: "GET", url: `${apiConfig.url.mentors}/${id}/pricing` },
      opts,
    );
  }

  async savePricing(id: string, data: Partial<PricingSettings>, opts?: RequestOptions) {
    return request<PricingSettings>(
      { method: "PATCH", url: `${apiConfig.url.mentors}/${id}/pricing`, data },
      opts,
    );
  }

  // ─── Reviews ──────────────────────────────────────────────────────────────

  async getReviews(
    id: string,
    params?: { page?: number; limit?: number },
    opts?: RequestOptions,
  ) {
    const query = params ? "?" + new URLSearchParams(params as Record<string, string>).toString() : "";
    return request<{ reviews: Review[]; averageRating: number; total: number }>(
      { method: "GET", url: `${apiConfig.url.mentors}/${id}/reviews${query}` },
      opts,
    );
  }
}
