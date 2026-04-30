import type { Metadata } from "next";
import Link from "next/link";
import { Compass, ArrowRight } from "lucide-react";
import { USE_CASES_LIST } from "@/lib/content/use-cases";
import { PRICING_TIERS } from "@/lib/pricing/tiers";

export const metadata: Metadata = {
  title: "Use cases — Lumina",
  description:
    "Concrete ways to use Lumina — career pivots, new-grad direction, returning to work, coaching, and direction-checks while still employed. Each links to a tailored walkthrough.",
  openGraph: {
    title: "Use cases — Lumina",
    description:
      "Concrete ways to use Lumina — career pivots, new-grad direction, returning to work, coaching, and direction-checks while still employed.",
    type: "website",
  },
};

export default function UseCasesIndexPage() {
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
            Use cases
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl">
            Five ways people actually use Lumina.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            Lumina is a single product, but the shape of an assessment differs
            by where you are in your career. Pick the use case closest to your
            situation — each links to a tailored walkthrough.
          </p>
        </header>

        <ul className="mt-12 grid gap-4 md:grid-cols-2">
          {USE_CASES_LIST.map((useCase) => {
            const tier = PRICING_TIERS[useCase.recommendedPlan];
            return (
              <li key={useCase.slug}>
                <Link
                  href={`/use-cases/${useCase.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/30"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                    {useCase.eyebrow}
                  </p>
                  <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
                    {useCase.title}
                  </h2>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {useCase.description}
                  </p>
                  <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                    <p className="text-xs text-muted-foreground">
                      Best on{" "}
                      <span className="font-mono text-foreground">
                        {tier.name.replace("Lumina ", "")}
                      </span>
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                      Read the walkthrough
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>

        <section className="mt-16 rounded-2xl border border-border bg-card p-8 md:p-12">
          <h2 className="text-2xl font-semibold">Not sure which one fits?</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Lumina works the same way regardless of which use case you pick —
            the difference is what you start with and which signals matter
            most. If you are unsure, start with{" "}
            <Link
              href="/pricing"
              className="text-foreground underline-offset-4 hover:underline"
            >
              Lumina Starter
            </Link>{" "}
            and upgrade once you see where you want more depth.
          </p>
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
              href="/pricing"
              className="text-foreground underline-offset-4 hover:underline"
            >
              Pricing
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
