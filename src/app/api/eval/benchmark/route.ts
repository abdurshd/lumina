import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, errorResponse, ErrorCode } from '@/lib/api-helpers';
import { runBenchmarkSuite } from '@/lib/eval/benchmark-runner';

export async function POST(req: NextRequest) {
  const authResult = await verifyAuth(req);
  if (!authResult) {
    return errorResponse('Authentication required', ErrorCode.UNAUTHORIZED, 401);
  }

  try {
    const result = runBenchmarkSuite();
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Benchmark Error]', message);
    return errorResponse('Benchmark run failed.', ErrorCode.INTERNAL_ERROR, 500);
  }
}
