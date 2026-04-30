import type { Metadata } from "next";
import Link from "next/link";
import { ScrollText } from "lucide-react";

export const metadata: Metadata = {
  title: "Changelog — Lumina",
  description:
    "Material product, model, and security changes shipped in Lumina. Updated each release.",
  openGraph: {
    title: "Changelog — Lumina",
    description:
      "Material product, model, and security changes shipped in Lumina. Updated each release.",
    type: "website",
  },
};

type EntryType = "feature" | "improvement" | "security" | "fix";

interface ChangelogEntry {
  date: string;
  title: string;
  type: EntryType;
  body: string;
  bullets?: string[];
}

const TYPE_STYLES: Record<EntryType, string> = {
  feature: "bg-primary/10 text-primary",
  improvement: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  security: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  fix: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

const TYPE_LABELS: Record<EntryType, string> = {
  feature: "Feature",
  improvement: "Improvement",
  security: "Security",
  fix: "Fix",
};

const ENTRIES: ChangelogEntry[] = [
  {
    date: "2026-04-29",
    title: "Pre-launch surface lands",
    type: "feature",
    body: "First pass of the public surface is in: security page, about page, footer, and the landing privacy block that explains exactly what the live session does and does not observe.",
    bullets: [
      "/security with five enforced principles and a full data lifecycle",
      "Landing 'observe vs. never claim' block linked to /security",
      "Sitemap and robots wired; (app) routes are now noindex",
      "Footer expanded to five columns with trust links",
    ],
  },
  {
    date: "2026-04-22",
    title: "Self-correcting report agent",
    type: "feature",
    body: "Reports now run a five-step generate → critique → identify-targets → refine → validate loop. Every step is visible in the agent decision log, with confidence-before and confidence-after on each transition.",
  },
  {
    date: "2026-04-15",
    title: "Behavioral timeline + correlations",
    type: "feature",
    body: "Live sessions now record a temporal behavioral timeline. The post-session summary surfaces rising/falling trends per category and topic-behavior correlations — not just snapshot averages.",
  },
  {
    date: "2026-04-08",
    title: "Confidence-weighted dimension profile",
    type: "improvement",
    body: "Per-dimension confidence is now computed from source diversity, evidence count, and cross-source agreement. Career-match badges and report sections gate by confidence — so weak claims do not appear with strong-claim styling.",
  },
  {
    date: "2026-04-01",
    title: "Bring-your-own Gemini key",
    type: "security",
    body: "Lumina now accepts a user-supplied Gemini API key. When BYOK is active, all inference is routed through your key and the platform key is not used.",
  },
  {
    date: "2026-03-25",
    title: "Ephemeral live-session tokens",
    type: "security",
    body: "Live multimodal sessions now use server-minted ephemeral tokens with a short TTL and a constrained model scope. Long-lived API keys never leave the server.",
  },
];

export default function ChangelogPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <Link
          href="/"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          &larr; Back to Lumina
        </Link>

        <header className="mt-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <ScrollText className="h-3 w-3" />
            Changelog
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl">
            What shipped, and when.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">
            Material product, model, and security changes are recorded here.
            Smaller fixes and content updates are not — read the blog when it
            launches for context on the bigger pieces.
          </p>
        </header>

        <section className="mt-16">
          <ol className="space-y-10 border-l border-border pl-6">
            {ENTRIES.map((entry) => (
              <li key={entry.date + entry.title} className="relative">
                <span className="absolute -left-[31px] top-2 h-2 w-2 rounded-full bg-primary" />
                <div className="flex flex-wrap items-center gap-3">
                  <time className="font-mono text-xs text-muted-foreground">
                    {entry.date}
                  </time>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${TYPE_STYLES[entry.type]}`}
                  >
                    {TYPE_LABELS[entry.type]}
                  </span>
                </div>
                <h2 className="mt-2 text-xl font-semibold text-foreground">
                  {entry.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {entry.body}
                </p>
                {entry.bullets && (
                  <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-foreground">
                    {entry.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-2">
                        <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ol>
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
          </p>
        </section>
      </div>
    </main>
  );
}
