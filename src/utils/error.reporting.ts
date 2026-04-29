const PII_KEYS = new Set([
  "phone_number",
  "date_of_birth",
  "government_id_number",
  "bank_account_details",
  "phone_number_encrypted",
  "date_of_birth_encrypted",
  "government_id_number_encrypted",
  "bank_account_details_encrypted",
]);

const scrubObject = (input: unknown): unknown => {
  if (Array.isArray(input)) {
    return input.map(scrubObject);
  }

  if (!input || typeof input !== "object") {
    return input;
  }

  const source = input as Record<string, unknown>;
  const output: Record<string, unknown> = {};

  Object.entries(source).forEach(([key, value]) => {
    if (PII_KEYS.has(key)) {
      return;
    }
    output[key] = scrubObject(value);
  });

  return output;
};

export const scrubPiiFromErrorPayload = <T>(payload: T): T => {
  return scrubObject(payload) as T;
};

export const reportErrorToSentry = (error: unknown) => {
  const scrubbedError = scrubPiiFromErrorPayload(error);
  const sentry = (globalThis as { Sentry?: { captureException?: (err: unknown) => void } }).Sentry;
  sentry?.captureException?.(scrubbedError);
};
