import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, ArrowLeft } from "lucide-react";
import { BLOG_POSTS, getBlogPost, getAllBlogSlugs } from "@/lib/content/blog";
import { ProseRenderer } from "@/components/content/prose-renderer";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) {
    return {
      title: "Post not found — Lumina blog",
      robots: { index: false },
    };
  }

  return {
    title: `${post.title} — Lumina blog`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.byline],
    },
  };
}

function formatDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const currentIndex = BLOG_POSTS.findIndex((p) => p.slug === post.slug);
  const previous =
    currentIndex < BLOG_POSTS.length - 1 ? BLOG_POSTS[currentIndex + 1] : null;
  const next = currentIndex > 0 ? BLOG_POSTS[currentIndex - 1] : null;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All posts
        </Link>

        <header className="mt-8">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="rounded-full bg-primary/10 px-2 py-0.5 font-semibold uppercase tracking-wider text-primary">
              {post.category}
            </span>
            <time
              dateTime={post.publishedAt}
              className="font-mono text-muted-foreground"
            >
              {formatDate(post.publishedAt)}
            </time>
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              {post.readingTimeMin} min read
            </span>
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl">
            {post.title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            {post.description}
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            By {post.byline}
          </p>
        </header>

        <article className="mt-16">
          <ProseRenderer sections={post.body} />
        </article>

        {/* Prev / next */}
        <nav className="mt-20 grid gap-3 border-t border-border pt-8 md:grid-cols-2">
          <div>
            {previous && (
              <Link
                href={`/blog/${previous.slug}`}
                className="block rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Older post
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {previous.title}
                </p>
              </Link>
            )}
          </div>
          <div className="md:text-right">
            {next && (
              <Link
                href={`/blog/${next.slug}`}
                className="block rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Newer post
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {next.title}
                </p>
              </Link>
            )}
          </div>
        </nav>

        <section className="mt-16 rounded-2xl border border-border bg-card p-8 text-center md:p-12">
          <h2 className="text-2xl font-semibold">
            Want a report grounded in your own data?
          </h2>
          <p className="mt-3 max-w-xl mx-auto text-sm leading-relaxed text-muted-foreground">
            Lumina synthesizes your connected data, an adaptive assessment, and
            a live AI conversation into one confidence-weighted talent profile.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              See pricing
            </Link>
            <Link
              href="/methodology"
              className="inline-flex items-center justify-center rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-foreground hover:bg-card"
            >
              Read methodology
            </Link>
          </div>
        </section>

        <section className="mt-12 border-t border-border pt-8">
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
              href="/security"
              className="text-foreground underline-offset-4 hover:underline"
            >
              Security &amp; Privacy
            </Link>
            {" · "}
            <Link
              href="/help"
              className="text-foreground underline-offset-4 hover:underline"
            >
              Help center
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
