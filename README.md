# Arcade Agents — Website

The marketing site **and** the Stripe subscription + offline license-key flow for
**Arcade Agents**, built with Next.js (App Router).

## What's here

| Path | Purpose |
| --- | --- |
| `app/page.tsx` | Landing page (React), `app/globals.css`, `public/landing.js` (canvas engine) |
| `app/checkout` · `app/success` | Subscribe (email → Stripe) and reveal-your-key pages |
| `app/api/{create-checkout,webhook,get-key}` | Stripe checkout, webhook (mints the key), key polling |
| `lib/*` | Framework-agnostic, dependency-injected logic (license, checkout, webhook, get-key, stripe, email) |
| `test/*` | Vitest unit tests incl. golden-vector license parity |
| `public/ArcadeAgents.dmg` | macOS installer, linked from the Download button |

## Product

$4.99 / year subscription (Stripe). On payment, a stateless HMAC license key bound to the
buyer's email is minted in the webhook, stored on the Stripe subscription metadata (no
database), and emailed via Resend. The success page reveals it.

## Develop

```bash
npm install
cp .env.local.example .env.local   # then fill in real values
npm run dev                        # http://localhost:3000
npm test                           # unit tests
npm run build                      # production build
```

### Stripe setup (one-time)

1. Create a Product with a **$4.99 / year** recurring Price → `STRIPE_PRICE_ID`.
2. Add a webhook endpoint → `/api/webhook`, subscribing to
   `checkout.session.completed`, `invoice.paid`, `customer.subscription.deleted`,
   `invoice.payment_failed` → `STRIPE_WEBHOOK_SECRET`.
3. Set the env vars from `.env.local.example` (server-side only — never `NEXT_PUBLIC_`).
4. Local: `stripe listen --forward-to localhost:3000/api/webhook`, test card `4242 4242 4242 4242`.

## Deploy

Deploy on Vercel from the repo root. Set the env vars per environment (Production **and**
Preview).

Built by [Fahrenheit Research](https://www.f-r.co/).
