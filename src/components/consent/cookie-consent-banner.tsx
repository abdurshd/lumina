"use client";

import Link from "next/link";
import { Cookie, X } from "lucide-react";
import { useConsent } from "@/lib/consent";

/**
 * Bottom-of-viewport consent banner. Shown only when the stored status is
 * pending. Rejected = analytics stays off; Accepted = third-party telemetry
 * (Vercel Analytics, Speed Insights, future live chat) is allowed to load.
 */
export function CookieConsentBanner() {
  const { consent, accept, reject } = useConsent();

  if (consent.status !== "pending") return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie and analytics consent"
      className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 sm:px-6 sm:pb-6"
    >
      <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card/95 p-5 shadow-xl backdrop-blur supports-[backdrop-filter]:bg-card/85">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Cookie className="h-4 w-4" />
          </div>
          <div className="flex-1 text-sm leading-relaxed text-foreground">
            <p>
              <span className="font-semibold">Cookies that are not strictly necessary.</span>{" "}
              Lumina uses Vercel Analytics and Speed Insights to understand
              page-level usage and Core Web Vitals. They load only if you
              accept. Strictly necessary cookies for sign-in and BYOK are
              always active.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              See our{" "}
              <Link
                href="/security"
                className="text-foreground underline-offset-4 hover:underline"
              >
                security posture
              </Link>{" "}
              for the full data lifecycle. You can change this anytime in
              Settings.
            </p>
          </div>

          <button
            type="button"
            onClick={reject}
            aria-label="Decline analytics"
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-overlay-subtle hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={reject}
            className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-overlay-subtle"
          >
            Strictly necessary only
          </button>
          <button
            type="button"
            onClick={accept}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Accept analytics
          </button>
        </div>
      </div>
    </div>
  );
}
