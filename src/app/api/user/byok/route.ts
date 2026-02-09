import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAuth, errorResponse, ErrorCode } from '@/lib/api-helpers';
import { updateUserProfile, getUserProfile } from '@/lib/firebase/firestore';
import { clearUserByokSecret, getUsageSnapshot, setUserByokSecret } from '@/lib/gemini/byok';

const UpdateSchema = z.object({
  enabled: z.boolean().optional(),
  apiKey: z.string().min(20).optional(),
  clearKey: z.boolean().optional(),
  monthlyBudgetUsd: z.number().min(1).max(2000).optional(),
  hardStop: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  const authResult = await verifyAuth(req);
  if (!authResult) {
    return errorResponse('Authentication required', ErrorCode.UNAUTHORIZED, 401);
  }

  try {
    const [profile, usage] = await Promise.all([
      getUserProfile(authResult.uid),
      getUsageSnapshot(authResult.uid),
    ]);

    const monthlyBudgetUsd = profile?.byokMonthlyBudgetUsd ?? 25;
    const estimatedSpend = usage.estimatedSpendUsd ?? 0;

    return NextResponse.json({
      enabled: profile?.byokEnabled ?? false,
      keyLast4: profile?.byokKeyLast4 ?? null,
      monthlyBudgetUsd,
      hardStop: profile?.byokHardStop ?? false,
      estimatedMonthlySpendUsd: estimatedSpend,
      budgetExceeded: estimatedSpend >= monthlyBudgetUsd,
      usage,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[BYOK GET Error]', message);
    return errorResponse('Failed to load BYOK settings', ErrorCode.INTERNAL_ERROR, 500);
  }
}

export async function POST(req: NextRequest) {
  const authResult = await verifyAuth(req);
  if (!authResult) {
    return errorResponse('Authentication required', ErrorCode.UNAUTHORIZED, 401);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse('Invalid request body', ErrorCode.BAD_REQUEST, 400);
  }

  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(
      parsed.error.issues[0]?.message ?? 'Invalid request data',
      ErrorCode.VALIDATION_ERROR,
      400,
    );
  }

  try {
    const updates: Parameters<typeof updateUserProfile>[1] = {};
    const { enabled, apiKey, clearKey, monthlyBudgetUsd, hardStop } = parsed.data;

    if (apiKey) {
      const keyInfo = await setUserByokSecret(authResult.uid, apiKey);
      updates.byokKeyLast4 = keyInfo.last4;
      updates.byokEnabled = true;
    }

    if (clearKey) {
      await clearUserByokSecret(authResult.uid);
      updates.byokKeyLast4 = '';
      updates.byokEnabled = false;
    }

    if (enabled !== undefined) {
      updates.byokEnabled = enabled;
    }
    if (monthlyBudgetUsd !== undefined) {
      updates.byokMonthlyBudgetUsd = monthlyBudgetUsd;
    }
    if (hardStop !== undefined) {
      updates.byokHardStop = hardStop;
    }

    if (Object.keys(updates).length === 0) {
      return errorResponse('No updates provided', ErrorCode.VALIDATION_ERROR, 400);
    }

    await updateUserProfile(authResult.uid, updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[BYOK POST Error]', message);
    return errorResponse('Failed to update BYOK settings', ErrorCode.INTERNAL_ERROR, 500);
  }
}
