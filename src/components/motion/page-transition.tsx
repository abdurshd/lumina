'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';

const pageVariants = {
  hidden: { opacity: 0.98, y: 2 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.14,
      ease: 'easeOut' as const,
    },
  },
};

const reducedVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.01 } },
};

interface PageTransitionProps extends Omit<HTMLMotionProps<'div'>, 'variants'> {
  children: React.ReactNode;
}

export function PageTransition({ children, ...props }: PageTransitionProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={shouldReduceMotion ? reducedVariants : pageVariants}
      {...props}
    >
      {children}
    </motion.div>
  );
}
