import Link from "next/link";
import { Check, ArrowRight, ArrowLeft } from "lucide-react";
import {
  PERSONAS_LIST,
  getPersona,
  type Persona,
} from "@/lib/content/personas";
import { ProseRenderer } from "@/components/content/prose-renderer";
import { PRICING_TIERS } from "@/lib/pricing/tiers";

interface PersonaPageBodyProps {
  slug: Persona["slug"];
}

/**
 * Renders the full marketing layout for a persona. The static route files
 * in `src/app/for-{slug}/page.tsx` each call into this component with their
 * own slug — Next 16 didn't recognize `for-[persona]` as a directory-name
 * pattern, so we use one static route per persona and share the template.
 */
export function PersonaPageBody({ slug }: PersonaPageBodyProps) {
  const persona = getPersona(slug);
  if (!persona) {
    throw new Error(`Unknown persona slug: ${slug}`);
  }

  const tier = PRICING_TIERS[persona.recommendedPlan];
  const others = PERSONAS_LIST.filter((p) => p.slug !== persona.slug);
  const checkoutHref = `/api/billing/checkout?plan=${tier.id}&interval=monthly`;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Lumina
        </Link>

        <header className="mt-8 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            {persona.eyebrow}
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            {persona.title}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            {persona.subtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={checkoutHref}
              className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              {persona.primaryCta}
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
            <Link
              href="/methodology"
              className="inline-flex items-center justify-center rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-foreground hover:bg-card"
            >
              How it works
            </Link>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Best on{" "}
            <Link
              href="/pricing"
              className="text-foreground underline-offset-4 hover:underline"
            >
              {tier.name}
            </Link>{" "}
            · 7-day refund · cancel anytime
          </p>
        </header>

        <section className="mt-20">
          <h2 className="text-2xl font-semibold tracking-tight">
            What you&apos;re running into
          </h2>
          <ul className="mt-8 space-y-4">
            {persona.painSolutions.map((row) => (
              <li
                key={row.pain}
                className="grid gap-4 rounded-2xl border border-border bg-card p-6 md:grid-cols-2"
              >
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    The pain
                  </p>
                  <p className="mt-2 text-base leading-relaxed text-foreground">
                    &ldquo;{row.pain}&rdquo;
                  </p>
                </div>
                <div className="border-t border-border pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                    What Lumina does
                  </p>
                  <p className="mt-2 text-base leading-relaxed text-foreground">
                    {row.solution}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-20">
          <h2 className="text-2xl font-semibold tracking-tight">What you get</h2>
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {persona.features.map((feature) => (
              <li
                key={feature.title}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-foreground">
                      {feature.title}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {feature.body}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-20">
          <ProseRenderer sections={persona.closing} />
        </section>

        <section className="mt-20 rounded-2xl border border-primary/20 bg-primary/5 p-8 md:p-12">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Recommended plan
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            {tier.name} · ${tier.monthlyPriceUsd}/mo
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {tier.tagline}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={checkoutHref}
              className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              {persona.primaryCta}
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-foreground hover:bg-card"
            >
              See all plans
            </Link>
          </div>
        </section>

        <section className="mt-20">
          <h2 className="text-2xl font-semibold tracking-tight">Frequently asked</h2>
          <dl className="mt-8 space-y-3">
            {persona.faqs.map((faq) => (
              <details
                key={faq.q}
                className="group rounded-xl border border-border bg-card p-5 open:border-primary/30"
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-base font-semibold text-foreground">
                  <span>{faq.q}</span>
                  <span
                    aria-hidden="true"
                    className="mt-1 shrink-0 font-mono text-xs text-muted-foreground transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {faq.a}
                </p>
              </details>
            ))}
          </dl>
        </section>

        <section className="mt-20">
          <h2 className="text-xl font-semibold tracking-tight">
            Other ways people come to Lumina
          </h2>
          <ul className="mt-6 grid gap-3 md:grid-cols-2">
            {others.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/for-${p.slug}`}
                  className="block rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                    {p.eyebrow}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm font-medium text-foreground">
                    {p.title}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-16 border-t border-border pt-8">
          <p className="text-sm text-muted-foreground">
            Related:{" "}
            <Link
              href="/use-cases"
              className="text-foreground underline-offset-4 hover:underline"
            >
              Use cases
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
              href="/security"
              className="text-foreground underline-offset-4 hover:underline"
            >
              Security &amp; Privacy
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
