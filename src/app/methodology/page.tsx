import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Layers, Network, Gauge, ScrollText, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Methodology — Lumina",
  description:
    "How Lumina works under the hood: the 31-dimension framework, source aggregation, confidence scoring, the self-correcting report agent, and the academic literature behind each piece.",
  openGraph: {
    title: "Methodology — Lumina",
    description:
      "How Lumina works under the hood: the 31-dimension framework, source aggregation, confidence scoring, the self-correcting report agent, and the academic literature behind each piece.",
    type: "website",
  },
};

interface DimensionGroup {
  title: string;
  description: string;
  dimensions: string[];
  citation: string;
}

const DIMENSION_GROUPS: DimensionGroup[] = [
  {
    title: "Interests — Holland (RIASEC)",
    description:
      "Six vocational interest types from Holland's hexagonal model. The most validated framework in vocational psychology, used by O*NET and the major career interest inventories.",
    dimensions: [
      "Realistic",
      "Investigative",
      "Artistic",
      "Social",
      "Enterprising",
      "Conventional",
    ],
    citation:
      "Holland, J. L. (1997). Making Vocational Choices: A Theory of Vocational Personalities and Work Environments (3rd ed.). PAR.",
  },
  {
    title: "Cognitive style — Big Five facets relevant to work",
    description:
      "Domain-relevant facets distilled from the Five Factor Model. We do not score full personality — we score the facets that have predictive validity for career fit.",
    dimensions: [
      "analytical_thinking",
      "creative_thinking",
      "communication",
      "leadership",
      "teamwork",
      "problem_solving",
      "adaptability",
      "emotional_intelligence",
      "technical_aptitude",
    ],
    citation:
      "Costa, P. T., & McCrae, R. R. (1992). Revised NEO Personality Inventory (NEO-PI-R). PAR.",
  },
  {
    title: "Values & constraints",
    description:
      "Work values and lifestyle constraints — what you optimize for, and what you cannot or will not change. These are explicit user inputs, not inferences, because they involve preferences only the user can authorize.",
    dimensions: [
      "work_values",
      "Location",
      "Salary",
      "Time",
      "Education",
    ],
    citation:
      "Schwartz, S. H. (2012). An Overview of the Schwartz Theory of Basic Values. Online Readings in Psychology and Culture, 2(1).",
  },
];

interface PipelineStep {
  number: number;
  title: string;
  body: string;
}

const PIPELINE: PipelineStep[] = [
  {
    number: 1,
    title: "Source aggregation",
    body: "We extract structured signals from connected sources (Gmail, Drive, Notion, ChatGPT export, file uploads). Raw content is processed server-side; only derived signals — themes, skills, interests, evidence excerpts — are persisted.",
  },
  {
    number: 2,
    title: "Adaptive assessment",
    body: "Five quiz modules cover the 31 dimensions. Each module is generated against your data context, so questions adapt to what we already know — fewer redundant questions, more probing where evidence is thin.",
  },
  {
    number: 3,
    title: "Live behavioral session",
    body: "A multimodal session (voice, optional video) lets the agent observe behavioral signals — engagement, hesitation, confidence patterns — and ask adaptive follow-ups on dimensions where the quiz left uncertainty.",
  },
  {
    number: 4,
    title: "Confidence scoring",
    body: "Every dimension gets a 0-100 confidence score computed from source diversity (penalized below two source types), evidence count (square-root scaled), and cross-source agreement (bonus when sources concur within a 15% range).",
  },
  {
    number: 5,
    title: "Cross-source correlation",
    body: "A correlator agent runs over all evidence to find patterns no single source reveals — convergent (multiple sources agree), divergent (sources contradict), and hidden talents (signals you would not have surfaced from any one source alone).",
  },
  {
    number: 6,
    title: "Self-correcting report",
    body: "The report agent runs five steps: generate draft, critique evidence quality per section, identify weak sections, refine with deeper grounding, validate. Each step is logged; weak sections do not appear with strong-claim styling.",
  },
];

const REFERENCES = [
  {
    title: "Holland, J. L. (1997). Making Vocational Choices.",
    description:
      "The canonical RIASEC reference. We map to the six interest types directly, and use Holland codes when matching to O*NET career clusters.",
  },
  {
    title: "Costa, P. T., & McCrae, R. R. (1992). NEO-PI-R Manual.",
    description:
      "Five Factor Model facets. Lumina scores the work-relevant facets (e.g., analytical thinking, adaptability) rather than reporting full personality.",
  },
  {
    title: "Schmidt, F. L., & Hunter, J. E. (1998). The validity and utility of selection methods.",
    description:
      "Meta-analysis of predictors of job performance. Cited because it is the empirical baseline for what actually predicts career outcomes — and what does not.",
  },
  {
    title: "Anastasi, A., & Urbina, S. (1997). Psychological Testing.",
    description:
      "The standard reference on reliability, validity, and the limits of psychometric measurement. We treat its critiques as design constraints — confidence intervals, evidence pointers, no fixed labels.",
  },
  {
    title: "U.S. Department of Labor. O*NET OnLine.",
    description:
      "The occupational data backbone Lumina uses for career-cluster matching. Public-domain, government-maintained, updated continuously. Career recommendations cite O*NET Holland codes and clusters.",
    href: "https://www.onetonline.org/",
  },
];

interface PrincipleProps {
  icon: React.ReactNode;
  title: string;
  body: string;
}

function Principle({ icon, title, body }: PrincipleProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {body}
      </p>
    </div>
  );
}

export default function MethodologyPage() {
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
            <BookOpen className="h-3 w-3" />
            Methodology
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl">
            How Lumina arrives at a recommendation.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">
            Career-discovery products tend to skip the methodology section
            because they don&apos;t want you reading the citations. We are
            opinionated the other way. Here is exactly what frameworks we use,
            why, and where the evidence comes from.
          </p>
        </header>

        {/* Principles */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold">Principles</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Principle
              icon={<Layers className="h-5 w-5" />}
              title="Multiple sources, weighted"
              body="A single instrument cannot tell you who you are. Lumina aggregates corpus signals, quiz scores, and behavioral observations into a single confidence-weighted profile, and refuses to report a claim with only one source backing it."
            />
            <Principle
              icon={<Gauge className="h-5 w-5" />}
              title="Confidence, not certainty"
              body="Every dimension carries a 0-100 confidence score. Career matches gate by confidence — a match below threshold is shown as a 'directional' rather than a 'recommended' path. We never present an inference more strongly than the evidence supports."
            />
            <Principle
              icon={<Network className="h-5 w-5" />}
              title="Validated frameworks, not invented ones"
              body="RIASEC for interests. Big Five facets for cognitive style. O*NET for occupational data. Where we extend, we extend transparently — for instance, our 'hidden talent' detection is a pattern across the validated dimensions, not a new construct."
            />
            <Principle
              icon={<ScrollText className="h-5 w-5" />}
              title="Auditable agent reasoning"
              body="Every autonomous decision the agent makes is logged with confidence-before / confidence-after, the action taken, and the evidence consulted. Users can replay this in the decision-log panel — there is no black box."
            />
          </div>
        </section>

        {/* The 31-dimension framework */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold">The 31-dimension framework</h2>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">
            Lumina does not invent dimensions. We standardize on a set drawn
            from validated psychometric instruments and extend only where the
            literature supports it. The full list, by group:
          </p>
          <div className="mt-6 space-y-6">
            {DIMENSION_GROUPS.map((group) => (
              <div
                key={group.title}
                className="rounded-xl border border-border bg-card p-6"
              >
                <h3 className="text-lg font-semibold text-foreground">
                  {group.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {group.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {group.dimensions.map((dim) => (
                    <span
                      key={dim}
                      className="rounded-full border border-border bg-background px-3 py-1 font-mono text-xs text-foreground"
                    >
                      {dim}
                    </span>
                  ))}
                </div>
                <p className="mt-4 border-l-2 border-primary/30 pl-3 text-xs italic leading-relaxed text-muted-foreground">
                  {group.citation}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Pipeline */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold">The pipeline, step by step</h2>
          <ol className="mt-6 space-y-6 border-l border-border pl-6">
            {PIPELINE.map((step) => (
              <li key={step.number} className="relative">
                <span className="absolute -left-[31px] top-1.5 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card font-mono text-[10px] text-foreground">
                  {step.number}
                </span>
                <h3 className="text-base font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* Confidence scoring detail */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold">How confidence is computed</h2>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">
            For each dimension, confidence is a deterministic function of three
            inputs:
          </p>
          <div className="mt-6 space-y-3 text-sm leading-relaxed text-foreground">
            <div className="rounded-lg border border-border bg-card p-4">
              <span className="font-semibold">Source diversity multiplier.</span>{" "}
              One source type → 0.6. Two source types → 0.8. Three source types
              (data + quiz + session) → 1.0. A dimension scored only by the
              quiz cannot reach full confidence.
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <span className="font-semibold">Evidence count factor.</span>{" "}
              <code className="rounded bg-background px-1.5 py-0.5 font-mono text-xs">
                min(count / 3, 1.0)
              </code>
              . Three or more pieces of evidence reach full weight; fewer
              evidence is penalized.
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <span className="font-semibold">Cross-source agreement bonus.</span>{" "}
              +0.10 (scaled to 0-100) when all sources scoring the same
              dimension agree within a 15% range. This is what catches genuinely
              corroborated patterns.
            </div>
          </div>
          <p className="mt-6 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            The overall confidence is a weighted average across dimensions,
            with importance weights tuned to predictive validity for career
            outcomes (interests and analytical-thinking weighted higher than,
            say, adaptability).
          </p>
        </section>

        {/* References */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold">Academic basis</h2>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">
            Where Lumina makes a claim about how careers and people fit, that
            claim traces to one of the following:
          </p>
          <ul className="mt-6 space-y-4">
            {REFERENCES.map((ref) => (
              <li
                key={ref.title}
                className="rounded-xl border border-border bg-card p-5"
              >
                <h3 className="text-sm font-semibold text-foreground">
                  {ref.title}
                  {ref.href && (
                    <a
                      href={ref.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 inline-flex items-center text-primary"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {ref.description}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* Caveats */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold">What we are careful about</h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-foreground">
            <li className="flex gap-2">
              <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary" />
              <span>
                <strong>People change.</strong> Confidence scores are reported
                with the caveat that they are point-in-time. Lumina&apos;s evolution
                snapshots are designed to track change, not freeze it.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary" />
              <span>
                <strong>Behavioral signals are bounded.</strong> Live-session
                observations contribute to behavioral and communication
                dimensions. They are not used to infer mood, mental health, or
                identity. See{" "}
                <Link
                  href="/security"
                  className="text-foreground underline-offset-4 hover:underline"
                >
                  /security
                </Link>{" "}
                for the explicit non-claims.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary" />
              <span>
                <strong>The model is not the assessment.</strong> Gemini is the
                inference engine; the framework is the assessment. We could
                swap the underlying model and the dimensions, scoring rules,
                and confidence math would be unchanged.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary" />
              <span>
                <strong>Recommendations are advisory.</strong> Lumina suggests
                directions with evidence. It does not make hiring, admissions,
                or compensation decisions, and it should not be used as the
                sole input for those.
              </span>
            </li>
          </ul>
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
              href="/pricing"
              className="text-foreground underline-offset-4 hover:underline"
            >
              Pricing
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
