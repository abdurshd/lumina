'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Lock, Circle } from 'lucide-react';
import { snappySpring } from '@/lib/motion';
import type { StageStatus } from '@/types';

interface StatusBadgeProps {
  status: StageStatus;
}

const config: Record<StageStatus, { label: string; icon: typeof CheckCircle2; variant: 'default' | 'secondary'; className?: string }> = {
  completed: { label: 'Done', icon: CheckCircle2, variant: 'default' },
  active: { label: 'Active', icon: Circle, variant: 'default' },
  locked: { label: 'Locked', icon: Lock, variant: 'secondary' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const { label, icon: Icon, variant, className } = config[status];
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.span
      initial={shouldReduceMotion ? false : { scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={snappySpring}
    >
      <Badge variant={variant} className={className}>
        <motion.span
          className="mr-1 inline-flex"
          animate={
            status === 'completed' && !shouldReduceMotion
              ? { scale: [1, 1.2, 1] }
              : status === 'active' && !shouldReduceMotion
              ? { opacity: [0.5, 1, 0.5] }
              : undefined
          }
          transition={
            status === 'completed'
              ? { duration: 0.4, delay: 0.2 }
              : status === 'active'
              ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
              : undefined
          }
        >
          <Icon className="h-3 w-3" />
        </motion.span>
        {label}
      </Badge>
    </motion.span>
  );
}
