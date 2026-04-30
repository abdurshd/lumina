import type { Metadata } from "next";
import Link from "next/link";
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  Trash2,
  Download,
  ServerCog,
  Database,
  FileCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Security & Privacy — Lumina",
  description:
    "How Lumina protects your data: ephemeral live-session tokens, deny-by-default Firestore rules, transient raw content, and explicit consent for behavioral inference.",
  openGraph: {
    title: "Security & Privacy — Lumina",
    description:
      "How Lumina protects your data: ephemeral live-session tokens, deny-by-default Firestore rules, transient raw content, and explicit consent for behavioral inference.",
    type: "website",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Lumina",
  url: "https://lumina.app",
  description:
    "Multimodal talent-discovery platform that helps people find their strongest career direction through connected data sources, adaptive psychometric assessment, live AI conversation, and evidence-grounded recommendations.",
};

interface PrincipleCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function PrincipleCard({ icon, title, description }: PrincipleCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

export default function SecurityPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is required as raw JSON
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationJsonLd),
        }}
      />

      <div className="mx-auto max-w-4xl px-6 py-16">
        <Link
          href="/"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          &larr; Back to Lumina
        </Link>

        <header className="mt-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <Shield className="h-3 w-3" />
            Security & Privacy
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl">
            Built so you can connect your real life
            <br className="hidden md:block" />
            without giving it away.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">
            Lumina sees more about you than most products do — your Gmail, your
            Drive, your Notion, your live voice and (with explicit consent)
            video. We took that as a constraint, not a feature. Here is exactly
            what we do, what we do not do, and how the architecture enforces
            both.
          </p>
        </header>

        {/* The five principles */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold">Five principles, enforced in code</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <PrincipleCard
              icon={<KeyRound className="h-5 w-5" />}
              title="No API keys in the browser"
              description="GEMINI_API_KEY never leaves the server. Live multimodal sessions use server-minted ephemeral tokens with a short TTL and a constrained model scope. If a token leaks, the blast radius is one session, not the account."
            />
            <PrincipleCard
              icon={<Database className="h-5 w-5" />}
              title="Deny-by-default Firestore rules"
              description="Every collection in our database starts with allow read, write: if false. Read access is granted only on a per-user, per-collection basis through request.auth.uid checks. Write access for agentLogs and reports is server-only via the Admin SDK."
            />
            <PrincipleCard
              icon={<EyeOff className="h-5 w-5" />}
              title="Raw imported content is transient"
              description="When we connect Gmail, Drive, Notion, or your ChatGPT export, we extract structured signals and discard the raw text. We do not retain long-term copies of your emails, documents, chats, or video recordings."
            />
            <PrincipleCard
              icon={<Eye className="h-5 w-5" />}
              title="Behavioral inference is consent-only and bounded"
              description="If you grant video consent for the live session, we observe coaching-style signals only — engagement, hesitation, confidence patterns, communication style. Decline at any moment and the session continues without the camera. Your choice is visible in the agent decision log."
            />
            <PrincipleCard
              icon={<Lock className="h-5 w-5" />}
              title="BYOK supported"
              description="If your organization or local laws require it, you can bring your own Gemini API key. Lumina then routes your inference through your key instead of ours, with no change to the product surface."
            />
          </div>
        </section>

        {/* What Lumina observes vs does not observe */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold">
            What Lumina observes — and what it does not
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            Behavioral inference is the most easily-misunderstood part of any
            multimodal AI product. We are explicit about it because we have to
            be.
          </p>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6">
              <h3 className="flex items-center gap-2 text-base font-semibold text-emerald-600 dark:text-emerald-400">
                <FileCheck className="h-4 w-4" />
                We observe (with consent)
              </h3>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-foreground">
                <li>
                  <strong>Engagement</strong> — turn-taking patterns, response
                  latency, follow-up depth.
                </li>
                <li>
                  <strong>Hesitation</strong> — pauses before answering certain
                  question categories.
                </li>
                <li>
                  <strong>Confidence patterns</strong> — voice steadiness,
                  certainty markers in your phrasing.
                </li>
                <li>
                  <strong>Communication style</strong> — concision, narrative
                  preference, abstraction level.
                </li>
              </ul>
              <p className="mt-4 text-xs text-muted-foreground">
                Each observation is paired with the session moment that produced
                it, so you can see the evidence in the agent decision log and
                disagree with our interpretation at any time.
              </p>
            </div>

            <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-6">
              <h3 className="flex items-center gap-2 text-base font-semibold text-rose-600 dark:text-rose-400">
                <EyeOff className="h-4 w-4" />
                We never claim
              </h3>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-foreground">
                <li>
                  <strong>Identity recognition.</strong> We do not run face
                  recognition or attempt to identify you from your video.
                </li>
                <li>
                  <strong>Medical diagnosis.</strong> Lumina is not a medical
                  device. No mood, mental-health, or neurological inferences.
                </li>
                <li>
                  <strong>Immutable personality certainty.</strong> Your traits
                  evolve. We report tendencies with confidence scores, never as
                  fixed labels.
                </li>
                <li>
                  <strong>Legally or academically consequential decisions from
                  video alone.</strong> Hiring, admissions, and similar
                  outcomes require evidence sources beyond what a Lumina session
                  provides.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Data lifecycle */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold">The data lifecycle</h2>
          <ol className="mt-6 space-y-6 border-l border-border pl-6">
            <li>
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <ServerCog className="h-4 w-4 text-primary" />
                Step 1 — Ingest
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                You connect a source (Gmail, Drive, Notion, ChatGPT export, or
                file upload). Raw content streams server-side; the corpus
                analyzer extracts career-relevant signals and writes only the
                derived signals to Firestore.
              </p>
            </li>
            <li>
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <ServerCog className="h-4 w-4 text-primary" />
                Step 2 — Assess
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                The orchestrator runs the adaptive quiz, scores responses
                against the 31-dimension framework, and (with explicit consent)
                runs the live session. Each agent action is logged with
                confidence-before / confidence-after to the agent decision log.
              </p>
            </li>
            <li>
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <ServerCog className="h-4 w-4 text-primary" />
                Step 3 — Generate
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                The report agent runs draft → critique → refine → validate. Every
                claim in your report carries an evidence pointer (which quiz
                answer, which session moment, which corpus signal) and a
                confidence number.
              </p>
            </li>
            <li>
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Trash2 className="h-4 w-4 text-primary" />
                Step 4 — Discard
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Raw imported content is discarded after extraction. Live-session
                video is not stored unless you explicitly asked us to. Audio
                transcripts are retained only as the structured behavioral
                timeline, not as audio files.
              </p>
            </li>
          </ol>
        </section>

        {/* Your controls */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold">Your controls</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-5">
              <Download className="mb-3 h-5 w-5 text-primary" />
              <h3 className="text-base font-semibold">Export everything</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                One-click export of every signal, quiz answer, session
                observation, and report Lumina holds about you. JSON or PDF.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <Trash2 className="mb-3 h-5 w-5 text-primary" />
              <h3 className="text-base font-semibold">Delete everything</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Permanent deletion across Firestore, derived signals, and
                connection tokens. Confirmed in &lt; 30 days under GDPR; usually
                same-hour.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <KeyRound className="mb-3 h-5 w-5 text-primary" />
              <h3 className="text-base font-semibold">Disconnect any source</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Remove a connected account at any time. Future re-assessments
                will run without it; past evidence remains until you delete.
              </p>
            </div>
          </div>
        </section>

        {/* Compliance status */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold">Compliance status</h2>
          <div className="mt-6 rounded-xl border border-border bg-card p-6">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Lumina is in active build toward SOC 2 Type 1. We follow a
              documented data-protection posture today and publish material
              security changes in our changelog. For B2B procurement reviews we
              provide a sub-processors list, our DPA template, and the
              architecture summary on request — email{" "}
              <a
                className="text-foreground underline-offset-4 hover:underline"
                href="mailto:security@lumina.app"
              >
                security@lumina.app
              </a>
              .
            </p>
          </div>
        </section>

        {/* Footer links */}
        <section className="mt-16 border-t border-border pt-8">
          <p className="text-sm text-muted-foreground">
            Related:{" "}
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
            {" · "}
            <a
              className="text-foreground underline-offset-4 hover:underline"
              href="mailto:security@lumina.app"
            >
              Report a vulnerability
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
