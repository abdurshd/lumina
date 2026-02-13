export const NOTION_OAUTH_MESSAGE_TYPE = 'lumina:notion-oauth';
export const NOTION_OAUTH_STATE_KEY = 'lumina:notion-oauth-state';

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
