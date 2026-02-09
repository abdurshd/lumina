import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, errorResponse, ErrorCode } from '@/lib/api-helpers';
import { getOrCreateUserCorpus, addDocumentToCorpus } from '@/lib/gemini/file-search';
import { z } from 'zod';

const UploadSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  title: z.string().min(1, 'Title is required'),
  source: z.string().min(1, 'Source is required'),
});

export async function POST(req: NextRequest) {
  const authResult = await verifyAuth(req);
  if (!authResult) {
    return errorResponse('Authentication required', ErrorCode.UNAUTHORIZED, 401);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse('Invalid request body', ErrorCode.BAD_REQUEST, 400);
  }

  const parsed = UploadSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(
      parsed.error.issues[0]?.message ?? 'Invalid request data',
      ErrorCode.VALIDATION_ERROR,
      400
    );
  }

  const { content, title, source } = parsed.data;

  try {
    const corpusName = await getOrCreateUserCorpus(authResult.uid);
    const document = await addDocumentToCorpus(corpusName, authResult.uid, content, {
      title,
      source,
    });

    return NextResponse.json({ success: true, documentId: document.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Corpus Upload Error]', message);
    return errorResponse('Failed to upload document', ErrorCode.INTERNAL_ERROR, 500);
  }
}
