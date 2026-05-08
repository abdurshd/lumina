import type { Metadata } from "next";
import Link from "next/link";
import { Compass, ArrowRight } from "lucide-react";
import {
  ONET_CLUSTERS,
  RIASEC_INFO,
  buildClusterContent,
} from "@/lib/content/careers";
import type { RiasecLetter } from "@/lib/content/careers";

export const metadata: Metadata = {
  title: "Careers — Lumina",
  description:
    "Browse all 16 O*NET career clusters and how Lumina assesses fit for each. Each cluster maps to validated RIASEC interest codes and a subset of the 31 Lumina dimensions.",
  openGraph: {
    title: "Careers — Lumina",
    description:
      "Browse all 16 O*NET career clusters and how Lumina assesses fit for each.",
    type: "website",
  },
};

const LETTER_ORDER: RiasecLetter[] = ["R", "I", "A", "S", "E", "C"];

const LETTER_BG: Record<RiasecLetter, string> = {
  R: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  I: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  A: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  S: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  E: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  C: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
};

export default function CareersIndexPage() {
  const enriched = ONET_CLUSTERS.map(buildClusterContent).sort((a, b) =>
    a.cluster.name.localeCompare(b.cluster.name)
  );

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <Link
          href="/"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          &larr; Back to Lumina
        </Link>

        <header className="mt-8 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <Compass className="h-3 w-3" />
            Careers
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl">
            All 16 O*NET career clusters.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            Lumina maps your dimension profile to the public-domain O*NET
            occupational data. Each cluster lists its primary RIASEC interest
            codes, example careers, and the Lumina dimensions that contribute
            most to a strong fit.
          </p>
        </header>

        {/* RIASEC legend */}
        <section className="mt-12 rounded-2xl border border-border bg-card p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            RIASEC at a glance
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {LETTER_ORDER.map((letter) => {
              const info = RIASEC_INFO[letter];
              return (
                <div key={letter} className="flex items-start gap-3">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md font-mono text-sm font-bold ${LETTER_BG[letter]}`}
                  >
                    {letter}
                  </span>
                  <div className="text-sm">
                    <p className="font-semibold text-foreground">{info.name}</p>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {info.blurb}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Clusters grid */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold tracking-tight">
            Clusters, alphabetical
          </h2>
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {enriched.map(({ cluster, primaryLetters, slug }) => (
              <li key={slug}>
                <Link
                  href={`/careers/${slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/30"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    {primaryLetters.map((letter) => (
                      <span
                        key={letter}
                        className={`flex h-6 w-6 items-center justify-center rounded-md font-mono text-xs font-bold ${LETTER_BG[letter]}`}
                      >
                        {letter}
                      </span>
                    ))}
                  </div>
                  <h3 className="mt-3 text-lg font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
                    {cluster.name}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {cluster.description}
                  </p>
                  <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-xs">
                    <p className="text-muted-foreground">
                      {cluster.exampleCareers.length} sample careers
                    </p>
                    <span className="inline-flex items-center gap-1 text-primary">
                      View cluster
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-16 rounded-2xl border border-border bg-card p-8 text-center md:p-12">
          <h2 className="text-2xl font-semibold">
            Want a personalized fit across all 16?
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-sm leading-relaxed text-muted-foreground">
            Lumina runs your evidence against every cluster and surfaces the
            three or four with strongest, confidence-gated matches — backed by
            specific signals from your data.
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
              Read methodology
            </Link>
          </div>
        </section>

        <section className="mt-12 border-t border-border pt-8">
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
              href="/use-cases"
              className="text-foreground underline-offset-4 hover:underline"
            >
              Use cases
            </Link>
            {" · "}
            <Link
              href="/help"
              className="text-foreground underline-offset-4 hover:underline"
            >
              Help center
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
