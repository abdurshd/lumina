/**
 * Referral / affiliate v1 — utilities, schema constants, and fraud helpers.
 *
 * Storage shape (Firestore):
 *   `users/{uid}.referralCode` — code this user owns (string)
 *   `users/{uid}.referredBy` — code this user signed up under (string | null)
 *   `referralCodes/{code}` — {
 *     uid: string;
 *     createdAt: number;
 *     totalClicks: number;
 *     totalSignups: number;
 *     totalQualified: number;     // bumped only after billing webhook fires
 *   }
 *   `referralClicks/{ipHash}_{code}_{dayBucket}` — used for 24h click dedup
 *
 * Reward fulfillment is intentionally out of scope for v1 — a referral is
 * marked "qualified" only when a Polar webhook (G0.3) confirms first paid
 * renewal. Until billing lands, "totalQualified" stays 0 and the credit grant
 * is a no-op stub.
 */

const CODE_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"; // Crockford base32 — no I/L/O/U
const CODE_LENGTH = 8;
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

export const REFERRAL_COOKIE_NAME = "lumina_referral";
export const REFERRAL_CODE_LENGTH = CODE_LENGTH;
export const REFERRAL_COOKIE_MAX_AGE = COOKIE_MAX_AGE_SECONDS;

const VALID_CODE_REGEX = new RegExp(
  `^[${CODE_ALPHABET}]{${CODE_LENGTH}}$`
);

export function isValidReferralCode(value: unknown): value is string {
  return typeof value === "string" && VALID_CODE_REGEX.test(value);
}

/**
 * Generate a fresh referral code. Pure function — caller is responsible for
 * persisting it and handling collisions (spectacularly unlikely at this
 * length but transaction-checked in the issuer).
 */
export function generateReferralCode(): string {
  const buf = new Uint8Array(CODE_LENGTH);
  crypto.getRandomValues(buf);
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_ALPHABET[buf[i] % CODE_ALPHABET.length];
  }
  return code;
}

/**
 * SHA-256 of (ip + day-bucket). Used to dedup clicks from the same IP within
 * the same UTC day window — no PII is stored.
 */
export async function hashClickIdentity(
  ip: string,
  code: string
): Promise<string> {
  const dayBucket = Math.floor(Date.now() / (24 * 60 * 60 * 1000));
  const data = new TextEncoder().encode(`${ip}|${code}|${dayBucket}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .slice(0, 12)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Fraud check: a user cannot redeem their own code. Called at signup time.
 */
export function isSelfReferral(params: {
  signupUid: string;
  referrerUid: string;
}): boolean {
  return params.signupUid === params.referrerUid;
}

export interface ReferralCodeDoc {
  uid: string;
  createdAt: number;
  totalClicks: number;
  totalSignups: number;
  totalQualified: number;
}

export interface ReferralStats {
  code: string;
  totalClicks: number;
  totalSignups: number;
  totalQualified: number;
  shareUrl: string;
}

/**
 * Build the public share URL for a code. The path lives under `/ref/` so
 * `/r/{slug}` can be used for shared reports.
 */
export function buildReferralShareUrl(
  origin: string,
  code: string
): string {
  return `${origin.replace(/\/$/, "")}/ref/${code}`;
}
