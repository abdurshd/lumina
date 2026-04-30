import Link from "next/link";
import { Shield } from "lucide-react";
import { LuminaIcon } from "@/components/icons/lumina-icon";

interface FooterLink {
  label: string;
  href: string | null; // null = coming soon, render as muted span instead of dead <a>
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

const FOOTER_COLUMNS: readonly FooterColumn[] = [
  {
    title: "Product",
    links: [
      { label: "Pricing", href: "/pricing" },
      { label: "Use cases", href: "/use-cases" },
      { label: "Showcase", href: "/showcase" },
      { label: "How it works", href: "/#how-it-works" },
      { label: "Sample Report", href: null },
    ],
  },
  {
    title: "Solutions",
    links: [
      { label: "Self-discovery", href: null },
      { label: "Career pivot", href: null },
      { label: "For coaches", href: null },
      { label: "For higher ed", href: null },
      { label: "For HR teams", href: null },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Help center", href: "/help" },
      { label: "Methodology", href: "/methodology" },
      { label: "Public benchmarks", href: "/lab/benchmarks" },
      { label: "Newsletter", href: null },
      { label: "Changelog", href: "/changelog" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Careers", href: null },
      { label: "Contact", href: "mailto:hello@lumina.app" },
      { label: "Press", href: null },
    ],
  },
  {
    title: "Trust",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Security", href: "/security" },
      { label: "Data Processing Agreement", href: null },
      { label: "Cookie settings", href: null },
      { label: "Status", href: null },
    ],
  },
] as const;

interface FooterLinkItemProps {
  link: FooterLink;
}

function FooterLinkItem({ link }: FooterLinkItemProps) {
  if (link.href === null) {
    return (
      <span
        className="text-sm text-muted-foreground/50 cursor-default"
        aria-label={`${link.label} — coming soon`}
        title="Coming soon"
      >
        {link.label}
      </span>
    );
  }

  if (link.href.startsWith("mailto:")) {
    return (
      <a
        href={link.href}
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        {link.label}
      </a>
    );
  }

  return (
    <Link
      href={link.href}
      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      {link.label}
    </Link>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-border bg-background">
      <div className="container relative z-10 mx-auto px-6 py-16">
        {/* Top row: logo + brand */}
        <div className="mb-12 flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <Link href="/" className="flex items-center gap-3">
            <LuminaIcon className="h-7 w-7 text-primary" />
            <span className="text-xl font-semibold tracking-tight text-foreground">
              Lumina
            </span>
          </Link>

          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            A multimodal talent-discovery platform that helps you find your
            strongest career direction — grounded in your real data, not in a
            personality quiz.
          </p>
        </div>

        {/* Five-column link grid */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-foreground">
                {column.title}
              </h4>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <FooterLinkItem link={link} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom row: trust signals + copyright */}
        <div className="mt-12 flex flex-col items-start gap-6 border-t border-border pt-8 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Shield className="h-3 w-3" />
              Zero Persistence
            </span>
            <span>Powered by Gemini AI</span>
            <span>SOC 2 in progress</span>
            <span>GDPR-ready</span>
          </div>
          <p className="text-xs text-muted-foreground/60">
            &copy; {new Date().getFullYear()} Lumina Synergy. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
