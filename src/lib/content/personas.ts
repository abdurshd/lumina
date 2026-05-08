import type { ProseSection } from "./prose";
import type { PlanId } from "@/lib/pricing/tiers";

export interface PersonaFeature {
  title: string;
  body: string;
}

export interface PersonaPainSolution {
  pain: string;
  solution: string;
}

export interface PersonaFaq {
  q: string;
  a: string;
}

export interface Persona {
  /** URL slug — used for `/for-{slug}`. */
  slug: string;
  /** Eyebrow chip rendered above the title. */
  eyebrow: string;
  /** Primary headline. */
  title: string;
  /** Sub-headline below title. */
  subtitle: string;
  /** Used in metadata description and index. */
  description: string;
  /** Pain → solution rows rendered side-by-side. */
  painSolutions: PersonaPainSolution[];
  /** Concrete feature highlights for this persona. */
  features: PersonaFeature[];
  /** Plan that fits best, by id. */
  recommendedPlan: PlanId;
  /** One-line CTA copy on the buy button. */
  primaryCta: string;
  /** Closing prose sections rendered with ProseRenderer. */
  closing: ProseSection[];
  /** Persona-specific FAQs. */
  faqs: PersonaFaq[];
}

const PERSONAS: Persona[] = [
  {
    slug: "self-discovery",
    eyebrow: "For self-discovery",
    title: "Find out what you should be doing — grounded in what you've already done.",
    subtitle:
      "Lumina builds a confidence-weighted talent profile from your real digital footprint. No personality label. No five-question quiz pretending to know you.",
    description:
      "The self-discovery use case for Lumina — a confidence-weighted talent profile built from your digital footprint, an adaptive assessment, and a live AI conversation.",
    painSolutions: [
      {
        pain: "I've taken every personality quiz and none of them survived contact with a real decision.",
        solution:
          "Every claim in your Lumina report carries an evidence pointer — which source, which moment — and a confidence number. No claim ships without backing.",
      },
      {
        pain: "I have a hunch about what I'd be good at, but no way to check it without quitting and finding out.",
        solution:
          "The corpus analyzer surfaces patterns across the projects, writing, and conversations you've already done — including hidden talents you wouldn't have surfaced from any single source.",
      },
      {
        pain: "Career advice always feels like guessing.",
        solution:
          "Lumina uses validated frameworks (RIASEC, Big Five facets, O*NET) and confidence-gates every recommendation. If we can't point to evidence, we don't put it in the report.",
      },
    ],
    features: [
      {
        title: "Connect what you already have",
        body: "Gmail, Drive, Notion, ChatGPT exports, file uploads. The corpus analyzer extracts themes, skills, and interests — never raw content.",
      },
      {
        title: "Adaptive assessment",
        body: "Five quiz modules covering 31 dimensions, where questions adapt to what your data already shows.",
      },
      {
        title: "Live AI session",
        body: "A 15-20 minute conversation with the AI counselor — voice plus optional video — to refine the dimensions a quiz can't reach.",
      },
      {
        title: "Self-correcting report",
        body: "Generate → critique → identify weak sections → refine → validate. The agent's reasoning is visible to you, not buried.",
      },
    ],
    recommendedPlan: "STARTER",
    primaryCta: "Start your assessment",
    closing: [
      {
        heading: "What you walk away with",
        paragraphs: [
          "A talent radar across 31 validated dimensions. A confidence-weighted view of strengths and hidden talents. Career matches grounded in O*NET data and your actual evidence — not generic mappings from a major to a job title.",
          "An action plan that respects your current life, not an idealized version of it. And monthly evolution snapshots so you can see whether your profile is firming up around something specific or staying broad — both are valid signals.",
        ],
      },
    ],
    faqs: [
      {
        q: "Will Lumina just confirm what I already think about myself?",
        a: "Often, partly. Validation of strong patterns is useful — it tells you which directions deserve serious investment. But the cross-source correlator is specifically designed to surface hidden talents and divergent patterns you wouldn't have predicted, so the report rarely lines up exactly with your own self-image.",
      },
      {
        q: "What if I haven't built up much digital footprint yet?",
        a: "Even one or two connected sources plus the quiz and live session are enough for a meaningful first profile. Confidence will be lower on data-bound dimensions, and the report tells you that explicitly. As you accumulate more work over time, monthly snapshots refine the profile.",
      },
      {
        q: "What does Starter cover?",
        a: "Starter includes the full assessment (75 credits, comfortably above the ~50 a first-time assessment uses), one live session per month, the full report, and monthly evolution snapshots. See /pricing for the credit math.",
      },
    ],
  },
  {
    slug: "career-pivots",
    eyebrow: "For career pivots",
    title: "Make a serious career change — without starting from zero.",
    subtitle:
      "You have a decade of work history, real preferences, and not enough time for a from-scratch search. Lumina maps your existing depth into directions that keep what's working.",
    description:
      "The career-pivot use case for Lumina — a confidence-weighted assessment built on your existing work history, designed for serious mid-career change.",
    painSolutions: [
      {
        pain: "Every career-change tool seems built for new graduates.",
        solution:
          "Lumina starts from your real corpus — Drive, Notion, sent mail. The depth of work you've already done is the input, not a footnote.",
      },
      {
        pain: "I'm worried a pivot means throwing away what I'm best at.",
        solution:
          "The cross-source correlator identifies which strengths transfer (and where) and which need new context. The report makes the trade-off explicit.",
      },
      {
        pain: "I need a real plan, not five vague suggestions.",
        solution:
          "The action plan is sequenced — what to test in the first 30 days, what to invest in over the quarter, what to revisit at six months. Quarterly deep re-assessments track progress.",
      },
    ],
    features: [
      {
        title: "Cross-source correlator",
        body: "Patterns visible only when data, quiz, and session converge — convergent strengths, divergent signals, and hidden talents that survive a pivot.",
      },
      {
        title: "Quarterly deep re-assessment",
        body: "Pivots play out over months. Pro includes a full re-run each quarter that compares your new evidence against your previous profile.",
      },
      {
        title: "Coach-shareable PDF",
        body: "If you're working with a career coach or advisor, export the report as a structured PDF they can review.",
      },
      {
        title: "Confidence-gated career matches",
        body: "Matches that fall below threshold are shown as 'directional' rather than 'recommended' — no false confidence on weak evidence.",
      },
    ],
    recommendedPlan: "PRO",
    primaryCta: "Start your pivot assessment",
    closing: [
      {
        heading: "Why Pro fits the pivot",
        paragraphs: [
          "A pivot assessment is heavier than a baseline self-discovery. You want the cross-source correlator running across multiple connected sources, you want re-runs as you collect new evidence, and you'll likely want to share the report with a coach or partner. Pro covers all three.",
          "If you're early in the exploration and want to test the waters first, Starter is fine. Most pivots upgrade once they're serious about acting on the report.",
        ],
      },
    ],
    faqs: [
      {
        q: "I don't want my current employer to see anything. Is Lumina safe?",
        a: "Yes. Lumina connects to your personal data sources via OAuth — your employer never sees the connection. Raw imported content is processed in-memory and discarded; only derived signals persist. See /security for the full lifecycle.",
      },
      {
        q: "Can the report help me make a salary case in my next role?",
        a: "Indirectly. The report identifies your strongest transferable strengths with evidence pointers. You can use that evidence in interviews and negotiations, but Lumina does not produce salary benchmarks itself.",
      },
      {
        q: "What if I want to stay in my industry but change role?",
        a: "Same workflow. The career matches surface relevant clusters across all 16 O*NET groupings; many roles in your current industry will still appear if they fit your profile. The cross-source correlator is good at flagging same-industry-different-role pivots.",
      },
    ],
  },
  {
    slug: "coaches",
    eyebrow: "For coaches",
    title: "Skip the data-gathering. Start with judgment.",
    subtitle:
      "Lumina gives you a confidence-weighted client baseline before the first session — so you spend the conversation on judgment, not on intake.",
    description:
      "Lumina for career coaches and advisors — evidence-grounded client baselines, coach mode for up to 5 clients, and read-only API access for your own integrations.",
    painSolutions: [
      {
        pain: "The first third of every coaching session is data collection.",
        solution:
          "Clients arrive with a structured profile already in place. You start from the report, not from zero.",
      },
      {
        pain: "Clients want a deliverable they can take home.",
        solution:
          "Coach-shareable PDFs are first-class. Reports include the agent decision log so the client (and you) can audit the reasoning later.",
      },
      {
        pain: "I have multiple clients to manage.",
        solution:
          "Pro+ coach mode supports up to five client profiles per account, plus read-only API access if you maintain your own dashboard.",
      },
    ],
    features: [
      {
        title: "Coach mode (Pro+)",
        body: "Manage up to 5 client profiles under one account. Each client owns their report and can revoke access at any time.",
      },
      {
        title: "Coach-shareable PDFs",
        body: "Branded, structured PDFs with the full report, decision log, and action plan. Print-friendly and skim-friendly.",
      },
      {
        title: "Priority session scheduling",
        body: "Faster live-session slots when client timelines are tight.",
      },
      {
        title: "Read-only API",
        body: "Pull profile snapshots into your own client dashboard if you have one. Read-only by design — writes go through the client's own account.",
      },
    ],
    recommendedPlan: "PRO_PLUS",
    primaryCta: "Try coach mode",
    closing: [
      {
        heading: "How the coach workflow runs",
        paragraphs: [
          "The client signs up and runs their assessment under their own account — they own their data. From your Pro+ account, you connect to that client (with their explicit consent) and the report becomes visible in your coach dashboard.",
          "You arrive at the first session with the report in hand: confidence per dimension, top strengths with evidence, career matches with O*NET cluster mapping, an action plan keyed to their constraints. The conversation can start at depth.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can I co-brand the PDF report?",
        a: "Coach branding is on the roadmap for Pro+. The current PDF includes your name as the connected coach but does not yet support custom logos. We add this in a planned content update — see /changelog.",
      },
      {
        q: "How does client revocation work?",
        a: "The client can revoke your coach access at any time from their settings. Their report and data remain entirely with them; you lose visibility immediately, but any prior PDFs you exported are not retracted.",
      },
      {
        q: "Is there a volume tier for larger practices?",
        a: "Pro+ caps at 5 simultaneous client profiles. For larger practices we are scoping a Lumina for Coaches plan — email hello@lumina.app to join the early-access list.",
      },
    ],
  },
  {
    slug: "schools",
    eyebrow: "For schools (higher ed)",
    title: "Career services that scales — without scripted advice.",
    subtitle:
      "Give every student an evidence-grounded talent profile they can take with them. Lumina handles the assessment depth so your team can focus on relationships and decisions.",
    description:
      "Lumina for higher-education career services — institutional pricing, evidence-grounded student profiles, and reporting designed for cohort-level visibility.",
    painSolutions: [
      {
        pain: "Career services has limited counselor hours and growing student demand.",
        solution:
          "Lumina runs the assessment depth — corpus analysis, adaptive quiz, behavioral session, evidence-backed report — so counselor sessions can focus on judgment.",
      },
      {
        pain: "Generic personality quizzes don't help when a student is choosing between specific paths.",
        solution:
          "Career matches use validated O*NET clusters with confidence scores. Students see why each match was made, with evidence they can verify.",
      },
      {
        pain: "We need cohort-level reporting, not just individual reports.",
        solution:
          "Institutional dashboards (in development) surface dimension distributions and hidden-talent patterns across a cohort, while keeping individual data private to the student.",
      },
    ],
    features: [
      {
        title: "Student-owned reports",
        body: "Each student owns their data and report. Institution access is consent-based and revocable.",
      },
      {
        title: "Cohort visibility",
        body: "Counselors see aggregate signals across opted-in cohorts. Individual reports remain student-only unless explicitly shared.",
      },
      {
        title: "O*NET-backed career matches",
        body: "Recommendations cite Holland codes and O*NET cluster IDs, so career-services teams can connect to existing employer networks.",
      },
      {
        title: "Privacy-first by design",
        body: "Raw imported content is discarded after extraction. Behavioral signals require explicit consent. See /security for the full posture.",
      },
    ],
    recommendedPlan: "PRO_PLUS",
    primaryCta: "Talk to us about institutional pricing",
    closing: [
      {
        heading: "Where we are with higher ed",
        paragraphs: [
          "We are launching with consumer plans and onboarding higher-education partners deliberately. Institutional features — cohort dashboards, SSO, DPA, FERPA addendum, billing on invoice — are scoped and partially built; the right pace is one or two design partners per term, not broad rollout.",
          "If your career-services team wants to be a launch partner, email hello@lumina.app with your enrollment range and what you want a Lumina deployment to look like. We respond within 48 hours.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is there a FERPA-aligned data agreement?",
        a: "We are in active build toward a higher-ed-aligned DPA covering FERPA, GDPR, and institutional data-protection norms. It is available on request — email security@lumina.app.",
      },
      {
        q: "Can students use Lumina without their school?",
        a: "Yes — Lumina is consumer-first. The institutional layer is additive: students always own their reports and can use Lumina independently.",
      },
      {
        q: "Do you support SSO?",
        a: "SSO (Google Workspace and SAML) is on the roadmap for institutional deployments. Today, students sign in with personal Google accounts; institutional accounts are scoped for the next quarter.",
      },
    ],
  },
  {
    slug: "hr-teams",
    eyebrow: "For HR teams",
    title: "Internal mobility, grounded in actual evidence.",
    subtitle:
      "Help employees find the right next role inside your company. Lumina surfaces transferable strengths and hidden talents so internal mobility becomes signal-driven.",
    description:
      "Lumina for HR teams — evidence-grounded employee talent profiles for internal mobility, succession planning, and L&D, with strict data boundaries.",
    painSolutions: [
      {
        pain: "Internal mobility is mostly determined by who knows whom.",
        solution:
          "Lumina builds a confidence-weighted talent profile from each opted-in employee's data, surfacing transferable strengths the hiring manager wouldn't have seen.",
      },
      {
        pain: "Existing personality assessments produce labels nobody trusts.",
        solution:
          "Validated frameworks (RIASEC, Big Five facets, O*NET) plus confidence-gated recommendations. Reports cite evidence, not vibes.",
      },
      {
        pain: "Privacy and compliance matter more than the assessment itself.",
        solution:
          "Behavioral inference is consent-only. Raw content is discarded. The full data lifecycle is documented in /security and enforced in code.",
      },
    ],
    features: [
      {
        title: "Employee-owned reports",
        body: "Employees opt in individually and own their data. HR access is consent-based and time-bound.",
      },
      {
        title: "Internal-mobility career matches",
        body: "Career matches highlight directions that map to your existing job families. Configurable on request.",
      },
      {
        title: "DPA + sub-processor list",
        body: "Standard data-protection agreement and an up-to-date sub-processor list for procurement reviews.",
      },
      {
        title: "BYOK for compliance-heavy deployments",
        body: "Bring your own Gemini API key — inference runs through your account, not ours, when required by your compliance posture.",
      },
    ],
    recommendedPlan: "PRO_PLUS",
    primaryCta: "Talk to sales",
    closing: [
      {
        heading: "Where we are with HR teams",
        paragraphs: [
          "Like higher ed, our HR-team rollout is partner-led. We're scoping with a small number of design partners on what cohort dashboards, role-family tagging, and HRIS integration should look like before broad availability.",
          "If you run people operations or L&D and want internal mobility to be signal-driven, email hello@lumina.app with your team size and the integration profile (Google Workspace, Microsoft 365, HRIS). We are not selling at scale yet — early-partner pricing is real.",
        ],
      },
    ],
    faqs: [
      {
        q: "What does an HR deployment of Lumina look like in practice?",
        a: "Employees opt in individually under their work email. Their Lumina report is theirs, and they choose what (if anything) to share with HR or their manager. HR sees aggregate signals on opted-in cohorts; individual reports require employee consent each time.",
      },
      {
        q: "Can I use Lumina for hiring decisions?",
        a: "We do not recommend it. Lumina is built for self-discovery and internal mobility. Behavioral signals from a single session are not strong enough to support hiring decisions on their own — we are explicit about this in /security.",
      },
      {
        q: "What integrations are available?",
        a: "Google Workspace OAuth today. SAML SSO, HRIS sync (BambooHR / Workday / Rippling), and Slack/Teams notifications are scoped for institutional deployments.",
      },
    ],
  },
];

export const PERSONAS_LIST: readonly Persona[] = PERSONAS;

export const PERSONA_SLUGS = PERSONAS.map((p) => p.slug) as readonly Persona["slug"][];

export function getPersona(slug: string): Persona | undefined {
  return PERSONAS_LIST.find((p) => p.slug === slug);
}
