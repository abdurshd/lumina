"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { Gift, Copy, ExternalLink, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/auth-store";
import { apiFetch } from "@/lib/fetch-client";
import { trackEvent } from "@/lib/analytics/track-event";

interface ReferralStats {
  code: string;
  totalClicks: number;
  totalSignups: number;
  totalQualified: number;
  shareUrl: string;
}

export function ReferralCard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    apiFetch<ReferralStats>("/api/referrals")
      .then((data) => {
        if (cancelled) return;
        setStats(data);
        setError(null);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Failed to load referral";
        setError(message);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  async function copyLink() {
    if (!stats) return;
    try {
      await navigator.clipboard.writeText(stats.shareUrl);
      setCopied(true);
      trackEvent({ name: "referral_share", payload: { channel: "copy" } });
      toast.success("Referral link copied.");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy. Select and copy the link manually.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-sans">
          <Gift className="h-5 w-5 text-primary" />
          Refer a friend
        </CardTitle>
        <CardDescription>
          Share Lumina with someone whose career direction you care about. When
          they convert to a paid plan, you both earn referral credits — see
          your tier in{" "}
          <Link href="/pricing" className="text-foreground underline-offset-4 hover:underline">
            pricing
          </Link>
          .
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading your referral link…
          </div>
        )}

        {error && (
          <p className="text-sm text-rose-500">{error}</p>
        )}

        {stats && (
          <>
            <div className="rounded-lg border border-border bg-overlay-subtle p-3">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Your referral link
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 truncate rounded-md bg-background px-3 py-2 font-mono text-sm text-foreground">
                  {stats.shareUrl}
                </code>
                <Button size="sm" variant="outline" onClick={copyLink}>
                  <Copy className="mr-2 h-3.5 w-3.5" />
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
              <p className="mt-2 text-[10px] text-muted-foreground">
                Code:{" "}
                <span className="font-mono text-foreground">{stats.code}</span>
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <StatTile label="Clicks" value={stats.totalClicks} />
              <StatTile label="Signups" value={stats.totalSignups} />
              <StatTile
                label="Qualified"
                value={stats.totalQualified}
                hint="Paid first month"
              />
            </div>

            <p className="text-xs text-muted-foreground">
              Self-referrals are blocked. Same-IP clicks within a 24-hour
              window are deduped. Reward credits land after the first paid
              renewal — billing pipeline goes live with the launch.{" "}
              <Link
                href="/security"
                className="text-foreground underline-offset-4 hover:underline"
              >
                <span className="inline-flex items-center gap-1">
                  Fraud controls
                  <ExternalLink className="h-3 w-3" />
                </span>
              </Link>
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function StatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 text-center">
      <p className="font-mono text-2xl font-bold tracking-tight text-foreground">
        {value}
      </p>
      <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      {hint && (
        <p className="mt-0.5 text-[10px] text-muted-foreground">{hint}</p>
      )}
      {value === 0 && <Badge variant="outline" className="mt-1 text-[9px]">—</Badge>}
    </div>
  );
}
