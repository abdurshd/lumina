import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, errorResponse, ErrorCode } from '@/lib/api-helpers';
import { getAllUserData } from '@/lib/firebase/firestore';

export async function GET(req: NextRequest) {
  const authResult = await verifyAuth(req);
  if (!authResult) {
    return errorResponse('Authentication required', ErrorCode.UNAUTHORIZED, 401);
  }

  const data = await getAllUserData(authResult.uid);
  return NextResponse.json(data);
}
