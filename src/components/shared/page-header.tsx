'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { fadeInUp, smoothTransition, reducedMotionVariants } from '@/lib/motion';
import type { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  children?: React.ReactNode;
}

export function PageHeader({ icon: Icon, title, description, children }: PageHeaderProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className="mb-8"
      initial="hidden"
      animate="visible"
      variants={shouldReduceMotion ? reducedMotionVariants : fadeInUp}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold">
            <motion.div
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border-2 border-primary/20"
              initial={shouldReduceMotion ? false : { scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ ...smoothTransition, delay: 0.1 }}
            >
              <Icon className="h-5 w-5 text-primary" />
            </motion.div>
            {title}
          </h1>
          <motion.p
            className="mt-2 text-muted-foreground ml-[52px]"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...smoothTransition, delay: 0.2 }}
          >
            {description}
          </motion.p>
        </div>
        {children && (
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...smoothTransition, delay: 0.3 }}
          >
            {children}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
