import { NextRequest, NextResponse } from "next/server";
import { verifyAuth, errorResponse, ErrorCode } from "@/lib/api-helpers";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { getAdminDb } from "@/lib/firebase/admin";
import { TalentReportSchema } from "@/lib/schemas/report";
import {
  generateShareSlug,
  anonymizeReport,
  buildShareUrl,
  type SharedReportDoc,
  type AnonymizedTalentReport,
} from "@/lib/share-report";

const USER_COLLECTION = "users";
const SHARED_REPORTS_COLLECTION = "sharedReports";
const TALENT_REPORT_DOC = "talentReport";
const ASSESSMENT_SUBCOLLECTION = "assessment";

const PUBLIC_ORIGIN =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://lumina.app";

interface ShareResponse {
  ok: boolean;
  slug: string;
  shareUrl: string;
  revoked: false;
  createdAt: number;
  updatedAt: number;
}

/**
 * GET — return the current share status (slug + URL, or null if not shared).
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
    const userSnap = await db.collection(USER_COLLECTION).doc(uid).get();
    const userData = (userSnap.data() ?? {}) as {
      shareReportSlug?: string;
    };

    if (!userData.shareReportSlug) {
      return NextResponse.json({ ok: true, slug: null, shareUrl: null });
    }

    const docSnap = await db
      .collection(SHARED_REPORTS_COLLECTION)
      .doc(userData.shareReportSlug)
      .get();

    if (!docSnap.exists) {
      return NextResponse.json({ ok: true, slug: null, shareUrl: null });
    }

    const data = docSnap.data() as SharedReportDoc;
    if (data.revoked) {
      return NextResponse.json({ ok: true, slug: null, shareUrl: null });
    }

    const origin = req.headers.get("origin") ?? req.nextUrl.origin ?? PUBLIC_ORIGIN;
    return NextResponse.json({
      ok: true,
      slug: data.slug,
      shareUrl: buildShareUrl(origin, data.slug),
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[share] GET failed:", message);
    return errorResponse(
      "Failed to read share status.",
      ErrorCode.INTERNAL_ERROR,
      500
    );
  }
}

/**
 * POST — create or refresh the user's share. Re-anonymizes from the latest
 * report each call. If the user already has a non-revoked share slug, that
 * same slug is reused so any links already in circulation keep working.
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
  const rate = checkRateLimit(`share:${uid}:${ip}`, RATE_LIMITS.sensitive);
  if (!rate.allowed) {
    return errorResponse("Too many requests.", ErrorCode.RATE_LIMITED, 429);
  }

  try {
    const db = getAdminDb();

    const reportSnap = await db
      .collection(USER_COLLECTION)
      .doc(uid)
      .collection(ASSESSMENT_SUBCOLLECTION)
      .doc(TALENT_REPORT_DOC)
      .get();

    if (!reportSnap.exists) {
      return errorResponse(
        "No report found. Generate one first.",
        ErrorCode.BAD_REQUEST,
        400
      );
    }

    const stored = reportSnap.data() as { report?: unknown };
    const parsed = TalentReportSchema.safeParse(stored.report);
    if (!parsed.success) {
      return errorResponse(
        "Stored report failed validation.",
        ErrorCode.INTERNAL_ERROR,
        500
      );
    }

    const anonymized: AnonymizedTalentReport = anonymizeReport(parsed.data);

    const userRef = db.collection(USER_COLLECTION).doc(uid);
    const userSnap = await userRef.get();
    const userData = (userSnap.data() ?? {}) as {
      shareReportSlug?: string;
      displayName?: string;
    };

    let slug = userData.shareReportSlug;
    let createdAt: number;

    if (slug) {
      const existingShareRef = db
        .collection(SHARED_REPORTS_COLLECTION)
        .doc(slug);
      const existingShareSnap = await existingShareRef.get();
      if (existingShareSnap.exists) {
        const existing = existingShareSnap.data() as SharedReportDoc;
        if (existing.revoked) {
          slug = undefined;
          createdAt = Date.now();
        } else {
          createdAt = existing.createdAt;
        }
      } else {
        slug = undefined;
        createdAt = Date.now();
      }
    } else {
      createdAt = Date.now();
    }

    if (!slug) {
      // Allocate a unique slug.
      let candidate: string | null = null;
      for (let attempt = 0; attempt < 5; attempt++) {
        const next = generateShareSlug();
        const taken = await db
          .collection(SHARED_REPORTS_COLLECTION)
          .doc(next)
          .get();
        if (!taken.exists) {
          candidate = next;
          break;
        }
      }
      if (!candidate) {
        throw new Error("Failed to allocate unique share slug");
      }
      slug = candidate;
    }

    const handle = userData.displayName?.split(" ")[0] ?? "Lumina user";

    const doc: SharedReportDoc = {
      slug,
      ownerUid: uid,
      createdAt,
      updatedAt: Date.now(),
      report: anonymized,
      ownerHandle: handle,
      revoked: false,
    };

    await db
      .collection(SHARED_REPORTS_COLLECTION)
      .doc(slug)
      .set(doc, { merge: true });

    await userRef.set({ shareReportSlug: slug }, { merge: true });

    const origin = req.headers.get("origin") ?? req.nextUrl.origin ?? PUBLIC_ORIGIN;
    const response: ShareResponse = {
      ok: true,
      slug,
      shareUrl: buildShareUrl(origin, slug),
      revoked: false,
      createdAt,
      updatedAt: doc.updatedAt,
    };
    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[share] POST failed:", message);
    return errorResponse(
      "Failed to publish share.",
      ErrorCode.INTERNAL_ERROR,
      500
    );
  }
}

/**
 * DELETE — revoke the current share. The slug stays reserved (so a recreate
 * gets the same URL) but the public page returns 404.
 */
export async function DELETE(req: NextRequest) {
  const authResult = await verifyAuth(req);
  if (!authResult) {
    return errorResponse(
      "Authentication required",
      ErrorCode.UNAUTHORIZED,
      401
    );
  }

  const { uid } = authResult;
  try {
    const db = getAdminDb();
    const userRef = db.collection(USER_COLLECTION).doc(uid);
    const userSnap = await userRef.get();
    const userData = (userSnap.data() ?? {}) as { shareReportSlug?: string };

    if (!userData.shareReportSlug) {
      return NextResponse.json({ ok: true, revoked: false });
    }

    await db
      .collection(SHARED_REPORTS_COLLECTION)
      .doc(userData.shareReportSlug)
      .set({ revoked: true, updatedAt: Date.now() }, { merge: true });

    return NextResponse.json({ ok: true, revoked: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[share] DELETE failed:", message);
    return errorResponse(
      "Failed to revoke share.",
      ErrorCode.INTERNAL_ERROR,
      500
    );
  }
}
