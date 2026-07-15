import "server-only";

/**
 * Webhook logic: where the license key is actually minted. Framework-agnostic and
 * dependency-injected. The route handler wires in the real Stripe client, key generator,
 * and email sender.
 *
 * Contract:
 *  - Invalid signature → 400, nothing minted.
 *  - Storage (subscription metadata write) failure → THROWS, so the route returns 500 and
 *    Stripe retries.
 *  - Email delivery failure → swallowed; the key is already minted + stored, and email is
 *    the backup channel, so a flaky provider must not fail (and thus retry) the webhook.
 */

export interface StripeEvent {
  type: string;
  data: { object: any };
}

export interface WebhookDeps {
  /** Verify the raw body against the signature; throws on a bad signature. */
  constructEvent(rawBody: string, signature: string): StripeEvent;
  /** Mint a license key (bound to `email`, 1-year expiry). */
  generateKey(email: string): { key: string; expiry: Date };
  /** Store the key on the Stripe subscription (the "no database" store of record). */
  updateSubscriptionMetadata(
    subscriptionId: string,
    metadata: { license_key: string; license_expiry: string },
  ): Promise<void>;
  /** Best-effort email of the key. May reject; the caller swallows it. */
  sendEmail(email: string, key: string, expiry: Date): Promise<void>;
}

export interface WebhookResult {
  status: number;
  body: Record<string, unknown>;
}

async function issueKey(
  email: string,
  subscriptionId: string,
  deps: WebhookDeps,
): Promise<void> {
  const { key, expiry } = deps.generateKey(email);
  // Storage first — this MUST succeed (throwing propagates to a 500 → Stripe retry).
  await deps.updateSubscriptionMetadata(subscriptionId, {
    license_key: key,
    license_expiry: expiry.toISOString(),
  });
  // Email is best-effort: never let it fail the webhook.
  try {
    await deps.sendEmail(email, key, expiry);
  } catch (err) {
    console.error("[webhook] email delivery failed (key already stored):", err);
  }
}

export async function handleWebhook(
  rawBody: string,
  signature: string,
  deps: WebhookDeps,
): Promise<WebhookResult> {
  let event: StripeEvent;
  try {
    event = deps.constructEvent(rawBody, signature);
  } catch (err) {
    console.error("[webhook] signature verification failed:", err);
    return { status: 400, body: { error: "Invalid signature" } };
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const email: string | undefined =
        session.customer_details?.email ?? session.customer_email;
      const subscriptionId: string | undefined = session.subscription;
      if (!email || !subscriptionId) {
        console.error("[webhook] completed session missing email/subscription");
        return { status: 200, body: { received: true, handled: false } };
      }
      await issueKey(email, subscriptionId, deps);
      return { status: 200, body: { received: true } };
    }

    case "invoice.paid": {
      const invoice = event.data.object;
      // Only renewals: the first invoice (subscription_create) is already covered by
      // checkout.session.completed. Minting on both would double-issue.
      if (invoice.billing_reason !== "subscription_cycle") {
        return { status: 200, body: { received: true, handled: false } };
      }
      const email: string | undefined = invoice.customer_email;
      const subscriptionId: string | undefined = invoice.subscription;
      if (!email || !subscriptionId) {
        console.error("[webhook] renewal invoice missing email/subscription");
        return { status: 200, body: { received: true, handled: false } };
      }
      await issueKey(email, subscriptionId, deps);
      return { status: 200, body: { received: true } };
    }

    case "customer.subscription.deleted":
    case "invoice.payment_failed":
      // Log-only: no key issued. (Offline keys can't be revoked mid-term anyway.)
      console.log(`[webhook] ${event.type} (log-only)`);
      return { status: 200, body: { received: true, handled: false } };

    default:
      return { status: 200, body: { received: true, handled: false } };
  }
}
