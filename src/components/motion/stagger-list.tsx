'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { staggerContainer, staggerItem, reducedMotionVariants } from '@/lib/motion';
import type { Variants, HTMLMotionProps } from 'framer-motion';

interface StaggerListProps extends Omit<HTMLMotionProps<'div'>, 'variants'> {
  containerVariants?: Variants;
  itemVariants?: Variants;
}

export function StaggerList({ containerVariants, children, className, ...props }: StaggerListProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={shouldReduceMotion ? reducedMotionVariants : (containerVariants ?? staggerContainer)}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps extends Omit<HTMLMotionProps<'div'>, 'variants'> {
  variants?: Variants;
}

export function StaggerItem({ variants: customVariants, children, ...props }: StaggerItemProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={shouldReduceMotion ? reducedMotionVariants : (customVariants ?? staggerItem)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
