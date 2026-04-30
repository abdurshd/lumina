import type { Metadata } from "next";
import Link from "next/link";
import {
  Layers,
  Compass,
  Sparkles,
  Eye,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { getAdminDb } from "@/lib/firebase/admin";
import { buildShareUrl, type SharedReportDoc } from "@/lib/share-report";

export const dynamic = "force-dynamic";

const SHARED_REPORTS_COLLECTION = "sharedReports";
const SHOWCASE_LIMIT = 6;

export const metadata: Metadata = {
  title: "Showcase — Lumina",
  description:
    "Anonymized public reports shared by Lumina users. The shape of the assessment, without anyone's personal evidence.",
  openGraph: {
    title: "Showcase — Lumina",
    description:
      "Anonymized public reports shared by Lumina users. The shape of the assessment, without anyone's personal evidence.",
    type: "website",
  },
};

interface ShowcaseEntry {
  slug: string;
  shareUrl: string;
  headline: string;
  tagline: string;
  ownerHandle: string;
  topCareer: string;
  topCareerMatch: number;
  topStrengths: string[];
  updatedAt: number;
}

async function loadShowcaseEntries(): Promise<ShowcaseEntry[]> {
  try {
    const db = getAdminDb();
    const snap = await db
      .collection(SHARED_REPORTS_COLLECTION)
      .where("revoked", "==", false)
      .orderBy("updatedAt", "desc")
      .limit(SHOWCASE_LIMIT)
      .get();

    const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lumina.app";
    const entries: ShowcaseEntry[] = [];

    snap.forEach((doc) => {
      const data = doc.data() as SharedReportDoc;
      const top = data.report.careerPaths[0];
      entries.push({
        slug: data.slug,
        shareUrl: buildShareUrl(origin, data.slug),
        headline: data.report.headline,
        tagline: data.report.tagline,
        ownerHandle: data.ownerHandle,
        topCareer: top?.title ?? "—",
        topCareerMatch: top?.match ?? 0,
        topStrengths: data.report.topStrengths.slice(0, 3).map((s) => s.name),
        updatedAt: data.updatedAt,
      });
    });

    return entries;
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    console.error("[showcase] load failed:", message);
    return [];
  }
}

function ValueRow({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {body}
        </p>
      </div>
    </div>
  );
}

export default async function ShowcasePage() {
  const entries = await loadShowcaseEntries();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <Link
          href="/"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          &larr; Back to Lumina
        </Link>

        <header className="mt-8 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <Layers className="h-3 w-3" />
            Showcase
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl">
            What a Lumina report actually looks like.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            Below are anonymized, owner-published reports — structural
            assessments without anyone&apos;s personal evidence excerpts. Owners
            choose what to share and can revoke at any time.
          </p>
        </header>

        {/* What sharing means */}
        <section className="mt-12 grid gap-6 md:grid-cols-3">
          <ValueRow
            icon={<ShieldCheck className="h-4 w-4" />}
            title="Privacy-preserving by default"
            body="Evidence excerpts are replaced with category labels (e.g. 'Connected documents'). The structural shape stays."
          />
          <ValueRow
            icon={<Eye className="h-4 w-4" />}
            title="Owner-controlled"
            body="Each report is shared deliberately by its owner. They can revoke the share link at any moment."
          />
          <ValueRow
            icon={<Sparkles className="h-4 w-4" />}
            title="Indexable, not identifying"
            body="Public, search-engine-readable, but never identifying. Voice neutralized to third-person."
          />
        </section>

        {/* Live entries */}
        <section className="mt-16">
          <div className="flex items-baseline justify-between">
            <h2 className="text-2xl font-semibold">Recent shares</h2>
            <p className="text-xs text-muted-foreground">
              Updated continuously
            </p>
          </div>

          {entries.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-border bg-card p-10 text-center">
              <Compass className="mx-auto h-6 w-6 text-muted-foreground" />
              <p className="mt-4 text-base font-semibold text-foreground">
                Nothing here yet
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                Showcase entries appear once Lumina users publish their
                anonymized reports. The first batch lands as the public
                launch ramps up.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link
                  href="/methodology"
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  See how Lumina works
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/security"
                  className="inline-flex items-center justify-center rounded-lg border border-border px-5 py-2 text-sm font-medium text-foreground hover:bg-card"
                >
                  Read sharing privacy
                </Link>
              </div>
            </div>
          ) : (
            <ul className="mt-6 grid gap-4 md:grid-cols-2">
              {entries.map((entry) => (
                <li key={entry.slug}>
                  <Link
                    href={`/r/${entry.slug}`}
                    className="group flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/30"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Shared by {entry.ownerHandle}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
                      {entry.headline}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {entry.tagline}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {entry.topStrengths.map((s) => (
                        <span
                          key={s}
                          className="rounded-full border border-border bg-overlay-subtle px-2 py-0.5 text-[10px] font-medium text-foreground"
                        >
                          {s}
                        </span>
                      ))}
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-xs">
                      <p className="text-muted-foreground">
                        Top match:{" "}
                        <span className="text-foreground">{entry.topCareer}</span>
                      </p>
                      <p className="font-mono text-foreground">
                        {entry.topCareerMatch}%
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* CTA */}
        <section className="mt-16 rounded-2xl border border-border bg-card p-8 text-center md:p-12">
          <h2 className="text-2xl font-semibold">Want one of your own?</h2>
          <p className="mt-3 max-w-2xl mx-auto text-sm leading-relaxed text-muted-foreground">
            Lumina synthesizes your connected data, an adaptive assessment, and
            a live AI conversation into one confidence-weighted talent profile.
            You decide what (if anything) to share publicly.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              See pricing
            </Link>
            <Link
              href="/use-cases"
              className="inline-flex items-center justify-center rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-foreground hover:bg-card"
            >
              Browse use cases
            </Link>
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
              href="/use-cases"
              className="text-foreground underline-offset-4 hover:underline"
            >
              Use cases
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
