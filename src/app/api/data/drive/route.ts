import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, errorResponse, ErrorCode } from '@/lib/api-helpers';
import { fetchDriveData } from '@/lib/data/drive';
import { buildIngestionResponse } from '@/lib/data/ingestion';
import { ensureSourceConsent } from '@/lib/data/consent';
import { analyzeDataSource } from '@/lib/agent/data-analyzer';
import type { ConfidenceProfile } from '@/types';

export async function POST(req: NextRequest) {
  const authResult = await verifyAuth(req);
  if (!authResult) {
    return errorResponse('Authentication required', ErrorCode.UNAUTHORIZED, 401);
  }

  const consented = await ensureSourceConsent(authResult.uid, 'drive');
  if (!consented) {
    return errorResponse(
      'Google Drive consent not granted. Enable this source in onboarding or settings first.',
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
    return errorResponse('Missing or invalid access token', ErrorCode.VALIDATION_ERROR, 400);
  }

  try {
    const payload = await fetchDriveData(accessToken);
    const ingestion = buildIngestionResponse('drive', payload);

    let agentAnalysis = null;
    try {
      const existingProfile: ConfidenceProfile = body.confidenceProfile ?? {
        dimensions: {},
        overallConfidence: 0,
        lastUpdated: Date.now(),
      };
      agentAnalysis = await analyzeDataSource({
        uid: authResult.uid,
        source: 'drive',
        rawData: ingestion.data,
        existingProfile,
      });
    } catch (err) {
      console.error('[Drive Agent Analysis]', err instanceof Error ? err.message : err);
    }

    return NextResponse.json({ ...ingestion, agentAnalysis });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const statusCode = (error as { code?: number }).code;

    if (statusCode === 401 || message.includes('401') || message.includes('invalid_grant')) {
      return errorResponse(
        'Google access token expired. Please sign out and sign in again.',
        ErrorCode.UNAUTHORIZED,
        401,
      );
    }
    if (statusCode === 403 || message.includes('403') || message.toLowerCase().includes('insufficient permission')) {
      return errorResponse(
        'Drive access not granted. Please connect Google Drive permissions.',
        ErrorCode.FORBIDDEN,
        403,
      );
    }

    console.error('[Drive API Error]', message);
    return errorResponse('Failed to fetch Drive data', ErrorCode.INTERNAL_ERROR, 500, message);
  }
}
