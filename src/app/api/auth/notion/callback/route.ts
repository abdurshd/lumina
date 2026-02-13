import { NextRequest, NextResponse } from 'next/server';
import {
  decodeNotionOAuthState,
  NOTION_OAUTH_MESSAGE_TYPE,
  type NotionOAuthPopupMessage,
} from '@/lib/notion/oauth';

function escapeJsonForInlineScript(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const decodedState = decodeNotionOAuthState(state);
  const redirectUri = decodedState?.redirectUri ?? `${req.nextUrl.origin}${req.nextUrl.pathname}`;
  const targetOrigin = decodedState?.openerOrigin ?? req.nextUrl.origin;

  const payload: NotionOAuthPopupMessage = error || !code
    ? {
        type: NOTION_OAUTH_MESSAGE_TYPE,
        status: 'error',
        error: error ?? 'missing_authorization_code',
        errorDescription: errorDescription ?? (code ? null : 'Authorization code was not returned by Notion.'),
      }
    : {
        type: NOTION_OAUTH_MESSAGE_TYPE,
        status: 'success',
        code,
        state,
        redirectUri,
      };

  const safePayload = escapeJsonForInlineScript(payload);
  const safeOrigin = escapeJsonForInlineScript(targetOrigin);

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Notion Authentication</title>
  </head>
  <body style="font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; margin: 0; padding: 24px; color: #111827;">
    <p id="status" style="margin: 0;">Completing Notion authentication...</p>
    <script>
      (function () {
        const payload = ${safePayload};
        const targetOrigin = ${safeOrigin};
        if (window.opener) {
          window.opener.postMessage(payload, targetOrigin);
          window.close();
          return;
        }
        const status = document.getElementById('status');
        if (status) {
          status.textContent = 'Authentication complete. Return to Lumina and continue.';
        }
      })();
    </script>
  </body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
