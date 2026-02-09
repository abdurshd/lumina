'use client';

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { fadeInUp, staggerContainer, staggerItem, reducedMotionVariants } from '@/lib/motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import type { ProfileSnapshot } from '@/types';

interface ProfileComparisonProps {
  snapshotA: ProfileSnapshot;
  snapshotB: ProfileSnapshot;
}

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

export function ProfileComparison({ snapshotA, snapshotB }: ProfileComparisonProps) {
  const shouldReduceMotion = useReducedMotion();

  const allDimensions = useMemo(() => {
    const dims = new Set<string>();
    Object.keys(snapshotA.dimensionScores).forEach((d) => dims.add(d));
    Object.keys(snapshotB.dimensionScores).forEach((d) => dims.add(d));
    return Array.from(dims);
  }, [snapshotA, snapshotB]);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={shouldReduceMotion ? reducedMotionVariants : fadeInUp}
    >
      <Card>
        <CardHeader>
          <CardTitle className="font-sans">Profile Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          {/* RIASEC comparison */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">
                v{snapshotA.version} - {formatDate(snapshotA.timestamp)}
              </p>
              <span className="text-lg font-mono font-bold text-primary tracking-wider">
                {snapshotA.riasecCode}
              </span>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" />
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">
                v{snapshotB.version} - {formatDate(snapshotB.timestamp)}
              </p>
              <span className="text-lg font-mono font-bold text-primary tracking-wider">
                {snapshotB.riasecCode}
              </span>
            </div>
          </div>

          {/* Dimension scores grid */}
          <motion.div
            className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 gap-y-2 items-center"
            initial="hidden"
            animate="visible"
            variants={shouldReduceMotion ? reducedMotionVariants : staggerContainer}
          >
            {/* Header row */}
            <div className="text-xs font-bold text-muted-foreground">Dimension</div>
            <div className="text-xs font-bold text-muted-foreground text-center">v{snapshotA.version}</div>
            <div className="text-xs font-bold text-muted-foreground text-center">v{snapshotB.version}</div>
            <div className="text-xs font-bold text-muted-foreground text-center">Change</div>

            {allDimensions.map((dim) => {
              const scoreA = snapshotA.dimensionScores[dim] ?? 0;
              const scoreB = snapshotB.dimensionScores[dim] ?? 0;
              const delta = scoreB - scoreA;

              return (
                <motion.div
                  key={dim}
                  className="contents"
                  variants={shouldReduceMotion ? reducedMotionVariants : staggerItem}
                >
                  <span className="text-sm font-medium">{dim}</span>
                  <span className="text-sm font-mono text-center text-muted-foreground">
                    {scoreA.toFixed(0)}
                  </span>
                  <span className="text-sm font-mono text-center">
                    {scoreB.toFixed(0)}
                  </span>
                  <div className="flex justify-center">
                    <Badge
                      variant="outline"
                      className={
                        delta > 0
                          ? 'text-emerald-400 border-emerald-500/20'
                          : delta < 0
                            ? 'text-red-400 border-red-500/20'
                            : 'text-muted-foreground border-overlay-light'
                      }
                    >
                      {formatDelta(delta)}
                    </Badge>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
