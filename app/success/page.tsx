import { Suspense } from "react";
import Link from "next/link";
import { LicenseKey } from "@/components/LicenseKey/LicenseKey";

export const metadata = {
  title: "Your license key — Arcade Agents",
};

export default function SuccessPage() {
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
      <div style={{ width: "100%", maxWidth: 480 }}>
        <Link
          href="/"
          style={{ color: "#6f6f7a", textDecoration: "none", fontSize: 14 }}
        >
          ← Arcade Agents
        </Link>
        <div style={{ marginTop: 20 }}>
          <Suspense fallback={<p style={{ color: "#a8a8b3" }}>Loading…</p>}>
            <LicenseKey />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
