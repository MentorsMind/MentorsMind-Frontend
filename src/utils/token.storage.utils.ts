let _accessToken: string | null = null;
let _refreshToken: string | null = null;

export const tokenStorage = {
  setTokens(accessToken: string, refreshToken: string) {
    _accessToken = accessToken;
    _refreshToken = refreshToken;
  },
  getAccessToken() {
    return _accessToken;
  },
  getRefreshToken() {
    return _refreshToken;
  },
  hasTokens() {
    return !!_accessToken && !!_refreshToken;
  },
  clearTokens() {
    _accessToken = null;
    _refreshToken = null;
  },
};
