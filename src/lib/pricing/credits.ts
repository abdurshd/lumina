/**
 * Credit cost estimates for each AI operation Lumina runs.
 *
 * 1 credit = $0.01 of estimated Gemini spend (rounded up). The actual debit
 * is computed from real token counts via `estimateCostUsd` in
 * `src/lib/gemini/byok.ts`; the values here are the *budgeted* averages
 * used to size tier credit pools and for marketing copy on `/pricing`.
 *
 * Cost basis: pricing constants in `byok.ts` —
 *   Flash       1×   $0.40/M input, $1.20/M output
 *   Pro         4×   $1.60/M input, $4.80/M output
 *   Live audio  2.5× $1.00/M input, $3.00/M output
 *
 * If you change a model or prompt size in a way that materially changes the
 * underlying cost, update both this file and the credit pools in `tiers.ts`.
 */

export interface CreditOperation {
  /** Internal identifier — matches the `feature` string in `trackGeminiUsage`. */
  id: string;
  /** Display label for marketing/dashboard surfaces. */
  label: string;
  /** Budgeted credit cost. Real debit is computed from actual token usage. */
  estimatedCredits: number;
  /** One-line description for the /pricing "what credits buy" table. */
  description: string;
}

export const CREDIT_OPERATIONS = {
  data_analysis: {
    id: "agent_data_analysis",
    label: "Connected-source analysis",
    estimatedCredits: 3,
    description:
      "Run the corpus analyzer over one connected data source (Gmail, Drive, Notion, ChatGPT export, or file upload).",
  },
  quiz_module: {
    id: "quiz_module",
    label: "Adaptive quiz module",
    estimatedCredits: 2,
    description:
      "Generate adaptive questions for one quiz module and score the responses against the dimension framework.",
  },
  live_session_per_minute: {
    id: "live_session",
    label: "Live AI session (per minute)",
    estimatedCredits: 2,
    description:
      "Multimodal live session with the AI counselor — voice, behavior signals, and adaptive follow-ups.",
  },
  cross_source_correlator: {
    id: "agent_correlation",
    label: "Cross-source correlator",
    estimatedCredits: 3,
    description:
      "Find patterns that no single source reveals — convergent, divergent, and hidden-talent insights across data, quiz, and session.",
  },
  report_full: {
    id: "report_full",
    label: "Full talent report (5-step agent)",
    estimatedCredits: 18,
    description:
      "Self-correcting report agent: generate draft → critique → identify weak sections → refine → validate.",
  },
  evolution_snapshot: {
    id: "evolution_snapshot",
    label: "Evolution snapshot",
    estimatedCredits: 8,
    description:
      "Monthly delta report comparing your current profile to last month — what shifted, what is steady, what is emerging.",
  },
  quarterly_reassessment: {
    id: "quarterly_reassessment",
    label: "Quarterly deep re-assessment",
    estimatedCredits: 65,
    description:
      "Full corpus + new live session + new report, with a longitudinal comparison against your previous report.",
  },
} as const satisfies Record<string, CreditOperation>;

export type CreditOperationKey = keyof typeof CREDIT_OPERATIONS;

/**
 * Convert an estimated USD spend into credits (rounded up so a partial
 * fraction-of-a-cent operation still counts as one credit). Used by the
 * usage-tracking layer to debit a user's monthly pool.
 */
export function usdToCredits(usd: number): number {
  if (usd <= 0) return 0;
  return Math.ceil(usd * 100);
}

/**
 * Convert credits back to dollars — used for the "$X.YZ of AI included" line
 * on `/pricing` and the user-facing credit balance display.
 */
export function creditsToUsd(credits: number): number {
  return Math.round(credits) / 100;
}

/**
 * Budgeted credit cost for a full first-time assessment (data analysis on 3
 * sources + 5 quiz modules + 18-minute live session + correlator + full
 * report). Rendered on `/pricing` so users can sanity-check tier sizing.
 */
export function fullAssessmentBudgetCredits(): number {
  return (
    CREDIT_OPERATIONS.data_analysis.estimatedCredits * 3 +
    CREDIT_OPERATIONS.quiz_module.estimatedCredits * 5 +
    CREDIT_OPERATIONS.live_session_per_minute.estimatedCredits * 18 +
    CREDIT_OPERATIONS.cross_source_correlator.estimatedCredits +
    CREDIT_OPERATIONS.report_full.estimatedCredits
  );
}
