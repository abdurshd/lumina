import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, errorResponse, ErrorCode } from '@/lib/api-helpers';

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

  return NextResponse.json({ apiKey });
}
