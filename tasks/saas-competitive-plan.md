# Lumina — SaaS Competitive Improvement Plan

**Date:** 2026-04-29
**Author:** Audit + research pass (trustmrr.com directory carry-over + multimodal-AI-coaching deep-dive)
**Project status:** Pre-launch consumer product. Agentic architecture under active build (per `CLAUDE.md` "Agentic Architecture" section). **No longer framed as a hackathon submission** — every recommendation in this plan assumes Lumina is a real product going to market over the next 3–9 months.
**Companion docs:**
- `CLAUDE.md` — engineering rules, model policy, consent rules, agentic architecture
- `Agents.md` — multi-agent task coordination
- `ARCHITECTURE.md` — agent orchestrator system diagram
- `plan.md` — currently empty; this file is the GTM/product-surface plan, not the engineering task tracker

---

## 1. Executive summary

Lumina has the rarest combination in the AI tooling market right now: a **multimodal live AI conversation** (video + voice) **plus** an **adaptive psychometric assessment** **plus** **personal-data corpus integration** (Gmail / Drive / Notion / ChatGPT exports / file upload), all stitched together by a **real agentic orchestrator** with confidence-gated transitions and a self-correcting report loop. None of the comparable career-discovery or AI-coaching products on the market combine all four.

The opportunity is real. The risks are also real, and they are *not* technical — the technical foundation is excellent (Next.js 16, Firebase, Gemini 3 Flash/Pro/Live Audio, agent decision log, deny-by-default Firestore rules, ephemeral tokens, BYOK). The risks are commercial, regulatory, and structural:

1. **No monetization model is defined.** No `/pricing` page, no Polar/Stripe in `package.json`, no plan tiers in code. Without a model decision, the product cannot launch.
2. **The 16+ launch constraint is a real ship gate, not a footnote.** `CLAUDE.md` already flags this. Multimodal AI with behavioral inference, video, and personal-data corpus aimed at minors is one of the most legally-loaded combinations in consumer AI. This must be resolved or the audience must shift.
3. **The public surface is one page.** `src/app/page.tsx` (51 lines) renders a single landing scroll with five anchored sections. The footer has 5 items. There is no `/about`, no `/blog`, no `/help`, no `/security`, no `/changelog`, no pricing, no public report sample, no creator/coach surface, no waitlist mechanic, no SEO machinery beyond a single static `<Metadata>` block in `layout.tsx`.
4. **There is no proof anywhere on the public surface.** No testimonials, no logos, no usage stats, no SOC progress, no investor/advisor names, no founder presence.
5. **The product's strongest defensibility (agentic decision log) is not visible to a stranger before they sign up.** A live "look inside the agent's reasoning" demo is the single highest-leverage public-surface asset Lumina could ship.

This plan ranks the work by **launch-criticality first, then growth-impact** — not by effort.

---

## 2. Research methodology

Primary live research conducted on 2026-04-29 plus carry-over from the LearnSelf comparable pass on the same day.

| Source | What was studied | Most relevant takeaway for Lumina |
|---|---|---|
| `trustmrr.com` (verified-revenue directory) | Top 50 SaaS by MRR, with payment-provider attestation | Direct comparable in Lumina's exact niche is **Rezi ($289k MRR — AI for career)**. Most leaders in the $50k–$300k tier ship with full marketing surfaces (pricing, blog, help, status, security, persona pages, partner logos, testimonials). |
| `yoodli.ai` | Multimodal AI coaching — closest direct analog (video + voice + behavioral feedback under consent) | **SOC 2 + GDPR badge under hero CTA** is non-negotiable for products with video/voice/personal-data; **logo cloud where every logo links to a real proof artifact** (case study / webinar / announcement) is a higher-leverage variant of the standard logo wall; **Trust Center** as a separate subdomain pattern keeps compliance docs accessible without crowding marketing; **investor naming** is real social proof when post-round; **interactive "How it works" walkthrough** beats a demo video alone for converting analytical visitors; **persona-tab content swap** for "How will you use Lumina?" handles the multi-audience problem cleanly; **live chat with seeded quick replies** ("Get a demo / Try a roleplay / I have questions") tied to user intent. |
| `codedex.io` (carry-over) | Course-discovery EdTech — strong narrative + outcome stats | Outcome counters and 3 long-form testimonials with country flags work; award badges (GitHub Education Partner / Customer Reviews / Product Hunt) build credibility without partnership claims. |
| `dataexpert.io` (carry-over) | Operator-led education academy | Live Trustpilot widget + 6+ detailed testimonials with photos, "Platform Access Included" partner-logo block, capstone showcase — all transferable. |
| Lumina codebase (`/Users/ricky/dastur/lumina`) | Full read of `src/app/page.tsx`, `layout.tsx`, all `src/components/landing/*`, `firestore.rules`, `package.json`, `README.md`, `CLAUDE.md`, `Agents.md`, full API route map, all 9 in-app routes under `(app)` group | Pre-launch state confirmed: solid core but zero commercial surface. |

---

## 3. State of Lumina today (verified)

| Surface | Built | Notes |
|---|---|---|
| Landing page (`src/app/page.tsx`) | ✅ | Single-page scroll: Hero → Quiz → Session → Report → How It Works → CTA. Bespoke SVG scenes (`hero-prism-scene`, `neural-brain-scene`, `data-network-scene`, `report-constellation-scene`, `session-scene`). Strong visual identity. |
| Footer (in `page.tsx`) | 🟡 | 5 items: "Zero Persistence", "Powered by Gemini AI", Privacy, Terms, copyright. Comparable real-product footers carry 25–35 links across 5 columns. |
| `/privacy`, `/terms` | ✅ | Routes exist (`src/app/privacy/page.tsx`, `src/app/terms/page.tsx`). |
| `/login` | ✅ | `src/app/(auth)/login/page.tsx`. |
| In-app routes (`(app)` group) | ✅ | dashboard, onboarding, connections, quiz, session, report, evolution, profile, settings, admin, layout. |
| API routes | ✅ | 30 routes under `src/app/api/`: gemini/{quiz,quiz-score,reflections,challenges,feedback,regenerate-report,analyze,report,ephemeral-token}, auth/notion, corpus/*, admin/analytics, user/{update-profile,action-plan-progress,delete-data,export-data,byok}, agent/{evaluate,correlate}, profile/{snapshot,evolution}, eval/{benchmark,bias}, data/{notion,file-upload}. |
| Firestore rules | ✅ | Deny-by-default, user-scoped reads/writes, server-only writes for `agentLogs` and `reports`. Solid baseline. |
| Pricing page | ❌ | Does not exist as a route or component. |
| Billing integration | ❌ | No Stripe / Polar / Paddle / RevenueCat in `package.json`. No checkout API route. |
| About / founder page | ❌ | Does not exist. |
| Blog / changelog / help / status / security pages | ❌ | None exist. |
| `/api/health` or status endpoint | ❌ | Not visible. |
| Sitemap / robots.txt | ❌ | Not in `public/`. |
| OG image (per route or default) | ❌ | Only the static `<Metadata>` in `layout.tsx` ("Lumina — Discover Your Hidden Talents"). No `/public/og*.png`. No per-route metadata. |
| JSON-LD / structured data | ❌ | No emission anywhere. |
| i18n | ❌ | English only. Single language at `<html lang="en">`. |
| Analytics | 🟡 | `src/lib/analytics/` exists; no analytics package wired into `layout.tsx` (no Vercel Analytics, no GA4, no PostHog visible). |
| Live chat / support widget | ❌ | None. |
| Newsletter / waitlist | ❌ | None. Critical pre-launch gap. |
| Public report sample (the strongest demo asset) | ❌ | The `report-mockup.tsx` component exists but only inside the marketing scroll. There is no shareable `/sample-report/{id}` URL. |
| Demo video | ❌ | Has SVG scenes and mockups; no real product walkthrough video. |
| Discord / community | ❌ | None. |
| Mobile app | ❌ | Web-only (per README). Web-first is fine; the absence is just a fact. |
| 16+ launch constraint resolved | ❌ | Flagged in `CLAUDE.md` as a release gate. No public document of the legal review or audience adjustment. |
| SOC 2 / GDPR / security posture published | ❌ | The architecture supports this (ephemeral tokens, deny-by-default rules, BYOK option) but there is no `/security` page articulating it. |

---

## 4. Gap analysis grouped by launch-criticality

### 4.1 Launch blockers (cannot ship without)

1. **No monetization model defined.** This isn't "should we charge?" — it's "we cannot launch a real product without a billing path." Decision required: B2C subscription / freemium-with-paid-report / per-session pricing / B2B SaaS / hybrid. Affects: pricing page copy, plan-tier code, signup flow gating, retention loops, every CTA on the public surface.
2. **16+ audience legal validation.** Multimodal AI + behavioral inference + personal-data corpus aimed at minors is the most-regulated consumer AI combination short of explicit medical or financial advice. Decision required: ship to 18+ first / ship to 16+ with parental consent flow / ship globally with regional age gates / wait for legal validation. Affects: signup flow, ToS, marketing copy, data retention defaults, behavioral inference defaults.
3. **No production billing wiring.** Once the model is decided, the integration (Stripe Checkout / Polar / etc.), webhooks, plan-tier persistence in Firestore, and entitlement checks across `/quiz`, `/session`, `/report`, `/evolution` all need to land before public launch.
4. **Public-surface privacy/security articulation.** The architecture is privacy-first; the public surface does not communicate this. A user with sensitive data (Gmail, Notion, ChatGPT exports) will not connect their accounts based on a 5-link footer. A `/security` page articulating data flow, consent, retention, and erasure is a launch dependency, not a nice-to-have.

### 4.2 Trust & social proof (highest commercial leverage post-launch)

5. **No public report sample.** The single highest-leverage asset Lumina could ship is a shareable, anonymized example report at a stable URL like `/sample-report/anon-001`, indexable, with the full radar chart, strengths, hidden talents, career matches, action plan, and the agent decision log visible. This is what converts a curious visitor into a signup at a much higher rate than any landing-page copy.
6. **No "see the agent reasoning" public demo.** The agent decision log is Lumina's defensibility moat. It needs a public demo: an interactive page that walks through a real example session, shows the orchestrator's confidence-gated decisions, and exposes the report-agent loop (draft → critique → refine → validate) live. Currently it's hidden inside a logged-in app.
7. **Zero testimonials, zero outcome stats, zero logos.** Same gap as every pre-launch product. Plan-level rule: do not invent any of these.
8. **No founder presence.** Career-discovery products are a high-trust category. "Powered by Gemini AI" in the footer is a tech credit, not a brand. A named founder with a 2-sentence bio + headshot on `/about` is the cheapest single trust improvement available.
9. **No security trust artifacts.** Yoodli puts SOC 2 Type 2 and GDPR badges directly under the hero CTA. Lumina handles arguably more sensitive data than Yoodli (psychometric + multimodal + personal corpus) but says nothing on the public surface about its actual security posture.

### 4.3 Marketing structure

10. **Footer is 5 items.** Should be 5 columns × 5–6 items (~25 links). Missing entirely: Solutions, Resources, Company, Trust, Mobile (if applicable later), Social.
11. **No nav.** The sticky top nav is bespoke and renders only landing-page section anchors. No `Pricing`, `Solutions`, `For ___`, `Resources`, `About`. Once new pages exist, the nav has to actually link to them.
12. **No persona surfaces.** The product can serve at least four distinct personas: students choosing a major, recent grads picking a first role, mid-career professionals considering a pivot, B2B coaches/HR using Lumina for assessment. Each is a real landing-page candidate that can target its own keyword set and conversion narrative — and the four personas have very different sensitivity profiles for the data corpus question.
13. **No public report / no public showcase.** Even an anonymized library of 5–10 sample reports across personas would 10× the perceived legitimacy.

### 4.4 Content & retention

14. **No blog.** Career-discovery is a content-heavy category (Holland Codes, Big Five, RIASEC, career-pivot stories, "should I switch careers?" guides). Programmatic SEO opportunity is substantial — `/careers/{role}`, `/personality-types/{type}`, `/quiz/{module}`-explainer pages — and Lumina has zero of it.
15. **No help center / FAQ surface.** There's a CTASection but no `/help`, no FAQ schema for SEO.
16. **No newsletter / waitlist.** Pre-launch, this is the single most valuable lead-capture mechanism. Build it before launching.
17. **No changelog.** Pre-launch is fine. Post-launch, this becomes a retention loop and a "we're actively building" trust signal.
18. **No community surface.** Career discovery has natural community gravity (Discord / forum). Optional pre-launch, valuable post.

### 4.5 Conversion mechanics

19. **No pricing page.** Even before billing is wired, articulating the planned pricing structure is itself a conversion asset — it sets expectations and screens out browsers who would never pay.
20. **No yearly-discount mechanism.** Standard SaaS lever; missing.
21. **No "Book a demo" path for B2B.** Once persona pages exist, B2B (HR teams, university career centers, coaches) needs a calendar-embed booking flow.
22. **No referral / share-your-results loop.** A user who finishes their report and gets a result they like is the most likely person on earth to share Lumina. There is no "share your report" flow with privacy-preserving anonymization, and no referral credit.
23. **No live chat for inbound.** Yoodli's seeded quick-reply chat ("Get a demo / Try / I have questions") is a high-converting low-cost addition. Lumina has none.

### 4.6 Technical SEO & meta polish

24. **No sitemap or robots.txt** in `public/`. Next.js 16 supports `app/sitemap.ts` and `app/robots.ts` for code-driven generation.
25. **One static metadata block** in `layout.tsx`. No per-route `generateMetadata()` for `/privacy`, `/terms`, `/about`, `/security`, persona pages, or anything else.
26. **No JSON-LD anywhere.** `Organization`, `WebSite`, `Person` (founder), `WebPage`, `FAQPage`, `Article` (blog), `Product` (Lumina-as-software) are all relevant schemas none of which are emitted.
27. **No per-route OG images.** Lumina is at the stage where every share unfurls identically — measurable impact on Twitter / LinkedIn / Slack share-driven acquisition.
28. **No Vercel Analytics / GA4 / PostHog wired into root layout.** `src/lib/analytics/` exists in code but the bridge into the app shell isn't visible. Without analytics live, the entire metrics-driven part of this plan is unenforceable.
29. **No `noindex` policy on protected `(app)` routes.** Logged-in surfaces shouldn't be in search results; needs `<meta robots="noindex,nofollow">` from the `(app)/layout.tsx`.

### 4.7 Brand / visual cohesion

30. **Brand voice is minimalist-spiritual** ("Discover Your Hidden Talents", `LuminaIcon`, "lumina-orb", "lumina-shard", "lumina-spark"). This is a strength but it currently only lives on the landing page. If the product surface (in-app screens) doesn't carry the same voice, the conversion-to-activation drop is real.
31. **No screenshots of the actual product on the public surface.** The mockup components are stylized SVG approximations, not real product screens. Yoodli's interactive walkthrough uses real product UI; that's higher-converting for analytical visitors.

### 4.8 Cross-cutting (behavioral inference / consent UX)

32. **The consent UX is the single most reputationally-loaded part of the product.** Behavioral inference from face/body cues during live sessions, even with consent, is a category that gets products written up by privacy press if mis-handled. The `CLAUDE.md` rules are correct (only coaching-style signals; no identity recognition; no medical/personality certainty claims; evidence-and-confidence on every claim). The public surface needs to communicate this *before* a user reaches the consent prompt — otherwise the consent prompt itself feels surprising. A `/security` page plus a section on the landing page describing exactly what is and isn't observed is launch-table-stakes.

---

## 5. Phased implementation plan

Phases are ordered by **launch-criticality first**. Phase 0 must land before any public launch. Phase 1 ships alongside launch. Phase 2+ are growth.

### Phase 0 — Pre-launch decisions and gates (cannot skip)

**Goal:** unblock every other decision in the plan.

- [x] **0.1 — Monetization model decision.** **LOCKED:** paid-subscription only (no free tier), with optional first-month discount of 30%/50% as the entry incentive. Memo: `tasks/monetization-decision.md`.
  - Implication: every CTA on the public surface routes to checkout, not to a free-account signup. Sample report (`/sample-report/maya`), agent decision log demo, and the security/methodology pages become the *only* pre-purchase evaluation surface.
  - Acceptance: plan tiers encoded as constants in `src/lib/pricing/tiers.ts`; every CTA in the codebase points at the single source of truth.

- [x] **0.2 — Age-gate decision.** **LOCKED:** 18+ at launch. Revisit 16+ post legal review as a Phase 4 item, not at launch. Memo: `tasks/age-gate-decision.md`.
  - Implication: signup flow gates at 18; ToS reflects 18+; landing copy never targets minors; Gemini API consumer terms are honored without exception.
  - Acceptance: signup form rejects DOB < 18; ToS updated; copy audited.

- [ ] **0.3 — Billing integration (Polar SH).** **PROVIDER LOCKED:** Polar SH (matches `learnself` portfolio).
  - Add: `@polar-sh/sdk` to `package.json`; `src/lib/billing/polar.ts` (server-side client + helpers); `src/app/api/billing/checkout/route.ts`, `src/app/api/billing/webhook/route.ts`, `src/app/api/billing/customer-portal/route.ts`; plan-tier persistence in Firestore `users/{uid}.subscription`; entitlement guard on `(app)` layout that redirects unpaid users to `/pricing`.
  - First-month discount: implement via Polar discount codes (one for 30%, one for 50%) so the operator can A/B without code changes.
  - Acceptance: a real payment can be made end-to-end in production, with webhook reconciliation, discount-code application, and a customer portal for cancel/upgrade.

- [ ] **0.4 — Analytics live (no pre-launch baseline available).**
  - Wire Vercel Analytics + Speed Insights into `src/app/layout.tsx` immediately so every event from the waitlist phase forward is captured. Add PostHog later if needed for funnel depth.
  - Define the canonical event set: `landing_view`, `landing_cta_click`, `waitlist_join`, `signup_start`, `signup_complete`, `connection_added`, `quiz_module_complete`, `quiz_complete`, `session_consent_grant`, `session_complete`, `report_generated`, `report_view`, `pricing_view`, `checkout_start`, `checkout_complete`, `referral_share`. Document in `docs/analytics.md`.
  - **No baseline pre-launch — there are zero current users.** Baseline starts the moment the waitlist opens; it accumulates through Phase 0 → Phase 1 → public launch.
  - Acceptance: Vercel Analytics shows traffic on the live site; the canonical event set is fired at every touchpoint by Phase 1 close.

- [ ] **0.5 — `/security` page.**
  - Articulate: no `GEMINI_API_KEY` to browser, ephemeral tokens for live sessions, deny-by-default Firestore rules, raw imported content is transient, behavioral observations are coaching-only (no identity recognition / medical claims / personality certainty), every strong claim ships with evidence and confidence, BYOK option, data export and delete endpoints (already built — `/api/user/export-data`, `/api/user/delete-data`).
  - Link from footer, link from consent prompts in-app, link from the landing page's session section.
  - Acceptance: a B2B procurement reviewer reading only `/security` understands the data flow well enough to decide whether to grant a pilot.

- [ ] **0.6 — Public-surface privacy/consent articulation on the landing page.**
  - The session section already exists. Add a clear "What we observe / What we do not observe" block before the session mockup. List exactly the coaching signals (engagement, hesitation, confidence patterns, communication style) and the four explicit "we never claim" items from `CLAUDE.md` (identity recognition, medical diagnosis, immutable personality certainty, legally/academically consequential decisions from video alone).
  - Acceptance: a privacy-skeptical user reading the landing page reaches the signup form with their concerns addressed, not amplified.

- [ ] **0.7 — Public report sample.**
  - Generate one anonymized, beautifully-rendered example report for a fictional persona ("Maya, 24, design-engineer pivoting to research"). Mount it at `/sample-report/maya` with full read-only layout: radar chart, strengths-with-evidence, hidden talents, career matches, action plan, **and a panel that exposes the agent decision log** for that report (draft → critique → refine → validate steps).
  - This page is your single most-shareable asset and your single most-converting public asset.
  - Acceptance: a stranger can read the sample report end-to-end without an account; the agent decision log is visible; the page is shareable on Twitter/LinkedIn with a real OG card.

### Phase 1 — Launch surface (ships with public launch)

**Goal:** raise Lumina's public surface to the credibility of comparable AI coaching products at the moment of launch.

- [ ] **1.1 — Landing page structural rewrite.**
  - File: `src/app/page.tsx` plus `src/components/landing/*`.
  - Add: persona-tab content swap ("Who is this for?" — Self-discovery / Career pivot / Coaches & HR / Students), proof strip (only metrics that exceed thresholds — see 1.2), interactive product walkthrough (replicate Yoodli's pattern using the existing mockup components but make them step-throughable), security/privacy block before the session section, founder/team mention if 1.4 lands.
  - Acceptance: a stranger reading only the landing page understands what Lumina is, who it's for, what data it sees and doesn't see, what it costs, and why it's different from a generic chatbot — within 60 seconds of scrolling.

- [ ] **1.2 — Outcome stats with thresholds (no fake proof).**
  - Server endpoint: `src/app/api/public/stats/route.ts` returning `{ users, sessions_completed, reports_generated, dimensions_assessed, hours_of_evidence }`. Cache 5 minutes.
  - Render rule: a metric only shows if it exceeds a floor (`users >= 1000`, `sessions >= 500`, `reports >= 500`, `dimensions = 31` always shows because it's static, `hours >= 1000`). Below the floor, the cell is omitted; never show a small or zero number.
  - Acceptance: at launch with 0 real users, the strip is hidden; as numbers grow, cells fill in.

- [ ] **1.3 — Real product walkthrough.**
  - 60–90s video showing the actual flow (Connections → Quiz → Session consent → Live session snippet → Report generation with agent log visible → Action plan). Self-host (Cloudflare Stream or Mux) — do not use YouTube as the canonical embed for a product handling personal data, because YouTube embeds load third-party tracking even via lite-embed and that contradicts the "Zero Persistence" footer claim.
  - Place above the fold under the hero, with a poster frame; LCP budget < 2.5s.
  - Acceptance: video plays inline; CSP `media-src` configured; no third-party trackers loaded by the embed.

- [ ] **1.4 — Founder / `/about` page (operator decision required).**
  - **Option A:** founder named on `/about` with photo + bio + LinkedIn link.
  - **Option B:** company-anchored, no individual named.
  - **Option C (recommended for early-stage AI products):** founder named once on `/about` with bio + photo + LinkedIn. Blog posts (Phase 2) bylined "by the Lumina team" until there are multiple authors.
  - Acceptance: `/about` exists, footer + nav link to it; `Person` + `Organization` JSON-LD emitted via `generateMetadata()`.

- [ ] **1.5 — Footer expansion.**
  - Replace the current 5-item footer in `src/app/page.tsx` with a 5-column structure: **Product** (Pricing, Sample Report, How It Works, What's New, Roadmap), **Solutions** (Self-discovery, Career Pivot, For Coaches, For Schools, For HR Teams), **Resources** (Blog, Help, FAQ, Newsletter, Sample Reports), **Company** (About, Careers, Contact, Press), **Trust** (Privacy, Terms, Security, Data Processing Agreement, Cookie Settings, Status).
  - Render only links that point at real or "coming soon" pages — do not ship dead links. A `/soon/{slug}` waitlist page is acceptable for not-yet-built items.
  - Acceptance: every link 200s; footer is server-rendered (Next.js App Router default); a11y score ≥ 95.

- [ ] **1.6 — Pricing page.**
  - File: `src/app/pricing/page.tsx`. Render plan tiers from the single source of truth in `src/lib/pricing/tiers.ts` (created in 0.1).
  - Show honest unit costs of what each tier *includes*, not abstract credits: e.g., "Free: 1 connected source, 1 quiz module, sample-only report. Pro: full corpus, all 5 quiz modules, full report, monthly evolution snapshots."
  - Yearly toggle with absolute dollar savings.
  - "Book a demo" alt CTA for B2B.
  - Acceptance: pricing renders in en (i18n is Phase 2); Stripe/Polar checkout flow works end-to-end; webhook persists plan tier; entitlement checks on protected app routes respect the tier.

- [ ] **1.7 — Waitlist (2–4 week pre-launch window).** **LOCKED:** waitlist is the official Phase 0 → Phase 1 bridge.
  - Schema: Firestore `waitlist/{email}` collection with `email`, `joined_at`, `source`, `referrer`, `notified` fields.
  - Endpoint: `src/app/api/waitlist/route.ts` (POST email, returns position).
  - Landing CTA flips from "Try Lumina" to "Join the waitlist" during the 2–4 week window.
  - Confirmation email via Resend or Postmark; "Lumina opens to you on {date}" notification when slots open.
  - Public-facing position counter ("You're #324 in line") — only show real numbers; never inflate.
  - At launch, waitlist members get the 50% first-month discount code automatically.
  - Acceptance: emails deliver with double opt-in; position counter is real; waitlist members are seeded into Polar with the discount code on launch day.

- [ ] **1.8 — Per-route metadata + OG images.**
  - Implement `generateMetadata()` per route for `/`, `/pricing`, `/about`, `/security`, `/sample-report/maya`, `/privacy`, `/terms`. Each emits its own title, description, OG image.
  - OG generation: `@vercel/og` invoked from a build-time `scripts/generate-og.ts` that loops over the route list. Output to `public/og/{slug}.png`. Don't do runtime OG until the route count justifies the latency budget.
  - Acceptance: every route shares with a unique OG card; sharing on Twitter/LinkedIn produces distinct unfurls.

- [ ] **1.9 — Sitemap + robots.**
  - Files: `src/app/sitemap.ts`, `src/app/robots.ts` (Next.js 16 App Router conventions).
  - Sitemap covers all public routes plus the sample report.
  - Robots: allow all on public routes; disallow `/api`, `/dashboard`, `/onboarding`, `/connections`, `/quiz`, `/session`, `/report`, `/evolution`, `/settings`, `/admin`.
  - Acceptance: `https://lumina/sitemap.xml` returns valid XML; Google Search Console accepts the submission.

- [ ] **1.10 — `noindex` on `(app)` routes.**
  - Add `metadata.robots = { index: false, follow: false }` to `src/app/(app)/layout.tsx` so every protected screen is not indexable.
  - Acceptance: a search for `site:lumina.app /dashboard` returns no results 30 days post-launch.

- [ ] **1.11 — Live chat with seeded quick replies.**
  - Crisp or Plain (cheaper than Intercom). Load deferred (after first interaction), only on marketing routes (suppress in `(app)` group). Quick replies: "How does the live session work?", "What data do you collect?", "What does it cost?", "Is this for me?" — each tied to a canned response that can hand off to a human.
  - Acceptance: TTI on `/` does not regress; suppressed on `(app)` routes; consent-aware (no chat widget loads if cookie consent not granted).

- [ ] **Phase 1 verification.**
  - Lighthouse Performance / Accessibility / Best Practices / SEO each ≥ 90 on `/`, `/pricing`, `/sample-report/maya`, `/security`, `/about`.
  - Manual privacy audit: a privacy-conscious user can complete signup, run the quiz, decline behavioral inference, and still get a useful report.
  - Manual checkout audit: Stripe/Polar production-mode end-to-end.

### Phase 2 — Content & SEO (start week 2 post-launch, runs continuously)

**Goal:** turn the highest-value AI-career queries into Lumina traffic.

- [ ] **2.1 — Blog at `/blog`.**
  - MDX under `src/content/blog/*.mdx`, rendered via `app/blog/[slug]/page.tsx`. Seed with 5 launch posts: "How Lumina builds confidence for every claim", "Why we built a real agent and not a chatbot for career discovery", "What we observe (and don't) in live sessions", "RIASEC + 31 dimensions: Lumina's psychometric model", "The agent decision log: see your career assessment reasoning live".
  - `BlogPosting` JSON-LD per post.
  - Acceptance: 5 posts shipped; each gets an OG card; `/blog` index renders; first impressions in Search Console within 14–28 days.

- [ ] **2.2 — `/help` (FAQ + how-to).**
  - 30+ entries across categories: Getting started, Connecting data, Quiz, Live session, Report, Privacy & data, Pricing, Mobile.
  - `FAQPage` JSON-LD on the page.
  - Acceptance: `/help` ranks for at least 5 long-tail "how to" queries within 60 days.

- [ ] **2.3 — `/changelog`.**
  - Source: MDX or `changelog.json`. Reverse-chronological. Surface in the in-app help menu so existing users see updates.
  - Acceptance: ship at least 6 months of meaningful entries on launch.

- [ ] **2.4 — `/status`.**
  - Embed BetterStack / Instatus / UpRobot. One health check against the Next.js app and one against the Gemini API path. This is critical for B2B prospects — they will check.
  - Acceptance: `/status` shows current state without waking up the dev.

- [ ] **2.5 — Persona landing pages.**
  - `/for-self-discovery`, `/for-career-pivots`, `/for-coaches`, `/for-schools`, `/for-hr-teams`. Each reuses the homepage scaffold but swaps hero copy, screenshots, testimonials, pricing emphasis, FAQ, and primary CTA.
  - Acceptance: each ranks for its primary keyword in title/H1/description; sitemap includes all five.

- [ ] **2.6 — Programmatic comparison pages.**
  - `/vs/{competitor}` — likely candidates: ChatGPT, NotebookLM, 16Personalities, Pymetrics, MyersBriggs, CareerExplorer, Yoodli. Templated MDX driven by a single `competitors.json`.
  - Editorial rule: never disparage; only state factual differences.
  - Each page emits `Article` + `Product` JSON-LD.
  - Acceptance: 5+ comparison pages live and indexed.

- [ ] **2.7 — Programmatic use-case pages.**
  - `/use-cases/{slug}` — e.g., "discovering your strengths from your Notion notes", "career pivot at 30", "choosing a major from your Drive", "team talent mapping for 5–20 person teams".
  - Each can include a 1-click "Start your assessment for this" deep-link.
  - Acceptance: 8+ use-case pages with distinct H1s and OG images.

- [ ] **2.8 — Career-tag programmatic pages.**
  - Career-discovery products win SEO via career-detail pages. Lumina has O*NET data wired (`src/lib/career/`). Generate `/careers/{slug}` for the top 200 careers in O*NET, each showing: career description, RIASEC profile match, top dimensions, and a "See your fit" CTA into Lumina.
  - This is potentially Lumina's largest organic acquisition channel — 200 indexable pages targeting "what is a {career}" and "is {career} right for me" searches.
  - Acceptance: 50+ career pages launch; sitemap auto-regenerates daily.

- [ ] **Phase 2 verification.**
  - Submit refreshed sitemap to Google Search Console + Bing.
  - Track new-route impressions weekly; expect first impressions within 2–4 weeks.
  - Quality bar: every templated page has ≥ 800 words of unique content (Google penalizes thin programmatic pages).

### Phase 3 — Activation, retention, and the share loop (months 2–4 post-launch)

**Goal:** turn signups into completed reports and completed reports into shares.

- [ ] **3.1 — Time-to-first-report instrumentation and reduction.**
  - Track every drop-off point: signup → onboarding → first connection → first quiz module → quiz completion → session consent → session complete → report generation → first report view.
  - For each drop-off > 30%, ship a fix (better default, better empty state, better progress indicator, better consent copy, etc.).
  - Acceptance: median time-to-first-report drops to < 30 minutes from current baseline; documented in `tasks/activation-funnel-2026-Q3.md`.

- [ ] **3.2 — "Share your report" privacy-preserving loop.**
  - Each completed report produces a sharable, anonymizable URL `/r/{slug}` where the user can choose (a) keep private, (b) share with a coach via signed link, (c) publish anonymously to the showcase. Publishing strips identifying details; signed share is per-recipient.
  - Each share generates a referral attribution event.
  - Acceptance: a user can share their report in two clicks; recipients can view without an account; published-anonymously reports populate Phase 3.3.

- [ ] **3.3 — Public showcase at `/showcase`.**
  - Curated grid of anonymized reports (with the user's consent), filterable by persona / career match / RIASEC code. Also indexable HTML (server-rendered with `Course`/`Article`-style JSON-LD).
  - This is Lumina's `/marketplace` analog — a live proof surface that grows automatically.
  - Acceptance: 20+ published reports at launch of the page; new ones appear daily.

- [ ] **3.4 — Referral / affiliate v1.**
  - Schema additions: `referral_codes(user_id, code unique, created_at)` collection in Firestore. Profile gains `referred_by` and `referral_code_used` fields.
  - Reward: 1 month of Pro on first qualified paid referral (define "qualified" = referred user pays at least once and clears the refund window).
  - Fraud controls (must ship with v1, not after): same-IP throttling, payment-method dedup, device fingerprint or equivalent (FingerprintJS or homegrown), per-referrer monthly cap, holding period before credit is spendable, chargeback clawback.
  - Acceptance: end-to-end test creates user A, A copies link, B signs up via link, an event row records signup, B upgrades, A receives credit after the holding period.

- [ ] **3.5 — Re-engagement loop.**
  - The Evolution feature already exists. Add an email trigger: 30/60/90 days post-report, send the user a "your evolution snapshot" email comparing then-vs-now from a fresh data corpus pull. This creates a reason to come back to a product that otherwise has a one-shot perceived value.
  - Acceptance: open rate > 35%, click-to-app rate > 15% on the 30-day snapshot email.

- [ ] **3.6 — In-app onboarding polish.**
  - Replace the existing onboarding (`src/app/(app)/onboarding/page.tsx`) with a single-screen consent + first-connection flow. Goal: from "Sign up" click to "first data source connected" in < 2 minutes.
  - Acceptance: tracked in 3.1's funnel.

### Phase 4 — B2B / persona expansion (months 4–6 post-launch)

**Goal:** unlock the B2B path that the multimodal-assessment category supports.

- [ ] **4.1 — `/for-coaches` deep build.**
  - Career coaches and counselors are the highest-leverage B2B persona for Lumina because they refer multiple clients and are themselves credibility-creating users. Build: a coach-specific signup, a coach dashboard showing their clients' (consented) reports, a co-branded shareable client report, a per-client billing flow.
  - Acceptance: ≥ 10 paying coaches within 60 days of launch.

- [ ] **4.2 — `/for-schools` and `/for-hr-teams`.**
  - Schools: career-services departments at universities and high schools (subject to 4.x age-gate decision). HR: talent assessment for hiring or internal mobility. Both require: SSO (Google Workspace + Microsoft), org-level dashboards, bulk seat management, DPA on file.
  - Acceptance: at least one design partner on each surface before broad launch.

- [ ] **4.3 — Compliance posture upgrade.**
  - SOC 2 Type 1 path started by month 4. GDPR DPA template published. Sub-processors page on `/security`.
  - Acceptance: enough on `/security` that a Series A-stage HR procurement reviewer signs without back-and-forth.

- [ ] **4.4 — API surface for coaches and integrations.**
  - Read-only API for coaches who want to embed reports into their own dashboards. Export endpoints already exist (`/api/user/export-data`); build on them.
  - Acceptance: published `/api-docs` page; first integration partner ships.

### Phase 5 — Defensibility moat (continuous)

**Goal:** make sure "Why not just use ChatGPT?" has a clear, public answer.

- [ ] **5.1 — Public agent benchmark dashboard.**
  - The product already has `/api/eval/benchmark` and `/api/eval/bias`. Surface the results publicly at `/lab/benchmarks` showing how Lumina's report agent compares to single-prompt baselines on calibration, hallucination rate, evidence citation rate, and bias metrics.
  - This is the single asset most likely to convert sophisticated AI-skeptical visitors. It is also a real engineering investment, not marketing copy.
  - Acceptance: dashboard is live, methodology page explains the eval setup, results refresh monthly.

- [ ] **5.2 — Live agent decision log on the homepage.**
  - Embed an interactive "Watch a Lumina agent reason" widget on the landing page that streams a real (or pre-recorded) decision sequence: confidence evaluation → data gap detection → next-action recommendation → user override option.
  - Acceptance: widget loads without auth; doesn't leak any real user data; demonstrates the orchestrator's mechanic in under 60 seconds.

- [ ] **5.3 — Open methodology page.**
  - `/methodology` describing the 31 dimensions, the RIASEC + custom dimension model, the confidence engine math, the source-diversity multipliers, the freshness weighting, the report-agent loop. Cite the academic literature (Holland Codes, Big Five). This is a trust artifact for the assessment-skeptical audience.
  - Acceptance: a graduate student in I/O psychology can read `/methodology` and not find a claim that's wrong or misleading.

---

## 6. Cross-cutting hardening

These apply across all phases.

- [ ] **i18n on the launch surface.** Lumina is single-language. Career discovery has global appeal. Plan: en first, then es / fr / de / pt-BR for Phase 2. Every new copy lands in all locales before merge.
- [ ] **CI gates.** `lint`, `typecheck`, `test` (when tests exist), Lighthouse PR check (Performance/A11y/SEO ≥ 90), sitemap-validation check, OG-image-presence check, route-meta-completeness check (every route in `src/app/` has `generateMetadata`).
- [ ] **Observability.** Sentry on the Next.js + API + Firestore side. Per-route latency budgets in Vercel.
- [ ] **CSP nonces, not `'unsafe-inline'`.** Set up nonce-based CSP via Next.js middleware. Critical because the consent page must be unforgeable.
- [ ] **Cookie consent banner that actually controls third-party loading.** Live chat, analytics, OG generators all gated behind consent. Default-no in the EU.
- [ ] **Data-export and data-delete UX.** The endpoints exist (`/api/user/export-data`, `/api/user/delete-data`). The user-facing flow needs polish — both should be visible from `/settings` with one-click confirmation.

---

## 7. Verification & ship rules

- Phase 0 must close before public launch. No exceptions; the legal and billing items are real.
- Every PR runs `npm run lint && npm run typecheck && npm run build`.
- Every phase ships behind a feature flag where the change is non-cosmetic.
- Lighthouse on `/`, `/pricing`, `/security`, `/sample-report/*`, `/about` must hold ≥ 90 on Performance / Accessibility / Best Practices / SEO.
- Every public-surface change passes a privacy review: does the change increase or decrease the user's understanding of what Lumina sees and does not see?
- No fake proof, fake scarcity, fake testimonials, fake partner claims, ever.

---

## 8. Out of scope (intentional)

- Mobile apps (web-first per `README.md`).
- Multi-language support beyond launch language until Phase 2.
- Real-time collaboration on reports (Phase 4+ if at all).
- Multi-tenant org features beyond seat management (Phase 4 only if a B2B design partner asks).

---

## 9. Operator decisions (locked 2026-04-29)

All Phase 0 inputs answered. Engineering work is unblocked.

1. **Monetization** — Paid-subscription only. No free tier. First-month discount of 30% or 50% as the only entry incentive (operator can A/B). Memo: `tasks/monetization-decision.md`.
2. **Age gate** — 18+ at launch. Revisit 16+ after legal review as a Phase 4 expansion. Memo: `tasks/age-gate-decision.md`.
3. **Founder visibility** — Option C: named once on `/about` with bio + photo + LinkedIn; blog bylined "by the Lumina team" until there are multiple authors.
4. **Billing provider** — Polar SH (matches LearnSelf portfolio).
5. **Launch sequencing** — 2–4 week waitlist while Phase 0 ships; public launch coincides with Phase 1.
6. **Pre-launch users** — None. No baseline available; analytics start fresh from waitlist phase.

These answers are reflected throughout the plan above. The live implementation tracker is `plan.md` at the repo root.
