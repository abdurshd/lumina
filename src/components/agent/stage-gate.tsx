'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, AlertTriangle, ArrowRight, Brain } from 'lucide-react';

interface StageGateProps {
  /** Current overall confidence 0-100 */
  confidence: number;
  /** Minimum confidence to proceed (agent recommendation) */
  threshold: number;
  /** What the next stage is */
  nextStageLabel: string;
  /** Navigation path for the next stage */
  nextStageHref: string;
  /** Agent's suggestions if confidence is low */
  suggestions?: string[];
  /** Called when user clicks proceed */
  onProceed: () => void;
  /** Whether the proceed action is loading */
  loading?: boolean;
}

export function StageGate({
  confidence,
  threshold,
  nextStageLabel,
  suggestions = [],
  onProceed,
  loading = false,
}: StageGateProps) {
  const ready = confidence >= threshold;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`p-4 border ${ready ? 'border-green-500/30 bg-green-500/5' : 'border-yellow-500/30 bg-yellow-500/5'}`}>
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 ${ready ? 'text-green-400' : 'text-yellow-400'}`}>
            {ready ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <AlertTriangle className="h-5 w-5" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">Agent Assessment</span>
            </div>

            <p className={`text-sm font-medium ${ready ? 'text-green-300' : 'text-yellow-300'}`}>
              {ready
                ? `Ready to proceed to ${nextStageLabel}`
                : `Agent recommends more preparation before ${nextStageLabel}`}
            </p>

            {/* Confidence bar */}
            <div className="mt-3 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Profile Confidence</span>
                <span className={`font-mono font-bold ${ready ? 'text-green-400' : 'text-yellow-400'}`}>
                  {confidence}%
                </span>
              </div>
              <div className="relative">
                <Progress
                  value={confidence}
                  className={`h-2 bg-neutral-800 ${ready ? '[&>div]:bg-green-500/70' : '[&>div]:bg-yellow-500/70'}`}
                />
                {/* Threshold marker */}
                <div
                  className="absolute top-0 h-2 w-0.5 bg-neutral-400"
                  style={{ left: `${threshold}%` }}
                />
              </div>
              <p className="text-[10px] text-neutral-500">
                Minimum recommended: {threshold}%
              </p>
            </div>

            {/* Suggestions when below threshold */}
            {!ready && suggestions.length > 0 && (
              <div className="mt-3 space-y-1">
                <p className="text-xs text-muted-foreground">To improve confidence:</p>
                <ul className="space-y-0.5">
                  {suggestions.map((s, i) => (
                    <li key={i} className="text-xs text-yellow-400/80 flex items-start gap-1.5">
                      <span className="text-yellow-500 mt-0.5">•</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-3 flex items-center gap-2">
              <Button
                size="sm"
                variant={ready ? 'default' : 'outline'}
                onClick={onProceed}
                disabled={loading}
              >
                {loading ? (
                  'Loading...'
                ) : (
                  <>
                    {ready ? 'Proceed' : 'Proceed Anyway'}
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </>
                )}
              </Button>
              {!ready && (
                <span className="text-[10px] text-neutral-500">
                  You can always proceed — the agent just recommends more data
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
