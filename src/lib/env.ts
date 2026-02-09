/** Validate required environment variables at import time */

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
      `Check your .env.local file.`
    );
  }
  return value;
}

/** Server-only env vars — import only in API routes / server components */
export const serverEnv = {
  get GEMINI_API_KEY() { return requireEnv('GEMINI_API_KEY'); },
  get FIREBASE_ADMIN_PROJECT_ID() { return requireEnv('FIREBASE_ADMIN_PROJECT_ID'); },
  get FIREBASE_ADMIN_CLIENT_EMAIL() { return requireEnv('FIREBASE_ADMIN_CLIENT_EMAIL'); },
  get FIREBASE_ADMIN_PRIVATE_KEY() { return requireEnv('FIREBASE_ADMIN_PRIVATE_KEY'); },
  get NOTION_CLIENT_ID() { return process.env.NOTION_CLIENT_ID ?? ''; },
  get NOTION_CLIENT_SECRET() { return process.env.NOTION_CLIENT_SECRET ?? ''; },
};
