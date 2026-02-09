'use client';

import { useSyncExternalStore } from 'react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';

const emptySubscribe = () => () => {};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const shouldReduceMotion = useReducedMotion();

  if (!mounted) {
    return <Button variant="ghost" size="icon-sm" className="text-muted-foreground" disabled><Moon className="h-4 w-4" /></Button>;
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="text-muted-foreground hover:text-foreground overflow-hidden"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={shouldReduceMotion ? false : { rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={shouldReduceMotion ? undefined : { rotate: 90, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, duration: 0.2 }}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </motion.span>
      </AnimatePresence>
    </Button>
  );
}
