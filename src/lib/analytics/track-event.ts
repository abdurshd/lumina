/**
 * Type-safe wrapper around `track()` from `@vercel/analytics`. Every funnel
 * event in the codebase MUST go through this module — raw `track(...)` calls
 * are not allowed. The canonical event taxonomy lives in `docs/analytics.md`.
 *
 * Hard rules (enforced by review, see `docs/analytics.md`):
 *   - No PII in payloads.
 *   - No raw imported corpus content.
 *   - Quiz answers, session transcripts, report bodies are never tracked.
 *
 * The wrapper is a no-op when `track` is missing (e.g. during SSR before the
 * Vercel script loads or in test environments) so it can be called freely
 * without try/catch from call sites.
 */

import { track } from "@vercel/analytics";

export type FunnelEvent =
  // Acquisition
  | {
      name: "landing_cta_click";
      payload: {
        cta_id:
          | "hero_primary"
          | "hero_secondary"
          | "footer"
          | "session_section"
          | "report_section"
          | "pricing_section";
      };
    }
  | { name: "waitlist_join"; payload: { source: string; position: number } }
  | { name: "pricing_view"; payload: { tiers_visible: string[] } }
  // Activation
  | { name: "signup_start"; payload: { method: "google" } }
  | {
      name: "signup_complete";
      payload: { method: "google"; age_verified: boolean };
    }
  | {
      name: "connection_added";
      payload: {
        source: "gmail" | "drive" | "notion" | "chatgpt_export" | "file_upload";
      };
    }
  | {
      name: "quiz_module_complete";
      payload: { module: string; dimensions_filled: number };
    }
  | { name: "quiz_complete"; payload: { total_dimensions_filled: number } }
  | {
      name: "session_consent_grant";
      payload: { video: boolean; behavioral_inference: boolean };
    }
  | {
      name: "session_complete";
      payload: { duration_seconds: number; tools_used: string[] };
    }
  | {
      name: "report_generated";
      payload: {
        confidence_average: number;
        dimensions_assessed: number;
        has_hidden_talents: boolean;
      };
    }
  | { name: "report_view"; payload: { first_view: boolean } }
  // Conversion
  | {
      name: "checkout_start";
      payload: {
        plan: "STARTER" | "PRO" | "PRO_PLUS";
        interval: "monthly" | "yearly";
        discount_code: string | null;
      };
    }
  | {
      name: "checkout_complete";
      payload: {
        plan: "STARTER" | "PRO" | "PRO_PLUS";
        interval: "monthly" | "yearly";
        discount_code: string | null;
        polar_subscription_id: string;
      };
    }
  | {
      name: "subscription_canceled";
      payload: {
        plan: "STARTER" | "PRO" | "PRO_PLUS";
        reason: string | null;
      };
    }
  // Retention & loops
  | { name: "evolution_snapshot_view"; payload: { snapshot_age_days: number } }
  | {
      name: "report_share_create";
      payload: { visibility: "private" | "signed" | "public_anonymous" };
    }
  | {
      name: "report_share_view";
      payload: {
        visibility: "private" | "signed" | "public_anonymous";
        has_account: boolean;
      };
    }
  | {
      name: "referral_share";
      payload: { channel: "copy" | "twitter" | "linkedin" | "email" };
    }
  | { name: "referral_attributed"; payload: { referrer_id: string } }
  // Quality / funnel diagnostics
  | {
      name: "agent_decision_view";
      payload: { stage: "data" | "quiz" | "session" | "report" };
    }
  | {
      name: "consent_decline";
      payload: {
        stage: "video_recording" | "behavioral_inference" | "data_source";
        surface: string;
      };
    }
  | { name: "data_export_request"; payload: { format: "json" | "pdf" } }
  | { name: "data_delete_request"; payload: { confirmed: boolean } };

/**
 * Fire a funnel event. Type-safe, no-op-safe, never throws.
 */
export function trackEvent<E extends FunnelEvent>(event: E): void {
  try {
    track(
      event.name,
      event.payload as unknown as Record<string, string | number | boolean>
    );
  } catch (error) {
    // Defense in depth — analytics must never break the app.
    if (process.env.NODE_ENV !== "production") {
      const message = error instanceof Error ? error.message : "unknown";
      console.warn(`[analytics] Failed to track ${event.name}:`, message);
    }
  }
}
