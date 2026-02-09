import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, errorResponse, ErrorCode } from '@/lib/api-helpers';
import { fetchNotionData } from '@/lib/data/notion';

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
    return errorResponse('Missing or invalid Notion access token', ErrorCode.VALIDATION_ERROR, 400);
  }

  try {
    const data = await fetchNotionData(accessToken);
    const tokenCount = Math.round(data.length / 4);
    return NextResponse.json({ data, tokenCount });
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
