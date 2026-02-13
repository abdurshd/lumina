import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  );
}

function getRateLimitConfig(pathname: string) {
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

  // AI generation endpoints
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

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only rate-limit API routes
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const ip = getClientIp(req);
  const config = getRateLimitConfig(pathname);
  const key = `${ip}:${pathname}`;
  const result = checkRateLimit(key, config);

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
  matcher: '/api/:path*',
};
