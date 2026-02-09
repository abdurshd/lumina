import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase/admin';

/** Standard API error response shape */
export interface ApiErrorResponse {
  error: string;
  code: string;
  details?: string;
}

/** Error codes for client-side handling */
export const ErrorCode = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  BAD_REQUEST: 'BAD_REQUEST',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  GEMINI_ERROR: 'GEMINI_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',
  TIMEOUT: 'TIMEOUT',
} as const;

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];

/** Verify Firebase ID token from Authorization header */
export async function verifyAuth(req: NextRequest): Promise<{ uid: string } | null> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  try {
    const token = authHeader.split('Bearer ')[1];
    const decoded = await getAdminAuth().verifyIdToken(token);
    return { uid: decoded.uid };
  } catch (err) {
    console.error('[verifyAuth] Token verification failed:', err instanceof Error ? err.message : err);
    return null;
  }
}

/** Create a typed error response */
export function errorResponse(
  message: string,
  code: ErrorCodeType,
  status: number,
  details?: string
): NextResponse<ApiErrorResponse> {
  return NextResponse.json({ error: message, code, details }, { status });
}

/** Wrapper for Gemini API calls with timeout and error handling */
export async function callGemini<T>(
  fn: () => Promise<T>,
  timeoutMs: number = 60000
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const result = await fn();
    return result;
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new GeminiError('Request timed out', 'TIMEOUT');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

/** Typed error for Gemini API failures */
export class GeminiError extends Error {
  code: string;
  constructor(message: string, code: string = 'GEMINI_ERROR') {
    super(message);
    this.name = 'GeminiError';
    this.code = code;
  }
}

/** Safely parse JSON from Gemini response, handling markdown-wrapped JSON */
export function safeParseJson(text: string): unknown {
  let cleaned = text.trim();
  // Strip markdown code fences if present
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    throw new GeminiError(
      'Failed to parse AI response as JSON. The model returned invalid JSON.',
      'PARSE_ERROR'
    );
  }
}
