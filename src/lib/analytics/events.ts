import type { AnalyticsEventType } from '@/types';

export function createEvent(
  type: AnalyticsEventType,
  metadata?: Record<string, string | number | boolean>
): { type: AnalyticsEventType; timestamp: number; metadata?: Record<string, string | number | boolean> } {
  return { type, timestamp: Date.now(), metadata };
}
