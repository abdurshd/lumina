import { NextRequest, NextResponse } from "next/server";
import { verifyAuth, errorResponse, ErrorCode } from "@/lib/api-helpers";
import { getAdminDb } from "@/lib/firebase/admin";
import {
  generateReferralCode,
  buildReferralShareUrl,
  type ReferralCodeDoc,
  type ReferralStats,
} from "@/lib/referrals";

const USER_COLLECTION = "users";
const REFERRAL_CODE_COLLECTION = "referralCodes";

const PUBLIC_ORIGIN =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://lumina.app";

/**
 * GET — return the caller's referral code + counters. Issues a fresh code on
 * the first call (transactionally, so two parallel calls cannot land on the
 * same user with two codes).
 */
export async function GET(req: NextRequest) {
  const authResult = await verifyAuth(req);
  if (!authResult) {
    return errorResponse(
      "Authentication required",
      ErrorCode.UNAUTHORIZED,
      401
    );
  }

  const { uid } = authResult;
  const db = getAdminDb();

  try {
    const code = await ensureReferralCode(uid);
    const codeRef = db.collection(REFERRAL_CODE_COLLECTION).doc(code);
    const codeSnap = await codeRef.get();
    const data = codeSnap.exists
      ? (codeSnap.data() as ReferralCodeDoc)
      : { totalClicks: 0, totalSignups: 0, totalQualified: 0 };

    const origin =
      req.headers.get("origin") ?? req.nextUrl.origin ?? PUBLIC_ORIGIN;

    const stats: ReferralStats = {
      code,
      totalClicks: data.totalClicks,
      totalSignups: data.totalSignups,
      totalQualified: data.totalQualified,
      shareUrl: buildReferralShareUrl(origin, code),
    };

    return NextResponse.json(stats);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[referrals] GET failed:", message);
    return errorResponse(
      "Failed to load referral stats.",
      ErrorCode.INTERNAL_ERROR,
      500
    );
  }
}

/**
 * Idempotently produce a referral code for the given user. If one exists, it
 * is returned. Otherwise a fresh code is allocated under a transaction —
 * collisions are vanishingly rare at our entropy but the transaction guards
 * the rare case anyway.
 */
async function ensureReferralCode(uid: string): Promise<string> {
  const db = getAdminDb();
  const userRef = db.collection(USER_COLLECTION).doc(uid);

  return await db.runTransaction(async (tx) => {
    const userSnap = await tx.get(userRef);
    const userData = (userSnap.data() ?? {}) as { referralCode?: string };
    if (typeof userData.referralCode === "string" && userData.referralCode) {
      return userData.referralCode;
    }

    // Allocate a fresh, unused code.
    let candidate: string | null = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      const next = generateReferralCode();
      const codeRef = db.collection(REFERRAL_CODE_COLLECTION).doc(next);
      const existing = await tx.get(codeRef);
      if (!existing.exists) {
        candidate = next;
        break;
      }
    }
    if (!candidate) {
      throw new Error("Failed to allocate unique referral code after 5 attempts");
    }

    const codeRef = db.collection(REFERRAL_CODE_COLLECTION).doc(candidate);
    const codeDoc: ReferralCodeDoc = {
      uid,
      createdAt: Date.now(),
      totalClicks: 0,
      totalSignups: 0,
      totalQualified: 0,
    };

    tx.set(codeRef, codeDoc);
    tx.set(userRef, { referralCode: candidate }, { merge: true });

    return candidate;
  });
}
