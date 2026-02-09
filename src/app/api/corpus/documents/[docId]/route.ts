import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, errorResponse, ErrorCode } from '@/lib/api-helpers';
import { getUserProfile, getCorpusDocuments } from '@/lib/firebase/firestore';
import { removeDocumentFromCorpus } from '@/lib/gemini/file-search';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ docId: string }> }
) {
  const authResult = await verifyAuth(req);
  if (!authResult) {
    return errorResponse('Authentication required', ErrorCode.UNAUTHORIZED, 401);
  }

  const { docId } = await params;
  if (!docId) {
    return errorResponse('Document ID is required', ErrorCode.VALIDATION_ERROR, 400);
  }

  try {
    const profile = await getUserProfile(authResult.uid);
    if (!profile?.corpusName) {
      return errorResponse('No corpus found for user', ErrorCode.BAD_REQUEST, 400);
    }

    // Find the document in Firestore to get its Gemini file name
    const documents = await getCorpusDocuments(authResult.uid);
    const targetDoc = documents.find((d) => d.id === docId);
    if (!targetDoc) {
      return errorResponse('Document not found', ErrorCode.BAD_REQUEST, 404);
    }

    await removeDocumentFromCorpus(
      profile.corpusName,
      targetDoc.documentName,
      authResult.uid,
      docId
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Corpus Delete Document Error]', message);
    return errorResponse('Failed to delete document', ErrorCode.INTERNAL_ERROR, 500);
  }
}
