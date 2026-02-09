'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { fadeInUp, fadeIn, scaleIn, slideInLeft, slideInRight, popIn, reducedMotionVariants } from '@/lib/motion';
import type { Variants, HTMLMotionProps } from 'framer-motion';

const presets: Record<string, Variants> = {
  fadeInUp,
  fadeIn,
  scaleIn,
  slideInLeft,
  slideInRight,
  popIn,
};

interface MotionDivProps extends Omit<HTMLMotionProps<'div'>, 'variants'> {
  variant?: keyof typeof presets;
  variants?: Variants;
  delay?: number;
}

export function MotionDiv({ variant = 'fadeInUp', variants: customVariants, delay, children, ...props }: MotionDivProps) {
  const shouldReduceMotion = useReducedMotion();
  const selectedVariants = shouldReduceMotion ? reducedMotionVariants : (customVariants ?? presets[variant]);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={selectedVariants}
      transition={delay ? { delay } : undefined}
      {...props}
    >
      {children}
    </motion.div>
  );
}
