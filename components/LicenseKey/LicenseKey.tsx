"use client";

import { useEffect, useState } from "react";

type State =
  | { kind: "loading" }
  | { kind: "key"; key: string; expiry?: string }
  | { kind: "email" };

const POLL_INTERVAL_MS = 1500;
const MAX_TRIES = 10; // ~15s

export function LicenseKey() {
  const [state, setState] = useState<State>({ kind: "loading" });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get(
      "session_id",
    );
    if (!sessionId) {
      setState({ kind: "email" });
      return;
    }
    // Strip the ugly ?session_id=… from the address bar.
    window.history.replaceState({}, "", window.location.pathname);

    let cancelled = false;
    let tries = 0;

    async function poll() {
      tries += 1;
      try {
        const res = await fetch(
          `/api/get-key?session_id=${encodeURIComponent(sessionId!)}`,
        );
        const data = await res.json();
        if (cancelled) return;
        if (res.ok && data.key) {
          setState({ kind: "key", key: data.key, expiry: data.expiry });
          return;
        }
      } catch {
        // network hiccup — fall through to retry
      }
      if (cancelled) return;
      if (tries >= MAX_TRIES) {
        setState({ kind: "email" });
        return;
      }
      window.setTimeout(poll, POLL_INTERVAL_MS);
    }

    poll();
    return () => {
      cancelled = true;
    };
  }, []);

  async function copy(key: string) {
    try {
      await navigator.clipboard.writeText(key);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — user can select manually */
    }
  }

  if (state.kind === "loading") {
    return <p style={{ color: "#a8a8b3" }}>Preparing your license key…</p>;
  }

  if (state.kind === "email") {
    return (
      <div>
        <h1 style={{ fontSize: 26, margin: "0 0 10px" }}>Thank you!</h1>
        <p style={{ color: "#a8a8b3", lineHeight: 1.6 }}>
          Your license key is on its way to your inbox. Check your email (and
          spam) — it has your key, the licensed email, and the valid-until date.
        </p>
      </div>
    );
  }

  const expiryLabel = state.expiry
    ? new Date(state.expiry).toISOString().slice(0, 10)
    : null;

  return (
    <div>
      <h1 style={{ fontSize: 26, margin: "0 0 10px" }}>You&apos;re in 🎉</h1>
      <p style={{ color: "#a8a8b3", margin: "0 0 18px" }}>
        Here&apos;s your license key. We&apos;ve also emailed it to you.
      </p>
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          background: "#151519",
          border: "1px solid #2a2a33",
          borderRadius: 12,
          padding: "14px 16px",
        }}
      >
        <code
          style={{
            fontSize: 20,
            letterSpacing: 2,
            color: "#37d67a",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            flex: 1,
            wordBreak: "break-all",
          }}
        >
          {state.key}
        </code>
        <button
          onClick={() => copy(state.key)}
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            border: "none",
            background: "#37d67a",
            color: "#08130c",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      {expiryLabel && (
        <p style={{ color: "#6f6f7a", fontSize: 13, marginTop: 12 }}>
          Valid until {expiryLabel}. Activate by entering your email and this
          key in the Arcade Agents app.
        </p>
      )}
    </div>
  );
}
