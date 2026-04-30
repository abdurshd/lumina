import type { Metadata } from "next";
import Link from "next/link";
import { LifeBuoy, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Help center — Lumina",
  description:
    "Answers to the most common questions about Lumina — getting started, connections, the assessment, the live session, reports, billing, and account controls.",
  openGraph: {
    title: "Help center — Lumina",
    description:
      "Answers to the most common questions about Lumina — getting started, connections, the assessment, the live session, reports, billing, and account controls.",
    type: "website",
  },
};

interface FaqEntry {
  q: string;
  a: string;
}

interface FaqSection {
  id: string;
  title: string;
  description: string;
  faqs: FaqEntry[];
}

const SECTIONS: FaqSection[] = [
  {
    id: "getting-started",
    title: "Getting started",
    description: "What Lumina is, who it is for, and how to begin.",
    faqs: [
      {
        q: "What is Lumina?",
        a: "Lumina is a multimodal talent-discovery platform. It synthesizes signals from your connected data sources, an adaptive psychometric assessment, and a live AI conversation into a single evidence-grounded talent profile with career recommendations.",
      },
      {
        q: "Who is Lumina for?",
        a: "Anyone trying to understand what they should be doing — career discovery, mid-career pivots, returning to work, or coaches and advisors who want a deeper assessment for their clients. The product is designed for adults; the launch age gate is 18+.",
      },
      {
        q: "How long does a full assessment take?",
        a: "Most users finish in under 30 minutes. Connecting one or two sources takes a few minutes; the adaptive quiz runs five short modules; the live session is typically 15-20 minutes. The report generates immediately afterward.",
      },
      {
        q: "Do I have to connect data sources to use Lumina?",
        a: "You can complete an assessment with the quiz and live session alone, but the full evidence quality requires at least one connected source. Recommendations are gated by per-dimension confidence — without source data, several dimensions will stay below threshold.",
      },
      {
        q: "Is there a free tier?",
        a: "No. Lumina is paid-only — no free tier, no freemium. We have a 7-day refund on the first month and you can cancel anytime. See /pricing for the three plans.",
      },
    ],
  },
  {
    id: "connections",
    title: "Connections & data sources",
    description: "What you can connect, how it is processed, what happens to it.",
    faqs: [
      {
        q: "Which data sources can I connect?",
        a: "Five at launch: Gmail (sent mail), Google Drive (your Docs), Notion (notes and pages), a ChatGPT export, and direct file uploads (resumes, portfolios, writing samples).",
      },
      {
        q: "What does Lumina extract from my data?",
        a: "Themes, skills, interests, communication patterns, and career-relevant signals. We do not retain raw text — the corpus analyzer extracts structured signals and the source content is discarded.",
      },
      {
        q: "Can I disconnect a source later?",
        a: "Yes, at any time, from Settings. Past evidence derived from that source remains in your profile until you delete it; future re-runs simply skip the disconnected source.",
      },
      {
        q: "Does Lumina read my whole inbox?",
        a: "We sample your sent mail, not received mail, and we sample — we do not pull every message. You see exactly what was analyzed in the agent decision log.",
      },
      {
        q: "Can I bring private files that aren't on Google or Notion?",
        a: "Yes — file uploads support resumes, portfolios, writing samples, and similar documents. They are processed once and discarded after extraction, like any other source.",
      },
    ],
  },
  {
    id: "assessment",
    title: "The adaptive quiz",
    description: "How the assessment is structured and how it adapts to your data.",
    faqs: [
      {
        q: "How is the quiz adaptive?",
        a: "Two ways. First, questions are generated against your connected-data context, so the quiz probes where evidence is thin rather than asking what your data already shows. Second, after each module, the orchestrator picks the next module that covers the most low-confidence dimensions.",
      },
      {
        q: "How many questions are there?",
        a: "Five modules of roughly six adaptive questions each — about 30 questions total, covering 31 dimensions across interests, cognitive style, and values.",
      },
      {
        q: "What if I disagree with a quiz question's framing?",
        a: "Pick the closest answer; the agent weighs the entire response set, not any single answer. The decision log shows how each answer mapped to dimension scores.",
      },
      {
        q: "Can I pause the quiz and come back later?",
        a: "Yes. Module progress is saved as you go, and you can resume from the last unanswered question. Modules can be taken in any order.",
      },
    ],
  },
  {
    id: "live-session",
    title: "The live AI session",
    description: "What happens during the conversation, what is observed, what is not.",
    faqs: [
      {
        q: "Do I have to turn on my camera?",
        a: "No. The session works with audio alone. With explicit consent, video adds behavioral signals — engagement, hesitation, posture cues — that strengthen behavioral and communication dimensions. Decline at any moment and the session continues.",
      },
      {
        q: "What does Lumina observe during a video session?",
        a: "Engagement, hesitation patterns, confidence patterns, and communication style. We do not run face recognition, infer mood or mental health, or store the video. See /security for the explicit non-claims.",
      },
      {
        q: "How long is the live session?",
        a: "Tier-dependent: 15 minutes on Starter, up to 30 on Pro, up to 45 on Pro+. Most users find 15-20 minutes is the sweet spot.",
      },
      {
        q: "Can I retake the session if it didn't go well?",
        a: "Yes. Each tier includes one or more sessions per month. The new session adds to the behavioral evidence; previous observations are retained but new ones can override them as your profile evolves.",
      },
    ],
  },
  {
    id: "reports",
    title: "Reports & evidence",
    description: "How reports are generated and how to read them.",
    faqs: [
      {
        q: "Why is there an agent decision log on my report?",
        a: "Every claim in your report carries an evidence pointer (which source, which quiz answer, which session moment) and a confidence number. The decision log is the audit trail — you can replay how the agent arrived at every conclusion.",
      },
      {
        q: "How is confidence computed for each dimension?",
        a: "Three factors: source diversity (one type → 0.6×, two → 0.8×, three → 1.0×), evidence count (more evidence raises the multiplier up to a cap), and cross-source agreement (a small bonus when sources concur). See /methodology for the full math.",
      },
      {
        q: "Why are some career matches shown as 'directional' rather than 'recommended'?",
        a: "When the underlying confidence for a match falls below threshold, we present it as directional — interesting but not yet evidenced enough. Adding more sources or completing more modules will often promote a directional match into a recommendation.",
      },
      {
        q: "Can I share my report?",
        a: "Yes — Pro and Pro+ include a privacy-preserving share-your-report link. The shared version anonymizes personal evidence excerpts while preserving the structural insights and career matches.",
      },
    ],
  },
  {
    id: "privacy",
    title: "Privacy & security",
    description: "What we keep, what we discard, what we never claim.",
    faqs: [
      {
        q: "Where is my data stored?",
        a: "Firestore with deny-by-default rules — every collection denies access by default and we explicitly grant read access only on a per-user, per-collection basis. Server-only writes for agent logs and reports go through the Admin SDK.",
      },
      {
        q: "Do you train models on my data?",
        a: "No. Your data is processed in your account context and is not added to any training corpus. Inference runs through Gemini APIs with your account's session.",
      },
      {
        q: "Can I export everything Lumina has on me?",
        a: "Yes. Settings → Data Export gives you a JSON file with every signal, score, observation, and report. No customer-support hop required.",
      },
      {
        q: "What happens when I delete my account?",
        a: "Permanent deletion across Firestore, derived signals, and connection tokens. Confirmed within 30 days under GDPR; usually same-hour for the structured records.",
      },
    ],
  },
  {
    id: "billing",
    title: "Billing & credits",
    description: "How the credit pool works and how to manage your subscription.",
    faqs: [
      {
        q: "What is a credit?",
        a: "One credit equals about $0.01 of Gemini AI work. Operations debit credits from your monthly pool at their real cost. We track actual token usage, so you only pay for what you run.",
      },
      {
        q: "What if I run out of credits mid-month?",
        a: "Credit-bound operations pause until your next billing cycle (or you upgrade). Your subscription features keep working — you can still read your existing report, view dashboards, and export data.",
      },
      {
        q: "Do unused credits roll over?",
        a: "Starter: no rollover. Pro: 1 month. Pro+: 3 months. Beyond the rolling window, unused credits expire to keep accounting predictable.",
      },
      {
        q: "Can I cancel anytime?",
        a: "Yes. Cancellation stops the next renewal; access continues until the end of the period you paid for. Within the first 7 days of your first month, you can request a full refund.",
      },
    ],
  },
  {
    id: "account",
    title: "Account & access",
    description: "Managing your account, login, and BYOK.",
    faqs: [
      {
        q: "How do I sign in?",
        a: "Currently with Google OAuth via Firebase Auth. Email-link and SSO options are on the roadmap for B2B deployments.",
      },
      {
        q: "What is BYOK and do I need it?",
        a: "Bring-your-own-key — you supply your Gemini API key and inference is routed through your key instead of ours. Most users will not need it; some enterprise deployments require it for compliance reasons. Configurable in Settings on every tier.",
      },
      {
        q: "I'm getting an error in the live session — what should I check?",
        a: "First, that camera and microphone permissions are granted. Second, that you're on a stable network — the live session uses a websocket connection. Third, that your browser supports WebRTC (Chrome, Edge, Safari, and Firefox all do). If problems persist, contact support.",
      },
      {
        q: "How do I contact support?",
        a: "Email hello@lumina.app for product and account questions, security@lumina.app for security disclosures. Pro+ subscribers get a 24-hour response SLA; other tiers get best-effort.",
      },
    ],
  },
];

const TOTAL_FAQ_COUNT = SECTIONS.reduce((sum, s) => sum + s.faqs.length, 0);

export default function HelpPage() {
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
            <LifeBuoy className="h-3 w-3" />
            Help center
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl">
            Answers to {TOTAL_FAQ_COUNT}{" "}
            <span className="text-primary">common questions.</span>
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">
            If your question is not here, email{" "}
            <a
              href="mailto:hello@lumina.app"
              className="text-foreground underline-offset-4 hover:underline"
            >
              hello@lumina.app
            </a>{" "}
            — we read everything.
          </p>
        </header>

        {/* Table of contents */}
        <nav className="mt-10 rounded-xl border border-border bg-card p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Jump to
          </p>
          <ul className="grid gap-2 text-sm sm:grid-cols-2">
            {SECTIONS.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="text-foreground underline-offset-4 hover:underline"
                >
                  {section.title}
                </a>
                <span className="ml-2 text-xs text-muted-foreground">
                  ({section.faqs.length})
                </span>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sections */}
        {SECTIONS.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className="mt-16 scroll-mt-16"
          >
            <h2 className="text-2xl font-semibold">{section.title}</h2>
            <p className="mt-2 text-base leading-relaxed text-muted-foreground">
              {section.description}
            </p>
            <div className="mt-6 space-y-3">
              {section.faqs.map((faq) => (
                <details
                  key={faq.q}
                  className="group rounded-xl border border-border bg-card p-5 transition-colors open:border-primary/30"
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
            </div>
          </section>
        ))}

        {/* Contact CTA */}
        <section className="mt-20 rounded-2xl border border-border bg-card p-8 md:p-12">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Still not answered?</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Email{" "}
                <a
                  href="mailto:hello@lumina.app"
                  className="text-foreground underline-offset-4 hover:underline"
                >
                  hello@lumina.app
                </a>{" "}
                with as much detail as you can — links to the report or session
                are helpful when relevant. Security disclosures go to{" "}
                <a
                  href="mailto:security@lumina.app"
                  className="text-foreground underline-offset-4 hover:underline"
                >
                  security@lumina.app
                </a>
                .
              </p>
            </div>
          </div>
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
