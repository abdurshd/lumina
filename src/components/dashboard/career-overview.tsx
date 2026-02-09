'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import {
  staggerContainer,
  staggerItem,
  reducedMotionVariants,
  fadeInUp,
} from '@/lib/motion';
import { Briefcase } from 'lucide-react';
import type { CareerPath } from '@/types';

interface CareerOverviewProps {
  careerPaths: CareerPath[];
}

export function CareerOverview({ careerPaths }: CareerOverviewProps) {
  const shouldReduceMotion = useReducedMotion();
  const topTwo = careerPaths.slice(0, 2);

  return (
    <ScrollReveal variants={shouldReduceMotion ? undefined : fadeInUp}>
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 pb-0">
          <Briefcase className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Top Career Matches</CardTitle>
        </CardHeader>
        <CardContent>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            initial="hidden"
            animate="visible"
            variants={shouldReduceMotion ? reducedMotionVariants : staggerContainer}
          >
            {topTwo.map((career) => (
              <motion.div
                key={career.title}
                className="rounded-xl border-2 border-overlay-light p-4 space-y-3"
                variants={shouldReduceMotion ? reducedMotionVariants : staggerItem}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-sm">{career.title}</h3>
                  <Badge variant="secondary" className="shrink-0 text-xs">
                    {career.match}%
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-3">
                  {career.description}
                </p>
                {career.riasecCodes && (
                  <Badge variant="outline" className="text-xs">
                    {career.riasecCodes}
                  </Badge>
                )}
              </motion.div>
            ))}
          </motion.div>
        </CardContent>
      </Card>
    </ScrollReveal>
  );
}
