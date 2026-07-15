import "server-only";

/**
 * Create-checkout logic, framework-agnostic and dependency-injected so it is unit-testable
 * without a live Stripe. The route handler wires in a real Stripe client.
 */

export interface CheckoutSessionParams {
  mode: "subscription";
  customer_email: string;
  line_items: { price: string; quantity: number }[];
  success_url: string;
  cancel_url: string;
  subscription_data: { metadata: { license_email: string } };
}

export interface CheckoutDeps {
  /** The recurring price to sell ($4.99/yr). */
  priceId: string;
  /** Base site URL (no trailing slash) for success/cancel URLs. */
  siteUrl: string;
  /** Create a Stripe Checkout Session; resolves to its hosted URL. */
  createCheckoutSession(params: CheckoutSessionParams): Promise<{ url: string | null }>;
}

export interface CreateCheckoutInput {
  method: string;
  email?: unknown;
}

export interface CheckoutResult {
  status: number;
  body: Record<string, unknown>;
}

export async function createCheckout(
  input: CreateCheckoutInput,
  deps: CheckoutDeps,
): Promise<CheckoutResult> {
  if (input.method !== "POST") {
    return { status: 405, body: { error: "Method not allowed" } };
  }

  const email = typeof input.email === "string" ? input.email.trim() : "";
  // Cheap guard; Stripe re-validates on its hosted page.
  if (!email.includes("@")) {
    return { status: 400, body: { error: "A valid email is required" } };
  }

  const session = await deps.createCheckoutSession({
    mode: "subscription",
    customer_email: email,
    line_items: [{ price: deps.priceId, quantity: 1 }],
    success_url: `${deps.siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${deps.siteUrl}/checkout`,
    subscription_data: { metadata: { license_email: email } },
  });

  if (!session.url) {
    return { status: 500, body: { error: "Could not create checkout session" } };
  }
  return { status: 200, body: { url: session.url } };
}
