export const maxDuration = 120;

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, errorResponse, ErrorCode } from '@/lib/api-helpers';
import { runBiasAudit } from '@/lib/eval/bias-runner';

export async function POST(req: NextRequest) {
  const authResult = await verifyAuth(req);
  if (!authResult) {
    return errorResponse('Authentication required', ErrorCode.UNAUTHORIZED, 401);
  }

  try {
    const result = await runBiasAudit();
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Bias Audit Error]', message);
    return errorResponse('Bias audit failed.', ErrorCode.INTERNAL_ERROR, 500);
  }
}
