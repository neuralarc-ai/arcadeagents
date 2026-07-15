import { describe, it, expect } from "vitest";
import { createCheckout, type CheckoutDeps } from "../lib/checkout";

function deps(overrides: Partial<CheckoutDeps> = {}): {
  deps: CheckoutDeps;
  calls: any[];
} {
  const calls: any[] = [];
  return {
    calls,
    deps: {
      priceId: "price_test",
      siteUrl: "https://arcade.test",
      createCheckoutSession: async (params) => {
        calls.push(params);
        return { url: "https://checkout.stripe.test/session" };
      },
      ...overrides,
    },
  };
}

describe("createCheckout", () => {
  it("rejects non-POST with 405", async () => {
    const { deps: d } = deps();
    const r = await createCheckout({ method: "GET", email: "a@b.com" }, d);
    expect(r.status).toBe(405);
  });

  it("rejects an email without @ with 400", async () => {
    const { deps: d, calls } = deps();
    const r = await createCheckout({ method: "POST", email: "not-an-email" }, d);
    expect(r.status).toBe(400);
    expect(calls).toHaveLength(0); // never hit Stripe
  });

  it("creates a subscription session with the right params and returns the url", async () => {
    const { deps: d, calls } = deps();
    const r = await createCheckout({ method: "POST", email: "buyer@x.com" }, d);
    expect(r.status).toBe(200);
    expect(r.body.url).toBe("https://checkout.stripe.test/session");
    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({
      mode: "subscription",
      customer_email: "buyer@x.com",
      line_items: [{ price: "price_test", quantity: 1 }],
      success_url: "https://arcade.test/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://arcade.test/checkout",
      subscription_data: { metadata: { license_email: "buyer@x.com" } },
    });
  });

  it("returns 500 if Stripe gives back no url", async () => {
    const { deps: d } = deps({ createCheckoutSession: async () => ({ url: null }) });
    const r = await createCheckout({ method: "POST", email: "buyer@x.com" }, d);
    expect(r.status).toBe(500);
  });
});
