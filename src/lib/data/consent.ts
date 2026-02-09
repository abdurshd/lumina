import { getUserProfile, updateUserProfile } from '@/lib/firebase/firestore';
import type { IngestionSource } from '@/lib/data/ingestion';

export async function hasSourceConsent(uid: string, source: IngestionSource): Promise<boolean> {
  const profile = await getUserProfile(uid);
  if (!profile?.consentGiven) return false;

  // Backward compatibility:
  // Older users may have consentGiven=true with no per-source selections stored.
  // Treat this as broad consent unless they are explicitly on source-scoped consent v2+.
  const consentSources = profile.consentSources;
  if (!Array.isArray(consentSources)) return true;
  if (consentSources.length === 0) {
    return (profile.consentVersion ?? 1) < 2;
  }

  return consentSources.includes(source);
}

/**
 * Ensure the source is consented for this user.
 * Used when the user explicitly initiates a source connection/upload action.
 */
export async function ensureSourceConsent(uid: string, source: IngestionSource): Promise<boolean> {
  const profile = await getUserProfile(uid);
  if (!profile?.consentGiven) return false;

  const existing = profile.consentSources;

  // Legacy broad consent (no explicit source list stored)
  if (!Array.isArray(existing)) return true;

  if (existing.includes(source)) return true;

  await updateUserProfile(uid, {
    consentSources: [...existing, source],
  });
  return true;
}
