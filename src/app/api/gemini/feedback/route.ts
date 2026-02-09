import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, errorResponse, ErrorCode } from '@/lib/api-helpers';
import { saveFeedback } from '@/lib/firebase/firestore';
import { z } from 'zod';
import type { UserFeedback } from '@/types';

const RequestSchema = z.object({
  itemType: z.enum(['career', 'strength']),
  itemId: z.string(),
  feedback: z.enum(['agree', 'disagree']),
  reason: z.string().optional(),
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
    const feedback: UserFeedback = {
      ...parsed.data,
      timestamp: Date.now(),
    };
    await saveFeedback(authResult.uid, feedback);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Feedback Error]', message);
    return errorResponse('Failed to save feedback', ErrorCode.INTERNAL_ERROR, 500);
  }
}
