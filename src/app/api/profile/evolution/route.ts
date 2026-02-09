import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, errorResponse, ErrorCode } from '@/lib/api-helpers';
import { getProfileSnapshots } from '@/lib/firebase/firestore';

export async function GET(req: NextRequest) {
  const authResult = await verifyAuth(req);
  if (!authResult) {
    return errorResponse('Authentication required', ErrorCode.UNAUTHORIZED, 401);
  }

  const { uid } = authResult;

  try {
    const snapshots = await getProfileSnapshots(uid);
    return NextResponse.json({ snapshots });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Profile Evolution Error]', message);
    return errorResponse('Failed to fetch profile evolution.', ErrorCode.INTERNAL_ERROR, 500);
  }
}
