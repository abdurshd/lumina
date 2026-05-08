# Lumina — Live Implementation Plan

> **Conventions:** Read [`Agents.md`](./Agents.md) before claiming a task.
> **Rationale documents:** [`tasks/saas-competitive-plan.md`](./tasks/saas-competitive-plan.md) (GTM/launch plan), [`ARCHITECTURE.md`](./ARCHITECTURE.md) (agent system), [`tasks/monetization-decision.md`](./tasks/monetization-decision.md), [`tasks/age-gate-decision.md`](./tasks/age-gate-decision.md).

## Legend

| Status | Meaning |
|---|---|
| `[ ]` | Available — not started |
| `[~]` | In progress |
| `[x]` | Done |
| `[!]` | Done, needs review |
| `[-]` | Blocked (note the blocker) |

**Lock convention:** `UNLOCKED` when available; `<agent-name> | YYYY-MM-DD HH:MM` when claimed.

## Active agents

| Agent | Current task | Started | Notes |
|---|---|---|---|
| (none) | — | — | — |

> **Audit note (2026-04-29):** Group E (E1–E7) and several G items (G0.4, G0.5, G1.5) were already implemented in the working tree but had stale `[ ]` / `[~]` statuses. The plan was reconciled to reflect the codebase. Remaining `[ ]` items below are genuinely unimplemented.

---

## Group E — Engineering: agentic core

These tasks build the orchestrator, confidence engine, and self-correcting report loop. See [`Agents.md`](./Agents.md) for full task descriptions.

### E1. Foundation
- `[x]` **E1.1** — Agent orchestrator (`src/lib/agent/orchestrator.ts`)
- `[x]` **E1.2** — Confidence scoring (`src/lib/agent/confidence.ts`)
- `[x]` **E1.3** — Agent decision log store (`src/stores/agent-store.ts`)

### E2. Data corpus + analysis
- `[x]` **E2.1** — Data analyzer agent (`src/lib/agent/data-analyzer.ts`)
- `[x]` **E2.2** — Knowledge-gap detection (`identifyGaps` in `src/lib/agent/confidence.ts`)
- `[x]` **E2.3** — Cross-source evidence correlator (`src/lib/agent/correlator.ts`)

### E3. Adaptive quiz
- `[x]` **E3.1** — Quiz adaptation logic (module-aware question generation in `src/components/quiz/module-quiz-flow.tsx`)
- `[x]` **E3.2** — Module selection by lowest confidence (`recommendNextModule` consumed by `src/app/(app)/quiz/page.tsx`)

### E4. Live session tools
- `[x]` **E4.1** — Session tool registry (7 function declarations wired in `src/lib/gemini/live-session.ts`)
- `[x]` **E4.2** — Behavioral timeline (`src/lib/agent/behavioral-timeline.ts`)

### E5. Report agent
- `[x]` **E5.1** — Self-correcting report loop (`src/lib/agent/report-agent.ts`, 5-step generate→critique→refine→validate)
- `[x]` **E5.2** — Confidence-gated report sections (`src/components/report/{career-paths,strengths-grid,report-confidence-summary}.tsx`)

### E6. Decision-log UI
- `[x]` **E6.1** — Decision-log side panel (`src/components/agent/decision-log.tsx`)
- `[x]` **E6.2** — Thought-chain visualization (`src/components/report/thought-chain.tsx`)
- `[x]` **E6.3** — Page integration across (app) routes (`src/app/(app)/layout.tsx` mounts DecisionLog + MobileDecisionLog)

### E7. Agent dashboard + stage gates
- `[x]` **E7.1** — Agent dashboard surface (`src/components/agent/confidence-dashboard.tsx`)
- `[x]` **E7.2** — Stage gates (`src/components/agent/stage-gate.tsx`, user can override)

---

## Group G — Launch & GTM

These tasks ship the public surface, billing, content, and acquisition loops. Source-of-truth: [`tasks/saas-competitive-plan.md`](./tasks/saas-competitive-plan.md). All operator decisions are locked (`tasks/monetization-decision.md`, `tasks/age-gate-decision.md`).

### G0. Pre-launch gates (must close before public launch)

- `[x]` **G0.1** — Monetization decision memo (paid-only, first-month discount) — `tasks/monetization-decision.md`
- `[x]` **G0.2** — Age-gate decision memo (18+ at launch) — `tasks/age-gate-decision.md`
- `[ ]` **G0.3** — Polar SH billing integration — LOCK: UNLOCKED — DEPENDS ON: G0.1
  - Add `@polar-sh/sdk` to `package.json`
  - `src/lib/billing/polar.ts` (server client + helpers)
  - `src/lib/pricing/tiers.ts` (single source of truth for tier constants)
  - `src/app/api/billing/checkout/route.ts`, `webhook/route.ts`, `customer-portal/route.ts`
  - Plan-tier persistence in Firestore `users/{uid}.subscription`
  - Entitlement guard on `src/app/(app)/layout.tsx` redirecting unpaid users to `/pricing`
  - Polar discount codes for 30% / 50% first-month
- `[x]` **G0.4** — Vercel Analytics + Speed Insights wired into `src/app/layout.tsx`; canonical event taxonomy in `docs/analytics.md`
- `[x]` **G0.5** — `/security` page (`src/app/security/page.tsx`, 336 lines: principles, observe/never-claim, lifecycle, controls, JSON-LD, footer link)
- `[x]` **G0.6** — Public-surface privacy block on landing (`src/components/landing/session-section.tsx` now renders observe/never-claim block above the mockup with link to `/security`)
- `[ ]` **G0.7** — Public report sample at `/sample-report/maya` — LOCK: UNLOCKED — DEPENDS ON: G0.5, E5.1, E1.3, E6.1
  - `src/app/sample-report/[slug]/page.tsx` rendering an anonymized example with full radar / strengths / hidden talents / career matches / action plan
  - Agent decision log panel exposed (draft → critique → refine → validate steps)
  - Shareable; per-route OG; indexable

### G1. Launch surface (ships with public launch)

- `[ ]` **G1.1** — Landing structural rewrite (persona tabs, proof strip thresholds, walkthrough, security block) — LOCK: UNLOCKED — DEPENDS ON: G0.5, G0.6
- `[ ]` **G1.2** — Outcome stats with thresholds — `src/app/api/public/stats/route.ts` — LOCK: UNLOCKED — DEPENDS ON: G0.4
- `[ ]` **G1.3** — Real product walkthrough video (self-hosted, not YouTube) — LOCK: UNLOCKED
- `[x]` **G1.4** — `/about` page (`src/app/about/page.tsx` — Option C: single founder mention, "team" framing for blog bylines)
- `[x]` **G1.5** — Footer expansion to 5 columns (`src/components/landing/site-footer.tsx`)
- `[!]` **G1.6** — `/pricing` page (`src/app/pricing/page.tsx` + `pricing-tier-grid.tsx`) reads from `src/lib/pricing/tiers.ts`; tiers refactored to 3-tier credit-based model (Starter $9 / Pro $19 / Pro+ $39) backed by `src/lib/pricing/credits.ts`. **NEEDS REVIEW** of price points and credit pool sizing once Polar product/price IDs are minted
- `[x]` **G1.7** — Waitlist (`src/app/api/waitlist/route.ts` POST/GET, transactional position counter in `waitlist_meta/counter`, Firestore `waitlist/{email}` with hashed IP, rate-limited; landing form at `src/components/landing/waitlist-form.tsx` wired into the CTA section)
- `[x]` **G1.8** — Per-route metadata + OG images via Next.js `opengraph-image.tsx` convention. Shared template in `src/lib/og-template.tsx`; per-route generators for `/`, `/about`, `/pricing`, `/security`, `/methodology`, `/changelog`, `/help`. (Replaced the planned build-time `scripts/generate-og.ts` with the native edge-runtime convention — same outcome, cached automatically.)
- `[x]` **G1.9** — Sitemap + robots (`src/app/sitemap.ts` lists public marketing routes; `src/app/robots.ts` allows `/`, disallows `(app)` paths and `/api/`)
- `[x]` **G1.10** — `noindex` on `(app)` routes (server `(app)/layout.tsx` exports `metadata.robots`; client logic moved to `(app)/app-shell.tsx`)
- `[ ]` **G1.11** — Live chat with seeded quick replies (Crisp or Plain) — LOCK: UNLOCKED — DEPENDS ON: G0.4

### G2. Content & SEO

- `[x]` **G2.1** — `/blog` with 5 launch posts. Pure-TS content layer (`src/lib/content/blog.ts` typed `BlogPost`s, `src/lib/content/prose.ts` `ProseSection` shape, `src/components/content/prose-renderer.tsx` for rendering) — no MDX tooling needed for the stub authoring. `src/app/blog/page.tsx` (index) + `src/app/blog/[slug]/page.tsx` (post page with prev/next nav, generateStaticParams). Posts: methodology / report-agent engineering / behavioral signals / 31 dimensions / credits.
- `[x]` **G2.2** — `/help` with 34 FAQs across 8 sections (`src/app/help/page.tsx`) — getting started, connections, assessment, live session, reports, privacy, billing, account; jump-to ToC + contact CTA
- `[x]` **G2.3** — `/changelog` (`src/app/changelog/page.tsx` with timeline of feature/improvement/security entries)
- `[ ]` **G2.4** — `/status` (BetterStack / Instatus / UpRobot embed) — LOCK: UNLOCKED
- `[x]` **G2.5** — Persona landing pages. `src/lib/content/personas.ts` (typed `Persona` shape with hero / pain-solutions / features / FAQs / recommended plan), `src/components/personas/persona-page.tsx` (shared template), 5 static route directories — `/for-self-discovery`, `/for-career-pivots`, `/for-coaches`, `/for-schools` (higher ed at launch), `/for-hr-teams` — each delegates to the shared template + exports its own metadata + OG image. (Note: Next 16 doesn't recognize `for-[persona]` as a directory-name pattern — named segments with prefix work for filenames inside a segment, not as the segment itself. Static-per-persona is the right shape here anyway.)
- `[ ]` **G2.6** — Comparison pages `/vs/{competitor}` — LOCK: UNLOCKED
- `[x]` **G2.7** — Use-case pages. `src/lib/content/use-cases.ts` defines 5 personas (career-pivot-after-thirty, new-grad-finding-direction, returning-to-work, for-coaches-and-advisors, exploring-while-employed) with outcomes + recommended plan + body sections. `src/app/use-cases/page.tsx` (index, persona cards with eyebrow + plan recommendation) + `src/app/use-cases/[slug]/page.tsx` (per-page outcomes + body + plan callout + cross-links).
- `[x]` **G2.8** — Programmatic `/careers/{slug}` from O*NET. `src/lib/content/careers.ts` (RIASEC letter info, dimension mapping, related-cluster resolver) wraps the existing `src/lib/career/onet-clusters.ts`. `src/app/careers/page.tsx` (alphabetical index with RIASEC legend) + `src/app/careers/[slug]/page.tsx` (per-cluster page with letter breakdowns, example careers, predicted-fit Lumina dimensions, related clusters, O*NET attribution). 16 cluster pages, `generateStaticParams` over all slugs.

### G3. Activation, retention, share loop

- `[~]` **G3.1** — Funnel instrumentation. `src/lib/analytics/track-event.ts` is now the single type-safe entry to Vercel Analytics — discriminated-union of every event in `docs/analytics.md`, never throws, no-op-safe during SSR. Wired call sites: `waitlist_join`, `pricing_view`, `checkout_start`, `report_share_view`, `data_export_request`, `data_delete_request`, `referral_share`. **STILL TO WIRE** (need touching auth/quiz/session/report flows): `signup_start`, `signup_complete`, `connection_added`, `quiz_module_complete`, `quiz_complete`, `session_consent_grant`, `session_complete`, `report_generated`, `report_view`. Time-to-first-report can be derived from the `signup_complete → report_generated` interval once those fire.
- `[x]` **G3.2** — Share-your-report `/r/{slug}` loop. Referral redirect moved to `/ref/{code}` to free the `/r/` namespace. New: `src/lib/share-report.ts` (10-char slug, `anonymizeReport()` strips evidence excerpts and neutralizes second-person voice in narrative fields), `src/app/api/reports/share/route.ts` (GET status / POST publish-or-refresh / DELETE revoke; idempotent slug — same URL keeps working across re-publishes), `src/app/r/[slug]/page.tsx` (server-rendered, indexable, structural radar/strengths/career-paths with anonymized "why this person" rather than "why you"; deep-links to `/security` and `/methodology`). Tracking via `report_share_view` from a tiny client component.
- `[x]` **G3.3** — Public showcase at `/showcase` (`src/app/showcase/page.tsx`). Server-rendered, queries `sharedReports` for non-revoked entries (top 6 by updatedAt), shows headline + tagline + top strengths + top career match. Empty-state copy until first shares ship. Three "what sharing means" rows above the grid for trust framing.
- `[!]` **G3.4** — Referral v1: tracking and attribution wired end-to-end. `src/lib/referrals.ts` (Crockford-base32 8-char codes, IP-hash dedup, self-ref check); `src/app/r/[code]/route.ts` (302 redirect with attribution cookie + best-effort Firestore click recording); `src/app/api/referrals/route.ts` (GET stats + lazy code issuance via transaction); `src/app/api/referrals/claim/route.ts` (idempotent claim called from onboarding completion); `src/components/settings/referral-card.tsx` (link + clicks/signups/qualified tiles with copy-to-clipboard). **NOT YET wired:** the credit-grant fulfillment for `qualified` events — that requires the Polar webhook from G0.3, which is still open. Counters are live but `totalQualified` stays 0 until billing lands.
- `[ ]` **G3.5** — Re-engagement loop (30/60/90-day Evolution snapshot emails) — LOCK: UNLOCKED
- `[x]` **G3.6** — In-app onboarding polish (`src/app/(app)/onboarding/page.tsx` — trimmed to canonical 5 sources, fixed quiz claim to "5 modules / 31 dimensions", aligned age gate to locked 18+, added `/security` + `/methodology` trust links, routes to `/connections` after consent so first action is connecting a source)

### G4. B2B / persona expansion

- `[ ]` **G4.1** — `/for-coaches` deep build (coach signup, client dashboard, co-branded reports) — LOCK: UNLOCKED — DEPENDS ON: G2.5
- `[ ]` **G4.2** — `/for-schools` (higher-ed) and `/for-hr-teams` (SSO, org dashboards, seat management, DPA) — LOCK: UNLOCKED — DEPENDS ON: G2.5
- `[ ]` **G4.3** — Compliance posture upgrade (SOC 2 Type 1 path, DPA template, sub-processors) — LOCK: UNLOCKED
- `[ ]` **G4.4** — Read-only API + `/api-docs` — LOCK: UNLOCKED — DEPENDS ON: G3.2

### G5. Defensibility moat (continuous)

- `[x]` **G5.1** — Public agent benchmark dashboard at `/lab/benchmarks` (`src/app/lab/benchmarks/page.tsx`) — calls `runBenchmarkSuite()` server-side per request; renders RIASEC accuracy / cluster overlap / stability / pass-fail with regression alerting, plus a static description of the bias-audit pipeline (Gemini-bound, runs on schedule)
- `[x]` **G5.2** — Live agent decision log widget on the homepage (`src/components/landing/agent-log-widget.tsx`). Auto-cycles a curated 7-step decision sequence with confidence-before / confidence-after deltas; pauses at "Report ready" then resets. Reduce-motion users see all steps at once. Mounted between `<ReportSection />` and `<HowItWorksSection />`. Demo data only — never reads real user logs (privacy posture).
- `[x]` **G5.3** — `/methodology` page (`src/app/methodology/page.tsx`) — RIASEC, Big Five facets, Schwartz values, O*NET, confidence-scoring math, full reference list

### Cross-cutting hardening

- `[ ]` **GX.1** — i18n on the launch surface (en first, then es / fr / de / pt-BR for G2) — LOCK: UNLOCKED
- `[x]` **GX.2** — CI gates. `.github/workflows/ci.yml` runs lint → typecheck → route validation → production build on every PR; `scripts/validate-public-routes.ts` (new `npm run validate:routes` + `npm run ci` scripts) asserts every public route has `metadata` and a co-located `opengraph-image.tsx`. Lighthouse runs against the Vercel preview URL on PRs (soft-fail). `tsx` added as a devDependency.
- `[x]` **GX.3** — Sentry observability (`@sentry/nextjs` installed; `src/instrumentation.ts` for Node + Edge with `onRequestError`; `src/instrumentation-client.ts` for browser with `onRouterTransitionStart`; `app/error.tsx` and `app/global-error.tsx` now call `Sentry.captureException`). All paths no-op when `NEXT_PUBLIC_SENTRY_DSN` is unset, so dev keeps working without setup. **Operator action:** set `NEXT_PUBLIC_SENTRY_DSN` (and optionally `SENTRY_TRACES_SAMPLE_RATE`) to activate.
- `[!]` **GX.4** — CSP hardened, nonce-based approach reverted. Per-request CSP lives in `src/proxy.ts` (Next 16 renamed `middleware.ts` → `proxy.ts`); static CSP removed from `next.config.ts`. **Final shape: host-allowlist + `'unsafe-inline'`** for `script-src` (operator revert from the originally-shipped nonce + `'strict-dynamic'`). Reason: Firebase Auth's `signInWithPopup` loads `apis.google.com/js/api.js` and gapi dynamically creates inline scripts inside helper iframes that inherit our CSP — those have no nonce, and nonce-based policies cause modern browsers to ignore `'unsafe-inline'` per CSP3, so any nonce policy blocks Google sign-in. Trade-off: weaker XSS protection for a working auth flow. Mitigations retained: strict `default-src 'self'`, narrow connect/frame allowlists, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`. `x-nonce` header is still forwarded for opt-in nonce-gating. Marked `[!]` to flag the security trade-off for review during the SOC2 push.
- `[x]` **GX.5** — Cookie consent banner — `src/lib/consent.ts` (`useSyncExternalStore`-backed hook, version-stamped, cross-tab via storage event); `src/components/consent/cookie-consent-banner.tsx` (bottom-sheet banner shown only when status is pending); `src/components/consent/consented-analytics.tsx` (mounts Vercel Analytics + Speed Insights only when accepted). Settings page now has a "Cookie & analytics preferences" card with Enable / Disable / Reset. (Note: OG image generators are server-rendered, not third-party — they don't need consent.)
- `[x]` **GX.6** — Polished data-export and data-delete UX in `/settings` (`src/app/(app)/settings/page.tsx` — export card now shows what's included + last-export confirmation with size; delete dialog adds "I understand" checkbox + structured "what gets deleted" list; CONSENT_SOURCE_OPTIONS trimmed to canonical 5; both cards link to `/security` for retention/lifecycle context; export filename now includes ISO datestamp)

---

## Operator decisions (locked 2026-04-29)

| Decision | Locked value | Memo |
|---|---|---|
| Monetization | Paid-subscription only; 30%/50% first-month discount | `tasks/monetization-decision.md` |
| Age gate | 18+ at launch; revisit 16+ in G4 | `tasks/age-gate-decision.md` |
| Founder visibility | Option C — named once on `/about`, blog bylined as team | — |
| Billing provider | Polar SH | — |
| Launch sequencing | 2–4 week waitlist, public launch coincides with G1 | — |
| Pre-launch users | None — analytics start fresh from waitlist phase | — |
