import { REFRESH_TOKEN, TOKEN_KEY } from "../config/app.config";

export const tokenStorage = {
  setTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN, refreshToken);
  },
  getAccessToken() {
    return localStorage.getItem(TOKEN_KEY);
  },
  getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN);
  },
  hasTokens() {
    return !!this.getAccessToken() && !!this.getRefreshToken();
  },
  cleaTokens() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN);
  },
};
