import { NextRequest, NextResponse } from "next/server";
import { verifyAuth, errorResponse, ErrorCode } from "@/lib/api-helpers";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { getAdminDb } from "@/lib/firebase/admin";
import {
  REFERRAL_COOKIE_NAME,
  isValidReferralCode,
  isSelfReferral,
  type ReferralCodeDoc,
} from "@/lib/referrals";

const USER_COLLECTION = "users";
const REFERRAL_CODE_COLLECTION = "referralCodes";

/**
 * POST /api/referrals/claim
 *
 * Called once, immediately after a new user completes signup / first profile
 * write. Reads the `lumina_referral` cookie set by `/r/[code]` and atomically:
 *
 *   1. Validates the code and that it isn't the user's own code (self-ref).
 *   2. Sets `users/{uid}.referredBy` if not already set.
 *   3. Increments `referralCodes/{code}.totalSignups`.
 *
 * Idempotent: if `referredBy` is already set, the call is a no-op.
 *
 * Reward fulfillment is intentionally not done here. A separate pipeline (the
 * Polar billing webhook in G0.3) will mark a referral as `qualified` and
 * grant the credit reward — see `src/lib/pricing/tiers.ts`.
 */
export async function POST(req: NextRequest) {
  const authResult = await verifyAuth(req);
  if (!authResult) {
    return errorResponse(
      "Authentication required",
      ErrorCode.UNAUTHORIZED,
      401
    );
  }

  const { uid } = authResult;

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  const rate = checkRateLimit(`referral-claim:${ip}:${uid}`, RATE_LIMITS.sensitive);
  if (!rate.allowed) {
    return errorResponse(
      "Too many requests.",
      ErrorCode.RATE_LIMITED,
      429
    );
  }

  const cookieValue = req.cookies.get(REFERRAL_COOKIE_NAME)?.value ?? null;
  if (!cookieValue) {
    return NextResponse.json({ ok: true, claimed: false, reason: "no_cookie" });
  }

  const code = cookieValue.toUpperCase();
  if (!isValidReferralCode(code)) {
    return NextResponse.json({ ok: true, claimed: false, reason: "invalid_code" });
  }

  try {
    const db = getAdminDb();
    const userRef = db.collection(USER_COLLECTION).doc(uid);
    const codeRef = db.collection(REFERRAL_CODE_COLLECTION).doc(code);

    const result = await db.runTransaction(async (tx) => {
      const [userSnap, codeSnap] = await Promise.all([
        tx.get(userRef),
        tx.get(codeRef),
      ]);

      const userData = (userSnap.data() ?? {}) as {
        referredBy?: string;
        referralCode?: string;
      };

      // Idempotent
      if (typeof userData.referredBy === "string" && userData.referredBy) {
        return { claimed: false, reason: "already_claimed" } as const;
      }

      if (!codeSnap.exists) {
        return { claimed: false, reason: "code_not_found" } as const;
      }

      const codeData = codeSnap.data() as ReferralCodeDoc;

      if (isSelfReferral({ signupUid: uid, referrerUid: codeData.uid })) {
        return { claimed: false, reason: "self_referral" } as const;
      }

      tx.set(userRef, { referredBy: code }, { merge: true });
      tx.set(
        codeRef,
        {
          ...codeData,
          totalSignups: codeData.totalSignups + 1,
        },
        { merge: true }
      );

      return { claimed: true, reason: "ok" } as const;
    });

    const response = NextResponse.json({ ok: true, ...result });
    if (result.claimed) {
      // Clear the cookie now that it's been redeemed.
      response.cookies.set({
        name: REFERRAL_COOKIE_NAME,
        value: "",
        maxAge: 0,
        path: "/",
      });
    }
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[referrals] claim failed:", message);
    return errorResponse(
      "Failed to claim referral.",
      ErrorCode.INTERNAL_ERROR,
      500
    );
  }
}
