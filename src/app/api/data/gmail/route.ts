import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, errorResponse, ErrorCode } from '@/lib/api-helpers';
import { fetchGmailData } from '@/lib/data/gmail';
import { buildIngestionResponse } from '@/lib/data/ingestion';
import { hasSourceConsent } from '@/lib/data/consent';

export async function POST(req: NextRequest) {
  const authResult = await verifyAuth(req);
  if (!authResult) {
    return errorResponse('Authentication required', ErrorCode.UNAUTHORIZED, 401);
  }

  const consented = await hasSourceConsent(authResult.uid, 'gmail');
  if (!consented) {
    return errorResponse(
      'Gmail consent not granted. Enable this source in onboarding or settings first.',
      ErrorCode.FORBIDDEN,
      403,
    );
  }

  let body: { accessToken?: string };
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
    const payload = await fetchGmailData(accessToken);
    return NextResponse.json(buildIngestionResponse('gmail', payload));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const statusCode = (error as { code?: number }).code;

    if (statusCode === 401 || message.includes('401') || message.includes('invalid_grant')) {
      return errorResponse(
        'Google access token expired. Please sign out and sign in again.',
        ErrorCode.UNAUTHORIZED,
        401
      );
    }
    if (statusCode === 403 || message.includes('403') || message.toLowerCase().includes('insufficient permission')) {
      return errorResponse(
        'Gmail access not granted. Please sign in with Gmail permissions.',
        ErrorCode.FORBIDDEN,
        403
      );
    }

    console.error('[Gmail API Error]', message);
    return errorResponse('Failed to fetch Gmail data', ErrorCode.INTERNAL_ERROR, 500, message);
  }
}
