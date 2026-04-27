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

export interface AdminUserListItem {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  average_rating: number | null;
}

export interface AdminUserRecord extends AdminUserListItem {
  phone_number?: string;
  date_of_birth?: string;
  government_id_number?: string;
  bank_account_details?: string;
}

export interface AdminUserSensitiveData {
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

const toAdminListItem = (user: AdminUserRecord): AdminUserListItem => ({
  id: user.id,
  email: user.email,
  first_name: user.first_name,
  last_name: user.last_name,
  role: user.role,
  is_active: user.is_active,
  created_at: user.created_at,
  average_rating: user.average_rating,
});

const toSensitiveData = (user: AdminUserRecord): AdminUserSensitiveData => ({
  phone_number: user.phone_number,
  date_of_birth: user.date_of_birth,
  government_id_number: user.government_id_number,
  bank_account_details: user.bank_account_details,
});

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

  async listUsers(opts?: RequestOptions) {
    return request<AdminUserRecord[]>(
      {
        method: "GET",
        url: apiConfig.url.admin.users,
      },
      opts,
    );
  }

  async listUsersSafe(opts?: RequestOptions) {
    const users = await this.listUsers(opts);
    return users.map(toAdminListItem);
  }

  async getSensitiveData(userId: string, opts?: RequestOptions) {
    const user = await request<AdminUserRecord>(
      {
        method: "GET",
        url: `${apiConfig.url.admin.users}/${userId}`,
      },
      opts,
    );
    return toSensitiveData(user);
  }
}
