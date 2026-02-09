'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  FileText,
  Search,
  Wrench,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import type { ReportTraceStep } from '@/types';

interface ThoughtChainProps {
  steps: ReportTraceStep[];
}

const STEP_ICONS: Record<string, typeof Brain> = {
  'Generate Draft': FileText,
  'Self-Critique': Search,
  'Identify Refinement Targets': Search,
  'Targeted Refinement': Wrench,
  'Final Validation': CheckCircle2,
};

const STEP_COLORS: Record<string, string> = {
  'Generate Draft': 'text-blue-400 border-blue-500/30 bg-blue-500/10',
  'Self-Critique': 'text-amber-400 border-amber-500/30 bg-amber-500/10',
  'Identify Refinement Targets': 'text-purple-400 border-purple-500/30 bg-purple-500/10',
  'Targeted Refinement': 'text-green-400 border-green-500/30 bg-green-500/10',
  'Final Validation': 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
};

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function StepCard({ step }: { step: ReportTraceStep }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = STEP_ICONS[step.name] ?? Brain;
  const colorClass = STEP_COLORS[step.name] ?? 'text-neutral-400 border-neutral-500/30 bg-neutral-500/10';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: step.step * 0.1, duration: 0.3 }}
      className="relative"
    >
      {/* Timeline connector */}
      {step.step > 1 && (
        <div className="absolute left-5 -top-4 w-0.5 h-4 bg-neutral-700" />
      )}

      <div className={`rounded-lg border p-3 ${colorClass}`}>
        <div className="flex items-start gap-3">
          {/* Step number + icon */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-current/30 bg-current/10">
              <Icon className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-mono opacity-60">#{step.step}</span>
          </div>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium">{step.name}</span>
              <div className="flex items-center gap-1.5">
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 gap-0.5">
                  <Clock className="h-2.5 w-2.5" />
                  {formatDuration(step.durationMs)}
                </Badge>
                {step.confidenceChange !== 0 && (
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0 gap-0.5 ${
                      step.confidenceChange > 0
                        ? 'text-green-400 border-green-500/30'
                        : 'text-red-400 border-red-500/30'
                    }`}
                  >
                    {step.confidenceChange > 0 ? (
                      <TrendingUp className="h-2.5 w-2.5" />
                    ) : (
                      <TrendingDown className="h-2.5 w-2.5" />
                    )}
                    {step.confidenceChange > 0 ? '+' : ''}
                    {step.confidenceChange}
                  </Badge>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-current/70 mt-1">{step.description}</p>

            {/* Expandable details */}
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-[10px] mt-1.5 flex items-center gap-0.5 opacity-60 hover:opacity-100 transition-opacity"
            >
              {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {expanded ? 'Less' : 'Details'}
            </button>

            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 space-y-1.5 text-[11px] opacity-70">
                    <div>
                      <span className="font-medium">Input:</span> {step.inputSummary}
                    </div>
                    <div>
                      <span className="font-medium">Output:</span> {step.outputSummary}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function ThoughtChain({ steps }: ThoughtChainProps) {
  if (steps.length === 0) return null;

  const totalDuration = steps.reduce((s, step) => s + step.durationMs, 0);
  const totalConfidenceChange = steps.reduce((s, step) => s + step.confidenceChange, 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-sans flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            How I Built This Report
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px]">
              {steps.length} steps
            </Badge>
            <Badge variant="secondary" className="text-[10px]">
              {formatDuration(totalDuration)}
            </Badge>
            {totalConfidenceChange !== 0 && (
              <Badge
                variant="secondary"
                className={`text-[10px] ${
                  totalConfidenceChange > 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {totalConfidenceChange > 0 ? '+' : ''}
                {totalConfidenceChange} confidence
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step) => (
            <StepCard key={step.step} step={step} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
