"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import {
  PRICING_TIERS,
  PLAN_ORDER,
  yearlySavingsPercent,
  effectiveMonthlyWhenYearly,
  creditPoolValueUsd,
  type BillingInterval,
  type PlanId,
} from "@/lib/pricing/tiers";
import { trackEvent } from "@/lib/analytics/track-event";

function formatPrice(value: number): string {
  return Number.isInteger(value) ? `$${value}` : `$${value.toFixed(2)}`;
}

function checkoutHref(plan: PlanId, interval: BillingInterval): string {
  const params = new URLSearchParams({ plan, interval });
  return `/api/billing/checkout?${params.toString()}`;
}

interface BillingToggleProps {
  value: BillingInterval;
  onChange: (next: BillingInterval) => void;
}

function BillingToggle({ value, onChange }: BillingToggleProps) {
  return (
    <div
      role="tablist"
      aria-label="Billing interval"
      className="inline-flex items-center rounded-full border border-border bg-card p-1"
    >
      <button
        role="tab"
        aria-selected={value === "monthly"}
        onClick={() => onChange("monthly")}
        className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
          value === "monthly"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        Monthly
      </button>
      <button
        role="tab"
        aria-selected={value === "yearly"}
        onClick={() => onChange("yearly")}
        className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
          value === "yearly"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        Yearly
        <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
          save up to {Math.max(...PLAN_ORDER.map((p) => yearlySavingsPercent(p)))}%
        </span>
      </button>
    </div>
  );
}

interface TierCardProps {
  plan: PlanId;
  interval: BillingInterval;
}

function TierCard({ plan, interval }: TierCardProps) {
  const tier = PRICING_TIERS[plan];
  const displayPrice =
    interval === "monthly"
      ? tier.monthlyPriceUsd
      : effectiveMonthlyWhenYearly(plan);
  const periodLabel = interval === "monthly" ? "/ mo" : "/ mo billed yearly";

  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-6 ${
        tier.highlighted
          ? "border-primary/40 bg-primary/[0.03] shadow-sm"
          : "border-border bg-card"
      }`}
    >
      {tier.highlighted && (
        <div className="absolute -top-3 left-6 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
          <Sparkles className="h-3 w-3" />
          Recommended
        </div>
      )}

      <header>
        <h3 className="text-xl font-semibold text-foreground">{tier.name}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {tier.tagline}
        </p>
      </header>

      <div className="mt-6">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold tracking-tight text-foreground">
            {formatPrice(displayPrice)}
          </span>
          <span className="text-sm text-muted-foreground">{periodLabel}</span>
        </div>
        {interval === "yearly" && (
          <p className="mt-1 text-xs text-muted-foreground">
            ${tier.yearlyPriceUsd} billed annually · save{" "}
            {yearlySavingsPercent(plan)}%
          </p>
        )}
        {interval === "monthly" && (
          <p className="mt-1 text-xs text-muted-foreground">
            Or {formatPrice(effectiveMonthlyWhenYearly(plan))}/mo billed yearly
            (save {yearlySavingsPercent(plan)}%)
          </p>
        )}
      </div>

      <div className="mt-4 rounded-lg border border-border bg-background/40 px-3 py-2 text-xs text-muted-foreground">
        <span className="font-mono text-foreground">
          {tier.entitlements.monthlyCredits} credits
        </span>{" "}
        / month — about ${creditPoolValueUsd(plan).toFixed(2)} of AI work
        included
      </div>

      <ul className="mt-6 space-y-3 text-sm">
        {tier.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span className="leading-relaxed text-foreground">{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-8">
        <Link
          href={checkoutHref(plan, interval)}
          onClick={() =>
            trackEvent({
              name: "checkout_start",
              payload: { plan, interval, discount_code: null },
            })
          }
          className={`flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
            tier.highlighted
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "border border-border bg-background text-foreground hover:bg-card"
          }`}
        >
          Start with {tier.name.replace("Lumina ", "")}
        </Link>
        <p className="mt-2 text-center text-[10px] text-muted-foreground">
          7-day refund on first month · cancel anytime
        </p>
      </div>
    </div>
  );
}

export function PricingTierGrid() {
  const [interval, setInterval] = useState<BillingInterval>("monthly");

  useEffect(() => {
    trackEvent({
      name: "pricing_view",
      payload: { tiers_visible: [...PLAN_ORDER] },
    });
  }, []);

  return (
    <>
      <div className="mt-8 flex justify-center">
        <BillingToggle value={interval} onChange={setInterval} />
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {PLAN_ORDER.map((plan) => (
          <TierCard key={plan} plan={plan} interval={interval} />
        ))}
      </div>
    </>
  );
}
