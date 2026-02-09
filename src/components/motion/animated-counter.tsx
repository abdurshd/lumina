'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
}

export function AnimatedCounter({ value, duration = 800, className, suffix = '', prefix = '' }: AnimatedCounterProps) {
  const shouldReduceMotion = useReducedMotion();
  const spanRef = useRef<HTMLSpanElement>(null);
  const prevValue = useRef(0);

  useEffect(() => {
    if (shouldReduceMotion) {
      prevValue.current = value;
      if (spanRef.current) spanRef.current.textContent = `${prefix}${value}${suffix}`;
      return;
    }

    const start = prevValue.current;
    const diff = value - start;
    if (diff === 0) {
      if (spanRef.current) spanRef.current.textContent = `${prefix}${value}${suffix}`;
      return;
    }

    const startTime = performance.now();
    let rafId: number;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + diff * eased);
      if (spanRef.current) spanRef.current.textContent = `${prefix}${current}${suffix}`;

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      } else {
        prevValue.current = value;
      }
    };

    rafId = requestAnimationFrame(animate);
    prevValue.current = value;

    return () => cancelAnimationFrame(rafId);
  }, [value, duration, shouldReduceMotion, prefix, suffix]);

  return (
    <span ref={spanRef} className={className}>
      {prefix}{value}{suffix}
    </span>
  );
}
