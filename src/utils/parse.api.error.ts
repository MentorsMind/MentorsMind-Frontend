import type { AxiosError, AxiosResponse } from "axios";

/**
 * Extracts a user-friendly error message from any known API error response shape:
 *   { success: false, error: "..." }       — AuthController, PaymentsController
 *   { error: "..." }                        — DisputesController
 *   { status: "error", message: "..." }    — rate-limiter middleware
 *   { details: [{ message: "..." }] }      — Zod validation errors
 *   response.statusText                    — fallback
 */
export function parseApiError(error: AxiosError): string {
  const response = error.response as AxiosResponse<any> | undefined;
  const status = response?.status;
  const data = response?.data;

  // 429 — rate limit: use Retry-After header if present
  if (status === 429) {
    const retryAfter = response?.headers?.["retry-after"];
    const seconds = retryAfter ? parseInt(retryAfter, 10) : null;
    return seconds
      ? `Too many requests. Please wait ${seconds} seconds.`
      : "Too many requests. Please wait before trying again.";
  }

  // 503 — service unavailable
  if (status === 503) {
    return "Service temporarily unavailable";
  }

  // 502 — bad gateway (payment network)
  if (status === 502) {
    return "Unable to reach the payment network. Please try again.";
  }

  // 409 — conflict: show the specific message from the body
  if (status === 409) {
    const msg =
      data?.error ??
      data?.message ??
      data?.details?.[0]?.message ??
      response?.statusText ??
      "A conflict occurred.";
    return msg;
  }

  // Generic shape extraction (order matters)
  if (data?.error) return data.error;
  if (data?.message) return data.message;
  if (data?.details?.[0]?.message) return data.details[0].message;
  if (response?.statusText) return response.statusText;

  return "An unexpected error occurred.";
}
