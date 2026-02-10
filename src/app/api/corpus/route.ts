import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, errorResponse, ErrorCode, getClientByokApiKey } from '@/lib/api-helpers';
import { getUserProfile } from '@/lib/firebase/firestore';
import { deleteUserCorpus } from '@/lib/gemini/file-search';

export async function DELETE(req: NextRequest) {
  const authResult = await verifyAuth(req);
  if (!authResult) {
    return errorResponse('Authentication required', ErrorCode.UNAUTHORIZED, 401);
  }

  try {
    const profile = await getUserProfile(authResult.uid);
    if (!profile?.corpusName) {
      return errorResponse('No corpus found for user', ErrorCode.BAD_REQUEST, 400);
    }

    await deleteUserCorpus(profile.corpusName, authResult.uid, getClientByokApiKey(req));

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('BYOK required')) {
      return errorResponse(message, ErrorCode.FORBIDDEN, 403);
    }
    if (message.includes('budget exceeded')) {
      return errorResponse(message, ErrorCode.RATE_LIMITED, 429);
    }
    console.error('[Corpus Delete Error]', message);
    return errorResponse('Failed to delete corpus', ErrorCode.INTERNAL_ERROR, 500);
  }
}
