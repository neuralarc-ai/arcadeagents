import "server-only";

/**
 * Get-key logic: the success page polls this to reveal the minted key. Read-only and public,
 * so it MUST refuse to return a key for a session that has not actually paid (402).
 */

export interface RetrievedSession {
  payment_status: string;
  subscription: { metadata?: Record<string, string> } | null;
}

export interface GetKeyDeps {
  /** Retrieve a Checkout Session with its subscription expanded. */
  retrieveSession(sessionId: string): Promise<RetrievedSession>;
}

export interface GetKeyResult {
  status: number;
  body: Record<string, unknown>;
}

export async function getKey(
  sessionId: string | null,
  deps: GetKeyDeps,
): Promise<GetKeyResult> {
  if (!sessionId) {
    return { status: 400, body: { error: "session_id is required" } };
  }

  const session = await deps.retrieveSession(sessionId);

  if (session.payment_status !== "paid") {
    return { status: 402, body: { error: "Payment not completed" } };
  }

  const meta = session.subscription?.metadata;
  if (meta?.license_key) {
    return {
      status: 200,
      body: { key: meta.license_key, expiry: meta.license_expiry },
    };
  }

  // Paid, but the webhook has not stored the key yet — client keeps polling.
  return { status: 200, body: { pending: true } };
}
