import { apiConfig } from "../config/api.config";
import type { RequestOptions } from "../types/api.types";
import { request } from "../utils/request.utils";

export default class AuthService {
  async login(email: string, password: string, opts?: RequestOptions) {
    return request<{ accessToken: string; refreshToken: string }>(
      {
        method: "POST",
        url: apiConfig.url.auth.login,
        data: { email, password },
      },
      opts,
    );
  }

  async signup(email: string, password: string, opts?: RequestOptions) {
    return request<{ accessToken: string; refreshToken: string }>(
      {
        method: "POST",
        url: apiConfig.url.auth.signup,
        data: { email, password },
      },
      opts,
    );
  }

  async me(opts?: RequestOptions) {
    return request<{ id: string; email: string }>(
      {
        method: "GET",
        url: apiConfig.url.auth.me,
      },
      opts,
    );
  }
}
