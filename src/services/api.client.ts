import type { AxiosInstance } from "axios";
import axios from "axios";

let accessToken: string;
let refreshToken: string;

export const setTokens = (access: string, refresh: string) => {
  accessToken = access;
  refreshToken = refresh;
};

const api: AxiosInstance = axios.create({ baseURL: "/api", timeout: 10000 });

api.interceptors.request.use((config) => {
  if (accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

export default api;
