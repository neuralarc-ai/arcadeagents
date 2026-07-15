import "server-only";
import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

/**
 * Stateless, offline-verifiable license key bound to the buyer's email.
 *
 *   XXXX-XXXX-XXXX-XXXX   e.g. AOMA-BJX6-PDPW-1XJE
 *
 * 16 chars = 3 (expiry, base-36 days since EPOCH) + 2 (nonce) + 11 (signature).
 * The signature is the first 11 bytes of HMAC-SHA256("email|expiryDays|nonce"),
 * each byte folded onto the 36-char alphabet via `byte % 36`.
 *
 * The algorithm here MUST stay byte-for-byte identical to any validator (e.g. the
 * future LicenseManager.swift). Changing the alphabet, EPOCH, message format, or
 * signature length invalidates every previously issued key. `test/license.test.ts`
 * pins it with golden vectors for exactly this reason.
 */

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"; // 36 chars, base-36
const DAY = 86_400_000;
const SIG_LEN = 11;

/** Day zero for the expiry counter: 2026-01-01 UTC. */
export const EPOCH = Date.UTC(2026, 0, 1);

export interface GenerateOptions {
  /** Override the HMAC secret (defaults to process.env.LICENSE_SECRET). */
  secret?: string;
  /** Override "now" in ms since the Unix epoch (for deterministic tests). */
  now?: number;
  /** Override the 2-char nonce (for deterministic tests). */
  nonce?: string;
}

function requireSecret(secret?: string): string {
  const s = secret ?? process.env.LICENSE_SECRET;
  if (!s) throw new Error("LICENSE_SECRET is not set");
  return s;
}

/** trim + lowercase — load-bearing: the validator must normalize identically. */
function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function encode36(n: number, width: number): string {
  let out = "";
  let v = Math.floor(n);
  while (v > 0) {
    out = ALPHABET[v % 36] + out;
    v = Math.floor(v / 36);
  }
  return out.padStart(width, ALPHABET[0]); // pad with 'A' (== zero)
}

function decode36(s: string): number {
  let v = 0;
  for (const ch of s) v = v * 36 + ALPHABET.indexOf(ch);
  return v;
}

function randomNonce(): string {
  return ALPHABET[randomInt(36)] + ALPHABET[randomInt(36)];
}

function group4(raw: string): string {
  return raw.match(/.{1,4}/g)!.join("-");
}

/** Uppercase and strip everything not in the alphabet (dashes/spaces are ignored). */
function normalizeKey(key: string): string {
  return key
    .toUpperCase()
    .split("")
    .filter((c) => ALPHABET.includes(c))
    .join("");
}

function equalConstantTime(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/** The 11-char signature over "email|expiryDays|nonce". */
export function signature(
  email: string,
  expiryDays: number,
  nonce: string,
  secret?: string,
): string {
  const msg = `${normalizeEmail(email)}|${expiryDays}|${nonce}`;
  const mac = createHmac("sha256", requireSecret(secret)).update(msg).digest();
  let sig = "";
  for (let i = 0; i < SIG_LEN; i++) sig += ALPHABET[mac[i] % 36];
  return sig;
}

/** Mint a key for `email` valid for `days` days from now (default 365 = ~1 year). */
export function generateKey(
  email: string,
  days = 365,
  opts: GenerateOptions = {},
): { key: string; expiry: Date } {
  const now = opts.now ?? Date.now();
  const expiryDays = Math.floor((now + days * DAY - EPOCH) / DAY);
  const nonce = opts.nonce ?? randomNonce();
  const sig = signature(email, expiryDays, nonce, opts.secret);
  const raw = encode36(expiryDays, 3) + nonce + sig; // 3 + 2 + 11 = 16
  return { key: group4(raw), expiry: new Date(EPOCH + expiryDays * DAY) };
}

export interface ValidationResult {
  /** Signature matches the email — the key is authentic. */
  valid: boolean;
  /** Authentic AND not past its expiry date. */
  active: boolean;
  expiry: Date | null;
  expiryDays: number | null;
}

/** Offline validation: recompute the signature for `email` and compare. */
export function validateKey(
  email: string,
  key: string,
  opts: { secret?: string; now?: number } = {},
): ValidationResult {
  const now = opts.now ?? Date.now();
  const raw = normalizeKey(key);
  if (raw.length !== 16) {
    return { valid: false, active: false, expiry: null, expiryDays: null };
  }
  const expiryDays = decode36(raw.slice(0, 3));
  const nonce = raw.slice(3, 5);
  const sig = raw.slice(5, 16);
  const valid = equalConstantTime(sig, signature(email, expiryDays, nonce, opts.secret));
  const expiry = new Date(EPOCH + expiryDays * DAY);
  return {
    valid,
    active: valid && expiry.getTime() >= now,
    expiry: valid ? expiry : null,
    expiryDays: valid ? expiryDays : null,
  };
}
