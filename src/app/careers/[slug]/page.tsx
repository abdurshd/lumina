import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Briefcase, ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import {
  getClusterContent,
  buildClusterContent,
  ALL_CLUSTER_SLUGS,
} from "@/lib/content/careers";
import type { RiasecLetter } from "@/lib/content/careers";
import { getClusterById } from "@/lib/career/onet-clusters";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return ALL_CLUSTER_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const content = getClusterContent(slug);
  if (!content) {
    return {
      title: "Cluster not found — Lumina careers",
      robots: { index: false },
    };
  }

  return {
    title: `${content.cluster.name} — Lumina careers`,
    description: content.cluster.description,
    openGraph: {
      title: `${content.cluster.name} — Lumina careers`,
      description: content.cluster.description,
      type: "article",
    },
  };
}

const LETTER_BG: Record<RiasecLetter, string> = {
  R: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  I: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  A: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  S: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  E: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  C: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
};

export default async function CareerClusterPage({ params }: PageProps) {
  const { slug } = await params;
  const content = getClusterContent(slug);
  if (!content) notFound();

  const { cluster, letterInfo, alignedDimensions, relatedClusterIds } = content;

  const related = relatedClusterIds
    .map((id) => getClusterById(id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
    .map(buildClusterContent);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <Link
          href="/careers"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All career clusters
        </Link>

        <header className="mt-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <Briefcase className="h-3 w-3" />
            Career cluster
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl">
            {cluster.name}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            {cluster.description}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              RIASEC codes:
            </span>
            {cluster.riasecCodes.map((code) => (
              <span
                key={code}
                className="rounded-full border border-border bg-overlay-subtle px-3 py-1 font-mono text-sm text-foreground"
              >
                {code}
              </span>
            ))}
          </div>
        </header>

        {/* RIASEC letter breakdown */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold tracking-tight">
            What the codes mean for this cluster
          </h2>
          <ul className="mt-6 space-y-4">
            {letterInfo.map((info) => (
              <li
                key={info.letter}
                className="rounded-xl border border-border bg-card p-5"
              >
                <div className="flex items-start gap-4">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-mono text-base font-bold ${LETTER_BG[info.letter]}`}
                  >
                    {info.letter}
                  </span>
                  <div>
                    <p className="text-base font-semibold text-foreground">
                      {info.name}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {info.blurb}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Example careers */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold tracking-tight">
            Example careers in this cluster
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            A representative sample drawn from the O*NET occupational data.
            Lumina&apos;s career-match engine considers many more occupations,
            ranked by your dimension profile.
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {cluster.exampleCareers.map((career) => (
              <li
                key={career}
                className="rounded-xl border border-border bg-card p-4 text-sm font-medium text-foreground"
              >
                {career}
              </li>
            ))}
          </ul>
        </section>

        {/* Aligned Lumina dimensions */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold tracking-tight">
            Lumina dimensions that predict fit
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            These are the dimensions whose strength most strongly predicts a
            good match for {cluster.name.toLowerCase()}. A high overall fit
            usually means several of these score well together — not that
            any single one is decisive.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {alignedDimensions.map((dim) => (
              <span
                key={dim}
                className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 font-mono text-xs text-primary"
              >
                {dim}
              </span>
            ))}
          </div>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            See{" "}
            <Link
              href="/methodology"
              className="text-foreground underline-offset-4 hover:underline"
            >
              /methodology
            </Link>{" "}
            for how each dimension is scored, weighted, and combined into a
            confidence-gated career match.
          </p>
        </section>

        {/* External O*NET link */}
        <section className="mt-12 rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Source data
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Cluster definitions come from the public-domain U.S. Department of
            Labor O*NET database. Browse the full occupational data at{" "}
            <a
              href="https://www.onetonline.org/find/career"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-foreground underline-offset-4 hover:underline"
            >
              onetonline.org
              <ExternalLink className="h-3 w-3" />
            </a>
            .
          </p>
        </section>

        {/* Related clusters */}
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-xl font-semibold tracking-tight">
              Related clusters
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Clusters that share at least one primary RIASEC letter with{" "}
              {cluster.name.toLowerCase()}.
            </p>
            <ul className="mt-6 grid gap-3 md:grid-cols-3">
              {related.map(({ cluster: r, slug, primaryLetters: rLetters }) => (
                <li key={slug}>
                  <Link
                    href={`/careers/${slug}`}
                    className="block rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30"
                  >
                    <div className="flex flex-wrap gap-1">
                      {rLetters.map((letter) => (
                        <span
                          key={letter}
                          className={`flex h-5 w-5 items-center justify-center rounded-md font-mono text-[10px] font-bold ${LETTER_BG[letter]}`}
                        >
                          {letter}
                        </span>
                      ))}
                    </div>
                    <p className="mt-2 text-sm font-medium text-foreground">
                      {r.name}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* CTA */}
        <section className="mt-16 rounded-2xl border border-border bg-card p-8 text-center md:p-12">
          <h2 className="text-2xl font-semibold">
            Want a personalized fit score for this cluster?
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-sm leading-relaxed text-muted-foreground">
            Lumina runs your evidence against every O*NET cluster and shows
            where you have the strongest fit, with confidence numbers grounded
            in your real data.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              See pricing
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
            <Link
              href="/use-cases"
              className="inline-flex items-center justify-center rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-foreground hover:bg-card"
            >
              Browse use cases
            </Link>
          </div>
        </section>

        <section className="mt-12 border-t border-border pt-8">
          <p className="text-sm text-muted-foreground">
            Related:{" "}
            <Link
              href="/careers"
              className="text-foreground underline-offset-4 hover:underline"
            >
              All clusters
            </Link>
            {" · "}
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
          </p>
        </section>
      </div>
    </main>
  );
}
