import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, errorResponse, ErrorCode } from '@/lib/api-helpers';
import { deleteAssessmentData, resetStages } from '@/lib/firebase/firestore';
import { z } from 'zod';

const RequestSchema = z.object({
  sources: z.array(z.string()).optional(),
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

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? 'Invalid request data', ErrorCode.VALIDATION_ERROR, 400);
  }

  try {
    await deleteAssessmentData(authResult.uid, parsed.data.sources);
    if (!parsed.data.sources || parsed.data.sources.length === 0) {
      await resetStages(authResult.uid);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Delete Data Error]', message);
    return errorResponse('Failed to delete data', ErrorCode.INTERNAL_ERROR, 500);
  }
}
