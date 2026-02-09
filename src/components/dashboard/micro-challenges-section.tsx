'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { MicroChallengeCard } from './micro-challenge-card';
import {
  staggerContainer,
  staggerItem,
  reducedMotionVariants,
  fadeInUp,
} from '@/lib/motion';
import { Sparkles, Loader2 } from 'lucide-react';
import type { MicroChallenge } from '@/types';

interface MicroChallengesSectionProps {
  challenges: MicroChallenge[];
  onGenerate: () => void;
  isGenerating: boolean;
}

export function MicroChallengesSection({ challenges, onGenerate, isGenerating }: MicroChallengesSectionProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <ScrollReveal variants={shouldReduceMotion ? undefined : fadeInUp}>
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 pb-0">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Micro-Challenges</CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={onGenerate}
            disabled={isGenerating}
            className="ml-auto text-xs h-7"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-3 w-3 mr-1" />
                Generate New
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent>
          {challenges.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No challenges yet. Generate your first micro-challenge to start growing.
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-3"
              initial="hidden"
              animate="visible"
              variants={shouldReduceMotion ? reducedMotionVariants : staggerContainer}
            >
              {challenges.map((challenge) => (
                <motion.div
                  key={challenge.id}
                  variants={shouldReduceMotion ? reducedMotionVariants : staggerItem}
                >
                  <MicroChallengeCard challenge={challenge} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </ScrollReveal>
  );
}
