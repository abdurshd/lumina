# Lumina — Monetization Decision

**Date:** 2026-04-29
**Status:** LOCKED
**Owner:** Operator

---

## Decision

**Paid-subscription only.** No free tier. No freemium. No free credits.

The only entry incentives are time-bound discounts on the first month: 30% off, or 50% off. The operator can A/B between the two using Polar discount codes; the codebase does not need to know which is active.

## Why this model and not freemium

The conventional consumer-AI playbook is freemium: free tier captures a wide top-of-funnel, paid tier converts the engaged subset. Lumina deliberately rejects this because:

1. **The product is high-investment to deliver.** A full Lumina assessment runs through agentic orchestration, multimodal Gemini calls (Flash + Pro + Live Audio), corpus analysis across connected accounts, and a self-correcting report loop. Per-user cost is non-trivial. A free tier dilutes economics.
2. **The signal a free user produces is misleading.** A user who would never pay also has no incentive to connect their Gmail / Drive / Notion or sit through a 10-minute live session. Their behavior is not predictive of the paid user's behavior, so the funnel data is noisy.
3. **The audience is high-intent by definition.** People who actively want career discovery — not entertainment — self-select into paying. The segment that would only use Lumina if free is the same segment that would not act on the report.
4. **The competitive moat is qualitative, not breadth-based.** Lumina wins by having the deepest, best-evidenced assessment; not by having the most users. A smaller paid base with high engagement is the right shape.

## Tier sketch (subject to refinement during 0.3)

The tier system encodes in `src/lib/pricing/tiers.ts`. Initial sketch — refine when wiring Polar:

| Tier | Price | Includes |
|---|---|---|
| **Lumina Pro** | $19 / month or $179 / year (~22% off) | Full corpus integration, all five quiz modules, full live session, full report with agent decision log, monthly evolution snapshot, share-your-report loop, 1 referral credit per qualified referral |
| **Lumina Pro+** (optional, can defer) | $39 / month or $369 / year | Everything in Pro plus quarterly deep re-assessment, priority live-session scheduling, expanded action plan, coach-export PDF |

Single-tier launch is acceptable. Two-tier is preferable because it lets the higher-intent buyer self-segment.

**Discount mechanics:**
- `LUMINA50` — 50% off first month, capped to N redemptions (waitlist priority codes)
- `LUMINA30` — 30% off first month, broader distribution
- Both are Polar discount codes. The codebase does not hardcode either; it reads `?discount=` from the checkout URL and passes through to Polar.

**Refund policy:** 7-day refund on the first month, no questions asked. After that, no refunds; cancel-anytime stops the next renewal. This protects against churn complaints while keeping the model defensible.

## Implications for the rest of the plan

- **Every CTA on the public surface routes to checkout, not to a "free signup."** "Get Started Free" is removed from the lexicon; replaced with "Start your assessment" → checkout.
- **Pre-purchase evaluation surface becomes critical.** The user must be able to evaluate before paying, since there is no try-before-you-buy. The three pre-purchase assets are:
  - `/sample-report/maya` (the canonical anonymized example report with full agent decision log visible)
  - `/security` (so a privacy-conscious user trusts the data path)
  - `/methodology` (so an assessment-skeptical user trusts the science)
- **Onboarding must be tight.** A paying user who fails activation costs money. Time-to-first-report budget: < 30 minutes from checkout to "I have my report and it feels worth $19."
- **Retention loop matters more than freemium products.** The 30 / 60 / 90-day Evolution snapshot email is not a nice-to-have; it is the entire reason a user pays month two.

## What we are *not* doing

- No "free tier with limits" disguised as freemium.
- No "free quiz only, paywall the report" — every comparable that does this gets a one-star review for "felt baited." Lumina takes payment upfront and delivers the full thing.
- No lifetime deal. (Lifetime deals are anti-retention; a subscription product with a strong evolution loop should not sell its own future revenue.)

## Acceptance for closing 0.1

- [ ] `src/lib/pricing/tiers.ts` defines the tiers as a typed const.
- [ ] Every CTA in the codebase points at `/pricing` or directly at Polar checkout via the same constant.
- [ ] No copy anywhere in the repo uses "free trial," "free tier," "free forever," or implies a no-cost path beyond the discounted first month.

## Revisit triggers

This decision is not permanent. Revisit if any of the following becomes true:

- 90 days post-launch and waitlist-to-paid conversion is < 5% (paid-only model is misfit; need to diagnose).
- A clear B2B path emerges with seat-based pricing that requires a free-self-serve trial for evaluators.
- A direct comparable launches at a meaningfully lower price point and pulls share.
