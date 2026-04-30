import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  Activity,
  ShieldQuestion,
  GitCompare,
  AlertTriangle,
  BookOpen,
} from "lucide-react";
import { runBenchmarkSuite } from "@/lib/eval/benchmark-runner";

export const metadata: Metadata = {
  title: "Public benchmarks — Lumina Lab",
  description:
    "Live regression metrics for the Lumina profile builder against synthetic talent profiles, plus the standing bias-audit posture. Re-run on every page load — no cherry-picking.",
  openGraph: {
    title: "Public benchmarks — Lumina Lab",
    description:
      "Live regression metrics for the Lumina profile builder against synthetic talent profiles, plus the standing bias-audit posture.",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 font-mono text-3xl font-bold tracking-tight text-foreground">
        {value}
      </p>
      {hint && (
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}

export default function LabBenchmarksPage() {
  const result = runBenchmarkSuite();
  const { profiles, summary, regressionDetected } = result;
  const passing = summary.passing;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <Link
          href="/"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          &larr; Back to Lumina
        </Link>

        <header className="mt-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <Activity className="h-3 w-3" />
            Lumina Lab — Public benchmarks
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl">
            Live metrics. Recomputed every time you load this page.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">
            The profile builder benchmark below runs against a fixed set of
            synthetic profiles and recomputes accuracy, cluster overlap, and
            stability on every request. No cached results, no cherry-picking —
            if we regress, you see it.
          </p>
        </header>

        {/* Headline status */}
        <section className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div
            className={`rounded-xl border p-5 ${
              passing
                ? "border-emerald-500/30 bg-emerald-500/5"
                : "border-rose-500/30 bg-rose-500/5"
            }`}
          >
            <div className="flex items-center gap-2">
              {passing ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              ) : (
                <XCircle className="h-5 w-5 text-rose-500" />
              )}
              <p
                className={`text-sm font-semibold ${
                  passing
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {passing ? "All passing" : "Failing"}
              </p>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Threshold: ≥70% RIASEC accuracy and ≥30% cluster overlap.
            </p>
          </div>

          <MetricCard
            label="RIASEC accuracy"
            value={formatPercent(summary.avgRiasecAccuracy)}
            hint={`Average across ${summary.profileCount} synthetic profiles.`}
          />
          <MetricCard
            label="Cluster overlap"
            value={formatPercent(summary.avgClusterOverlap)}
            hint="Top-3 O*NET cluster recommendations vs. expected set."
          />
          <MetricCard
            label="Stability"
            value={formatPercent(summary.stability)}
            hint="Same input → same RIASEC code, run 5×."
          />
        </section>

        {regressionDetected && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
            <div>
              <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                Regression detected
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                A current metric has dropped more than 5% below the
                last-known-good baseline. Engineering is investigating —
                deployments to production are gated until this clears.
              </p>
            </div>
          </div>
        )}

        {/* Per-profile table */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold">Synthetic-profile results</h2>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground">
            Each row is a deterministic synthetic profile with known expected
            outcomes. Source data:{" "}
            <code className="rounded bg-card px-1.5 py-0.5 font-mono text-xs">
              src/lib/eval/synthetic-profiles.ts
            </code>
            .
          </p>

          <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full">
              <thead className="bg-overlay-subtle">
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Profile</th>
                  <th className="px-4 py-3 font-medium">Computed</th>
                  <th className="px-4 py-3 font-medium">Expected</th>
                  <th className="px-4 py-3 text-right font-medium">RIASEC accuracy</th>
                  <th className="px-4 py-3 text-right font-medium">Cluster overlap</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {profiles.map((p) => {
                  const exact = p.computedRiasec === p.expectedRiasec;
                  return (
                    <tr key={p.id}>
                      <td className="px-4 py-3 align-top">
                        <p className="text-sm font-medium text-foreground">
                          {p.name}
                        </p>
                        <p className="font-mono text-[10px] text-muted-foreground">
                          {p.id}
                        </p>
                      </td>
                      <td className="px-4 py-3 align-top font-mono text-sm text-foreground">
                        {p.computedRiasec}
                      </td>
                      <td className="px-4 py-3 align-top font-mono text-sm text-muted-foreground">
                        {p.expectedRiasec}
                      </td>
                      <td className="px-4 py-3 text-right align-top">
                        <span
                          className={`font-mono text-sm ${
                            exact
                              ? "text-emerald-600 dark:text-emerald-400"
                              : p.riasecAcc >= 0.5
                                ? "text-foreground"
                                : "text-rose-500"
                          }`}
                        >
                          {formatPercent(p.riasecAcc)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right align-top font-mono text-sm text-foreground">
                        {formatPercent(p.clusterOverlap)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* What it tests */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold">What this benchmark tests</h2>
          <ul className="mt-6 space-y-4 text-sm leading-relaxed text-foreground">
            <li className="flex gap-3">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>
                <strong>RIASEC accuracy</strong> — given quiz dimension scores,
                does the profile builder produce the expected three-letter
                Holland code? Partial-match is awarded for shared letters.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>
                <strong>Cluster overlap</strong> — do the top-3 recommended
                O*NET career clusters intersect the expected cluster set? This
                catches RIASEC codes that look right but recommend the wrong
                careers.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>
                <strong>Stability</strong> — running the same input five times
                must return the same RIASEC code. Anything below 100% means
                non-determinism slipped in somewhere.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>
                <strong>Regression detection</strong> — accuracy that drops
                more than 5% below the last-known-good baseline triggers a
                gating warning above. Production deploys do not ship while a
                regression is open.
              </span>
            </li>
          </ul>
        </section>

        {/* Bias audit */}
        <section className="mt-16">
          <div className="flex items-center gap-2">
            <ShieldQuestion className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-semibold">Bias audit</h2>
          </div>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground">
            The bias audit generates two talent reports for paired profiles
            with{" "}
            <em>identical scores but different names</em>, then measures
            divergence across career recommendations, top strengths, and the
            radar profile. A passing audit keeps average overall bias under
            15% (the lower the better).
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2">
                <GitCompare className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold text-foreground">
                  Career divergence
                </p>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Jaccard distance between recommended career sets, paired by
                identical inputs and differing names.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2">
                <GitCompare className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold text-foreground">
                  Strength divergence
                </p>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Jaccard distance between named top-strengths sets across each
                pair.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2">
                <GitCompare className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold text-foreground">
                  Radar divergence
                </p>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Per-axis L1 distance between radar dimension scores,
                normalized by axis count.
              </p>
            </div>
          </div>

          <p className="mt-6 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            The bias audit calls Gemini, so it does not run on every page
            load. Results from the latest scheduled run will appear here once
            the audit pipeline is deployed; in the meantime, the
            implementation lives at{" "}
            <code className="rounded bg-card px-1.5 py-0.5 font-mono text-xs">
              src/lib/eval/bias-runner.ts
            </code>
            .
          </p>
        </section>

        {/* References */}
        <section className="mt-16 rounded-2xl border border-border bg-card p-8">
          <div className="flex items-start gap-3">
            <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <h2 className="text-lg font-semibold">
                For the curious, the math
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                The frameworks behind RIASEC, the dimension importance
                weights, and how confidence is computed are documented on{" "}
                <Link
                  href="/methodology"
                  className="text-foreground underline-offset-4 hover:underline"
                >
                  /methodology
                </Link>
                . Source: <code className="rounded bg-background px-1.5 py-0.5 font-mono text-xs">src/lib/eval/</code>.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-16 border-t border-border pt-8">
          <p className="text-sm text-muted-foreground">
            Related:{" "}
            <Link
              href="/methodology"
              className="text-foreground underline-offset-4 hover:underline"
            >
              Methodology
            </Link>
            {" · "}
            <Link
              href="/security"
              className="text-foreground underline-offset-4 hover:underline"
            >
              Security &amp; Privacy
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
