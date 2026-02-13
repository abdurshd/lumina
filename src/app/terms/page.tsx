import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — Lumina",
  description: "Lumina terms of service — rules for using our platform",
};

export default function TermsOfServicePage() {
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
          Terms of Service
        </h1>
        <p className="mt-2 text-muted-foreground">
          Last updated: February 13, 2026
        </p>

        <div className="mt-10 space-y-8 text-base leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground">
              1. Acceptance of Terms
            </h2>
            <p className="mt-3">
              By accessing or using Lumina (&quot;the Service&quot;), you agree
              to be bound by these Terms of Service. If you do not agree to these
              terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              2. Description of Service
            </h2>
            <p className="mt-3">
              Lumina is a multimodal talent-discovery platform that uses AI to
              help users explore career directions through connected data source
              analysis, psychometric assessments, and live conversational
              sessions. The Service provides recommendations, learning roadmaps,
              and portfolio task suggestions based on your data and interactions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              3. Eligibility
            </h2>
            <p className="mt-3">
              You must be at least 16 years of age to use the Service. By using
              Lumina, you represent and warrant that you meet this age
              requirement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              4. User Accounts
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>
                You are responsible for maintaining the confidentiality of your
                account credentials.
              </li>
              <li>
                You agree to provide accurate and complete information when
                creating your account.
              </li>
              <li>
                You are responsible for all activities that occur under your
                account.
              </li>
              <li>
                You must notify us immediately of any unauthorized use of your
                account.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              5. Data and Connected Sources
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>
                By connecting data sources (Gmail, Google Drive, Notion, etc.),
                you grant Lumina permission to access and analyze the data for
                the purpose of generating career insights.
              </li>
              <li>
                You may revoke access to any connected data source at any time
                through your account settings.
              </li>
              <li>
                You are responsible for ensuring you have the right to share any
                data you provide to the Service.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              6. Consent for Live Sessions
            </h2>
            <p className="mt-3">
              Live video and voice sessions require your explicit consent before
              any behavioral analysis is performed. You may opt out of behavioral
              inference at any time during a session without affecting your
              ability to use other features of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              7. Acceptable Use
            </h2>
            <p className="mt-3">You agree not to:</p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>
                Use the Service for any unlawful purpose or in violation of any
                applicable laws.
              </li>
              <li>
                Attempt to reverse engineer, decompile, or disassemble any part
                of the Service.
              </li>
              <li>
                Interfere with or disrupt the Service or its infrastructure.
              </li>
              <li>
                Use the Service to harm, harass, or discriminate against others.
              </li>
              <li>
                Share your account credentials with third parties.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              8. Intellectual Property
            </h2>
            <p className="mt-3">
              The Service, including its design, features, and content, is owned
              by Lumina and protected by intellectual property laws. You retain
              ownership of any data you provide to the Service. Reports and
              insights generated by the Service are provided for your personal
              use.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              9. Disclaimers
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>
                Lumina provides career guidance and recommendations for
                informational purposes only. These do not constitute
                professional career counseling, medical advice, or legally
                binding assessments.
              </li>
              <li>
                The Service is provided &quot;as is&quot; without warranties of
                any kind, express or implied.
              </li>
              <li>
                We do not guarantee the accuracy, completeness, or reliability
                of any insights or recommendations generated by the Service.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              10. Limitation of Liability
            </h2>
            <p className="mt-3">
              To the maximum extent permitted by law, Lumina shall not be liable
              for any indirect, incidental, special, consequential, or punitive
              damages arising from your use of the Service, including but not
              limited to career decisions made based on the Service&apos;s
              recommendations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              11. Termination
            </h2>
            <p className="mt-3">
              We reserve the right to suspend or terminate your access to the
              Service at any time for violation of these terms. You may delete
              your account and associated data at any time through your account
              settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              12. Changes to Terms
            </h2>
            <p className="mt-3">
              We may update these Terms of Service from time to time. We will
              notify you of significant changes through the Service or via email.
              Continued use of the Service after changes constitutes acceptance
              of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              13. Contact Us
            </h2>
            <p className="mt-3">
              If you have questions about these Terms of Service, contact us at{" "}
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
