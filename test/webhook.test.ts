import { describe, it, expect } from "vitest";
import { handleWebhook, type WebhookDeps, type StripeEvent } from "../lib/webhook";

const EXPIRY = new Date("2027-05-31T00:00:00.000Z");

function makeDeps(
  event: StripeEvent | Error,
  overrides: Partial<WebhookDeps> = {},
) {
  const calls = {
    generateKey: [] as string[],
    update: [] as { id: string; metadata: Record<string, string> }[],
    email: [] as { email: string; key: string; expiry: Date }[],
  };
  const deps: WebhookDeps = {
    constructEvent: () => {
      if (event instanceof Error) throw event;
      return event;
    },
    generateKey: (email) => {
      calls.generateKey.push(email);
      return { key: "TESTKEY-XXXX-XXXX-XXXX", expiry: EXPIRY };
    },
    updateSubscriptionMetadata: async (id, metadata) => {
      calls.update.push({ id, metadata });
    },
    sendEmail: async (email, key, expiry) => {
      calls.email.push({ email, key, expiry });
    },
    ...overrides,
  };
  return { deps, calls };
}

function completedSession(email: string, subId: string): StripeEvent {
  return {
    type: "checkout.session.completed",
    data: {
      object: {
        customer_details: { email },
        customer_email: email,
        subscription: subId,
      },
    },
  };
}

function invoicePaid(reason: string, email: string, subId: string): StripeEvent {
  return {
    type: "invoice.paid",
    data: {
      object: { billing_reason: reason, customer_email: email, subscription: subId },
    },
  };
}

describe("handleWebhook", () => {
  it("returns 400 on a forged signature and mints nothing", async () => {
    const { deps, calls } = makeDeps(new Error("bad signature"));
    const r = await handleWebhook("raw", "sig", deps);
    expect(r.status).toBe(400);
    expect(calls.generateKey).toHaveLength(0);
    expect(calls.update).toHaveLength(0);
  });

  it("mints a key on checkout.session.completed and stores it on the subscription", async () => {
    const { deps, calls } = makeDeps(completedSession("buyer@x.com", "sub_1"));
    const r = await handleWebhook("raw", "sig", deps);
    expect(r.status).toBe(200);
    expect(r.body).toMatchObject({ received: true });
    expect(calls.generateKey).toEqual(["buyer@x.com"]);
    expect(calls.update).toEqual([
      {
        id: "sub_1",
        metadata: {
          license_key: "TESTKEY-XXXX-XXXX-XXXX",
          license_expiry: EXPIRY.toISOString(),
        },
      },
    ]);
    expect(calls.email).toHaveLength(1);
  });

  it("mints a fresh key on a renewal (invoice.paid / subscription_cycle)", async () => {
    const { deps, calls } = makeDeps(invoicePaid("subscription_cycle", "buyer@x.com", "sub_1"));
    const r = await handleWebhook("raw", "sig", deps);
    expect(r.status).toBe(200);
    expect(calls.generateKey).toEqual(["buyer@x.com"]);
    expect(calls.update).toHaveLength(1);
  });

  it("does NOT mint on the first invoice (subscription_create) — idempotency", async () => {
    const { deps, calls } = makeDeps(invoicePaid("subscription_create", "buyer@x.com", "sub_1"));
    const r = await handleWebhook("raw", "sig", deps);
    expect(r.status).toBe(200);
    expect(calls.generateKey).toHaveLength(0);
    expect(calls.update).toHaveLength(0);
  });

  it("ignores unrelated events without minting", async () => {
    const { deps, calls } = makeDeps({ type: "customer.subscription.deleted", data: { object: {} } });
    const r = await handleWebhook("raw", "sig", deps);
    expect(r.status).toBe(200);
    expect(calls.generateKey).toHaveLength(0);
  });

  it("still succeeds (200) when email delivery throws — key is already stored", async () => {
    const { deps, calls } = makeDeps(completedSession("buyer@x.com", "sub_1"), {
      sendEmail: async () => {
        throw new Error("Resend is down");
      },
    });
    const r = await handleWebhook("raw", "sig", deps);
    expect(r.status).toBe(200);
    expect(calls.update).toHaveLength(1); // key WAS stored
  });

  it("propagates a storage failure so Stripe retries (route → 500)", async () => {
    const { deps } = makeDeps(completedSession("buyer@x.com", "sub_1"), {
      updateSubscriptionMetadata: async () => {
        throw new Error("Stripe metadata write failed");
      },
    });
    await expect(handleWebhook("raw", "sig", deps)).rejects.toThrow();
  });
});
