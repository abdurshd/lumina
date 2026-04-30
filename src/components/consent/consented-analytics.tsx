"use client";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { useConsent } from "@/lib/consent";

/**
 * Mounts Vercel Analytics + Speed Insights only when the user has explicitly
 * accepted analytics. Replaces the unconditional mount in the root layout.
 */
export function ConsentedAnalytics() {
  const { consent } = useConsent();
  if (consent.status !== "accepted") return null;

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
