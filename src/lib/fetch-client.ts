import { auth } from '@/lib/firebase/config';

/** Standard error shape returned from our API routes */
export interface ApiError {
  error: string;
  code: string;
  details?: string;
}

/** Custom error class for API failures with structured error info */
export class FetchError extends Error {
  status: number;
  code: string;
  constructor(message: string, status: number, code: string) {
    super(message);
    this.name = 'FetchError';
    this.status = status;
    this.code = code;
  }
}

/**
 * Authenticated fetch wrapper that:
 * 1. Attaches Firebase ID token to requests
 * 2. Parses error responses into typed FetchError
 * 3. Handles network failures with clear messages
 */
export async function apiFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const user = auth.currentUser;
  const isFormData = options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers as Record<string, string> ?? {}),
  };

  if (user) {
    try {
      const token = await user.getIdToken();
      headers['Authorization'] = `Bearer ${token}`;
    } catch {
      throw new FetchError('Authentication expired. Please sign in again.', 401, 'AUTH_EXPIRED');
    }
  }

  let response: Response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch {
    throw new FetchError(
      'Network error. Please check your connection and try again.',
      0,
      'NETWORK_ERROR'
    );
  }

  if (!response.ok) {
    let body: ApiError | null = null;
    try {
      body = await response.json();
    } catch {
      // Response isn't JSON
    }
    throw new FetchError(
      body?.error ?? `Request failed (${response.status})`,
      response.status,
      body?.code ?? 'UNKNOWN'
    );
  }

  return response.json();
}
