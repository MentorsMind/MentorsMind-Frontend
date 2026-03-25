import { apiConfig } from "../config/api.config";
import type { RequestOptions } from "../types/api.types";
import { request } from "../utils/request.utils";

export default class SessionService {
  async create(mentorId: string, opts?: RequestOptions) {
    return request<{ status: string }>(
      {
        method: "POST",
        url: apiConfig.url.sessions,
        data: { mentorId },
      },
      opts,
    );
  }

  async getSession(id: string, opts?: RequestOptions) {
    return request<{ status: string }>(
      {
        method: "GET",
        url: apiConfig.url.sessions,
        data: { id },
      },
      opts,
    );
  }

  async getSessions(args: Record<string, unknown>, opts?: RequestOptions) {
    return request<{ status: string }>(
      {
        method: "GET",
        url: apiConfig.url.sessions,
        data: { args },
      },
      opts,
    );
  }
}
