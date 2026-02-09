'use client';

import { memo, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import {
  Brain,
  Database,
  FileQuestion,
  Video,
  FileText,
  Search,
  Target,
  ChevronDown,
  ChevronUp,
  PanelRightClose,
  PanelRightOpen,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import type { AgentDecision, AgentActionType } from '@/types';
import { useAgentStore } from '@/stores/agent-store';
import { ConfidenceDashboard } from './confidence-dashboard';

const ACTION_ICONS: Record<AgentActionType, typeof Brain> = {
  analyze_source: Database,
  run_quiz_module: FileQuestion,
  start_session: Video,
  generate_report: FileText,
  refine_report_section: FileText,
  request_additional_data: Search,
  probe_dimension: Target,
};

const ACTION_COLORS: Record<AgentActionType, string> = {
  analyze_source: 'text-blue-400',
  run_quiz_module: 'text-purple-400',
  start_session: 'text-green-400',
  generate_report: 'text-amber-400',
  refine_report_section: 'text-amber-400',
  request_additional_data: 'text-cyan-400',
  probe_dimension: 'text-rose-400',
};

const ACTION_LABELS: Record<AgentActionType, string> = {
  analyze_source: 'Analyzed Source',
  run_quiz_module: 'Quiz Module',
  start_session: 'Live Session',
  generate_report: 'Report Generation',
  refine_report_section: 'Report Refinement',
  request_additional_data: 'Data Request',
  probe_dimension: 'Probed Dimension',
};

const MAX_VISIBLE_DECISIONS = 100;

const TIME_FORMATTER = new Intl.DateTimeFormat(undefined, {
  hour: '2-digit',
  minute: '2-digit',
});

interface DecisionLogProps {
  filter?: AgentActionType;
}

const DecisionCard = memo(function DecisionCard({ decision }: { decision: AgentDecision }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = ACTION_ICONS[decision.action] ?? Brain;
  const colorClass = ACTION_COLORS[decision.action] ?? 'text-neutral-400';
  const delta = decision.confidenceAfter - decision.confidenceBefore;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="glass p-3 border-neutral-800">
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 ${colorClass}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                {ACTION_LABELS[decision.action] ?? decision.action}
              </Badge>
              {delta !== 0 && (
                <span className={`flex items-center text-xs font-mono ${delta > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {delta > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {delta > 0 ? '+' : ''}{delta}%
                </span>
              )}
              <span className="text-[10px] text-neutral-500 ml-auto">
                {formatTimestamp(decision.timestamp)}
              </span>
            </div>
            <p className="text-xs text-neutral-300 line-clamp-2">
              {decision.reason}
            </p>
            {expanded && decision.metadata && (
              <div className="mt-2 text-[10px] text-neutral-500 space-y-0.5">
                {Object.entries(decision.metadata).map(([key, value]) => (
                  <div key={key}>
                    <span className="text-neutral-600">{key}:</span> {String(value)}
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-[10px] text-neutral-500 hover:text-neutral-300 mt-1 flex items-center gap-0.5"
            >
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {expanded ? 'Less' : 'Details'}
            </button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
});

function DecisionLogInner({ filtered, visible }: { filtered: AgentDecision[]; visible: AgentDecision[] }) {
  return (
    <>
      {/* Confidence Dashboard */}
      <div className="px-2 py-2 border-b border-neutral-800">
        <ConfidenceDashboard profile={null} compact />
      </div>

      <ScrollArea className="flex-1 px-2 py-2">
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <p className="text-xs text-neutral-500 text-center py-8">
                No agent decisions yet.
              </p>
            ) : (
              visible.map((d) => (
                <DecisionCard key={d.id} decision={d} />
              ))
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </>
  );
}

/** Desktop sidebar panel */
export function DecisionLog({ filter }: DecisionLogProps) {
  const [collapsed, setCollapsed] = useState(false);
  const decisions = useAgentStore((s) => s.decisions);

  const filtered = useMemo(
    () => (filter ? decisions.filter((d) => d.action === filter) : decisions),
    [decisions, filter]
  );

  const visible = useMemo(
    () => filtered.slice(-MAX_VISIBLE_DECISIONS).reverse(),
    [filtered]
  );

  if (collapsed) {
    return (
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCollapsed(false)}
          className="rounded-l-lg rounded-r-none border-r-0 px-2 py-6 bg-neutral-900/90 border-neutral-700"
        >
          <PanelRightOpen className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-72 border-l border-neutral-800 bg-neutral-950/50 flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-green-400" />
          <span className="text-xs font-medium text-neutral-200">Agent Log</span>
          <Badge variant="secondary" className="text-[10px] px-1 py-0">
            {filtered.length}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(true)}
          className="h-6 w-6 p-0"
        >
          <PanelRightClose className="w-3.5 h-3.5" />
        </Button>
      </div>
      <DecisionLogInner filtered={filtered} visible={visible} />
    </div>
  );
}

/** Mobile sheet for agent decision log */
export function MobileDecisionLog({ filter }: DecisionLogProps) {
  const [open, setOpen] = useState(false);
  const decisions = useAgentStore((s) => s.decisions);

  const filtered = useMemo(
    () => (filter ? decisions.filter((d) => d.action === filter) : decisions),
    [decisions, filter]
  );

  const visible = useMemo(
    () => filtered.slice(-MAX_VISIBLE_DECISIONS).reverse(),
    [filtered]
  );

  return (
    <>
      {/* Floating button — bottom-right, visible only on mobile/tablet */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary shadow-lg xl:hidden"
        aria-label="Open agent log"
      >
        <Brain className="h-5 w-5 text-primary-foreground" />
        {filtered.length > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-[10px] font-bold text-white">
            {filtered.length > 99 ? '99+' : filtered.length}
          </span>
        )}
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-80 sm:w-96 p-0 bg-neutral-950/95 border-neutral-800">
          <SheetHeader className="px-3 py-2 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-green-400" />
              <SheetTitle className="text-xs font-medium text-neutral-200">Agent Log</SheetTitle>
              <Badge variant="secondary" className="text-[10px] px-1 py-0">
                {filtered.length}
              </Badge>
            </div>
            <SheetDescription className="sr-only">
              Agent decision log and confidence dashboard
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col h-[calc(100%-3rem)]">
            <DecisionLogInner filtered={filtered} visible={visible} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

function formatTimestamp(ts: number): string {
  return TIME_FORMATTER.format(ts);
}
