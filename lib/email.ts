import "server-only";
import { Resend } from "resend";

/**
 * Best-effort license email via Resend.
 *  - RESEND_API_KEY unset → warn and skip (the key is still stored + shown on /success).
 *  - Resend throws → the error propagates to the webhook, which swallows it (email is the
 *    backup channel; the on-page path is the primary reveal).
 */
export async function sendLicenseEmail(
  email: string,
  key: string,
  expiry: Date,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY unset — skipping license email");
    return;
  }
  const from =
    process.env.LICENSE_FROM_EMAIL ?? "Arcade Agents <keys@arcadeagents.app>";
  const validUntil = expiry.toISOString().slice(0, 10); // YYYY-MM-DD

  const resend = new Resend(apiKey);
  await resend.emails.send({
    from,
    to: email,
    subject: "Your Arcade Agents license key",
    text: [
      "Thanks for subscribing to Arcade Agents.",
      "",
      `License key:     ${key}`,
      `Licensed email:  ${email}`,
      `Valid until:     ${validUntil}`,
      "",
      "Activate by entering this email and key in the Arcade Agents app.",
      "Keep this email — it is your proof of purchase and the guaranteed copy of your key.",
    ].join("\n"),
  });
}
