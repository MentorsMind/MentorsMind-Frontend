import { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import toast from "react-hot-toast";
import { refreshToken as authRefreshToken } from "../services/auth.service";
import { triggerGlobalLogout } from "./global.logout.utils";
import { tokenStorage } from "./token.storage.utils";

// Messages that indicate the token is permanently invalid — do not attempt refresh
const TERMINAL_401_MESSAGES = [
  "Token has been revoked. Please log in again.",
  "Signing key has expired.",
];

type QueueEntry = {
  resolve: (val: unknown) => void;
  reject: (reason?: unknown) => void;
};

let isRefreshing = false;
let failedQueue: QueueEntry[] = [];

const flushQueue = (err: unknown, token: string | null = null) => {
  failedQueue.forEach((q) => (err ? q.reject(err) : q.resolve(token)));
  failedQueue = [];
};

const clearAndLogout = () => {
  tokenStorage.clearTokens();
  triggerGlobalLogout();
};

export function initTokenRefresh(api: AxiosInstance) {
  api.interceptors.response.use(
    (response) => response,
    async (err: AxiosError) => {
      const originalReq = err.config as AxiosRequestConfig & { _retry?: boolean };

      if (err.response?.status !== 401 || originalReq._retry) {
        return Promise.reject(err);
      }

      // Check for terminal error messages — clear tokens and redirect immediately
      const serverMessage: string =
        (err.response?.data as any)?.error ??
        (err.response?.data as any)?.message ??
        "";

      if (TERMINAL_401_MESSAGES.some((m) => serverMessage.includes(m))) {
        clearAndLogout();
        return Promise.reject(err);
      }

      // Queue concurrent requests that arrive while a refresh is in flight
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: () => resolve(api(originalReq)),
            reject,
          });
        });
      }

      isRefreshing = true;
      originalReq._retry = true;

      try {
        const rt = tokenStorage.getRefreshToken();
        if (!rt) throw new Error("No refresh token available");

        const { token: accessToken, refreshToken: newRefreshToken } =
          await authRefreshToken(rt);

        tokenStorage.setTokens(accessToken, newRefreshToken);

        // Replay all queued requests with the new token
        flushQueue(null, accessToken);

        return api(originalReq);
      } catch (refreshErr) {
        flushQueue(refreshErr, null);
        clearAndLogout();
        toast.error("Session expired. Please log in again.");
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    },
  );
}
