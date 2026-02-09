'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import {
  staggerContainer,
  staggerItem,
  reducedMotionVariants,
  fadeInUp,
} from '@/lib/motion';
import { ClipboardList } from 'lucide-react';
import type { ActionItem, ActionPlanProgress } from '@/types';

interface ActionPlanTrackerProps {
  actionItems: ActionItem[];
  progress: ActionPlanProgress | null;
  onUpdateProgress: (itemTitle: string, status: 'pending' | 'completed') => void;
}

const priorityColors: Record<string, string> = {
  high: 'bg-red-500/10 text-red-400 border-red-500/20',
  medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  low: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

export function ActionPlanTracker({ actionItems, progress, onUpdateProgress }: ActionPlanTrackerProps) {
  const shouldReduceMotion = useReducedMotion();

  const completedCount = actionItems.filter(
    (item) => progress?.items[item.title]?.status === 'completed'
  ).length;
  const totalCount = actionItems.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <ScrollReveal variants={shouldReduceMotion ? undefined : fadeInUp}>
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 pb-0">
          <ClipboardList className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Action Plan</CardTitle>
          <span className="ml-auto text-sm font-mono text-muted-foreground">
            {completedCount} of {totalCount} completed
          </span>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={progressPercent} className="h-2" />
          <motion.div
            className="space-y-3"
            initial="hidden"
            animate="visible"
            variants={shouldReduceMotion ? reducedMotionVariants : staggerContainer}
          >
            {actionItems.map((item) => {
              const isCompleted = progress?.items[item.title]?.status === 'completed';

              return (
                <motion.div
                  key={item.title}
                  className="flex items-start gap-3 rounded-lg border-2 border-overlay-light p-3"
                  variants={shouldReduceMotion ? reducedMotionVariants : staggerItem}
                >
                  <Checkbox
                    checked={isCompleted}
                    onCheckedChange={(checked) => {
                      onUpdateProgress(
                        item.title,
                        checked ? 'completed' : 'pending'
                      );
                    }}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-semibold ${isCompleted ? 'line-through text-muted-foreground' : ''}`}
                      >
                        {item.title}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-xs border ${priorityColors[item.priority] ?? ''}`}
                      >
                        {item.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                    <span className="text-xs text-muted-foreground/70">{item.timeframe}</span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </CardContent>
      </Card>
    </ScrollReveal>
  );
}
