import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, errorResponse, ErrorCode } from '@/lib/api-helpers';
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

    await deleteUserCorpus(profile.corpusName, authResult.uid);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Corpus Delete Error]', message);
    return errorResponse('Failed to delete corpus', ErrorCode.INTERNAL_ERROR, 500);
  }
}
