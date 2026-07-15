import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Arcade Agents — watch your AI coding agents from the notch",
  description:
    "Watch your AI coding agents, approve what they want to do, and jump back — from your MacBook notch. Claude Code, Codex, Grok Build, Kiro CLI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
