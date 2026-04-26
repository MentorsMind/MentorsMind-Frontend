import { apiConfig } from "../config/api.config";
import type { RequestOptions } from "../types/api.types";
import { request } from "../utils/request.utils";

export interface UserRecord {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  bio?: string;
  title?: string;
  skills?: string[];
  expertise?: string[];
  hourly_rate?: number;
  photo_url?: string;
  social_links?: Record<string, string>;
  notificationPreferences?: Record<string, unknown>;
  phone_number?: string;
  date_of_birth?: string;
  government_id_number?: string;
  bank_account_details?: string;
}

export interface UpdateUserPayload {
  first_name?: string;
  last_name?: string;
  email?: string;
  bio?: string;
  title?: string;
  skills?: string[];
  expertise?: string[];
  hourly_rate?: number;
  photo_url?: string;
  social_links?: Record<string, string>;
  notificationPreferences: Record<string, unknown>;
  phone_number?: string;
  date_of_birth?: string;
  government_id_number?: string;
  bank_account_details?: string;
}

export default class UserService {
  async getMe(opts?: RequestOptions) {
    return request<UserRecord>(
      {
        method: "GET",
        url: apiConfig.url.users.me,
      },
      opts,
    );
  }

  async updateMe(payload: UpdateUserPayload, opts?: RequestOptions) {
    return request<UserRecord>(
      {
        method: "PUT",
        url: apiConfig.url.users.me,
        data: payload,
      },
      opts,
    );
  }

  // Admin path for editing other users only.
  async updateUser(id: string, payload: UpdateUserPayload, opts?: RequestOptions) {
    return request<UserRecord>(
      {
        method: "PUT",
        url: `${apiConfig.url.users.byId}/${id}`,
        data: payload,
      },
      opts,
    );
  }
}
