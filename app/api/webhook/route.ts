import { NextRequest, NextResponse } from "next/server";
import { handleWebhook, type StripeEvent } from "@/lib/webhook";
import { getStripe } from "@/lib/stripe";
import { generateKey } from "@/lib/license";
import { sendLicenseEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  // RAW body — Stripe signs the exact bytes, so it must NOT be JSON-parsed first.
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature") ?? "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";

  try {
    const stripe = getStripe();
    const result = await handleWebhook(rawBody, signature, {
      constructEvent: (raw, sig) =>
        stripe.webhooks.constructEvent(raw, sig, webhookSecret) as StripeEvent,
      generateKey: (email) => generateKey(email, 365),
      updateSubscriptionMetadata: async (id, metadata) => {
        await stripe.subscriptions.update(id, { metadata });
      },
      sendEmail: sendLicenseEmail,
    });
    return NextResponse.json(result.body, { status: result.status });
  } catch (err) {
    // A real failure (e.g. metadata write) → 500 so Stripe retries the delivery.
    console.error("[webhook] handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
