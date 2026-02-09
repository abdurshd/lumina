import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, errorResponse, ErrorCode } from '@/lib/api-helpers';
import { fetchNotionData } from '@/lib/data/notion';
import { buildIngestionResponse } from '@/lib/data/ingestion';
import { ensureSourceConsent } from '@/lib/data/consent';
import { analyzeDataSource } from '@/lib/agent/data-analyzer';
import type { ConfidenceProfile } from '@/types';

export async function POST(req: NextRequest) {
  const authResult = await verifyAuth(req);
  if (!authResult) {
    return errorResponse('Authentication required', ErrorCode.UNAUTHORIZED, 401);
  }

  const consented = await ensureSourceConsent(authResult.uid, 'notion');
  if (!consented) {
    return errorResponse(
      'Notion consent not granted. Enable this source in onboarding or settings first.',
      ErrorCode.FORBIDDEN,
      403,
    );
  }

  let body: { accessToken?: string; confidenceProfile?: ConfidenceProfile };
  try {
    body = await req.json();
  } catch {
    return errorResponse('Invalid request body', ErrorCode.BAD_REQUEST, 400);
  }

  const { accessToken } = body;
  if (!accessToken || typeof accessToken !== 'string') {
    return errorResponse('Missing or invalid Notion access token', ErrorCode.VALIDATION_ERROR, 400);
  }

  try {
    const payload = await fetchNotionData(accessToken);
    const ingestion = buildIngestionResponse('notion', payload);

    let agentAnalysis = null;
    try {
      const existingProfile: ConfidenceProfile = body.confidenceProfile ?? {
        dimensions: {},
        overallConfidence: 0,
        lastUpdated: Date.now(),
      };
      agentAnalysis = await analyzeDataSource({
        uid: authResult.uid,
        source: 'notion',
        rawData: ingestion.data,
        existingProfile,
      });
    } catch (err) {
      console.error('[Notion Agent Analysis]', err instanceof Error ? err.message : err);
    }

    return NextResponse.json({ ...ingestion, agentAnalysis });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    if (message.includes('401') || message.includes('unauthorized')) {
      return errorResponse(
        'Notion access token expired. Please reconnect Notion.',
        ErrorCode.UNAUTHORIZED,
        401,
      );
    }

    console.error('[Notion API Error]', message);
    return errorResponse('Failed to fetch Notion data', ErrorCode.INTERNAL_ERROR, 500, message);
  }
}
