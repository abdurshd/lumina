import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, errorResponse, ErrorCode } from '@/lib/api-helpers';
import { saveActionPlanProgress, getActionPlanProgress } from '@/lib/firebase/firestore';
import { z } from 'zod';
import type { ActionPlanProgress } from '@/types';

const RequestSchema = z.object({
  items: z.record(
    z.string(),
    z.object({
      status: z.enum(['pending', 'in_progress', 'completed']),
      completedAt: z.number().optional(),
      notes: z.string().optional(),
    })
  ),
});

export async function POST(req: NextRequest) {
  const authResult = await verifyAuth(req);
  if (!authResult) {
    return errorResponse('Authentication required', ErrorCode.UNAUTHORIZED, 401);
  }

  const { uid } = authResult;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse('Invalid request body', ErrorCode.BAD_REQUEST, 400);
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(
      parsed.error.issues[0]?.message ?? 'Invalid request data',
      ErrorCode.VALIDATION_ERROR,
      400
    );
  }

  try {
    const progress: ActionPlanProgress = {
      items: parsed.data.items,
      updatedAt: Date.now(),
    };

    await saveActionPlanProgress(uid, progress);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Action Plan Progress Error]', message);
    return errorResponse('Failed to save action plan progress.', ErrorCode.INTERNAL_ERROR, 500);
  }
}

export async function GET(req: NextRequest) {
  const authResult = await verifyAuth(req);
  if (!authResult) {
    return errorResponse('Authentication required', ErrorCode.UNAUTHORIZED, 401);
  }

  const { uid } = authResult;

  try {
    const progress = await getActionPlanProgress(uid);
    return NextResponse.json({ progress });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Action Plan Progress Error]', message);
    return errorResponse('Failed to fetch action plan progress.', ErrorCode.INTERNAL_ERROR, 500);
  }
}
