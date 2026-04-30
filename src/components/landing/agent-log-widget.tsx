"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Brain,
  Database,
  FileQuestion,
  Video,
  FileText,
  Search,
  Target,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

/**
 * Live-decision-log demo widget for the landing page. Cycles through a
 * curated representative agent loop so visitors can see the reasoning
 * surface before they sign up. Real decisions live in `useAgentStore`
 * inside the (app) routes — this component is intentionally static.
 *
 * Why static: showing real decisions on the public surface would require
 * an anonymous read path into a real user's log — which we explicitly do
 * not want under our security posture (deny-by-default Firestore rules,
 * raw content discarded, etc., see /security).
 */

type DemoActionType =
  | "analyze_source"
  | "probe_dimension"
  | "run_quiz_module"
  | "request_additional_data"
  | "start_session"
  | "generate_report"
  | "refine_report_section";

interface DemoDecision {
  action: DemoActionType;
  label: string;
  reason: string;
  confidenceBefore: number;
  confidenceAfter: number;
}

const ACTION_ICONS: Record<DemoActionType, typeof Brain> = {
  analyze_source: Database,
  run_quiz_module: FileQuestion,
  start_session: Video,
  generate_report: FileText,
  refine_report_section: FileText,
  request_additional_data: Search,
  probe_dimension: Target,
};

const ACTION_COLORS: Record<DemoActionType, string> = {
  analyze_source: "text-blue-400",
  run_quiz_module: "text-purple-400",
  start_session: "text-green-400",
  generate_report: "text-amber-400",
  refine_report_section: "text-amber-400",
  request_additional_data: "text-cyan-400",
  probe_dimension: "text-rose-400",
};

const DECISIONS: DemoDecision[] = [
  {
    action: "analyze_source",
    label: "Analyzed connected source",
    reason:
      "Extracted 47 themes from connected documents. Strong signal on analytical writing and technical depth.",
    confidenceBefore: 0,
    confidenceAfter: 22,
  },
  {
    action: "probe_dimension",
    label: "Probed weak dimension",
    reason:
      "Communication confidence below 30%. Will probe via quiz module rather than guess from sparse data.",
    confidenceBefore: 22,
    confidenceAfter: 22,
  },
  {
    action: "run_quiz_module",
    label: "Ran quiz module",
    reason:
      "Selected 'strengths_skills' module — covers four low-confidence dimensions including communication and problem solving.",
    confidenceBefore: 22,
    confidenceAfter: 41,
  },
  {
    action: "request_additional_data",
    label: "Recommended source",
    reason:
      "Notion would strengthen 3 dimensions (creative thinking, adaptability, work values). Suggesting connection before report.",
    confidenceBefore: 41,
    confidenceAfter: 41,
  },
  {
    action: "start_session",
    label: "Started live session",
    reason:
      "Quiz data plus connected sources enough for live session to refine behavioral and emotional dimensions.",
    confidenceBefore: 41,
    confidenceAfter: 63,
  },
  {
    action: "generate_report",
    label: "Generated draft report",
    reason:
      "Overall confidence at 63% — above the 60% threshold for full report generation. Drafting now.",
    confidenceBefore: 63,
    confidenceAfter: 63,
  },
  {
    action: "refine_report_section",
    label: "Refined weak section",
    reason:
      "Critique flagged 'leadership' section as evidence-thin (52/100). Refining with deeper grounding from session moments.",
    confidenceBefore: 63,
    confidenceAfter: 71,
  },
];

const CYCLE_INTERVAL_MS = 1700;

function formatDelta(d: number): string {
  if (d === 0) return "no change";
  return `${d > 0 ? "+" : ""}${d}%`;
}

interface DecisionRowProps {
  decision: DemoDecision;
  index: number;
}

function DecisionRow({ decision, index }: DecisionRowProps) {
  const Icon = ACTION_ICONS[decision.action];
  const colorClass = ACTION_COLORS[decision.action];
  const delta = decision.confidenceAfter - decision.confidenceBefore;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05, ease: "easeOut" }}
      className="flex items-start gap-3 rounded-lg border border-border bg-card p-3"
    >
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-overlay-subtle">
        <Icon className={`h-4 w-4 ${colorClass}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-muted-foreground">
            #{String(index + 1).padStart(2, "0")}
          </span>
          <span className="text-sm font-medium text-foreground">
            {decision.label}
          </span>
        </div>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {decision.reason}
        </p>
      </div>
      <div className="shrink-0 text-right">
        {delta > 0 ? (
          <span className="inline-flex items-center gap-0.5 font-mono text-[11px] text-emerald-500">
            <ArrowUpRight className="h-3 w-3" />
            {formatDelta(delta)}
          </span>
        ) : (
          <span className="font-mono text-[11px] text-muted-foreground">
            {formatDelta(delta)}
          </span>
        )}
      </div>
    </motion.div>
  );
}

export function AgentLogWidget() {
  const reduceMotion = useReducedMotion();
  const [shown, setShown] = useState(() =>
    reduceMotion ? DECISIONS.length : 1
  );

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => {
      setShown((current) => {
        if (current >= DECISIONS.length) {
          // Brief pause at the end before resetting.
          window.setTimeout(() => setShown(1), 2400);
          return current;
        }
        return current + 1;
      });
    }, CYCLE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  const visible = DECISIONS.slice(0, shown);
  const lastConfidence =
    visible.length > 0 ? visible[visible.length - 1].confidenceAfter : 0;

  return (
    <section className="relative bg-background py-28">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <Brain className="h-3 w-3" />
            Live agent decisions
          </span>
          <h2 className="mt-6 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            You see the reasoning, not just the answer.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            Every action the agent takes — connect a source, run a module,
            critique a draft — is logged with confidence-before and
            confidence-after. No black box.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-2xl">
          <div className="rounded-2xl border border-border bg-card/40 p-5 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">
                  Agent log
                </span>
                <span className="rounded-full bg-overlay-subtle px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                  demo
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  Confidence
                </span>
                <span className="font-mono text-sm font-bold text-foreground">
                  {lastConfidence}%
                </span>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              <AnimatePresence initial={false}>
                {visible.map((decision, i) => (
                  <DecisionRow key={i} decision={decision} index={i} />
                ))}
              </AnimatePresence>
            </div>

            {shown >= DECISIONS.length && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 py-2 text-sm text-emerald-600 dark:text-emerald-400"
              >
                <CheckCircle2 className="h-4 w-4" />
                Report ready — confidence above 70% threshold.
              </motion.div>
            )}
          </div>

          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/lab/benchmarks"
              className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-card"
            >
              See public benchmarks
            </Link>
            <Link
              href="/methodology"
              className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Read the methodology &rarr;
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
