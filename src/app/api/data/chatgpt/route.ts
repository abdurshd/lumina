import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, errorResponse, ErrorCode } from '@/lib/api-helpers';
import { parseChatGPTExport } from '@/lib/data/chatgpt';
import { buildIngestionResponse } from '@/lib/data/ingestion';
import { hasSourceConsent } from '@/lib/data/consent';
import { analyzeDataSource } from '@/lib/agent/data-analyzer';
import type { ConfidenceProfile } from '@/types';

const MAX_CONTENT_LENGTH = 50 * 1024 * 1024; // 50MB

export async function POST(req: NextRequest) {
  const authResult = await verifyAuth(req);
  if (!authResult) {
    return errorResponse('Authentication required', ErrorCode.UNAUTHORIZED, 401);
  }

  const consented = await hasSourceConsent(authResult.uid, 'chatgpt');
  if (!consented) {
    return errorResponse(
      'ChatGPT export consent not granted. Enable this source in onboarding or settings first.',
      ErrorCode.FORBIDDEN,
      403,
    );
  }

  let body: { content?: string; confidenceProfile?: ConfidenceProfile };
  try {
    body = await req.json();
  } catch {
    return errorResponse('Invalid request body', ErrorCode.BAD_REQUEST, 400);
  }

  const { content } = body;
  if (!content || typeof content !== 'string') {
    return errorResponse('Missing file content', ErrorCode.VALIDATION_ERROR, 400);
  }

  if (content.length > MAX_CONTENT_LENGTH) {
    return errorResponse(
      `File too large (${Math.round(content.length / 1024 / 1024)}MB). Maximum is 50MB.`,
      ErrorCode.VALIDATION_ERROR,
      400
    );
  }

  try {
    const payload = parseChatGPTExport(content);
    const ingestion = buildIngestionResponse('chatgpt', payload);

    let agentAnalysis = null;
    try {
      const existingProfile: ConfidenceProfile = body.confidenceProfile ?? {
        dimensions: {},
        overallConfidence: 0,
        lastUpdated: Date.now(),
      };
      agentAnalysis = await analyzeDataSource({
        uid: authResult.uid,
        source: 'chatgpt',
        rawData: ingestion.data,
        existingProfile,
      });
    } catch (err) {
      console.error('[ChatGPT Agent Analysis]', err instanceof Error ? err.message : err);
    }

    return NextResponse.json({ ...ingestion, agentAnalysis });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to parse ChatGPT export';
    return errorResponse(message, ErrorCode.VALIDATION_ERROR, 400);
  }
}
