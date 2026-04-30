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
 * Per-request CSP with nonces for HTML routes. In production, only scripts
 * carrying the freshly-minted nonce — plus anything the nonced framework
 * loader trusts via `'strict-dynamic'` — execute. In dev, we keep
 * `'unsafe-inline' 'unsafe-eval'` so Turbopack HMR keeps working.
 *
 * Style nonces are deliberately *not* enforced (`'unsafe-inline'` stays in
 * `style-src`). Framer Motion, Tailwind dynamic atomics, and Radix UI write
 * inline styles at runtime; nonce-gating them is high breakage risk for low
 * XSS-coverage gain. Revisit when we move to a CSS-only animation primitive.
 */

function generateNonce(): string {
  const buf = new Uint8Array(16);
  crypto.getRandomValues(buf);
  let binary = '';
  for (const byte of buf) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function buildCsp(nonce: string, isDev: boolean): string {
  const scriptSrc = isDev
    ? [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        'blob:',
        'https://apis.google.com',
      ].join(' ')
    : [
        "'self'",
        `'nonce-${nonce}'`,
        "'strict-dynamic'",
        "'unsafe-eval'",
        'blob:',
        'https://apis.google.com',
      ].join(' ');

  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self'",
    "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.firebaseapp.com https://firestore.googleapis.com https://generativelanguage.googleapis.com wss://generativelanguage.googleapis.com https://api.notion.com wss://*.firebaseio.com",
    "frame-src 'self' https://accounts.google.com https://*.firebaseapp.com https://*.web.app",
    "media-src 'self' blob:",
    "worker-src 'self' blob:",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join('; ');
}

function applyCsp(req: NextRequest): NextResponse {
  const nonce = generateNonce();
  const isDev = process.env.NODE_ENV !== 'production';
  const csp = buildCsp(nonce, isDev);

  // Forward the nonce on the request so server components can read it via
  // `headers().get('x-nonce')` and Next.js auto-applies the nonce attribute
  // to its framework script tags.
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
