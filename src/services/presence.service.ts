import { apiConfig } from "../config/api.config";
import type { RequestOptions } from "../types/api.types";
import { request } from "../utils/request.utils";

export interface PresenceStatus {
  userId: string;
  online: boolean;
  last_seen?: string;
}

export default class PresenceService {
  async getBatchStatus(userIds: string[], opts?: RequestOptions): Promise<PresenceStatus[]> {
    const params = new URLSearchParams();
    userIds.forEach(id => params.append('userIds', id));

    return request<PresenceStatus[]>(
      {
        method: "GET",
        url: `${apiConfig.url.presence}/batch?${params.toString()}`,
      },
      opts,
    );
  }
}