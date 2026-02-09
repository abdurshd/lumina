import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, errorResponse, ErrorCode } from '@/lib/api-helpers';
import { getAdminDb } from '@/lib/firebase/admin';

export async function POST(req: NextRequest) {
  const authResult = await verifyAuth(req);
  if (!authResult) {
    return errorResponse('Authentication required', ErrorCode.UNAUTHORIZED, 401);
  }

  let body: { code?: string; redirectUri?: string };
  try {
    body = await req.json();
  } catch {
    return errorResponse('Invalid request body', ErrorCode.BAD_REQUEST, 400);
  }

  const { code, redirectUri } = body;
  if (!code || typeof code !== 'string') {
    return errorResponse('Missing authorization code', ErrorCode.VALIDATION_ERROR, 400);
  }

  const clientId = process.env.NOTION_CLIENT_ID;
  const clientSecret = process.env.NOTION_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return errorResponse('Notion OAuth not configured', ErrorCode.INTERNAL_ERROR, 500);
  }

  try {
    // Exchange code for access token
    const tokenRes = await fetch('https://api.notion.com/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      console.error('[Notion OAuth Error]', err);
      return errorResponse('Failed to exchange Notion authorization code', ErrorCode.INTERNAL_ERROR, 500);
    }

    const tokenData = await tokenRes.json() as { access_token: string };
    const { access_token } = tokenData;

    // Store token in Firestore
    const db = getAdminDb();
    await db.collection('users').doc(authResult.uid).update({
      notionAccessToken: access_token,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Notion OAuth Error]', message);
    return errorResponse('Notion authentication failed', ErrorCode.INTERNAL_ERROR, 500);
  }
}
