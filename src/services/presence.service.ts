import { apiConfig } from "../config/api.config";
import type { RequestOptions } from "../types/api.types";
import { request } from "../utils/request.utils";
import { parseApiError } from "../utils/parse.api.error";
import type { AxiosError } from "axios";

export interface PresenceStatus {
  userId: string;
  online: boolean;
  last_seen?: string;
}

export default class PresenceService {
  async getBatchStatus(userIds: string[], opts?: RequestOptions): Promise<PresenceStatus[]> {
    const params = new URLSearchParams();
    userIds.forEach(id => params.append('userIds', id));

    try {
      return await request<PresenceStatus[]>(
        {
          method: "GET",
          url: `${apiConfig.url.presence}/batch?${params.toString()}`,
        },
        opts,
      );
    } catch (err) {
      const axiosErr = err as AxiosError;
      if (axiosErr?.response?.status === 422) {
        // 422 from batch presence endpoint is a Zod validation error (e.g. too many userIds).
        // Treat as silent — presence failures should not surface to the user.
        console.warn("[PresenceService] 422 validation error:", parseApiError(axiosErr));
        return [];
      }
      throw err;
    }
  }
}