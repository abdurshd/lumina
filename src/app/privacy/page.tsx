import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Lumina",
  description: "Lumina privacy policy — how we handle your data",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; Back to Lumina
        </Link>

        <h1 className="mt-8 text-4xl font-bold tracking-tight">
          Privacy Policy
        </h1>
        <p className="mt-2 text-muted-foreground">
          Last updated: February 13, 2026
        </p>

        <div className="mt-10 space-y-8 text-base leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground">
              1. Introduction
            </h2>
            <p className="mt-3">
              Lumina (&quot;we&quot;, &quot;our&quot;, or &quot;the
              Service&quot;) is a multimodal talent-discovery platform that helps
              people find their strongest career direction. This Privacy Policy
              explains how we collect, use, and protect your information when you
              use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              2. Information We Collect
            </h2>
            <p className="mt-3">We may collect the following types of data:</p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>
                <strong className="text-foreground">Account information:</strong>{" "}
                name, email address, and profile photo provided through Google
                Sign-In.
              </li>
              <li>
                <strong className="text-foreground">
                  Connected data sources:
                </strong>{" "}
                with your explicit consent, we access data from Google Gmail,
                Google Drive, Notion, ChatGPT exports, or local file uploads to
                generate career insights.
              </li>
              <li>
                <strong className="text-foreground">
                  Assessment responses:
                </strong>{" "}
                answers you provide during psychometric assessments.
              </li>
              <li>
                <strong className="text-foreground">Live session data:</strong>{" "}
                during video/voice sessions, with your explicit consent, we may
                analyze behavioral signals (engagement, hesitation, confidence
                patterns, communication style) for coaching purposes only.
              </li>
              <li>
                <strong className="text-foreground">Usage data:</strong> basic
                analytics about how you interact with the Service.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              3. How We Use Your Information
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>
                To provide personalized talent discovery and career
                recommendations.
              </li>
              <li>
                To generate evidence-grounded reports including role matching,
                learning roadmaps, and portfolio tasks.
              </li>
              <li>
                To improve the accuracy and quality of our AI-driven analysis.
              </li>
              <li>To communicate with you about your account and the Service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              4. Data Processing and Storage
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>
                Raw imported source content (emails, documents, chat exports) is
                processed transiently and is not stored long-term.
              </li>
              <li>
                Derived assessment data defaults to session-only storage.
              </li>
              <li>
                We persist only minimal profile, consent, and settings data
                unless the product explicitly requires otherwise.
              </li>
              <li>
                We never permanently store full email content, full document text
                dumps, raw chat exports, or raw video recordings.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              5. Behavioral Inference
            </h2>
            <p className="mt-3">
              With your explicit consent, Lumina may analyze behavioral signals
              during live sessions for career coaching purposes. We will never
              use this data for identity recognition, medical diagnosis, or
              legally consequential decisions. All insights include confidence
              levels and supporting evidence.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              6. Third-Party Services
            </h2>
            <p className="mt-3">
              We use Google APIs (Gmail, Drive) to access your data with your
              explicit permission. Our use and transfer of information received
              from Google APIs adheres to the{" "}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-4 hover:text-primary/80"
              >
                Google API Services User Data Policy
              </a>
              , including the Limited Use requirements. We use Google Gemini for
              AI processing. Your data is processed according to Google&apos;s AI
              data policies and is not used for model training.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              7. Data Sharing
            </h2>
            <p className="mt-3">
              We do not sell, trade, or rent your personal information to third
              parties. We may share data only when required by law or to protect
              the rights and safety of our users.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              8. Your Rights
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Access and review the data we hold about you.</li>
              <li>Request deletion of your account and associated data.</li>
              <li>
                Revoke consent for connected data sources at any time through
                your settings.
              </li>
              <li>Opt out of behavioral inference during live sessions.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              9. Security
            </h2>
            <p className="mt-3">
              We implement industry-standard security measures to protect your
              data, including encrypted connections (HTTPS), server-side API key
              management, and ephemeral token-based authentication for live
              sessions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              10. Age Requirement
            </h2>
            <p className="mt-3">
              Lumina is intended for users aged 16 and above. We do not knowingly
              collect data from users under 16. If we become aware of such data,
              we will delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              11. Changes to This Policy
            </h2>
            <p className="mt-3">
              We may update this Privacy Policy from time to time. We will notify
              you of significant changes through the Service or via email.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              12. Contact Us
            </h2>
            <p className="mt-3">
              If you have questions about this Privacy Policy, contact us at{" "}
              <a
                href="mailto:abdrshdakbrv@gmail.com"
                className="text-primary underline underline-offset-4 hover:text-primary/80"
              >
                abdrshdakbrv@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
