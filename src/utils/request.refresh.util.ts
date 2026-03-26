import { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import AuthService from "../services/auth.service";
import { triggerGlobalLogout } from "./global.logout.utils";
import { tokenStorage } from "./token.storage.utils";

type Queue = {
  resolve: (val: unknown) => void;
  reject: (reason?: unknown) => void;
};

let isRefreshing = false;
let failedQueue: Array<Queue> = [];
const authService = new AuthService();

const processQueue = (err: unknown, token: string | null = null) => {
  failedQueue.forEach((q) => {
    if (err) {
      q.reject(err);
    } else {
      q.resolve(token);
    }
  });

  failedQueue = [];
};

export async function initTokenRefresh(api: AxiosInstance) {
  api.interceptors.response.use(
    (response) => response, // Pass through successful responses
    async (err: AxiosError) => {
      const originalReq = err.config as AxiosRequestConfig & {
        _retry?: boolean;
      };

      // Only handle 401 errors
      if (err.response?.status !== 401 || originalReq._retry) {
        return Promise.reject(err);
      }

      // if already refreshing, queue request
      if (isRefreshing) {
        return new Promise((res, rej) => {
          failedQueue.push({
            resolve: () => res(api(originalReq)),
            reject: rej,
          });
        });
      }

      isRefreshing = true;
      originalReq._retry = true;

      try {
        // Attemp rotating token
        const rt = tokenStorage.getRefreshToken();
        if (!rt) {
          throw new Error("No refesh token available");
        }

        const { accessToken, refreshToken } = await authService.refreshToken();
        // Update token
        tokenStorage.setTokens(accessToken, refreshToken);

        // Retry queued request with the new token
        processQueue(null, accessToken);

        // Retry original request
        return api(originalReq);
      } catch (err) {
        // Refresh fail - logout user
        processQueue(err, null);
        tokenStorage.cleaTokens();

        triggerGlobalLogout();

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    },
  );
}
