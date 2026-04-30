import type { ProseSection } from "./prose";

export interface UseCase {
  /** URL slug, used for `/use-cases/{slug}`. */
  slug: string;
  /** Page title (h1). */
  title: string;
  /** One-line description, used in metadata + index card. */
  description: string;
  /** Persona this use case is written for. */
  persona: string;
  /** Eyebrow / category label (shown above the title). */
  eyebrow: string;
  /** Plan that fits best, by id. */
  recommendedPlan: "STARTER" | "PRO" | "PRO_PLUS";
  /** Three-to-five outcomes the user can expect from this use case. */
  outcomes: string[];
  /** Long-form body. */
  body: ProseSection[];
}

const USE_CASES: UseCase[] = [
  {
    slug: "career-pivot-after-thirty",
    title: "Career pivot after 30 — without the spreadsheet of doom",
    description:
      "You have a decade of work history, real preferences, and not enough time to start over. Lumina maps your existing data into directions that keep what's working.",
    persona: "Mid-career pivot",
    eyebrow: "Career change",
    recommendedPlan: "PRO",
    outcomes: [
      "Three to five concrete career directions that build on, not contradict, your existing experience",
      "A confidence-weighted view of which strengths transfer and which need new context",
      "An action plan with quarterly milestones, not vague aspirations",
      "Evidence pointers showing where each recommendation came from",
    ],
    body: [
      {
        heading: "What this looks like",
        paragraphs: [
          "Career pivots after 30 fail not because the person picked the wrong direction, but because the direction-picking process ignored the depth of work already done. A spreadsheet of every job ever held does not capture which projects you stayed late for. A questionnaire about hypothetical preferences does not match what your actual writing reveals.",
          "Lumina starts the other direction: connect Drive, Notion, and your sent mail. The corpus analyzer extracts themes and skill signals from the work you have actually shipped. The adaptive quiz then probes only the dimensions where evidence is thin.",
        ],
      },
      {
        heading: "Why Pro fits",
        paragraphs: [
          "A pivot benefits from the cross-source correlator — patterns that emerge only when data, quiz, and session converge — and from the quarterly deep re-assessment, since serious pivots play out over months. Pro includes both.",
        ],
      },
      {
        heading: "What you do after the report",
        paragraphs: [
          "The action plan groups recommendations by timeframe — what to test in the next 30 days, what to invest in over the next quarter, what to revisit at six months. The monthly evolution snapshot tracks whether the directions are firming up or still ambiguous as you collect new evidence.",
        ],
      },
    ],
  },
  {
    slug: "new-grad-finding-direction",
    title: "New grad — finding direction without picking a label",
    description:
      "You have GPA, internships, projects, no clear narrative. Lumina builds the narrative from the trail you have already left.",
    persona: "Recent graduate",
    eyebrow: "Early career",
    recommendedPlan: "STARTER",
    outcomes: [
      "A coherent talent narrative built from your real coursework, projects, and writing",
      "Career matches that are not just 'jobs your major maps to'",
      "Concrete next-step suggestions for the first 90 days",
      "Hidden-talent detection — the things you keep doing without noticing",
    ],
    body: [
      {
        heading: "The narrative gap",
        paragraphs: [
          "New graduates often face a structural mismatch: the career-services question is 'what's your story', but the only material available to construct that story is a GPA, two internships, and a handful of projects. The story rarely writes itself.",
          "Lumina builds the structural answer for you. Connecting a Drive folder of papers, a few significant emails, and your written submissions gives the corpus analyzer enough to extract real themes. The quiz then targets the gaps. The session — even a short 15-minute one — adds confidence to behavioral dimensions.",
        ],
      },
      {
        heading: "Starter is enough",
        paragraphs: [
          "For a first assessment with limited corpus, Starter's 75-credit pool covers the full pipeline (about 50 credits) plus a monthly evolution snapshot. As you accumulate work and want re-runs, upgrading to Pro lifts the credit ceiling.",
        ],
      },
      {
        heading: "Hidden talents",
        paragraphs: [
          "The most common new-grad surprise: hidden talents. Patterns that span coursework + projects + email — like 'consistently does the explainer-document role on group projects' or 'the codebases you stay in longest are the ones with the messiest README' — are visible to the cross-source analysis even when they were invisible to you.",
        ],
        callout: {
          variant: "info",
          text: "Hidden talents are derived patterns across validated dimensions, not invented constructs. See /methodology for how the detection works.",
        },
      },
    ],
  },
  {
    slug: "returning-to-work",
    title: "Returning to work after a break",
    description:
      "Time off does not erase what you know — but it does change which directions are realistic. Lumina re-grounds the assessment in who you are now.",
    persona: "Returning professional",
    eyebrow: "Career re-entry",
    recommendedPlan: "PRO",
    outcomes: [
      "An honest map of which previous strengths still apply and which need refresh",
      "Realistic re-entry paths sorted by friction, not just title fit",
      "Time-aware action plan that respects current life constraints",
      "Confidence scores that reflect current evidence, not historical assumptions",
    ],
    body: [
      {
        heading: "Why a fresh assessment matters",
        paragraphs: [
          "Returning to work is not the same as picking up a paused career. Time changes what you optimize for, what you have patience for, and what you are willing to ramp on. A returning-to-work assessment that just dusts off the old resume misses the point.",
          "Lumina re-grounds the assessment in evidence from now. Recent connected data — current Notion notes, recent emails, current writing — weights heavier than older corpus. The quiz constraints module captures current flexibility around hours, location, and ramp.",
        ],
      },
      {
        heading: "What Pro adds",
        paragraphs: [
          "Pro includes the cross-source correlator (which catches the gap between 'who you used to be' signals and 'who you are now' signals) and the quarterly deep re-assessment (so the assessment evolves with you as the re-entry stabilizes).",
        ],
      },
    ],
  },
  {
    slug: "for-coaches-and-advisors",
    title: "For coaches and advisors — using Lumina with clients",
    description:
      "Lumina gives you an evidence-grounded baseline before the first conversation, so you can spend the session on judgment, not data collection.",
    persona: "Coach / advisor",
    eyebrow: "Professional use",
    recommendedPlan: "PRO_PLUS",
    outcomes: [
      "Coach-shareable PDF reports your client can take with them",
      "An evidence-grounded baseline before the first session",
      "Up to five client profiles managed under one Pro+ account",
      "Read-only API access for your own integrations",
    ],
    body: [
      {
        heading: "What changes for the coach",
        paragraphs: [
          "Coaching sessions tend to spend their first third on data-gathering — what the client has done, what they tried, what stuck. Lumina compresses that work into a structured baseline the client brings to the first session. You start from a confidence-weighted profile, not from zero.",
        ],
      },
      {
        heading: "Why Pro+",
        paragraphs: [
          "Pro+ is the tier built for coach use: coach mode for managing multiple client profiles, the coach-shareable PDF report, priority session scheduling for time-sensitive client needs, read-only API access if you integrate Lumina into your own dashboard, and a 600-credit monthly pool sized for several active clients.",
        ],
        callout: {
          variant: "success",
          text: "Coach mode is opt-in per client — clients always own their report and can revoke access at any time.",
        },
      },
    ],
  },
  {
    slug: "exploring-while-employed",
    title: "Exploring directions while still employed",
    description:
      "You are not unhappy in your current role — but you have a hunch there is a better fit out there. Lumina helps you check the hunch without disrupting work.",
    persona: "Employed professional",
    eyebrow: "Direction check",
    recommendedPlan: "STARTER",
    outcomes: [
      "An honest check on whether your current direction is still the best fit",
      "Career matches you might not have considered — anchored in your real work",
      "A low-friction action plan that respects your current obligations",
      "Evolution snapshots so you can revisit in six months without redoing the work",
    ],
    body: [
      {
        heading: "The 'hunch' problem",
        paragraphs: [
          "A hunch that there is a better fit out there is hard to act on without evidence. Resigning to figure it out is risky. Asking your network is biased toward the directions they already know. Lumina runs the assessment in the background — the data sources you connect, the 30 minutes of quiz, the 15-minute session — and returns a confidence-weighted view of whether the hunch holds water.",
        ],
      },
      {
        heading: "Starter, with snapshots",
        paragraphs: [
          "Starter covers the assessment plus monthly evolution snapshots — exactly what a direction-check needs. Snapshots show whether your profile is firming up around the current direction or drifting elsewhere. Many users run Starter for a few months before deciding whether to act.",
        ],
      },
    ],
  },
];

export const USE_CASES_LIST: readonly UseCase[] = USE_CASES;

export function getUseCase(slug: string): UseCase | undefined {
  return USE_CASES_LIST.find((u) => u.slug === slug);
}

export function getAllUseCaseSlugs(): readonly string[] {
  return USE_CASES_LIST.map((u) => u.slug);
}
