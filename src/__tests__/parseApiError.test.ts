import { describe, it, expect } from "vitest";
import type { AxiosError, AxiosResponse } from "axios";
import { parseApiError } from "../../utils/parse.api.error";

function makeError(
  status: number,
  data: Record<string, any>,
  headers: Record<string, string> = {},
  statusText = "Error"
): AxiosError {
  const response = { status, data, headers, statusText } as unknown as AxiosResponse;
  return { response, isAxiosError: true } as unknown as AxiosError;
}

describe("parseApiError", () => {
  it("extracts error from { success: false, error: '...' } shape", () => {
    const err = makeError(400, { success: false, error: "Invalid credentials" });
    expect(parseApiError(err)).toBe("Invalid credentials");
  });

  it("extracts error from { error: '...' } shape (no success field)", () => {
    const err = makeError(400, { error: "Dispute not found" });
    expect(parseApiError(err)).toBe("Dispute not found");
  });

  it("extracts message from { status: 'error', message: '...' } shape", () => {
    const err = makeError(400, { status: "error", message: "Rate limit exceeded" });
    expect(parseApiError(err)).toBe("Rate limit exceeded");
  });

  it("extracts first Zod validation error from details array", () => {
    const err = makeError(422, { details: [{ message: "email is required" }, { message: "password too short" }] });
    expect(parseApiError(err)).toBe("email is required");
  });

  it("falls back to statusText when no known shape matches", () => {
    const err = makeError(500, {}, {}, "Internal Server Error");
    expect(parseApiError(err)).toBe("Internal Server Error");
  });

  it("returns 429 message without Retry-After header", () => {
    const err = makeError(429, {});
    expect(parseApiError(err)).toBe("Too many requests. Please wait before trying again.");
  });

  it("returns 429 message with Retry-After header", () => {
    const err = makeError(429, {}, { "retry-after": "30" });
    expect(parseApiError(err)).toBe("Too many requests. Please wait 30 seconds.");
  });

  it("returns 409 conflict message from body", () => {
    const err = makeError(409, { error: "Email already in use" });
    expect(parseApiError(err)).toBe("Email already in use");
  });

  it("returns 503 user-friendly message", () => {
    const err = makeError(503, {});
    expect(parseApiError(err)).toBe("Service temporarily unavailable");
  });

  it("returns 502 payment network message", () => {
    const err = makeError(502, {});
    expect(parseApiError(err)).toBe("Unable to reach the payment network. Please try again.");
  });

  it("returns fallback message when response is undefined", () => {
    const err = { response: undefined, isAxiosError: true } as unknown as AxiosError;
    expect(parseApiError(err)).toBe("An unexpected error occurred.");
  });
});
