"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics/track-event";

/**
 * Fires `report_share_view` once per page mount on the public share page.
 * Lives as a tiny client component so the surrounding page can stay a
 * server component (better for SEO and time-to-first-byte).
 */
export function ShareViewTracker() {
  useEffect(() => {
    trackEvent({
      name: "report_share_view",
      payload: { visibility: "public_anonymous", has_account: false },
    });
  }, []);

  return null;
}
