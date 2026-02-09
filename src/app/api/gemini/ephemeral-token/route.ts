import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, errorResponse, ErrorCode } from '@/lib/api-helpers';
import { GoogleGenAI } from '@google/genai';
import { GEMINI_MODELS } from '@/lib/gemini/models';
import { getAdminDb } from '@/lib/firebase/admin';

export async function POST(req: NextRequest) {
  const authResult = await verifyAuth(req);
  if (!authResult) {
    return errorResponse('Authentication required', ErrorCode.UNAUTHORIZED, 401);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
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

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { apiVersion: 'v1alpha' },
    });

    const now = Date.now();
    const expireTime = new Date(now + 30 * 60 * 1000).toISOString();
    const newSessionExpireTime = new Date(now + 10 * 60 * 1000).toISOString();
    const uses = 5;

    const token = await ai.authTokens.create({
      config: {
        expireTime,
        newSessionExpireTime,
        uses,
        liveConnectConstraints: {
          model: GEMINI_MODELS.LIVE,
        },
      },
    });

    if (!token.name) {
      return errorResponse('Failed to mint ephemeral token', ErrorCode.GEMINI_ERROR, 502);
    }

    return NextResponse.json({
      token: token.name,
      apiVersion: 'v1alpha',
      model: GEMINI_MODELS.LIVE,
      expireTime,
      newSessionExpireTime,
      uses,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Ephemeral Token Error]', message);
    return errorResponse(
      'Failed to mint ephemeral token',
      ErrorCode.GEMINI_ERROR,
      502,
      message
    );
  }
}
