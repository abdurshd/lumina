import { getUserProfile } from '@/lib/firebase/firestore';
import type { IngestionSource } from '@/lib/data/ingestion';

export async function hasSourceConsent(uid: string, source: IngestionSource): Promise<boolean> {
  const profile = await getUserProfile(uid);
  if (!profile?.consentGiven) return false;
  const consentSources = profile.consentSources ?? [];
  return consentSources.includes(source);
}
