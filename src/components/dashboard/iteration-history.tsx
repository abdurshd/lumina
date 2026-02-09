'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import {
  staggerContainer,
  staggerItem,
  reducedMotionVariants,
  fadeInUp,
} from '@/lib/motion';
import { History, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { ProfileSnapshot, ProfileSnapshotTrigger } from '@/types';

interface IterationHistoryProps {
  snapshots: ProfileSnapshot[];
}

const triggerLabels: Record<ProfileSnapshotTrigger, string> = {
  initial: 'Initial Assessment',
  quiz_retake: 'Quiz Retake',
  challenge_complete: 'Challenge Completed',
  reflection: 'Reflection',
  feedback: 'Feedback',
};

const triggerColors: Record<ProfileSnapshotTrigger, string> = {
  initial: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  quiz_retake: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  challenge_complete: 'bg-green-500/10 text-green-400 border-green-500/20',
  reflection: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  feedback: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
};

export function IterationHistory({ snapshots }: IterationHistoryProps) {
  const shouldReduceMotion = useReducedMotion();
  const recentSnapshots = snapshots.slice(0, 5);

  return (
    <ScrollReveal variants={shouldReduceMotion ? undefined : fadeInUp}>
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 pb-0">
          <History className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Profile Evolution</CardTitle>
          <Link href="/evolution" className="ml-auto">
            <Button size="sm" variant="outline" className="text-xs h-7">
              View All
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentSnapshots.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No profile snapshots yet. Complete activities to see your evolution.
            </div>
          ) : (
            <motion.div
              className="relative space-y-0"
              initial="hidden"
              animate="visible"
              variants={shouldReduceMotion ? reducedMotionVariants : staggerContainer}
            >
              {/* Timeline line */}
              <div className="absolute left-[11px] top-2 bottom-2 w-px bg-overlay-light" />

              {recentSnapshots.map((snapshot, index) => (
                <motion.div
                  key={`${snapshot.version}-${snapshot.timestamp}`}
                  className="relative flex items-start gap-4 py-3"
                  variants={shouldReduceMotion ? reducedMotionVariants : staggerItem}
                >
                  {/* Timeline dot */}
                  <div
                    className={`relative z-10 mt-1 h-[9px] w-[9px] shrink-0 rounded-full border-2 ${
                      index === 0
                        ? 'border-primary bg-primary'
                        : 'border-overlay-light bg-card'
                    }`}
                  />

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="outline"
                        className={`text-xs border ${triggerColors[snapshot.trigger]}`}
                      >
                        {triggerLabels[snapshot.trigger]}
                      </Badge>
                      <span className="text-xs text-muted-foreground font-mono">
                        v{snapshot.version}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>RIASEC: {snapshot.riasecCode}</span>
                      <span>
                        {new Date(snapshot.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    {snapshot.reportHeadline && (
                      <p className="text-xs text-muted-foreground/80 truncate">
                        {snapshot.reportHeadline}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </ScrollReveal>
  );
}
