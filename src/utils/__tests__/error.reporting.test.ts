import { describe, expect, it } from "vitest";
import { scrubPiiFromErrorPayload } from "../error.reporting";

describe("scrubPiiFromErrorPayload", () => {
  it("removes known pii fields from nested payloads", () => {
    const payload = {
      user: {
        id: "u1",
        email: "test@example.com",
        phone_number: "+1234567",
        date_of_birth: "1990-01-01",
        government_id_number: "AB1234",
        bank_account_details: "123-456",
      },
      context: {
        users: [
          {
            id: "u2",
            phone_number_encrypted: "cipher-text",
            created_at: "2026-01-01",
          },
        ],
      },
    };

    const scrubbed = scrubPiiFromErrorPayload(payload);
    const scrubbedUser = (scrubbed as { user: Record<string, unknown> }).user;
    const scrubbedNestedUser = (
      scrubbed as { context: { users: Record<string, unknown>[] } }
    ).context.users[0];

    expect(scrubbedUser.phone_number).toBeUndefined();
    expect(scrubbedUser.date_of_birth).toBeUndefined();
    expect(scrubbedUser.government_id_number).toBeUndefined();
    expect(scrubbedUser.bank_account_details).toBeUndefined();
    expect(scrubbedNestedUser.phone_number_encrypted).toBeUndefined();
    expect(scrubbedUser.email).toBe("test@example.com");
  });
});
