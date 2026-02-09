'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { staggerContainer, staggerItem, reducedMotionVariants } from '@/lib/motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ProfileSnapshot } from '@/types';

interface ProfileTimelineProps {
  snapshots: ProfileSnapshot[];
}

const triggerLabels: Record<string, string> = {
  initial: 'Initial',
  quiz_retake: 'Quiz Retake',
  challenge_complete: 'Challenge',
  reflection: 'Reflection',
  feedback: 'Feedback',
};

const triggerColors: Record<string, string> = {
  initial: 'bg-primary/10 text-primary border-primary/20',
  quiz_retake: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  challenge_complete: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  reflection: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  feedback: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
};

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDelta(value: number): string {
  if (value > 0) return `+${value.toFixed(1)}`;
  return value.toFixed(1);
}

export function ProfileTimeline({ snapshots }: ProfileTimelineProps) {
  const shouldReduceMotion = useReducedMotion();

  if (snapshots.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground text-sm">
          No profile snapshots yet. Complete challenges and reflections to see your evolution.
        </CardContent>
      </Card>
    );
  }

  const sorted = [...snapshots].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <motion.div
      className="relative space-y-6"
      initial="hidden"
      animate="visible"
      variants={shouldReduceMotion ? reducedMotionVariants : staggerContainer}
    >
      {/* Vertical line */}
      <div className="absolute left-[19px] top-4 bottom-4 w-[2px] bg-overlay-light" />

      {sorted.map((snapshot) => (
        <motion.div
          key={`${snapshot.version}-${snapshot.timestamp}`}
          className="relative flex gap-4"
          variants={shouldReduceMotion ? reducedMotionVariants : staggerItem}
        >
          {/* Timeline dot */}
          <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-overlay-light bg-card">
            <span className="text-xs font-bold font-mono text-muted-foreground">
              v{snapshot.version}
            </span>
          </div>

          <Card className="flex-1">
            <CardContent className="py-4">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <Badge
                  variant="outline"
                  className={triggerColors[snapshot.trigger] ?? 'bg-overlay-subtle text-muted-foreground border-overlay-light'}
                >
                  {triggerLabels[snapshot.trigger] ?? snapshot.trigger}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDate(snapshot.timestamp)}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-bold">RIASEC:</span>
                <span className="text-sm font-mono text-primary font-bold tracking-wider">
                  {snapshot.riasecCode}
                </span>
              </div>

              {snapshot.reportHeadline && (
                <p className="text-sm text-muted-foreground mb-3">
                  {snapshot.reportHeadline}
                </p>
              )}

              {snapshot.deltas && Object.keys(snapshot.deltas).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(snapshot.deltas).map(([dim, delta]) => (
                    <Badge
                      key={dim}
                      variant="outline"
                      className={
                        delta > 0
                          ? 'text-emerald-400 border-emerald-500/20'
                          : delta < 0
                            ? 'text-red-400 border-red-500/20'
                            : 'text-muted-foreground border-overlay-light'
                      }
                    >
                      {dim}: {formatDelta(delta)}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
