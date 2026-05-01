import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  );
}

function getRateLimitConfig(pathname: string, method: string) {
  // Sensitive operations — strictest limits
  if (
    pathname.startsWith('/api/user/delete-data') ||
    pathname.startsWith('/api/user/export-data') ||
    pathname.startsWith('/api/user/byok')
  ) {
    return RATE_LIMITS.sensitive;
  }

  // Auth endpoints
  if (pathname.startsWith('/api/auth/')) {
    return RATE_LIMITS.auth;
  }

  // Token minting
  if (pathname.startsWith('/api/gemini/ephemeral-token')) {
    return RATE_LIMITS.token;
  }

  // Report status polling (GET) is lightweight — use general limit
  // Only POST (actual generation) needs the strict generation limit
  if (pathname.startsWith('/api/gemini/report') && method === 'GET') {
    return RATE_LIMITS.general;
  }

  // AI generation endpoints (POST only for report)
  if (
    pathname.startsWith('/api/gemini/report') ||
    pathname.startsWith('/api/gemini/regenerate-report') ||
    pathname.startsWith('/api/gemini/analyze') ||
    pathname.startsWith('/api/agent/')
  ) {
    return RATE_LIMITS.generation;
  }

  // Everything else
  return RATE_LIMITS.general;
}

// --- CSP nonce ---

/**
 * Per-request CSP for HTML routes. Uses host-allowlist + `'unsafe-inline'`
 * for `script-src` rather than nonce + `'strict-dynamic'`.
 *
 * Why not nonce/strict-dynamic: Firebase Auth's `signInWithPopup` loads
 * `apis.google.com/js/api.js` and gapi then dynamically creates inline
 * scripts (via `script.text = '...'`) inside helper iframes that inherit
 * our CSP. Those inline scripts have no nonce. With a nonce present in
 * `script-src`, modern browsers ignore `'unsafe-inline'` per CSP3 — so any
 * nonce-based policy blocks Google sign-in. `'strict-dynamic'` makes it
 * worse by also disabling the `https://apis.google.com` host allowlist.
 *
 * The trade-off: weaker XSS protection (any injected inline script runs)
 * for a working auth flow. Mitigations: strict `default-src 'self'`,
 * narrow connect/frame allowlists, `object-src 'none'`, `base-uri 'self'`,
 * `form-action 'self'`. We still forward `x-nonce` for any callers that
 * want to opt in to nonce-gating their own components.
 */

function generateNonce(): string {
  const buf = new Uint8Array(16);
  crypto.getRandomValues(buf);
  let binary = '';
  for (const byte of buf) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function buildCsp(): string {
  const googleAuthHosts = [
    'https://apis.google.com',
    'https://*.firebaseapp.com',
    'https://www.gstatic.com',
    'https://www.googleapis.com',
    'https://accounts.google.com',
  ];

  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'",
    'blob:',
    ...googleAuthHosts,
  ].join(' ');

  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self'",
    "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.firebaseapp.com https://firestore.googleapis.com https://generativelanguage.googleapis.com wss://generativelanguage.googleapis.com https://api.notion.com wss://*.firebaseio.com",
    "frame-src 'self' https://accounts.google.com https://apis.google.com https://*.firebaseapp.com https://*.web.app",
    "media-src 'self' blob:",
    "worker-src 'self' blob:",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join('; ');
}

function applyCsp(req: NextRequest): NextResponse {
  const nonce = generateNonce();
  const csp = buildCsp();

  // Forward the nonce on the request so server components can opt in via
  // `headers().get('x-nonce')`. The nonce is not in script-src today (see
  // module comment), but is kept available for future opt-in callers.
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('content-security-policy', csp);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  response.headers.set('content-security-policy', csp);
  return response;
}

// --- Proxy entry ---

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Non-API HTML routes: apply CSP nonce.
  if (!pathname.startsWith('/api/')) {
    return applyCsp(req);
  }

  // API routes: rate-limit.
  const ip = getClientIp(req);
  const limitConfig = getRateLimitConfig(pathname, req.method);
  const key = `${ip}:${pathname}`;
  const result = checkRateLimit(key, limitConfig);

  if (!result.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.', code: 'RATE_LIMITED' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((result.resetAt - Date.now()) / 1000)),
          'X-RateLimit-Limit': String(result.limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(result.resetAt),
        },
      }
    );
  }

  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', String(result.limit));
  response.headers.set('X-RateLimit-Remaining', String(result.remaining));
  response.headers.set('X-RateLimit-Reset', String(result.resetAt));
  return response;
}

export const config = {
  // Match API (rate-limited) and HTML routes (CSP-nonced); skip Next internals
  // and static assets.
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|opengraph-image|.*\\.).*)',
  ],
};
