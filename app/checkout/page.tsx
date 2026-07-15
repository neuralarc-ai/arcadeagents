import Link from "next/link";
import { CheckoutForm } from "@/components/CheckoutForm/CheckoutForm";

export const metadata = {
  title: "Subscribe — Arcade Agents",
};

export default function CheckoutPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0d0d0f",
        color: "#f2f2f5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        <Link
          href="/"
          style={{ color: "#6f6f7a", textDecoration: "none", fontSize: 14 }}
        >
          ← Arcade Agents
        </Link>
        <h1 style={{ fontSize: 28, margin: "20px 0 6px" }}>
          Subscribe to Arcade Agents
        </h1>
        <p style={{ color: "#a8a8b3", margin: "0 0 24px", lineHeight: 1.5 }}>
          $4.99 / year. After payment you&apos;ll get a license key on the next
          screen and by email.
        </p>
        <CheckoutForm />
      </div>
    </main>
  );
}
