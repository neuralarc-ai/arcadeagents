import { describe, it, expect } from "vitest";
import { getKey, type GetKeyDeps, type RetrievedSession } from "../lib/get-key";

function deps(session: RetrievedSession | null): GetKeyDeps {
  return {
    retrieveSession: async () => {
      if (!session) throw new Error("no such session");
      return session;
    },
  };
}

describe("getKey", () => {
  it("returns 400 when no session_id is given", async () => {
    const r = await getKey(null, deps(null));
    expect(r.status).toBe(400);
  });

  it("returns 402 for an unpaid session (no key leaks before payment)", async () => {
    const r = await getKey("cs_1", deps({ payment_status: "unpaid", subscription: null }));
    expect(r.status).toBe(402);
  });

  it("returns the key + expiry once the webhook has stored it", async () => {
    const r = await getKey(
      "cs_1",
      deps({
        payment_status: "paid",
        subscription: {
          metadata: { license_key: "AOMA-BUIP-LX3G-JOF2", license_expiry: "2027-05-31T00:00:00.000Z" },
        },
      }),
    );
    expect(r.status).toBe(200);
    expect(r.body).toEqual({
      key: "AOMA-BUIP-LX3G-JOF2",
      expiry: "2027-05-31T00:00:00.000Z",
    });
  });

  it("returns pending when paid but the webhook has not landed yet", async () => {
    const r = await getKey(
      "cs_1",
      deps({ payment_status: "paid", subscription: { metadata: {} } }),
    );
    expect(r.status).toBe(200);
    expect(r.body).toEqual({ pending: true });
  });
});
