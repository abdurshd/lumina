import { NextRequest, NextResponse } from "next/server";
import { verifyAuth, errorResponse, ErrorCode } from "@/lib/api-helpers";
import { updateUserProfile } from "@/lib/firebase/firestore";
import { z } from "zod";

const RequestSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  consentSources: z.array(z.string()).optional(),
  ageGateConfirmed: z.boolean().optional(),
  videoBehaviorConsent: z.boolean().optional(),
  dataRetentionMode: z.enum(['session_only', 'persistent']).optional(),
  byokEnabled: z.boolean().optional(),
  byokKeyLast4: z.string().max(8).optional(),
  byokMonthlyBudgetUsd: z.number().min(1).max(2000).optional(),
  byokHardStop: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  const authResult = await verifyAuth(req);
  if (!authResult) {
    return errorResponse("Authentication required", ErrorCode.UNAUTHORIZED, 401);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse("Invalid request body", ErrorCode.BAD_REQUEST, 400);
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(
      parsed.error.issues[0]?.message ?? "Invalid request data",
      ErrorCode.VALIDATION_ERROR,
      400,
    );
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.displayName !== undefined) {
    updates.displayName = parsed.data.displayName;
  }
  if (parsed.data.consentSources !== undefined) {
    updates.consentSources = parsed.data.consentSources;
  }
  if (parsed.data.ageGateConfirmed !== undefined) {
    updates.ageGateConfirmed = parsed.data.ageGateConfirmed;
  }
  if (parsed.data.videoBehaviorConsent !== undefined) {
    updates.videoBehaviorConsent = parsed.data.videoBehaviorConsent;
  }
  if (parsed.data.dataRetentionMode !== undefined) {
    updates.dataRetentionMode = parsed.data.dataRetentionMode;
  }
  if (parsed.data.byokEnabled !== undefined) {
    updates.byokEnabled = parsed.data.byokEnabled;
  }
  if (parsed.data.byokKeyLast4 !== undefined) {
    updates.byokKeyLast4 = parsed.data.byokKeyLast4;
  }
  if (parsed.data.byokMonthlyBudgetUsd !== undefined) {
    updates.byokMonthlyBudgetUsd = parsed.data.byokMonthlyBudgetUsd;
  }
  if (parsed.data.byokHardStop !== undefined) {
    updates.byokHardStop = parsed.data.byokHardStop;
  }

  const consentChanged =
    parsed.data.consentSources !== undefined ||
    parsed.data.ageGateConfirmed !== undefined ||
    parsed.data.videoBehaviorConsent !== undefined ||
    parsed.data.dataRetentionMode !== undefined;

  if (consentChanged) {
    updates.consentTimestamp = Date.now();
    updates.consentVersion = 2;
  }

  if (Object.keys(updates).length === 0) {
    return errorResponse("No updates provided", ErrorCode.VALIDATION_ERROR, 400);
  }

  try {
    await updateUserProfile(authResult.uid, updates as Parameters<typeof updateUserProfile>[1]);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Update Profile Error]", message);
    return errorResponse("Failed to update profile", ErrorCode.INTERNAL_ERROR, 500);
  }
}
