import type { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import axios from "axios";
import { initTokenRefresh } from "../utils/request.refresh.util";

let accessToken: string;
let refreshToken: string;

const setTokens = (access: string, refresh: string) => {
  accessToken = access;
  refreshToken = refresh;
};

// Use to wait few seconds before retry
const getBackOffDelay = (retry: number) => {
  return Math.min(1000 * 2 ** retry, 10000); // capped at 10s
};
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

const api: AxiosInstance = axios.create({ baseURL: "/api", timeout: 30000 });
const MAX_RETRIES = 3;

// Detect slow network
let slowNetworkTimer: any;
const SLOW_THRESHOLD = 5000; // 5s

const clearSlowTimer = () => {
  if (slowNetworkTimer) {
    clearTimeout(slowNetworkTimer);
    slowNetworkTimer = null;
  }
};

const startSlowTimer = () => {
  clearSlowTimer();
  slowNetworkTimer = setTimeout(() => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("api-network-error", {
          detail: {
            message:
              "The network is slow. Please wait while we process your request.",
          },
        }),
      );
    }
  }, SLOW_THRESHOLD);
};

// Queue for requests made while offline
interface QueuedRequest {
  config: AxiosRequestConfig;
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
}
let requestQueue: QueuedRequest[] = [];

/**
 * Process all queued requests when back online
 */
const processQueue = async () => {
  if (requestQueue.length === 0) return;
  console.log(`Processing ${requestQueue.length} queued requests...`);
  
  const queue = [...requestQueue];
  requestQueue = [];

  for (const req of queue) {
    try {
      const response = await api(req.config);
      req.resolve(response);
    } catch (error) {
      req.reject(error);
    }
  }
};

// Listen for online event to process queue
if (typeof window !== "undefined") {
  window.addEventListener("online", processQueue);
}

api.interceptors.request.use((config) => {
  if (accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    if (config.method !== "get") {
      requestQueue.push({
        config,
        resolve: (val: any) => val,
        reject: (err: any) => err,
      });
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("api-network-error", {
            detail: {
              message:
                "You are offline. Your changes will be saved and synced once you reconnect.",
            },
          }),
        );
      }
      return Promise.reject(new Error("OFFLINE"));
    }
  }
  startSlowTimer();
  return config;
});

api.interceptors.response.use(
  (response) => {
    clearSlowTimer();
    return response;
  },
  async (error: AxiosError) => {
    clearSlowTimer();
    const originalReq = error.config as AxiosRequestConfig & {
      _retry?: number;
    };

    // Detect network errors / offline
    if (
      !error.response &&
      (error.code === "ERR_NETWORK" ||
        (typeof navigator !== "undefined" && !navigator.onLine))
    ) {
      if (originalReq.method !== "get") {
        return new Promise((resolve, reject) => {
          requestQueue.push({ config: originalReq, resolve, reject });
          console.warn("Network error: Request added to offline queue");
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("api-network-error", {
                detail: {
                  message:
                    "Network error occurred. The request has been queued.",
                },
              }),
            );
          }
        });
      }
    }

    // Transient error retry (5xx)
    if (!originalReq._retry) {
      originalReq._retry = 0;
    }

    if (
      error.response?.status &&
      error.response.status >= 500 &&
      originalReq._retry < MAX_RETRIES
    ) {
      originalReq._retry++;

      // void immediate retry
      await sleep(getBackOffDelay(originalReq._retry));

      return api(originalReq);
    }

    // Refresh token
    if (error.response?.status === 401 && refreshToken) {
      try {
        const res = await axios.post("/auth/refresh", { refreshToken });
        setTokens(res.data.accessToken, res.data.refreshToken);

        if (originalReq.headers) {
          originalReq.headers.Authorization = `Bearer ${res.data.accessToken}`;
        }

        return api(originalReq);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

initTokenRefresh(api);

export default api;
