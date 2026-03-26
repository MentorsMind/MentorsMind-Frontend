import { apiConfig } from "../config/api.config";
import type { RequestOptions } from "../types/api.types";
import { request } from "../utils/request.utils";

export default class AuthService {
  async login(email: string, password: string, opts?: RequestOptions) {
    const config = {
      method: "POST",
      url: apiConfig.url.auth.login,
      data: { email, password },
    } as const;

    return opts ? request<{ accessToken: string; refreshToken: string }>(config, opts) : request(config);
  }

  async signup(email: string, password: string, opts?: RequestOptions) {
    const config = {
      method: "POST",
      url: apiConfig.url.auth.signup,
      data: { email, password },
    } as const;

    return opts ? request<{ accessToken: string; refreshToken: string }>(config, opts) : request(config);
  }

  async me(opts?: RequestOptions) {
    const config = {
      method: "GET",
      url: apiConfig.url.auth.me,
    } as const;

    return opts ? request<{ id: string; email: string }>(config, opts) : request(config);
  }
}
