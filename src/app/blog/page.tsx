import type { Metadata } from "next";
import Link from "next/link";
import { Newspaper, Clock } from "lucide-react";
import { BLOG_POSTS } from "@/lib/content/blog";

export const metadata: Metadata = {
  title: "Blog — Lumina",
  description:
    "Notes from the Lumina team on methodology, the agentic system, and the product decisions behind evidence-grounded talent discovery.",
  openGraph: {
    title: "Blog — Lumina",
    description:
      "Notes from the Lumina team on methodology, the agentic system, and the product decisions behind evidence-grounded talent discovery.",
    type: "website",
  },
};

const CATEGORY_STYLES: Record<string, string> = {
  Methodology: "bg-primary/10 text-primary",
  Product: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Research: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Engineering: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
};

function formatDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default function BlogIndexPage() {
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
            <Newspaper className="h-3 w-3" />
            Blog
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl">
            Notes from the Lumina team.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">
            Methodology, engineering decisions, and the product principles
            behind evidence-grounded talent discovery. Everything here is
            bylined as the team — see{" "}
            <Link
              href="/about"
              className="text-foreground underline-offset-4 hover:underline"
            >
              /about
            </Link>{" "}
            for who that is.
          </p>
        </header>

        <ul className="mt-12 space-y-4">
          {BLOG_POSTS.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="group block rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/30"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      CATEGORY_STYLES[post.category] ?? "bg-overlay-subtle text-foreground"
                    }`}
                  >
                    {post.category}
                  </span>
                  <time
                    dateTime={post.publishedAt}
                    className="font-mono text-xs text-muted-foreground"
                  >
                    {formatDate(post.publishedAt)}
                  </time>
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {post.readingTimeMin} min read
                  </span>
                </div>
                <h2 className="mt-3 text-xl font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
                  {post.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {post.description}
                </p>
                <p className="mt-3 text-xs text-muted-foreground">
                  By {post.byline}
                </p>
              </Link>
            </li>
          ))}
        </ul>

        <section className="mt-16 border-t border-border pt-8">
          <p className="text-sm text-muted-foreground">
            Related:{" "}
            <Link
              href="/methodology"
              className="text-foreground underline-offset-4 hover:underline"
            >
              Methodology
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
              href="/help"
              className="text-foreground underline-offset-4 hover:underline"
            >
              Help center
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
