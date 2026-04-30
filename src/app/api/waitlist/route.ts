import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { errorResponse, ErrorCode } from "@/lib/api-helpers";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { getAdminDb } from "@/lib/firebase/admin";

const WAITLIST_COLLECTION = "waitlist";
const COUNTER_COLLECTION = "waitlist_meta";
const COUNTER_DOC = "counter";
const MAX_SOURCE_LENGTH = 64;

const WaitlistRequestSchema = z.object({
  email: z.string().email().max(254),
  source: z.string().max(MAX_SOURCE_LENGTH).optional(),
});

interface WaitlistEntry {
  email: string;
  position: number;
  source: string | null;
  createdAt: number;
  ipHash: string | null;
  userAgent: string | null;
}

interface CounterDoc {
  total: number;
  updatedAt: number;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function getRequestIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

async function hashIp(ip: string): Promise<string> {
  if (ip === "unknown") return "unknown";
  const data = new TextEncoder().encode(ip);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .slice(0, 8)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function POST(req: NextRequest) {
  const ip = getRequestIp(req);
  const rate = checkRateLimit(`waitlist:${ip}`, RATE_LIMITS.auth);
  if (!rate.allowed) {
    return errorResponse(
      "Too many waitlist requests. Try again shortly.",
      ErrorCode.RATE_LIMITED,
      429
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse(
      "Invalid JSON body.",
      ErrorCode.BAD_REQUEST,
      400
    );
  }

  const parsed = WaitlistRequestSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(
      "Invalid email.",
      ErrorCode.VALIDATION_ERROR,
      400,
      parsed.error.issues.map((i) => i.message).join("; ")
    );
  }

  const email = normalizeEmail(parsed.data.email);
  const source = parsed.data.source?.slice(0, MAX_SOURCE_LENGTH) ?? null;

  try {
    const db = getAdminDb();
    const entryRef = db.collection(WAITLIST_COLLECTION).doc(email);
    const counterRef = db.collection(COUNTER_COLLECTION).doc(COUNTER_DOC);
    const ipHash = await hashIp(ip);
    const userAgent = req.headers.get("user-agent")?.slice(0, 256) ?? null;

    const result = await db.runTransaction(async (tx) => {
      const existing = await tx.get(entryRef);
      if (existing.exists) {
        const data = existing.data() as WaitlistEntry;
        return {
          alreadyOnList: true,
          position: data.position,
          totalSignups: 0,
        };
      }

      const counterSnap = await tx.get(counterRef);
      const currentTotal =
        (counterSnap.exists ? (counterSnap.data() as CounterDoc).total : 0) ?? 0;
      const newPosition = currentTotal + 1;

      const entry: WaitlistEntry = {
        email,
        position: newPosition,
        source,
        createdAt: Date.now(),
        ipHash,
        userAgent,
      };

      tx.set(entryRef, entry);
      tx.set(
        counterRef,
        { total: newPosition, updatedAt: Date.now() } satisfies CounterDoc,
        { merge: true }
      );

      return {
        alreadyOnList: false,
        position: newPosition,
        totalSignups: newPosition,
      };
    });

    return NextResponse.json({
      ok: true,
      alreadyOnList: result.alreadyOnList,
      position: result.position,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[waitlist] Failed to record signup:", message);
    return errorResponse(
      "Failed to record waitlist signup.",
      ErrorCode.INTERNAL_ERROR,
      500
    );
  }
}

export async function GET() {
  try {
    const db = getAdminDb();
    const counterSnap = await db
      .collection(COUNTER_COLLECTION)
      .doc(COUNTER_DOC)
      .get();
    const total = counterSnap.exists
      ? (counterSnap.data() as CounterDoc).total ?? 0
      : 0;
    return NextResponse.json({ total });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[waitlist] Failed to read counter:", message);
    return errorResponse(
      "Failed to read waitlist count.",
      ErrorCode.INTERNAL_ERROR,
      500
    );
  }
}
