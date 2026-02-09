import { GoogleGenAI } from '@google/genai';
import type { GeminiModelId } from '@/lib/gemini/models';
import { resolveGeminiKeyForUser, type GeminiKeySource, type ByokStatus } from '@/lib/gemini/byok';

export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set');
  return new GoogleGenAI({ apiKey });
}

export async function getGeminiClientForUser(params: {
  uid?: string;
  model: GeminiModelId;
}): Promise<{
  client: GoogleGenAI;
  keySource: GeminiKeySource;
  byokStatus: ByokStatus;
}> {
  const platformKey = process.env.GEMINI_API_KEY;
  if (!platformKey) throw new Error('GEMINI_API_KEY is not set');

  const resolved = await resolveGeminiKeyForUser({
    uid: params.uid,
    model: params.model,
    fallbackApiKey: platformKey,
  });

  return {
    client: new GoogleGenAI({ apiKey: resolved.apiKey }),
    keySource: resolved.keySource,
    byokStatus: resolved.status,
  };
}
