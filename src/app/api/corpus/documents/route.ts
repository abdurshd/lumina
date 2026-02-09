import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, errorResponse, ErrorCode } from '@/lib/api-helpers';
import { listUserDocuments } from '@/lib/gemini/file-search';

export async function GET(req: NextRequest) {
  const authResult = await verifyAuth(req);
  if (!authResult) {
    return errorResponse('Authentication required', ErrorCode.UNAUTHORIZED, 401);
  }

  try {
    const documents = await listUserDocuments(authResult.uid);
    return NextResponse.json({ documents });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Corpus Documents Error]', message);
    return errorResponse('Failed to list documents', ErrorCode.INTERNAL_ERROR, 500);
  }
}
