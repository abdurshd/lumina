import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, errorResponse, ErrorCode } from '@/lib/api-helpers';
import { fetchGmailData } from '@/lib/data/gmail';

export async function POST(req: NextRequest) {
  const authResult = await verifyAuth(req);
  if (!authResult) {
    return errorResponse('Authentication required', ErrorCode.UNAUTHORIZED, 401);
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
    const data = await fetchGmailData(accessToken);
    const tokenCount = Math.round(data.length / 4);
    return NextResponse.json({ data, tokenCount });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    if (message.includes('401') || message.includes('invalid_grant')) {
      return errorResponse(
        'Google access token expired. Please sign out and sign in again.',
        ErrorCode.UNAUTHORIZED,
        401
      );
    }
    if (message.includes('403')) {
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
