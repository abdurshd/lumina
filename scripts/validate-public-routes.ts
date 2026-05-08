/**
 * CI gate: validates that every public marketing route has the metadata and
 * OG image co-located files that our launch checklist requires.
 *
 *   npm run validate:routes
 *
 * Exits 1 if anything is missing. Wired into `.github/workflows/ci.yml`.
 *
 * The canonical route list is the same list `src/app/sitemap.ts` returns.
 * If you add a new public route, add it both there and here — the duplication
 * is intentional so this script does not depend on Next's runtime to read
 * sitemap output.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

interface RouteSpec {
  /** URL path beginning with `/`. Use `/` for the root route. */
  url: string;
  /** Page file relative to repo root. Defaults to `src/app${url}/page.tsx`. */
  pageFile?: string;
  /**
   * File where the route's `metadata` export lives. Defaults to the page
   * file. Override for routes whose metadata is provided by a parent layout
   * (the root `/` is the canonical example).
   */
  metadataFile?: string;
  /** OG image file relative to repo root. Defaults to `src/app${url}/opengraph-image.tsx`. */
  ogFile?: string;
}

const PUBLIC_ROUTES: RouteSpec[] = [
  {
    url: "/",
    pageFile: "src/app/page.tsx",
    metadataFile: "src/app/layout.tsx",
    ogFile: "src/app/opengraph-image.tsx",
  },
  { url: "/about" },
  { url: "/pricing" },
  { url: "/security" },
  { url: "/methodology" },
  { url: "/changelog" },
  { url: "/help" },
  { url: "/lab/benchmarks" },
  { url: "/blog" },
  { url: "/use-cases" },
  { url: "/showcase" },
  { url: "/careers" },
  // Persona pages — five static routes that share `PersonaPageBody`.
  // Next 16 doesn't recognize `for-[persona]` as a directory-name pattern
  // (named segments with prefix work for filenames inside a segment, not as
  // the segment itself), so we keep one route directory per persona slug.
  { url: "/for-self-discovery" },
  { url: "/for-career-pivots" },
  { url: "/for-coaches" },
  { url: "/for-schools" },
  { url: "/for-hr-teams" },
];

const METADATA_PATTERNS = [
  /export\s+const\s+metadata\s*[:=]/,
  /export\s+(?:async\s+)?function\s+generateMetadata\s*\(/,
];

interface RouteIssue {
  url: string;
  reason: string;
}

function defaultPageFile(url: string): string {
  return url === "/" ? "src/app/page.tsx" : `src/app${url}/page.tsx`;
}

function defaultOgFile(url: string): string {
  return url === "/"
    ? "src/app/opengraph-image.tsx"
    : `src/app${url}/opengraph-image.tsx`;
}

function checkRoute(spec: RouteSpec, repoRoot: string): RouteIssue[] {
  const issues: RouteIssue[] = [];
  const pagePath = join(repoRoot, spec.pageFile ?? defaultPageFile(spec.url));
  const metadataPath = join(
    repoRoot,
    spec.metadataFile ?? spec.pageFile ?? defaultPageFile(spec.url)
  );
  const ogPath = join(repoRoot, spec.ogFile ?? defaultOgFile(spec.url));

  if (!existsSync(pagePath)) {
    issues.push({ url: spec.url, reason: `Missing page file: ${pagePath}` });
  }

  if (!existsSync(metadataPath)) {
    issues.push({
      url: spec.url,
      reason: `Missing metadata file: ${metadataPath}`,
    });
  } else {
    const content = readFileSync(metadataPath, "utf8");
    const hasMetadata = METADATA_PATTERNS.some((re) => re.test(content));
    if (!hasMetadata) {
      issues.push({
        url: spec.url,
        reason: `\`metadata\` or \`generateMetadata\` not exported in: ${metadataPath}`,
      });
    }
  }

  if (!existsSync(ogPath)) {
    issues.push({
      url: spec.url,
      reason: `Missing opengraph-image file: ${ogPath}`,
    });
  } else {
    const content = readFileSync(ogPath, "utf8");
    if (!/export\s+default\s+function\s+OpengraphImage/.test(content)) {
      issues.push({
        url: spec.url,
        reason: `OG file does not export default function OpengraphImage: ${ogPath}`,
      });
    }
  }

  return issues;
}

function main(): void {
  const repoRoot = process.cwd();
  const allIssues: RouteIssue[] = [];

  for (const route of PUBLIC_ROUTES) {
    allIssues.push(...checkRoute(route, repoRoot));
  }

  console.log(`Checked ${PUBLIC_ROUTES.length} public routes.`);

  if (allIssues.length === 0) {
    console.log("All routes pass: metadata and OG images present.");
    process.exit(0);
  }

  console.error(`\n${allIssues.length} issue(s) found:\n`);
  for (const issue of allIssues) {
    console.error(`  [${issue.url}] ${issue.reason}`);
  }
  process.exit(1);
}

main();
