'use client';

import { memo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, Info } from 'lucide-react';
import { ConfidenceMeter } from './confidence-meter';
import { EvidenceDrawer } from './evidence-drawer';
import { staggerContainer, staggerItem, smoothTransition, reducedMotionVariants } from '@/lib/motion';
import { AnimatedCounter } from '@/components/motion/animated-counter';
import type { Strength } from '@/types';

interface StrengthsGridProps {
  strengths: Strength[];
  onFeedback?: (strengthName: string, feedback: 'agree' | 'disagree', reason?: string) => void;
}

export const StrengthsGrid = memo(function StrengthsGrid({ strengths, onFeedback }: StrengthsGridProps) {
  const [drawerStrength, setDrawerStrength] = useState<Strength | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<number, 'agree' | 'disagree'>>({});
  const shouldReduceMotion = useReducedMotion();

  const handleFeedback = (index: number, type: 'agree' | 'disagree') => {
    setFeedbackGiven((prev) => ({ ...prev, [index]: type }));
    onFeedback?.(strengths[index].name, type);
  };

  return (
    <>
      <motion.div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={shouldReduceMotion ? reducedMotionVariants : staggerContainer}
      >
        {strengths.map((strength, i) => (
          <motion.div
            key={i}
            variants={shouldReduceMotion ? reducedMotionVariants : staggerItem}
            whileHover={shouldReduceMotion ? undefined : { y: -2 }}
            transition={smoothTransition}
          >
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-sm font-sans">{strength.name}</h4>
                  <motion.span
                    className="text-xs font-bold text-primary font-mono"
                    animate={
                      !shouldReduceMotion
                        ? { scale: [1, 1.1, 1] }
                        : undefined
                    }
                    transition={{ duration: 0.4, delay: 0.8 }}
                  >
                    <AnimatedCounter value={strength.score} />/100
                  </motion.span>
                </div>
                <Progress value={strength.score} className="h-3 mb-3" />
                <p className="text-xs text-muted-foreground mb-2">{strength.evidence}</p>

                {strength.confidenceLevel && (
                  <div className="mb-2">
                    <ConfidenceMeter level={strength.confidenceLevel} />
                  </div>
                )}

                <div className="flex items-center gap-1">
                  {strength.evidenceSources && strength.evidenceSources.length > 0 && (
                    <button
                      onClick={() => setDrawerStrength(strength)}
                      className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Info className="h-3 w-3" /> Why?
                    </button>
                  )}
                  <AnimatePresence mode="wait">
                    {onFeedback && !feedbackGiven[i] && (
                      <motion.div
                        key="buttons"
                        className="flex items-center gap-1"
                        initial={{ opacity: 1 }}
                        exit={shouldReduceMotion ? { opacity: 0 } : { scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <motion.div whileTap={shouldReduceMotion ? undefined : { scale: 0.85 }}>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-1.5 text-[10px]"
                            onClick={() => handleFeedback(i, 'agree')}
                          >
                            <ThumbsUp className="h-2.5 w-2.5" />
                          </Button>
                        </motion.div>
                        <motion.div whileTap={shouldReduceMotion ? undefined : { scale: 0.85 }}>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-1.5 text-[10px]"
                            onClick={() => handleFeedback(i, 'disagree')}
                          >
                            <ThumbsDown className="h-2.5 w-2.5" />
                          </Button>
                        </motion.div>
                      </motion.div>
                    )}
                    {feedbackGiven[i] && (
                      <motion.span
                        key="confirmation"
                        className="text-[10px] text-muted-foreground ml-1"
                        initial={shouldReduceMotion ? false : { opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={smoothTransition}
                      >
                        {feedbackGiven[i] === 'agree' ? 'Confirmed' : 'Noted'}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <EvidenceDrawer
        open={!!drawerStrength}
        onOpenChange={(open) => { if (!open) setDrawerStrength(null); }}
        title={drawerStrength?.name ?? ''}
        evidenceSources={drawerStrength?.evidenceSources ?? []}
        confidenceLevel={drawerStrength?.confidenceLevel}
      />
    </>
  );
});
