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
  const parts = text.split(/(\s+)/).map((part, index, allParts) => ({
    part,
    offset: allParts.slice(0, index).join('').length,
  }));

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
        {parts.map(({ part, offset }, partIndex) => {
          if (/^\s+$/.test(part)) {
            return (
              <span key={`space-${partIndex}`} className="inline-block w-[0.25em]">
                {'\u00A0'}
              </span>
            );
          }

          return (
            <span key={`${part}-${partIndex}`} className="inline-block whitespace-nowrap">
              {part.split('').map((char, charIndex) => {
                const delayIndex = offset + charIndex;

                return (
                  <motion.span
                    key={`${char}-${charIndex}`}
                    className="inline-block"
                    variants={{
                      hidden: { opacity: 0, scale: 0.8, y: 4 },
                      visible: {
                        opacity: 1,
                        scale: 1,
                        y: 0,
                        transition: { ...snappySpring, delay: delayIndex * staggerDelay },
                      },
                    }}
                  >
                    {char}
                  </motion.span>
                );
              })}
            </span>
          );
        })}
      </motion.span>
    </AnimatePresence>
  );
}
