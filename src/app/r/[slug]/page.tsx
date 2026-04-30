import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldCheck, Sparkles, Award, Compass, Target } from "lucide-react";
import { getAdminDb } from "@/lib/firebase/admin";
import {
  isValidShareSlug,
  type SharedReportDoc,
} from "@/lib/share-report";
import { ShareViewTracker } from "./share-view-tracker";

export const dynamic = "force-dynamic";

const SHARED_REPORTS_COLLECTION = "sharedReports";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function loadShare(slug: string): Promise<SharedReportDoc | null> {
  if (!isValidShareSlug(slug)) return null;
  try {
    const db = getAdminDb();
    const snap = await db
      .collection(SHARED_REPORTS_COLLECTION)
      .doc(slug)
      .get();
    if (!snap.exists) return null;
    const data = snap.data() as SharedReportDoc;
    if (data.revoked) return null;
    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    console.error("[share/page] load failed:", message);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const share = await loadShare(slug);
  if (!share) {
    return {
      title: "Shared report — Lumina",
      description:
        "This shared Lumina report could not be found. It may have been revoked.",
      robots: { index: false },
    };
  }

  return {
    title: `${share.report.headline} — shared via Lumina`,
    description: share.report.tagline,
    openGraph: {
      title: `${share.report.headline} — shared via Lumina`,
      description: share.report.tagline,
      type: "article",
    },
    robots: { index: true, follow: true },
  };
}

function ConfidenceBadge({
  level,
}: {
  level: "high" | "medium" | "low";
}) {
  const styles: Record<typeof level, string> = {
    high: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    low: "bg-rose-500/10 text-rose-500",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${styles[level]}`}
    >
      {level} confidence
    </span>
  );
}

export default async function SharedReportPage({ params }: PageProps) {
  const { slug } = await params;
  const share = await loadShare(slug);
  if (!share) notFound();

  const { report, ownerHandle, updatedAt } = share;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <ShareViewTracker />
      <div className="mx-auto max-w-4xl px-6 py-16">
        {/* Privacy banner */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-semibold text-foreground">
                Anonymized share from {ownerHandle}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                This is the structural Lumina report — career matches,
                strengths, and action plan. Personal evidence excerpts are
                replaced with the kind of source they came from. The owner can
                revoke this link at any time.{" "}
                <Link
                  href="/security"
                  className="text-foreground underline-offset-4 hover:underline"
                >
                  How sharing protects privacy &rarr;
                </Link>
              </p>
            </div>
          </div>
        </div>

        <header className="mt-12">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            {report.headline}
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted-foreground">
            {report.tagline}
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            Last updated {new Date(updatedAt).toLocaleDateString()}
          </p>
        </header>

        {/* Radar dimensions */}
        <section className="mt-16">
          <h2 className="flex items-center gap-2 text-2xl font-semibold">
            <Compass className="h-5 w-5 text-primary" /> Talent radar
          </h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {report.radarDimensions.map((dim) => (
              <div
                key={dim.label}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="flex items-baseline justify-between">
                  <p className="text-sm font-semibold text-foreground">
                    {dim.label}
                  </p>
                  <p className="font-mono text-sm text-foreground">
                    {dim.value}
                  </p>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-overlay-subtle">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.min(100, Math.max(0, dim.value))}%` }}
                  />
                </div>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  {dim.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Top strengths */}
        <section className="mt-16">
          <h2 className="flex items-center gap-2 text-2xl font-semibold">
            <Award className="h-5 w-5 text-primary" /> Top strengths
          </h2>
          <ul className="mt-6 space-y-3">
            {report.topStrengths.map((s) => (
              <li
                key={s.name}
                className="rounded-xl border border-border bg-card p-5"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-base font-semibold text-foreground">
                    {s.name}
                  </p>
                  <span className="font-mono text-xs text-muted-foreground">
                    {s.score}/100
                  </span>
                  <ConfidenceBadge level={s.confidenceLevel} />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Evidence drawn from: {s.evidenceLabel}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* Hidden talents */}
        {report.hiddenTalents.length > 0 && (
          <section className="mt-16">
            <h2 className="flex items-center gap-2 text-2xl font-semibold">
              <Sparkles className="h-5 w-5 text-primary" /> Hidden talents
            </h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {report.hiddenTalents.map((talent) => (
                <li
                  key={talent}
                  className="rounded-xl border border-border bg-card p-4 text-sm leading-relaxed text-foreground"
                >
                  {talent}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Career paths */}
        <section className="mt-16">
          <h2 className="flex items-center gap-2 text-2xl font-semibold">
            <Target className="h-5 w-5 text-primary" /> Career matches
          </h2>
          <div className="mt-6 space-y-4">
            {report.careerPaths.map((path) => (
              <article
                key={path.title}
                className="rounded-xl border border-border bg-card p-6"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h3 className="text-lg font-semibold text-foreground">
                    {path.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono text-foreground">
                      {path.match}% match
                    </span>
                    <span className="text-muted-foreground">·</span>
                    <span className="font-mono text-muted-foreground">
                      {path.confidence}% confidence
                    </span>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                    {path.riasecCodes}
                  </span>
                  <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
                    {path.onetCluster}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {path.description}
                </p>
                <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                    Why this person
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-foreground">
                    {path.whyAnyone}
                  </p>
                </div>

                {path.evidenceLabels.length > 0 && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Evidence drawn from: {path.evidenceLabels.join(", ")}
                  </p>
                )}

                {path.nextSteps.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Next steps
                    </p>
                    <ul className="mt-2 space-y-1.5 text-sm text-foreground">
                      {path.nextSteps.map((step) => (
                        <li key={step} className="flex gap-2">
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                          <span className="leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>

        {/* Action plan */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold">Action plan</h2>
          <ol className="mt-6 space-y-3">
            {report.actionPlan.map((item, i) => (
              <li
                key={item.title}
                className="rounded-xl border border-border bg-card p-5"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-xs text-primary">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground">
                        {item.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.timeframe} · {item.priority} priority
                      </p>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Personality insights */}
        {report.personalityInsights.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-semibold">Patterns</h2>
            <ul className="mt-6 space-y-2">
              {report.personalityInsights.map((insight) => (
                <li
                  key={insight}
                  className="rounded-lg border border-border bg-card p-4 text-sm leading-relaxed text-foreground"
                >
                  {insight}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Confidence notes */}
        <section className="mt-16 rounded-xl border border-border bg-overlay-subtle p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Confidence notes
          </p>
          <ul className="mt-3 space-y-2 text-sm text-foreground">
            {report.confidenceNotes.map((note) => (
              <li key={note} className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                <span className="leading-relaxed">{note}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* CTA */}
        <section className="mt-16 rounded-2xl border border-border bg-card p-8 text-center md:p-12">
          <h2 className="text-2xl font-semibold">
            Want a report grounded in your own data?
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-sm leading-relaxed text-muted-foreground">
            Lumina synthesizes your connected data, an adaptive assessment, and
            a live AI conversation into a single confidence-weighted talent
            profile — with the agent reasoning visible at every step.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              See pricing
            </Link>
            <Link
              href="/methodology"
              className="inline-flex items-center justify-center rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-foreground hover:bg-card"
            >
              How it works
            </Link>
          </div>
        </section>

        <section className="mt-12 border-t border-border pt-8">
          <p className="text-sm text-muted-foreground">
            Related:{" "}
            <Link href="/security" className="text-foreground underline-offset-4 hover:underline">
              Security &amp; Privacy
            </Link>
            {" · "}
            <Link href="/methodology" className="text-foreground underline-offset-4 hover:underline">
              Methodology
            </Link>
            {" · "}
            <Link href="/help" className="text-foreground underline-offset-4 hover:underline">
              Help center
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
