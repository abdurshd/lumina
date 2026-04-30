import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, ArrowRight } from "lucide-react";
import {
  USE_CASES_LIST,
  getUseCase,
  getAllUseCaseSlugs,
} from "@/lib/content/use-cases";
import { ProseRenderer } from "@/components/content/prose-renderer";
import { PRICING_TIERS } from "@/lib/pricing/tiers";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllUseCaseSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const useCase = getUseCase(slug);
  if (!useCase) {
    return {
      title: "Use case not found — Lumina",
      robots: { index: false },
    };
  }

  return {
    title: `${useCase.title} — Lumina`,
    description: useCase.description,
    openGraph: {
      title: useCase.title,
      description: useCase.description,
      type: "article",
    },
  };
}

export default async function UseCasePage({ params }: PageProps) {
  const { slug } = await params;
  const useCase = getUseCase(slug);
  if (!useCase) notFound();

  const tier = PRICING_TIERS[useCase.recommendedPlan];
  const others = USE_CASES_LIST.filter((u) => u.slug !== useCase.slug).slice(0, 3);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link
          href="/use-cases"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All use cases
        </Link>

        <header className="mt-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            {useCase.eyebrow}
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl">
            {useCase.title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            {useCase.description}
          </p>
        </header>

        {/* Outcomes */}
        <section className="mt-12 rounded-2xl border border-border bg-card p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            What you walk away with
          </p>
          <ul className="mt-4 space-y-3">
            {useCase.outcomes.map((outcome) => (
              <li key={outcome} className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="text-sm leading-relaxed text-foreground">
                  {outcome}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Body */}
        <article className="mt-16">
          <ProseRenderer sections={useCase.body} />
        </article>

        {/* Recommended plan */}
        <section className="mt-16 rounded-2xl border border-primary/20 bg-primary/5 p-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Recommended plan
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
            {tier.name}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {tier.tagline}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              See pricing
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
            <Link
              href="/security"
              className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-5 py-2 text-sm font-medium text-foreground hover:bg-card"
            >
              Read security posture
            </Link>
          </div>
        </section>

        {/* Other use cases */}
        {others.length > 0 && (
          <section className="mt-16">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              Other use cases
            </h2>
            <ul className="mt-4 grid gap-3 md:grid-cols-2">
              {others.map((u) => (
                <li key={u.slug}>
                  <Link
                    href={`/use-cases/${u.slug}`}
                    className="block rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                      {u.eyebrow}
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {u.title}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-16 border-t border-border pt-8">
          <p className="text-sm text-muted-foreground">
            Related:{" "}
            <Link
              href="/pricing"
              className="text-foreground underline-offset-4 hover:underline"
            >
              Pricing
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
