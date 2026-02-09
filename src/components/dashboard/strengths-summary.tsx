'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import {
  staggerContainer,
  staggerItem,
  reducedMotionVariants,
  fadeInUp,
} from '@/lib/motion';
import { Zap } from 'lucide-react';
import type { Strength } from '@/types';

interface StrengthsSummaryProps {
  strengths: Strength[];
}

export function StrengthsSummary({ strengths }: StrengthsSummaryProps) {
  const shouldReduceMotion = useReducedMotion();
  const topThree = strengths.slice(0, 3);

  return (
    <ScrollReveal variants={shouldReduceMotion ? undefined : fadeInUp}>
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 pb-0">
          <Zap className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Top Strengths</CardTitle>
        </CardHeader>
        <CardContent>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
            initial="hidden"
            animate="visible"
            variants={shouldReduceMotion ? reducedMotionVariants : staggerContainer}
          >
            {topThree.map((strength) => (
              <motion.div
                key={strength.name}
                className="space-y-2"
                variants={shouldReduceMotion ? reducedMotionVariants : staggerItem}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold truncate">{strength.name}</span>
                  <span className="text-xs font-mono text-muted-foreground">{strength.score}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-overlay-light overflow-hidden">
                  <motion.div
                    className="h-2 rounded-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${strength.score}%` }}
                    transition={
                      shouldReduceMotion
                        ? { duration: 0 }
                        : { type: 'spring', stiffness: 200, damping: 25, delay: 0.2 }
                    }
                  />
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{strength.evidence}</p>
              </motion.div>
            ))}
          </motion.div>
        </CardContent>
      </Card>
    </ScrollReveal>
  );
}
