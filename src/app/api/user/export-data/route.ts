import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, errorResponse, ErrorCode } from '@/lib/api-helpers';
import { getAllUserData } from '@/lib/firebase/firestore';

const MAX_EXPORT_SIZE_BYTES = 10 * 1024 * 1024; // 10MB safety cap

export async function GET(req: NextRequest) {
  const authResult = await verifyAuth(req);
  if (!authResult) {
    return errorResponse('Authentication required', ErrorCode.UNAUTHORIZED, 401);
  }

  try {
    const data = await getAllUserData(authResult.uid);
    const payload = JSON.stringify(data);

    if (payload.length > MAX_EXPORT_SIZE_BYTES) {
      return errorResponse(
        'Export data exceeds maximum size. Please contact support.',
        ErrorCode.INTERNAL_ERROR,
        413,
      );
    }

    return new NextResponse(payload, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="lumina-export-${authResult.uid.slice(0, 8)}.json"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('[Export Data Error]', error instanceof Error ? error.message : error);
    return errorResponse('Failed to export data', ErrorCode.INTERNAL_ERROR, 500);
  }
}
