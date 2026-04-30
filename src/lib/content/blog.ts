import type { ProseSection } from "./prose";

export interface BlogPost {
  /** URL slug, used for `/blog/{slug}`. */
  slug: string;
  /** Page title. */
  title: string;
  /** One-line description, used in metadata + index card. */
  description: string;
  /** ISO date (YYYY-MM-DD). */
  publishedAt: string;
  /** Author byline — under Option C, always "Lumina team" except on /about. */
  byline: string;
  /** Subject area for index filtering. */
  category: "Methodology" | "Product" | "Research" | "Engineering";
  /** Approximate reading time. */
  readingTimeMin: number;
  /** Body sections. Rendered via `<ProseRenderer>`. */
  body: ProseSection[];
}

const POSTS: BlogPost[] = [
  {
    slug: "why-lumina-is-not-a-personality-quiz",
    title: "Why Lumina is not a personality quiz",
    description:
      "Most career tools converge on a five-question quiz that returns a label. We took the harder route — and here is why the label was never the answer.",
    publishedAt: "2026-04-29",
    byline: "Lumina team",
    category: "Methodology",
    readingTimeMin: 6,
    body: [
      {
        heading: "The label problem",
        paragraphs: [
          "Career-discovery products have converged on a single shape: a short questionnaire that returns a personality label. The label is reassuring. It is also almost never useful when you are about to make a real decision.",
          "Should you accept the offer? Pivot into a new field? Go back to school? Take the part-time consulting work that means you cannot ship the side project you care about? A label cannot tell you. A label does not have access to the evidence those decisions actually depend on.",
        ],
      },
      {
        heading: "What we built instead",
        paragraphs: [
          "Lumina aggregates three things: signals from the data sources you choose to connect, an adaptive psychometric assessment that adapts to what your data already shows, and a live conversation that listens for behavioral patterns the quiz cannot capture. The output is a confidence-weighted profile, not a label.",
          "Crucially, every claim in your report carries an evidence pointer — which source, which quiz answer, which session moment — and a confidence number. If we cannot point to evidence, we do not put it in the report.",
        ],
        callout: {
          variant: "info",
          text: "If you want the academic basis, see /methodology — it lists the validated frameworks (RIASEC, Big Five facets, O*NET) and the math behind confidence scoring.",
        },
      },
      {
        heading: "The trade-off",
        paragraphs: [
          "A profile takes longer to generate than a quiz. You cannot run Lumina in 90 seconds. We accept that, because the goal is not to give you something instant — it is to give you something defensible.",
        ],
      },
    ],
  },
  {
    slug: "how-the-self-correcting-report-agent-works",
    title: "How the self-correcting report agent works",
    description:
      "Generate → critique → identify weak sections → refine → validate. Every step is logged with confidence-before / confidence-after. Here is what each step actually does.",
    publishedAt: "2026-04-22",
    byline: "Lumina team",
    category: "Engineering",
    readingTimeMin: 8,
    body: [
      {
        heading: "Why a single Gemini call is not enough",
        paragraphs: [
          "A common pattern in AI consumer tools is: collect inputs, send everything to one large model in a single prompt, parse the response. That works for many things. It does not work for an evidence-grounded talent report.",
          "Single-shot generations confidently invent connections that are not in the source material. They use florid language to fill structural gaps. They do not know where the evidence is thin and where it is solid. The report we want has to know the difference.",
        ],
      },
      {
        heading: "The five steps, in order",
        paragraphs: [
          "Generate the draft against all evidence. Critique the draft per section against the evidence (running on a fast model). Identify which sections fall below the evidence-quality threshold. Refine those sections with a deeper model and tighter grounding. Validate the final shape against the schema and the original evidence.",
        ],
        list: [
          "Generate — Gemini Pro, full context, schema-constrained output",
          "Critique — Gemini Flash, scores each section's evidence quality",
          "Identify — pure code, picks sections below 60/100",
          "Refine — Gemini Pro, focused only on the weak sections + their evidence",
          "Validate — Gemini Flash + Zod schema, no hallucination tolerance",
        ],
      },
      {
        heading: "What lands in the decision log",
        paragraphs: [
          "Every step writes a `ReportTraceStep` with confidence-before, confidence-after, duration, and a one-line summary. Users open the panel and see exactly which parts of the report were rewritten and why.",
        ],
      },
    ],
  },
  {
    slug: "behavioral-signals-bounded-not-broken",
    title: "Behavioral signals, bounded — not broken",
    description:
      "We observe engagement, hesitation, communication style. We do not infer mood, identity, or hireability. The boundary is the design, not a footnote.",
    publishedAt: "2026-04-15",
    byline: "Lumina team",
    category: "Research",
    readingTimeMin: 5,
    body: [
      {
        heading: "What we observe",
        paragraphs: [
          "If you grant video consent for the live session, we observe four families of signal: engagement (turn-taking, follow-up depth), hesitation (pauses on specific question categories), confidence patterns (voice steadiness, certainty markers), and communication style (concision, narrative preference, abstraction level).",
          "Each observation is paired with the moment that produced it. You can see the evidence in the agent decision log and disagree with our interpretation at any time.",
        ],
      },
      {
        heading: "What we never claim",
        paragraphs: [
          "Identity recognition. Medical or mental-health diagnosis. Immutable personality certainty. Hiring or admissions decisions from a session alone. These are not aspirations we have not gotten to yet — they are explicit non-claims, enforced in code and copy.",
        ],
        callout: {
          variant: "warn",
          text: "Behavioral inference is the most easily-misunderstood part of any multimodal AI product. We are explicit about it because we have to be — see /security for the enforcement detail.",
        },
      },
      {
        heading: "Why the boundary",
        paragraphs: [
          "Behavioral signals from a 15-minute session are useful for assessment refinement and dimension confidence. They are not strong enough — and never will be — for high-stakes decisions about a person. Treating them otherwise would be malpractice. The boundary is the design.",
        ],
      },
    ],
  },
  {
    slug: "the-31-dimensions",
    title: "The 31 dimensions, and why we did not invent them",
    description:
      "RIASEC for interests, Big Five facets for cognitive style, Schwartz for values, O*NET for occupational data. Where Lumina extends, it extends transparently.",
    publishedAt: "2026-04-08",
    byline: "Lumina team",
    category: "Methodology",
    readingTimeMin: 7,
    body: [
      {
        heading: "Standardize, do not invent",
        paragraphs: [
          "When a product invents its own assessment dimensions, two things happen. The product gains marketing leverage — the dimensions become brand-defining nouns. The user loses the ability to triangulate against decades of independent research.",
          "Lumina deliberately does not invent dimensions. We standardize on a set drawn from validated psychometric instruments and extend only where the literature supports it.",
        ],
      },
      {
        heading: "What we use",
        paragraphs: [
          "Holland's RIASEC for the six vocational interest types. Big Five facets — restricted to the cognitive and behavioral facets that have predictive validity for career fit, not the full personality model. Schwartz's basic values for the explicit work-values inputs. O*NET for the occupational data backbone, including Holland-code matching for career clusters.",
        ],
      },
      {
        heading: "Where we extend",
        paragraphs: [
          'The "hidden talents" detection is a pattern across the validated dimensions, not a new construct. Cross-source correlation flags convergent / divergent / hidden-talent insights from the same dimension data. Confidence scoring is a deterministic function of source diversity, evidence count, and cross-source agreement — see /methodology for the math.',
        ],
      },
    ],
  },
  {
    slug: "credits-not-charges",
    title: "Credits, not charges",
    description:
      "Every Lumina plan grants a monthly AI-credit pool. Operations debit at their real cost. You will never be billed for AI usage beyond your subscription.",
    publishedAt: "2026-04-01",
    byline: "Lumina team",
    category: "Product",
    readingTimeMin: 4,
    body: [
      {
        heading: "The pricing principle",
        paragraphs: [
          "AI-heavy SaaS products have two failure modes on pricing. The first is opaque — a flat rate that has to be conservative enough to cover heavy users, which means light users overpay. The second is too transparent — pay-as-you-go meters that surprise people with bills.",
          "Lumina takes a third path. Each plan grants a monthly AI-credit pool. Operations debit credits at their real cost. If you exhaust the pool, credit-bound operations pause until the next cycle. You will never be billed for AI usage beyond your subscription. No overage, no surprises.",
        ],
      },
      {
        heading: "What 1 credit costs",
        paragraphs: [
          "One credit equals about $0.01 of estimated Gemini work. We track real token usage server-side and debit your pool from that. A full first-time assessment fits comfortably in roughly 50 credits; ongoing snapshots and re-runs are much smaller. Pro+ rolls over up to three months of unused credits to absorb workflow spikes.",
        ],
        callout: {
          variant: "success",
          text: "See /pricing for the full operation table — what each operation costs and how much each tier includes.",
        },
      },
    ],
  },
];

export const BLOG_POSTS: readonly BlogPost[] = POSTS.sort((a, b) =>
  a.publishedAt < b.publishedAt ? 1 : -1
);

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getAllBlogSlugs(): readonly string[] {
  return BLOG_POSTS.map((p) => p.slug);
}
