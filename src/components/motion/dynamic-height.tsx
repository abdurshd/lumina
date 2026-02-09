'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { morphTransition } from '@/lib/motion';
import type { Transition, HTMLMotionProps } from 'framer-motion';

interface DynamicHeightProps extends Omit<HTMLMotionProps<'div'>, 'transition'> {
  transition?: Transition;
}

export function DynamicHeight({ children, className, transition, ...props }: DynamicHeightProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      layout
      className={className}
      transition={shouldReduceMotion ? { duration: 0 } : (transition ?? morphTransition)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
