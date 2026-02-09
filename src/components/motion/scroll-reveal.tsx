'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { fadeInUp, reducedMotionVariants } from '@/lib/motion';
import type { Variants, HTMLMotionProps } from 'framer-motion';

interface ScrollRevealProps extends Omit<HTMLMotionProps<'div'>, 'variants'> {
  variants?: Variants;
  once?: boolean;
  amount?: number;
}

export function ScrollReveal({ variants, once = true, amount = 0.2, children, ...props }: ScrollRevealProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={shouldReduceMotion ? reducedMotionVariants : (variants ?? fadeInUp)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
