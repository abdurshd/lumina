'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface ErrorAlertProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorAlert({ title = 'Something went wrong', message, onRetry, className }: ErrorAlertProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 0 }}
      animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: [0, -10, 10, -10, 10, 0] }}
      transition={shouldReduceMotion ? { duration: 0.01 } : { duration: 0.5 }}
      className={className}
    >
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="flex items-center justify-between gap-4">
          <span>{message}</span>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry} className="shrink-0">
              <RefreshCw className="mr-1.5 h-3 w-3" />
              Retry
            </Button>
          )}
        </AlertDescription>
      </Alert>
    </motion.div>
  );
}
