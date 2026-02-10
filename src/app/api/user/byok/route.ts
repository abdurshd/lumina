import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAuth, errorResponse, ErrorCode } from '@/lib/api-helpers';
import { updateUserProfile, getUserProfile } from '@/lib/firebase/firestore';
import {
  clearUserByokSecret,
  getUsageSnapshot,
  isByokEnforcedForDeployment,
  setUserByokSecret,
} from '@/lib/gemini/byok';

const DEFAULT_BUDGET_USD = 25;
const GEMINI_API_KEY_MIN_LENGTH = 20;
const PLATFORM_OVERRIDE_CODE = (process.env.BYOK_PLATFORM_OVERRIDE_CODE ?? 'OyoKApQFP').trim();

const UpdateSchema = z.object({
  enabled: z.boolean().optional(),
  apiKey: z.string().trim().min(1).optional(),
  clearKey: z.boolean().optional(),
  monthlyBudgetUsd: z.number().min(1).max(2000).optional(),
  hardStop: z.boolean().optional(),
});

async function getByokResponse(uid: string) {
  const [profile, usage] = await Promise.all([getUserProfile(uid), getUsageSnapshot(uid)]);
  const monthlyBudgetUsd = profile?.byokMonthlyBudgetUsd ?? DEFAULT_BUDGET_USD;
  const estimatedSpend = usage.estimatedSpendUsd ?? 0;
  const platformOverrideEnabled = (profile?.byokPlatformAccess ?? false) && (profile?.byokEnabled ?? false);

  return {
    enabled: profile?.byokEnabled ?? false,
    keyLast4: profile?.byokKeyLast4?.trim() || null,
    platformOverrideEnabled,
    monthlyBudgetUsd,
    hardStop: profile?.byokHardStop ?? false,
    estimatedMonthlySpendUsd: estimatedSpend,
    budgetExceeded: estimatedSpend >= monthlyBudgetUsd,
    byokRequired: isByokEnforcedForDeployment(),
    usage,
  };
}

export async function GET(req: NextRequest) {
  const authResult = await verifyAuth(req);
  if (!authResult) {
    return errorResponse('Authentication required', ErrorCode.UNAUTHORIZED, 401);
  }

  try {
    return NextResponse.json(await getByokResponse(authResult.uid));
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
    const normalizedApiKey = apiKey?.trim();
    const currentProfile = await getUserProfile(authResult.uid);
    const hasExistingServerCredential = Boolean(currentProfile?.byokKeyLast4?.trim()) || Boolean(currentProfile?.byokPlatformAccess);

    if (clearKey && normalizedApiKey) {
      return errorResponse(
        'Provide either apiKey or clearKey, not both.',
        ErrorCode.VALIDATION_ERROR,
        400,
      );
    }

    if (clearKey && enabled === true && !normalizedApiKey) {
      return errorResponse(
        'Cannot clear key and enable BYOK in the same request without a new apiKey.',
        ErrorCode.VALIDATION_ERROR,
        400,
      );
    }

    if (enabled === true && !normalizedApiKey && !hasExistingServerCredential && !clearKey) {
      return errorResponse(
        'Enable BYOK requires a saved Gemini API key or platform access code.',
        ErrorCode.VALIDATION_ERROR,
        400,
      );
    }

    if (normalizedApiKey) {
      if (normalizedApiKey === PLATFORM_OVERRIDE_CODE) {
        await clearUserByokSecret(authResult.uid);
        updates.byokKeyLast4 = '';
        updates.byokEnabled = true;
        updates.byokPlatformAccess = true;
      } else {
        if (normalizedApiKey.length < GEMINI_API_KEY_MIN_LENGTH) {
          return errorResponse(
            `Gemini API key must be at least ${GEMINI_API_KEY_MIN_LENGTH} characters.`,
            ErrorCode.VALIDATION_ERROR,
            400,
          );
        }
        const keyInfo = await setUserByokSecret(authResult.uid, normalizedApiKey);
        updates.byokKeyLast4 = keyInfo.last4;
        updates.byokEnabled = true;
        updates.byokPlatformAccess = false;
      }
    }

    if (clearKey) {
      await clearUserByokSecret(authResult.uid);
      updates.byokKeyLast4 = '';
      updates.byokEnabled = false;
      updates.byokPlatformAccess = false;
    }

    if (enabled !== undefined) {
      updates.byokEnabled = enabled;
      if (!enabled) {
        updates.byokPlatformAccess = false;
      }
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
    return NextResponse.json({
      success: true,
      ...(await getByokResponse(authResult.uid)),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[BYOK POST Error]', message);
    return errorResponse('Failed to update BYOK settings', ErrorCode.INTERNAL_ERROR, 500);
  }
}
