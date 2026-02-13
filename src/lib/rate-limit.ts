/**
 * In-memory rate limiter for API routes.
 * Uses a sliding window counter per identifier (IP or user ID).
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

interface RateLimitConfig {
  /** Max requests allowed in the window */
  limit: number;
  /** Window duration in seconds */
  windowSeconds: number;
}

interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const key = identifier;
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, {
      count: 1,
      resetAt: now + config.windowSeconds * 1000,
    });
    return {
      allowed: true,
      limit: config.limit,
      remaining: config.limit - 1,
      resetAt: now + config.windowSeconds * 1000,
    };
  }

  entry.count += 1;

  if (entry.count > config.limit) {
    return {
      allowed: false,
      limit: config.limit,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  return {
    allowed: true,
    limit: config.limit,
    remaining: config.limit - entry.count,
    resetAt: entry.resetAt,
  };
}

/** Presets for different route sensitivity levels */
export const RATE_LIMITS = {
  /** General API: 100 requests per minute */
  general: { limit: 100, windowSeconds: 60 },
  /** Auth endpoints: 20 requests per minute */
  auth: { limit: 20, windowSeconds: 60 },
  /** Sensitive operations (delete, export, BYOK): 10 requests per minute */
  sensitive: { limit: 10, windowSeconds: 60 },
  /** AI generation (reports, analysis): 15 requests per minute */
  generation: { limit: 15, windowSeconds: 60 },
  /** Ephemeral token minting: 10 requests per minute */
  token: { limit: 10, windowSeconds: 60 },
} as const;
