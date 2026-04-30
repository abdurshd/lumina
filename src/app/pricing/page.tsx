import type { Metadata } from "next";
import Link from "next/link";
import { Coins, Shield, RefreshCw } from "lucide-react";
import { PricingTierGrid } from "./pricing-tier-grid";
import {
  CREDIT_OPERATIONS,
  fullAssessmentBudgetCredits,
} from "@/lib/pricing/credits";
import { PRICING_TIERS } from "@/lib/pricing/tiers";

export const metadata: Metadata = {
  title: "Pricing — Lumina",
  description:
    "Three credit-based plans. Pay for the AI work you use, with feature gates that match how seriously you are running your career discovery. Refund window on the first month, cancel anytime.",
  openGraph: {
    title: "Pricing — Lumina",
    description:
      "Three credit-based plans. Pay for the AI work you use, with feature gates that match how seriously you are running your career discovery.",
    type: "website",
  },
};

const FAQ: Array<{ q: string; a: string }> = [
  {
    q: "What is a credit?",
    a: "One credit equals roughly $0.01 of estimated Gemini AI work. Every operation — running the corpus analyzer, generating a quiz module, holding a live session, building your report — debits credits from your monthly pool. We track real token usage, so you only pay for what you actually run.",
  },
  {
    q: "What happens if I run out of credits?",
    a: "Your tier features keep working but credit-bound operations pause until your next billing cycle (or you upgrade). You will not be billed unexpectedly. We will surface a top-up flow at that point — for now, upgrading the tier is the way to add headroom.",
  },
  {
    q: "Do credits roll over?",
    a: "Starter is use-it-or-lose-it. Pro rolls over one month of unused credits. Pro+ rolls over up to three months. The rolling window is a soft cap — credits beyond the window are dropped to keep accounting simple.",
  },
  {
    q: "Why is there no free tier?",
    a: "A full Lumina assessment runs through agentic orchestration, multimodal Gemini calls, and a self-correcting report loop. Per-user cost is meaningful, and the audience that actually benefits is the one willing to invest in the answer. See our /security and /methodology pages to evaluate before paying.",
  },
  {
    q: "What is the refund policy?",
    a: "Seven days on the first month, no questions asked. After that, no refunds, but you can cancel anytime — your subscription stops at the next billing cycle and your data stays accessible until the end of the period you paid for.",
  },
  {
    q: "Can I bring my own Gemini API key?",
    a: "Yes. With BYOK active, your inference is routed through your key instead of ours, and your monthly credit pool tracks your platform usage rather than the AI cost. This is required for some enterprise deployments and supported on every tier.",
  },
];

const HEADLINE_OPS = [
  "data_analysis",
  "quiz_module",
  "live_session_per_minute",
  "cross_source_correlator",
  "report_full",
  "evolution_snapshot",
] as const;

export default function PricingPage() {
  const assessmentBudget = fullAssessmentBudgetCredits();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <Link
          href="/"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          &larr; Back to Lumina
        </Link>

        <header className="mt-8 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <Coins className="h-3 w-3" />
            Credit-based pricing
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl">
            You pay for the AI work you actually use.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            Every plan grants a monthly credit pool. Operations debit credits
            from the pool at their real cost — running the corpus analyzer,
            taking the quiz, holding a live session, generating your report.
            Credits are visible in your dashboard. No surprise bills.
          </p>
        </header>

        <PricingTierGrid />

        {/* What credits buy */}
        <section className="mt-24">
          <h2 className="text-2xl font-semibold">What credits buy</h2>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground">
            Each operation has a budgeted cost — the actual debit is computed
            from real token usage. A full first-time assessment fits in roughly{" "}
            <span className="font-mono text-foreground">
              {assessmentBudget} credits
            </span>
            . Re-runs and ongoing snapshots are much smaller.
          </p>

          <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full">
              <thead className="bg-background/40">
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Operation</th>
                  <th className="px-4 py-3 font-medium">Budget</th>
                  <th className="px-4 py-3 font-medium">What you get</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {HEADLINE_OPS.map((key) => {
                  const op = CREDIT_OPERATIONS[key];
                  return (
                    <tr key={op.id}>
                      <td className="px-4 py-4 align-top text-sm font-medium text-foreground">
                        {op.label}
                      </td>
                      <td className="px-4 py-4 align-top">
                        <span className="font-mono text-sm text-foreground">
                          {op.estimatedCredits}
                        </span>
                        <span className="ml-1 text-xs text-muted-foreground">
                          credits
                        </span>
                      </td>
                      <td className="px-4 py-4 align-top text-sm leading-relaxed text-muted-foreground">
                        {op.description}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Promises */}
        <section className="mt-24 grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-6">
            <Shield className="mb-3 h-5 w-5 text-primary" />
            <h3 className="text-base font-semibold">No data sold, no ads</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Our revenue is your subscription. Period. We do not sell signals
              to third parties or run advertising on your data. See our{" "}
              <Link
                href="/security"
                className="text-foreground underline-offset-4 hover:underline"
              >
                security posture
              </Link>{" "}
              for the technical enforcement.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <RefreshCw className="mb-3 h-5 w-5 text-primary" />
            <h3 className="text-base font-semibold">Cancel anytime</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Subscription stops at the next renewal. Your report stays
              accessible until the end of the period you paid for, and you can
              export everything at any moment.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <Coins className="mb-3 h-5 w-5 text-primary" />
            <h3 className="text-base font-semibold">Credits, not charges</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              You will never be billed for AI usage beyond your subscription.
              If you exhaust your credits, operations pause until the next
              cycle — no overage, no surprise.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-24">
          <h2 className="text-2xl font-semibold">Frequently asked</h2>
          <dl className="mt-6 space-y-6">
            {FAQ.map(({ q, a }) => (
              <div
                key={q}
                className="rounded-xl border border-border bg-card p-6"
              >
                <dt className="text-base font-semibold text-foreground">
                  {q}
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {a}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-24 rounded-2xl border border-border bg-card p-8 text-center md:p-12">
          <h2 className="text-2xl font-semibold">
            Ready to map what you should be doing?
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Most users finish their first assessment in under 30 minutes and
            get the full report immediately after.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href={`/api/billing/checkout?plan=${PRICING_TIERS.PRO.id}&interval=monthly`}
              className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Start with {PRICING_TIERS.PRO.name.replace("Lumina ", "")}
            </Link>
            <Link
              href="/security"
              className="inline-flex items-center justify-center rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-foreground hover:bg-card"
            >
              Read security &amp; privacy first
            </Link>
          </div>
        </section>

        <section className="mt-16 border-t border-border pt-8">
          <p className="text-sm text-muted-foreground">
            Related:{" "}
            <Link
              href="/security"
              className="text-foreground underline-offset-4 hover:underline"
            >
              Security &amp; Privacy
            </Link>
            {" · "}
            <Link
              href="/about"
              className="text-foreground underline-offset-4 hover:underline"
            >
              About
            </Link>
            {" · "}
            <Link
              href="/changelog"
              className="text-foreground underline-offset-4 hover:underline"
            >
              Changelog
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
