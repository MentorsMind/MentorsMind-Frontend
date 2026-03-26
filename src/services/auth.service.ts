import { apiConfig } from "../config/api.config";
import { User } from "../types";
import type { RequestOptions } from "../types/api.types";
import { request } from "../utils/request.utils";
import { tokenStorage } from "../utils/token.storage.utils";

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
<<<<<<< fix/89-email-notification-preferences-ui
    const config = {
      method: "GET",
      url: apiConfig.url.auth.me,
    } as const;

    return opts ? request<{ id: string; email: string }>(config, opts) : request(config);
=======
    return request<User>(
      {
        method: "GET",
        url: apiConfig.url.auth.me,
      },
      opts,
    );
>>>>>>> main
  }

  async logout(opts?: RequestOptions) {
    return request<void>(
      {
        method: "DELETE",
        url: apiConfig.url.auth.logout,
      },
      opts,
    );
  }

  async forgotPassword(email: string, opts?: RequestOptions) {
    return request<void>(
      {
        method: "GET",
        url: `${apiConfig.url.auth.forgotPassword}/${email}`,
      },
      opts,
    );
  }

  async resetPassword(
    token: string,
    newPassword: string,
    opts?: RequestOptions,
  ) {
    return request<User>(
      {
        method: "POST",
        url: `${apiConfig.url.auth.resetPassword}`,
        data: { token, newPassword },
      },
      opts,
    );
  }

  async verifyEmail(token: string, opts?: RequestOptions) {
    return request<boolean>(
      {
        method: "POST",
        url: `${apiConfig.url.auth.verifyEmail}`,
        data: { token },
      },
      opts,
    );
  }

  async resendVerification(email: string, opts?: RequestOptions) {
    return request<boolean>(
      {
        method: "POST",
        url: `${apiConfig.url.auth.resendVerification}`,
        data: { email },
      },
      opts,
    );
  }

  async refreshToken(opts?: RequestOptions) {
    const refreshToken = tokenStorage.getRefreshToken();

    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    return request<{ accessToken: string; refreshToken: string }>(
      {
        method: "POST",
        url: apiConfig.url.auth.refreshToken,
        data: { refreshToken },
      },
      opts,
    );
  }
}
