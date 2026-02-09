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

    if (snapshots.length === 0) {
      return NextResponse.json({ snapshot: null });
    }

    // Return the latest snapshot (highest version number)
    const latest = snapshots.reduce((a, b) => (a.version > b.version ? a : b));
    return NextResponse.json({ snapshot: latest });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Profile Snapshot Error]', message);
    return errorResponse('Failed to fetch profile snapshot.', ErrorCode.INTERNAL_ERROR, 500);
  }
}
