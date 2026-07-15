import { NextRequest, NextResponse } from "next/server";
import { getKey } from "@/lib/get-key";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");

  try {
    const stripe = getStripe();
    const result = await getKey(sessionId, {
      retrieveSession: async (id) => {
        const s = await stripe.checkout.sessions.retrieve(id, {
          expand: ["subscription"],
        });
        return {
          payment_status: s.payment_status ?? "unpaid",
          subscription:
            s.subscription && typeof s.subscription === "object"
              ? { metadata: s.subscription.metadata }
              : null,
        };
      },
    });
    return NextResponse.json(result.body, { status: result.status });
  } catch (err) {
    console.error("[get-key] error:", err);
    return NextResponse.json(
      { error: "Could not retrieve key" },
      { status: 500 },
    );
  }
}
