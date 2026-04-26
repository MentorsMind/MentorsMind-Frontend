import { AxiosError, type AxiosRequestConfig } from "axios";
import api from "../services/api.client";
import { ApiError, ApiErrorResponse } from "../services/api.error";

export const request = async <T>(
  config: AxiosRequestConfig,
  opts?: {
    signal?: AbortSignal;
  },
): Promise<T> => {
  if (opts?.signal) {
    config.signal = opts.signal;
  }

  try {
    const res = await api(config);
    return res.data;
  } catch (err) {
    if (err instanceof AxiosError) {
      const status = err.response?.status ?? 500;
      const data = err.response?.data as ApiErrorResponse;

      // Parse field-leve validation errors
      const fieldErrors: Record<string, string> = {};

      if (data.errors && Array.isArray(data.errors)) {
        data.errors.forEach((e) => {
          fieldErrors[e.field] = e.message;
        });
      }

      throw new ApiError(
        data.message || err.message || "An error occured.",
        status,
        Object.keys(fieldErrors).length ? fieldErrors : undefined,
      );
    }

    throw err;
  }
};
