import "server-only";
import Stripe from "stripe";

/**
 * Stripe client factory. Constructed per call from STRIPE_SECRET_KEY so a Preview deploy
 * without the env var fails loudly at the point of use rather than at import time.
 */
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key);
}
