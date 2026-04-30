/**
 * Lumina pricing tiers — single source of truth.
 *
 * Operator-locked decisions (see `tasks/monetization-decision.md`):
 *   • Paid-subscription only. NO free tier.
 *   • First-month discount applied via Polar discount codes (LUMINA30, LUMINA50).
 *   • Refund policy: 7 days on first month, no questions asked.
 *
 * Pricing is credit-based. 1 credit = $0.01 of estimated Gemini spend, computed
 * by `estimateCostUsd` in `src/lib/gemini/byok.ts`. Tiers grant a monthly credit
 * pool plus feature gates; AI usage debits the pool. See
 * `src/lib/pricing/credits.ts` for per-operation costs.
 *
 * Every CTA in the codebase MUST resolve a price/tier through this module.
 * Do not hardcode prices anywhere else.
 */

export type PlanId = "STARTER" | "PRO" | "PRO_PLUS";
export type BillingInterval = "monthly" | "yearly";

export interface PricingTier {
  /** Stable identifier referenced by the billing layer. */
  id: PlanId;
  /** Display name for marketing surfaces. */
  name: string;
  /** Short positioning sentence rendered under the name. */
  tagline: string;
  /** Monthly billed price in USD. */
  monthlyPriceUsd: number;
  /** Yearly billed price in USD (annual upfront). */
  yearlyPriceUsd: number;
  /** Whether this tier is highlighted as the recommended choice. */
  highlighted: boolean;
  /** Polar product/price IDs — wired in `src/lib/billing/polar.ts`. */
  polar: {
    monthlyPriceId: string | null;
    yearlyPriceId: string | null;
  };
  /** Feature copy rendered on `/pricing`. */
  features: readonly string[];
  /** Entitlement gates checked in `(app)/layout.tsx` and protected routes. */
  entitlements: {
    /** Monthly AI credit pool. 1 credit = $0.01 of estimated Gemini spend. */
    monthlyCredits: number;
    /** How many months of unused credits roll forward. 0 = use-it-or-lose-it. */
    creditRolloverMonths: number;
    /** Live-session minute cap per session. */
    liveSessionMinutesCap: number;
    /** Live sessions allowed per month. -1 = unlimited. */
    liveSessionsPerMonth: number;
    /** Number of distinct data sources the user can connect simultaneously. */
    maxConnectedSources: number;
    fullCorpus: boolean;
    allQuizModules: boolean;
    fullReport: boolean;
    crossSourceCorrelator: boolean;
    monthlyEvolutionSnapshot: boolean;
    quarterlyDeepReassessment: boolean;
    coachExportPdf: boolean;
    coachClientProfiles: number;
    prioritySessionScheduling: boolean;
    apiReadAccess: boolean;
    referralCreditsPerReferral: number;
  };
}

/**
 * Cost basis (computed against `MODEL_COST_MULTIPLIER` and pricing constants
 * in `src/lib/gemini/byok.ts`). All costs are estimated; the platform tracks
 * actual spend per-user per-month and reconciles credits against it.
 *
 *   Full assessment        ≈ 50 credits  ($0.50 of AI spend)
 *   Monthly snapshot       ≈ 8 credits   ($0.08)
 *   Live session (15 min)  ≈ 22 credits  ($0.22)
 *   Live session (30 min)  ≈ 42 credits  ($0.42)
 *   Quarterly re-assess    ≈ 65 credits  ($0.65)
 *
 * Tier credit pools are sized so the modal user fits comfortably with headroom
 * for re-runs. STARTER covers one assessment + snapshot; PRO covers a full
 * assessment + multiple sessions + correlator runs; PRO_PLUS covers coach-mode
 * with multiple client profiles.
 */
export const PRICING_TIERS = {
  STARTER: {
    id: "STARTER",
    name: "Lumina Starter",
    tagline: "Run a complete assessment and keep your evolution snapshot.",
    monthlyPriceUsd: 9,
    yearlyPriceUsd: 89,
    highlighted: false,
    polar: {
      monthlyPriceId: process.env.POLAR_STARTER_MONTHLY_PRICE_ID ?? null,
      yearlyPriceId: process.env.POLAR_STARTER_YEARLY_PRICE_ID ?? null,
    },
    features: [
      "75 AI credits per month",
      "All 5 adaptive quiz modules (31 dimensions)",
      "1 live AI session per month, up to 15 minutes",
      "Full talent report with agent decision log",
      "Monthly evolution snapshot",
      "Connect Gmail, Drive, Notion, ChatGPT exports, files",
      "1 referral credit per qualified referral",
    ],
    entitlements: {
      monthlyCredits: 75,
      creditRolloverMonths: 0,
      liveSessionMinutesCap: 15,
      liveSessionsPerMonth: 1,
      maxConnectedSources: 5,
      fullCorpus: true,
      allQuizModules: true,
      fullReport: true,
      crossSourceCorrelator: false,
      monthlyEvolutionSnapshot: true,
      quarterlyDeepReassessment: false,
      coachExportPdf: false,
      coachClientProfiles: 0,
      prioritySessionScheduling: false,
      apiReadAccess: false,
      referralCreditsPerReferral: 1,
    },
  },
  PRO: {
    id: "PRO",
    name: "Lumina Pro",
    tagline: "Full assessment, deep correlations, and re-runs as your data grows.",
    monthlyPriceUsd: 19,
    yearlyPriceUsd: 179,
    highlighted: true,
    polar: {
      monthlyPriceId: process.env.POLAR_PRO_MONTHLY_PRICE_ID ?? null,
      yearlyPriceId: process.env.POLAR_PRO_YEARLY_PRICE_ID ?? null,
    },
    features: [
      "250 AI credits per month (rolls over 1 month)",
      "Everything in Starter",
      "Up to 3 live sessions per month, 30 minutes each",
      "Cross-source evidence correlator",
      "Quarterly deep re-assessment included",
      "Coach-shareable PDF report",
      "Share-your-report (privacy-preserving) link",
      "Priority session scheduling",
      "2 referral credits per qualified referral",
    ],
    entitlements: {
      monthlyCredits: 250,
      creditRolloverMonths: 1,
      liveSessionMinutesCap: 30,
      liveSessionsPerMonth: 3,
      maxConnectedSources: 10,
      fullCorpus: true,
      allQuizModules: true,
      fullReport: true,
      crossSourceCorrelator: true,
      monthlyEvolutionSnapshot: true,
      quarterlyDeepReassessment: true,
      coachExportPdf: true,
      coachClientProfiles: 0,
      prioritySessionScheduling: true,
      apiReadAccess: false,
      referralCreditsPerReferral: 2,
    },
  },
  PRO_PLUS: {
    id: "PRO_PLUS",
    name: "Lumina Pro+",
    tagline: "For coaches, advisors, and people in active career transition.",
    monthlyPriceUsd: 39,
    yearlyPriceUsd: 369,
    highlighted: false,
    polar: {
      monthlyPriceId: process.env.POLAR_PRO_PLUS_MONTHLY_PRICE_ID ?? null,
      yearlyPriceId: process.env.POLAR_PRO_PLUS_YEARLY_PRICE_ID ?? null,
    },
    features: [
      "600 AI credits per month (rolls over 3 months)",
      "Everything in Pro",
      "Unlimited live sessions, up to 45 minutes each",
      "Coach mode — manage up to 5 client profiles",
      "Read-only API access for your own data",
      "Expanded action plan with weekly micro-challenges",
      "Priority support (24h response SLA)",
      "3 referral credits per qualified referral",
    ],
    entitlements: {
      monthlyCredits: 600,
      creditRolloverMonths: 3,
      liveSessionMinutesCap: 45,
      liveSessionsPerMonth: -1,
      maxConnectedSources: 20,
      fullCorpus: true,
      allQuizModules: true,
      fullReport: true,
      crossSourceCorrelator: true,
      monthlyEvolutionSnapshot: true,
      quarterlyDeepReassessment: true,
      coachExportPdf: true,
      coachClientProfiles: 5,
      prioritySessionScheduling: true,
      apiReadAccess: true,
      referralCreditsPerReferral: 3,
    },
  },
} as const satisfies Record<PlanId, PricingTier>;

export type PricingTierKey = keyof typeof PRICING_TIERS;

export const PLAN_ORDER: readonly PlanId[] = ["STARTER", "PRO", "PRO_PLUS"];

/**
 * Yearly savings vs monthly billed for 12 months, rendered on `/pricing`.
 */
export function yearlySavingsUsd(plan: PlanId): number {
  const tier = PRICING_TIERS[plan];
  return tier.monthlyPriceUsd * 12 - tier.yearlyPriceUsd;
}

/**
 * Effective monthly price when billed yearly — used to display "$X/mo billed annually".
 */
export function effectiveMonthlyWhenYearly(plan: PlanId): number {
  return Math.round((PRICING_TIERS[plan].yearlyPriceUsd / 12) * 100) / 100;
}

/**
 * Percent saved when billing yearly vs monthly. Rounded to nearest integer.
 */
export function yearlySavingsPercent(plan: PlanId): number {
  const tier = PRICING_TIERS[plan];
  return Math.round((1 - tier.yearlyPriceUsd / (tier.monthlyPriceUsd * 12)) * 100);
}

/**
 * Monthly credit pool for a plan, expressed as the rough USD value the user
 * gets back in AI work — used for the "$X of AI included" line on /pricing.
 */
export function creditPoolValueUsd(plan: PlanId): number {
  return Math.round(PRICING_TIERS[plan].entitlements.monthlyCredits) / 100;
}

/**
 * Discount codes are owned by Polar; the codebase only knows the codes by name
 * so the operator can A/B without code changes.
 */
export const DISCOUNT_CODES = {
  FIRST_MONTH_30_OFF: "LUMINA30",
  FIRST_MONTH_50_OFF: "LUMINA50",
} as const;
