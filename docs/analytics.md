# Lumina — Analytics Event Taxonomy

**Status:** Canonical reference. Every analytics event in the codebase MUST use one of these names. Adding a new event requires a PR that updates this document.

**Providers:**
- [Vercel Analytics](https://vercel.com/docs/analytics) — automatic page-view tracking, custom events via `track(name, payload)` from `@vercel/analytics`.
- [Vercel Speed Insights](https://vercel.com/docs/speed-insights) — automatic Core Web Vitals.
- (Future) PostHog — funnel depth, session replay opt-in for paid tier debugging.

**Wiring:** mounted in `src/app/layout.tsx` as `<Analytics />` and `<SpeedInsights />` from the `@vercel/analytics/next` and `@vercel/speed-insights/next` packages.

---

## Event naming rules

1. `snake_case`. Always.
2. Verb-form for actions (`landing_view`, `cta_click`, `checkout_complete`). Past-tense for completions (`signup_complete`, `report_generated`).
3. No personal data in event payloads. User identity is the Vercel Analytics anonymous ID; payloads carry only enums and counts.
4. Every paid-funnel event must include the source plan and discount code (if present): `{ plan: "PRO" | "PRO_PLUS", discount_code: string | null }`.
5. Page-views are automatic; do **not** fire a custom event for "viewed page X."

---

## Canonical event list

### Acquisition

| Event | Fired when | Payload |
|---|---|---|
| `landing_cta_click` | User clicks any primary CTA on `/` | `{ cta_id: "hero_primary" \| "hero_secondary" \| "footer" \| "session_section" \| "report_section" \| "pricing_section" }` |
| `waitlist_join` | User submits the waitlist form successfully | `{ source: string, position: number }` |
| `pricing_view` | User reaches `/pricing` (overrides the auto page-view to add plan visibility) | `{ tiers_visible: string[] }` |

### Activation

| Event | Fired when | Payload |
|---|---|---|
| `signup_start` | User clicks "Sign up with Google" | `{ method: "google" }` |
| `signup_complete` | Firebase auth state confirms first sign-in | `{ method: "google", age_verified: boolean }` |
| `connection_added` | User successfully connects a data source | `{ source: "gmail" \| "drive" \| "notion" \| "chatgpt_export" \| "file_upload" }` |
| `quiz_module_complete` | A quiz module ends with all questions answered | `{ module: string, dimensions_filled: number }` |
| `quiz_complete` | All five quiz modules complete | `{ total_dimensions_filled: number }` |
| `session_consent_grant` | User grants live-session consent | `{ video: boolean, behavioral_inference: boolean }` |
| `session_complete` | Live session ends naturally (not aborted) | `{ duration_seconds: number, tools_used: string[] }` |
| `report_generated` | Report agent finishes the validate step | `{ confidence_average: number, dimensions_assessed: number, has_hidden_talents: boolean }` |
| `report_view` | User opens their report after generation | `{ first_view: boolean }` |

### Conversion

| Event | Fired when | Payload |
|---|---|---|
| `checkout_start` | User clicks a buy CTA on `/pricing` | `{ plan: "PRO" \| "PRO_PLUS", interval: "monthly" \| "yearly", discount_code: string \| null }` |
| `checkout_complete` | Polar webhook confirms the subscription is active | `{ plan, interval, discount_code, polar_subscription_id }` |
| `subscription_canceled` | Polar webhook reports cancellation | `{ plan, reason: string \| null }` |

### Retention & loops

| Event | Fired when | Payload |
|---|---|---|
| `evolution_snapshot_view` | User opens a 30/60/90-day snapshot | `{ snapshot_age_days: number }` |
| `report_share_create` | User generates a shareable report URL | `{ visibility: "private" \| "signed" \| "public_anonymous" }` |
| `report_share_view` | A shared `/r/{slug}` URL is opened by anyone | `{ visibility, has_account: boolean }` |
| `referral_share` | User copies or shares their referral link | `{ channel: "copy" \| "twitter" \| "linkedin" \| "email" }` |
| `referral_attributed` | A new user signs up via a referral link | `{ referrer_id: string }` |

### Quality / funnel diagnostics

| Event | Fired when | Payload |
|---|---|---|
| `agent_decision_view` | User opens the decision-log side panel | `{ stage: "data" \| "quiz" \| "session" \| "report" }` |
| `consent_decline` | User declines consent at any point | `{ stage: "video_recording" \| "behavioral_inference" \| "data_source", surface: string }` |
| `data_export_request` | User invokes `/api/user/export-data` | `{ format: "json" \| "pdf" }` |
| `data_delete_request` | User invokes `/api/user/delete-data` | `{ confirmed: boolean }` |

---

## Funnel definition

Primary funnel for the launch metrics dashboard:

```
landing_cta_click → waitlist_join (pre-launch)
                  → signup_start → signup_complete
                  → checkout_start → checkout_complete
                  → connection_added (≥1)
                  → quiz_complete
                  → session_consent_grant → session_complete
                  → report_generated → report_view
                  → report_share_create OR evolution_snapshot_view (retention)
```

Drop-off targets (locked after first 30 days of real traffic):
- `landing_cta_click → checkout_start` ≥ 8% (industry baseline for paid-only consumer SaaS)
- `checkout_start → checkout_complete` ≥ 60%
- `checkout_complete → quiz_complete` ≥ 70%
- `quiz_complete → report_generated` ≥ 90% (any drop here is a product-quality bug)
- `report_view → report_share_create OR evolution_snapshot_view` ≥ 30% within 60 days (retention proof)

---

## Implementation pattern

```typescript
// src/lib/analytics/events.ts
import { track } from "@vercel/analytics";

export function trackEvent<E extends keyof EventPayloads>(
  name: E,
  payload: EventPayloads[E],
): void {
  // Type-safe wrapper. Concrete EventPayloads type lives next to this file.
  track(name, payload as Record<string, unknown>);
}
```

Every call site imports `trackEvent`; raw `track(...)` is forbidden by lint rule (TODO: add ESLint rule once events file is implemented).

---

## What is NOT tracked

- Raw imported corpus content (Gmail bodies, Drive doc text, Notion page contents). Per `CLAUDE.md` data governance.
- Quiz answers (only completion + dimension counts).
- Live-session video / audio. Behavioral observations are inferred server-side and stored separately under user-scoped Firestore paths; analytics only sees aggregate signals (`tools_used`, `duration_seconds`).
- Report content. Only the existence and confidence-summary statistics.
- Identifiable user data outside the anonymous Vercel Analytics ID.

This is a hard rule, not a guideline. Any event that would require sending personal content to Vercel/PostHog must be redesigned.
