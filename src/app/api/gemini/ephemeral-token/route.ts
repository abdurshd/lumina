import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, errorResponse, ErrorCode } from '@/lib/api-helpers';
import { GoogleGenAI } from '@google/genai';
import { GEMINI_MODELS, toLiveApiModelName } from '@/lib/gemini/models';
import { getAdminDb } from '@/lib/firebase/admin';
import { resolveGeminiKeyForUser } from '@/lib/gemini/byok';

export async function POST(req: NextRequest) {
  const authResult = await verifyAuth(req);
  if (!authResult) {
    return errorResponse('Authentication required', ErrorCode.UNAUTHORIZED, 401);
  }

  const platformApiKey = process.env.GEMINI_API_KEY;
  if (!platformApiKey) {
    return errorResponse(
      'Gemini API key not configured',
      ErrorCode.INTERNAL_ERROR,
      500,
      'The server is missing the GEMINI_API_KEY environment variable.'
    );
  }

  try {
    const profileSnap = await getAdminDb().collection('users').doc(authResult.uid).get();
    const profile = profileSnap.data() as
      | { consentGiven?: boolean; ageGateConfirmed?: boolean; videoBehaviorConsent?: boolean }
      | undefined;

    if (!profile?.consentGiven || !profile?.ageGateConfirmed || !profile?.videoBehaviorConsent) {
      return errorResponse(
        'Live session consent is incomplete. Please complete onboarding first.',
        ErrorCode.FORBIDDEN,
        403
      );
    }

    const resolvedKey = await resolveGeminiKeyForUser({
      uid: authResult.uid,
      model: GEMINI_MODELS.LIVE,
      fallbackApiKey: platformApiKey,
    });

    const ai = new GoogleGenAI({
      apiKey: resolvedKey.apiKey,
      httpOptions: { apiVersion: 'v1alpha' },
    });
    const liveModel = toLiveApiModelName(GEMINI_MODELS.LIVE);

    const now = Date.now();
    const expireTime = new Date(now + 30 * 60 * 1000).toISOString();
    const newSessionExpireTime = new Date(now + 25 * 60 * 1000).toISOString();
    const uses = 20;

    const token = await ai.authTokens.create({
      config: {
        expireTime,
        newSessionExpireTime,
        uses,
        liveConnectConstraints: {
          model: liveModel,
        },
      },
    });

    if (!token.name) {
      return errorResponse('Failed to mint ephemeral token', ErrorCode.GEMINI_ERROR, 502);
    }

    return NextResponse.json({
      token: token.name,
      apiVersion: 'v1alpha',
      model: liveModel,
      expireTime,
      newSessionExpireTime,
      uses,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('budget exceeded')) {
      return errorResponse(
        'Monthly Gemini budget exceeded. Update your BYOK settings or wait for next billing cycle.',
        ErrorCode.RATE_LIMITED,
        429
      );
    }
    console.error('[Ephemeral Token Error]', message);
    return errorResponse(
      'Failed to mint ephemeral token',
      ErrorCode.GEMINI_ERROR,
      502,
      message
    );
  }
}
