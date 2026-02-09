'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { scaleIn, reducedMotionVariants } from '@/lib/motion';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className="flex flex-col items-center justify-center py-20 text-center"
      initial="hidden"
      animate="visible"
      variants={shouldReduceMotion ? reducedMotionVariants : scaleIn}
    >
      <motion.div
        className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 border-2 border-primary/20"
        initial={shouldReduceMotion ? false : { scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
      >
        <Icon className="h-10 w-10 text-primary" />
      </motion.div>
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <p className="max-w-md text-muted-foreground mb-6">{description}</p>
      {action}
    </motion.div>
  );
}
