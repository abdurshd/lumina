'use client';

import { forwardRef, type ComponentProps } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Loader2, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

type LoadingButtonProps = ComponentProps<typeof Button> & {
  loading?: boolean;
  loadingText?: string;
  icon?: LucideIcon;
};

export const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ loading, loadingText, icon: Icon, children, disabled, className, ...props }, ref) => {
    const shouldReduceMotion = useReducedMotion();

    return (
      <motion.div
        whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={className}
      >
        <Button ref={ref} disabled={disabled || loading} className="w-full" {...props}>
          <AnimatePresence mode="wait" initial={false}>
            {loading ? (
              <motion.span
                key="loading"
                initial={shouldReduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center"
              >
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {loadingText ?? children}
              </motion.span>
            ) : (
              <motion.span
                key="default"
                initial={shouldReduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center"
              >
                {Icon && <Icon className="mr-2 h-4 w-4" />}
                {children}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </motion.div>
    );
  }
);

LoadingButton.displayName = 'LoadingButton';
