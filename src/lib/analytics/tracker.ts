import { trackEvent as firestoreTrackEvent } from '@/lib/firebase/firestore';
import type { AnalyticsEvent } from '@/types';

export async function trackAnalyticsEvent(uid: string, event: AnalyticsEvent): Promise<void> {
  try {
    await firestoreTrackEvent(uid, event);
  } catch (error) {
    // Silently fail — analytics should never break the app
    console.error('[Analytics] Failed to track event:', error);
  }
}
