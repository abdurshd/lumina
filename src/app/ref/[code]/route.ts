import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import {
  REFERRAL_COOKIE_NAME,
  REFERRAL_COOKIE_MAX_AGE,
  isValidReferralCode,
  hashClickIdentity,
  type ReferralCodeDoc,
} from "@/lib/referrals";

export const dynamic = "force-dynamic";

const REFERRAL_CODE_COLLECTION = "referralCodes";
const CLICK_DEDUP_COLLECTION = "referralClicks";

function getRequestIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code: rawCode } = await params;
  const code = rawCode.toUpperCase();

  // Always redirect to home, even if the code is invalid — this avoids
  // leaking which codes exist.
  const homeUrl = new URL("/", req.url);
  homeUrl.searchParams.set("ref", code);
  const response = NextResponse.redirect(homeUrl, { status: 302 });

  if (!isValidReferralCode(code)) {
    return response;
  }

  // Rate-limit click recording per IP. Cookie still gets set so a real user
  // who refreshed many times is not punished — only the click counter throttles.
  const ip = getRequestIp(req);
  const rate = checkRateLimit(`referral-click:${ip}`, RATE_LIMITS.general);

  // Set attribution cookie regardless of dedup outcome.
  response.cookies.set({
    name: REFERRAL_COOKIE_NAME,
    value: code,
    maxAge: REFERRAL_COOKIE_MAX_AGE,
    path: "/",
    sameSite: "lax",
    httpOnly: false, // signup form needs to read it
    secure: process.env.NODE_ENV === "production",
  });

  if (!rate.allowed) {
    return response;
  }

  // Best-effort click recording: never block redirect on Firestore errors.
  void recordClick({ code, ip }).catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "unknown";
    console.error("[referrals] click record failed:", message);
  });

  return response;
}

async function recordClick(params: {
  code: string;
  ip: string;
}): Promise<void> {
  const { code, ip } = params;
  const db = getAdminDb();
  const codeRef = db.collection(REFERRAL_CODE_COLLECTION).doc(code);

  const codeSnap = await codeRef.get();
  if (!codeSnap.exists) return;

  const dedupKey = `${await hashClickIdentity(ip, code)}_${code}`;
  const dedupRef = db.collection(CLICK_DEDUP_COLLECTION).doc(dedupKey);

  await db.runTransaction(async (tx) => {
    const dedupSnap = await tx.get(dedupRef);
    if (dedupSnap.exists) return;

    const codeData = codeSnap.data() as ReferralCodeDoc;
    tx.set(dedupRef, { ts: Date.now(), expiresAt: Date.now() + 24 * 60 * 60 * 1000 });
    tx.set(
      codeRef,
      {
        ...codeData,
        totalClicks: codeData.totalClicks + 1,
      },
      { merge: true }
    );
  });
}
