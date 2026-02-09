'use client';

import { forwardRef, type ComponentProps } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Loader2, Check, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatedText } from '@/components/motion/animated-text';
import { snappySpring } from '@/lib/motion';

type LoadingButtonProps = ComponentProps<typeof Button> & {
  loading?: boolean;
  loadingText?: string;
  icon?: LucideIcon;
  success?: boolean;
};

export const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ loading, loadingText, icon: Icon, success, children, disabled, className, ...props }, ref) => {
    const shouldReduceMotion = useReducedMotion();

    const buttonText = typeof children === 'string' ? children : null;
    const loadingStr = typeof loadingText === 'string' ? loadingText : null;

    return (
      <motion.div
        whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={className}
      >
        <Button ref={ref} disabled={disabled || loading} className="w-full" {...props}>
          <AnimatePresence mode="wait" initial={false}>
            {success ? (
              <motion.span
                key="success"
                initial={shouldReduceMotion ? false : { scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={shouldReduceMotion ? undefined : { scale: 0.8, opacity: 0 }}
                transition={snappySpring}
                className="flex items-center"
              >
                <Check className="mr-2 h-4 w-4" />
                Done
              </motion.span>
            ) : loading ? (
              <motion.span
                key="loading"
                initial={shouldReduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center"
              >
                <motion.span
                  initial={shouldReduceMotion ? false : { scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={snappySpring}
                >
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                </motion.span>
                {loadingStr && !shouldReduceMotion ? (
                  <AnimatedText text={loadingStr} staggerDelay={0.02} animateKey="loading-text" />
                ) : (
                  loadingText ?? children
                )}
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
                {buttonText && !shouldReduceMotion ? (
                  <AnimatedText text={buttonText} staggerDelay={0.02} animateKey="default-text" />
                ) : (
                  children
                )}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </motion.div>
    );
  }
);

LoadingButton.displayName = 'LoadingButton';
