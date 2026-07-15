import { NextRequest, NextResponse } from "next/server";
import { createCheckout } from "@/lib/checkout";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let email: unknown;
  try {
    const body = await req.json();
    email = body?.email;
  } catch {
    email = undefined;
  }

  try {
    const stripe = getStripe();
    const result = await createCheckout(
      { method: "POST", email },
      {
        priceId: process.env.STRIPE_PRICE_ID ?? "",
        siteUrl: process.env.SITE_URL ?? "",
        createCheckoutSession: async (params) => {
          const session = await stripe.checkout.sessions.create(params);
          return { url: session.url };
        },
      },
    );
    return NextResponse.json(result.body, { status: result.status });
  } catch (err) {
    console.error("[create-checkout] error:", err);
    return NextResponse.json(
      { error: "Could not start checkout" },
      { status: 500 },
    );
  }
}
