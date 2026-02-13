export const NOTION_OAUTH_MESSAGE_TYPE = 'lumina:notion-oauth';
export const NOTION_OAUTH_STATE_KEY = 'lumina:notion-oauth-state';
export const NOTION_OAUTH_REDIRECT_ORIGIN_KEY = 'lumina:notion-oauth-redirect-origin';
export const NOTION_CALLBACK_PATH = '/api/auth/notion/callback';

interface NotionOAuthStatePayload {
  nonce: string;
  openerOrigin: string;
  redirectUri: string;
  issuedAt: number;
}

export type NotionOAuthPopupMessage =
  | {
      type: typeof NOTION_OAUTH_MESSAGE_TYPE;
      status: 'success';
      code: string;
      state: string | null;
      redirectUri: string;
    }
  | {
      type: typeof NOTION_OAUTH_MESSAGE_TYPE;
      status: 'error';
      error: string;
      errorDescription?: string | null;
    };

export function isNotionOAuthPopupMessage(value: unknown): value is NotionOAuthPopupMessage {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<NotionOAuthPopupMessage>;
  return candidate.type === NOTION_OAUTH_MESSAGE_TYPE;
}

export function createNotionOAuthState(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `notion-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
}

function base64UrlEncode(value: string): string {
  if (typeof btoa === 'function') {
    return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }

  return Buffer.from(value, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function base64UrlDecode(value: string): string {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
  if (typeof atob === 'function') {
    return atob(`${normalized}${padding}`);
  }

  return Buffer.from(`${normalized}${padding}`, 'base64').toString('utf8');
}

export function encodeNotionOAuthState(
  openerOrigin: string,
  redirectUri: string,
): { state: string; nonce: string } {
  const parsedRedirect = new URL(redirectUri);
  if (!['http:', 'https:'].includes(parsedRedirect.protocol)) {
    throw new Error('Invalid Notion redirect URI protocol');
  }
  if (parsedRedirect.hash) {
    throw new Error('Notion redirect URI must not contain URL fragments');
  }

  const nonce = createNotionOAuthState();
  const payload: NotionOAuthStatePayload = {
    nonce,
    openerOrigin,
    redirectUri: parsedRedirect.toString(),
    issuedAt: Date.now(),
  };
  return {
    state: base64UrlEncode(JSON.stringify(payload)),
    nonce,
  };
}

export function decodeNotionOAuthState(rawState: string | null): NotionOAuthStatePayload | null {
  if (!rawState) return null;
  try {
    const decoded = base64UrlDecode(rawState);
    const parsed = JSON.parse(decoded) as Partial<NotionOAuthStatePayload>;
    if (
      !parsed ||
      typeof parsed.nonce !== 'string' ||
      typeof parsed.openerOrigin !== 'string' ||
      typeof parsed.redirectUri !== 'string' ||
      typeof parsed.issuedAt !== 'number'
    ) {
      return null;
    }

    const origin = new URL(parsed.openerOrigin);
    if (!['http:', 'https:'].includes(origin.protocol)) return null;
    const redirect = new URL(parsed.redirectUri);
    if (!['http:', 'https:'].includes(redirect.protocol)) return null;
    if (redirect.hash) return null;

    return {
      nonce: parsed.nonce,
      openerOrigin: origin.origin,
      redirectUri: redirect.toString(),
      issuedAt: parsed.issuedAt,
    };
  } catch {
    return null;
  }
}

export function resolveNotionRedirectUri(currentOrigin: string): string {
  const configured = process.env.NEXT_PUBLIC_NOTION_REDIRECT_URI?.trim();
  if (configured) {
    try {
      const parsed = new URL(configured);
      const normalizedPath = parsed.pathname.length > 1
        ? parsed.pathname.replace(/\/+$/, '')
        : parsed.pathname;
      if (
        ['http:', 'https:'].includes(parsed.protocol) &&
        normalizedPath === NOTION_CALLBACK_PATH &&
        !parsed.search &&
        !parsed.hash
      ) {
        return parsed.toString();
      }
    } catch {
      // Fall through to current origin.
    }
  }
  return `${currentOrigin}${NOTION_CALLBACK_PATH}`;
}
