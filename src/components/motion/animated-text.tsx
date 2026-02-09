'use client';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { snappySpring } from '@/lib/motion';

interface AnimatedTextProps {
  text: string;
  className?: string;
  staggerDelay?: number;
  animateKey?: string;
}

export function AnimatedText({ text, className, staggerDelay = 0.02, animateKey }: AnimatedTextProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <span className={className}>{text}</span>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={animateKey ?? text}
        className={className}
        initial="hidden"
        animate="visible"
        exit="hidden"
        aria-label={text}
      >
        {text.split('').map((char, i) => (
          <motion.span
            key={`${char}-${i}`}
            className="inline-block"
            style={char === ' ' ? { width: '0.25em' } : undefined}
            variants={{
              hidden: { opacity: 0, scale: 0.8, y: 4 },
              visible: {
                opacity: 1,
                scale: 1,
                y: 0,
                transition: { ...snappySpring, delay: i * staggerDelay },
              },
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
      </motion.span>
    </AnimatePresence>
  );
}
