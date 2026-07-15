import { describe, it, expect } from "vitest";
import { generateKey, validateKey, signature } from "../lib/license";

// Fixed, PUBLIC, non-production secret used only to make the crypto deterministic in tests.
// Production uses a different LICENSE_SECRET supplied via env.
const SECRET = "ARCADE-TEST-SECRET-DO-NOT-SHIP";
const DAY = 86_400_000;
const EPOCH = Date.UTC(2026, 0, 1);

describe("key format", () => {
  it("is four dash-joined groups of four base-36 chars", () => {
    const { key } = generateKey("user@example.com", 365, { secret: SECRET });
    expect(key).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
  });
});

describe("email normalization", () => {
  it("case and surrounding whitespace produce the same key", () => {
    const opts = { secret: SECRET, now: Date.UTC(2026, 5, 1), nonce: "AB" };
    const a = generateKey("User@Example.com", 365, opts).key;
    const b = generateKey("  user@example.com  ", 365, opts).key;
    expect(a).toBe(b);
  });
});

describe("nonce", () => {
  it("is deterministic for the same inputs + nonce", () => {
    const opts = { secret: SECRET, now: Date.UTC(2026, 5, 1), nonce: "AB" };
    expect(generateKey("a@b.com", 365, opts).key).toBe(
      generateKey("a@b.com", 365, opts).key,
    );
  });

  it("changes the key when the nonce changes", () => {
    const base = { secret: SECRET, now: Date.UTC(2026, 5, 1) };
    const a = generateKey("a@b.com", 365, { ...base, nonce: "AB" }).key;
    const b = generateKey("a@b.com", 365, { ...base, nonce: "ZZ" }).key;
    expect(a).not.toBe(b);
  });
});

describe("expiry", () => {
  it("is EPOCH + expiryDays*day and base-36 encoded in the first group", () => {
    const now = Date.UTC(2026, 5, 1); // 151 days after EPOCH
    const { key, expiry } = generateKey("a@b.com", 365, {
      secret: SECRET,
      now,
      nonce: "AB",
    });
    // 151 + 365 = 516 days after EPOCH
    expect(expiry.getTime()).toBe(EPOCH + 516 * DAY);
    // 516 base-36 padded to 3 chars = "AOM" (secret-independent)
    expect(key.replace(/-/g, "").slice(0, 3)).toBe("AOM");
  });
});

describe("signature", () => {
  it("is 11 chars from the alphabet", () => {
    expect(signature("a@b.com", 516, "AB", SECRET)).toMatch(/^[A-Z0-9]{11}$/);
  });
});

describe("golden vector (regression pin — parity anchor for the future Swift port)", () => {
  // Independently derived via a RAW HMAC-SHA256 of "user@example.com|516|AB" with SECRET,
  // first 11 bytes mapped through `byte % 36` onto the alphabet (see commit notes). Any
  // drift in alphabet / EPOCH / message / length breaks this and every issued key.
  const now = Date.UTC(2026, 5, 1); // 2026-06-01 → expiryDays 516
  const opts = { secret: SECRET, now, nonce: "AB" };

  it("mints the exact frozen key", () => {
    expect(generateKey("user@example.com", 365, opts).key).toBe("AOMA-BUIP-LX3G-JOF2");
  });

  it("email is normalized before hashing (mixed case → same key)", () => {
    expect(generateKey("User@Example.com", 365, opts).key).toBe("AOMA-BUIP-LX3G-JOF2");
  });

  it("produces the exact frozen signature", () => {
    expect(signature("user@example.com", 516, "AB", SECRET)).toBe("UIPLX3GJOF2");
  });

  it("validates its own golden key", () => {
    const r = validateKey("user@example.com", "AOMA-BUIP-LX3G-JOF2", { secret: SECRET, now });
    expect(r.valid).toBe(true);
    expect(r.active).toBe(true);
    expect(r.expiryDays).toBe(516);
  });
});

describe("validateKey", () => {
  const now = Date.UTC(2026, 5, 1);

  it("accepts a freshly issued key for the same email", () => {
    const { key } = generateKey("user@example.com", 365, {
      secret: SECRET,
      now,
      nonce: "AB",
    });
    const r = validateKey("user@example.com", key, { secret: SECRET, now });
    expect(r.valid).toBe(true);
    expect(r.active).toBe(true);
  });

  it("rejects a different email (the binding)", () => {
    const { key } = generateKey("user@example.com", 365, {
      secret: SECRET,
      now,
      nonce: "AB",
    });
    expect(
      validateKey("someone@else.com", key, { secret: SECRET, now }).valid,
    ).toBe(false);
  });

  it("ignores case, spaces and dashes in the pasted key", () => {
    const { key } = generateKey("user@example.com", 365, {
      secret: SECRET,
      now,
      nonce: "AB",
    });
    const messy = `  ${key.toLowerCase().replace(/-/g, " ")} `;
    expect(
      validateKey("user@example.com", messy, { secret: SECRET, now }).valid,
    ).toBe(true);
  });

  it("marks an expired key valid-but-inactive", () => {
    const { key } = generateKey("user@example.com", 365, {
      secret: SECRET,
      now,
      nonce: "AB",
    });
    const later = Date.UTC(2028, 0, 1); // > 1 year after issue
    const r = validateKey("user@example.com", key, { secret: SECRET, now: later });
    expect(r.valid).toBe(true);
    expect(r.active).toBe(false);
  });

  it("rejects a tampered signature", () => {
    const { key } = generateKey("user@example.com", 365, {
      secret: SECRET,
      now,
      nonce: "AB",
    });
    const raw = key.replace(/-/g, "");
    // flip the last char to a different alphabet member
    const tampered = raw.slice(0, 15) + (raw[15] === "A" ? "B" : "A");
    expect(
      validateKey("user@example.com", tampered, { secret: SECRET, now }).valid,
    ).toBe(false);
  });
});
