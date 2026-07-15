"use client";

import { useState } from "react";

export function CheckoutForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Could not start checkout");
      }
      // Redirect to Stripe Hosted Checkout; keep the button in its loading state.
      window.location.href = data.url;
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
      <label htmlFor="email" style={{ fontSize: 14, color: "#a8a8b3" }}>
        Email — your license key is bound to this address
      </label>
      <input
        id="email"
        type="email"
        required
        autoFocus
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
        style={{
          padding: "12px 14px",
          borderRadius: 10,
          border: "1px solid #2a2a33",
          background: "#151519",
          color: "#f2f2f5",
          fontSize: 16,
          outline: "none",
        }}
      />
      <button
        type="submit"
        disabled={loading || !email}
        style={{
          padding: "12px 14px",
          borderRadius: 10,
          border: "none",
          background: loading || !email ? "#2a4d3a" : "#37d67a",
          color: loading || !email ? "#8fb89f" : "#08130c",
          fontSize: 16,
          fontWeight: 700,
          cursor: loading || !email ? "default" : "pointer",
        }}
      >
        {loading ? "Redirecting to checkout…" : "Subscribe — $4.99/yr"}
      </button>
      <p style={{ fontSize: 12, color: "#6f6f7a", margin: 0 }}>
        Secure payment by Stripe. Cancel anytime. Nothing leaves your Mac.
      </p>
    </form>
  );
}
