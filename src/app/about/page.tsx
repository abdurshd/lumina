import type { Metadata } from "next";
import Link from "next/link";
import { Compass, Eye, ShieldCheck, Layers } from "lucide-react";

const FOUNDER_NAME = "Abdurashid";

export const metadata: Metadata = {
  title: "About Lumina",
  description:
    "Lumina helps people find their strongest career direction by grounding the recommendation in their real data, an adaptive assessment, and a live AI conversation — not a personality quiz.",
  openGraph: {
    title: "About Lumina",
    description:
      "Lumina helps people find their strongest career direction by grounding the recommendation in their real data, an adaptive assessment, and a live AI conversation — not a personality quiz.",
    type: "website",
  },
};

interface ValueCardProps {
  icon: React.ReactNode;
  title: string;
  body: string;
}

function ValueCard({ icon, title, body }: ValueCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

export default function AboutPage() {
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
            <Compass className="h-3 w-3" />
            About
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl">
            We are building the talent map
            <br className="hidden md:block" />
            careers actually need.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">
            Most career tools either ask you twenty multiple-choice questions
            and pretend the answer is on the other side, or they recommend
            generic paths that match a job title rather than a person. Lumina
            takes the harder route: we ground every recommendation in your real
            digital footprint, an adaptive assessment that asks you fewer but
            sharper questions, and a live conversation that listens to how you
            think — not just what you click.
          </p>
        </header>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold">Why we exist</h2>
          <div className="mt-6 space-y-5 text-base leading-relaxed text-muted-foreground">
            <p>
              Career advice has been industrialized into a single shape: a
              questionnaire that returns a label. The label is reassuring, but
              it almost never survives contact with a real decision. Should you
              accept the offer? Pivot into a new field? Go back to school? A
              label cannot tell you, because a label is not evidence.
            </p>
            <p>
              We started Lumina because the missing piece is the underlying
              evidence — the projects you have actually shipped, the questions
              you ask people you respect, the phrasing you reach for when you
              are trying to convince someone, the topics that keep showing up in
              your notes years apart. None of this fits in a five-question
              quiz, but all of it fits in the digital trail you have already
              created.
            </p>
            <p>
              Our goal is to make that trail readable to you — not as a
              surveillance feed, but as a structured profile of how you think,
              what you keep returning to, and where your strongest work has
              consistently emerged. Then, and only then, do recommendations
              earn their place.
            </p>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold">What we believe</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <ValueCard
              icon={<Layers className="h-5 w-5" />}
              title="Multiple sources, one truth"
              body="A single quiz cannot tell you who you are. Five corroborating sources can show you a pattern. Lumina synthesizes data, assessment, and conversation into a single confidence-weighted profile."
            />
            <ValueCard
              icon={<Eye className="h-5 w-5" />}
              title="Evidence before claims"
              body="Every claim in your report links back to the moment that produced it. If we cannot point to evidence, we do not put it in the report."
            />
            <ValueCard
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Consent before observation"
              body="Behavioral signals from the live session require explicit, revocable consent. The agent's reasoning is visible to you in the decision log — not buried in a model."
            />
            <ValueCard
              icon={<Compass className="h-5 w-5" />}
              title="Tendencies, not labels"
              body="People change. We report tendencies with confidence numbers, not immutable identity labels. Re-assessment is part of the product, not an afterthought."
            />
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold">The team</h2>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">
            Lumina was started by {FOUNDER_NAME}. The product, research, and
            engineering work is done by the Lumina team — additional bylines
            appear on the blog as they ship.
          </p>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            We are deliberately small and deliberately careful. Talent
            discovery is a long-horizon problem and we are building it for
            decades, not for a launch week.
          </p>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold">Stay in touch</h2>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">
            Press, partnerships, and product feedback all go to{" "}
            <a
              href="mailto:hello@lumina.app"
              className="text-foreground underline-offset-4 hover:underline"
            >
              hello@lumina.app
            </a>
            . Security disclosures go to{" "}
            <a
              href="mailto:security@lumina.app"
              className="text-foreground underline-offset-4 hover:underline"
            >
              security@lumina.app
            </a>
            .
          </p>
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
              href="/privacy"
              className="text-foreground underline-offset-4 hover:underline"
            >
              Privacy Policy
            </Link>
            {" · "}
            <Link
              href="/terms"
              className="text-foreground underline-offset-4 hover:underline"
            >
              Terms of Service
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
