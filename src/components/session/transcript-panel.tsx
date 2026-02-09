'use client';

import { memo, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { smoothTransition } from '@/lib/motion';
import type { TranscriptEntry } from '@/hooks/use-live-session';

interface TranscriptPanelProps {
  entries: TranscriptEntry[];
  isStreaming?: boolean;
}

export const TranscriptPanel = memo(function TranscriptPanel({ entries, isStreaming }: TranscriptPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries.length]);

  return (
    <ScrollArea className="h-full">
      <div className="space-y-3 p-4">
        {entries.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">
            Start the session to begin your conversation...
          </p>
        )}
        {entries.map((entry, i) => {
          const isLast = i === entries.length - 1;
          const isAiStreaming = isStreaming && isLast && !entry.isUser;

          return (
            <motion.div
              key={i}
              className={`flex ${entry.isUser ? 'justify-end' : 'justify-start'}`}
              initial={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, x: entry.isUser ? 12 : -12 }
              }
              animate={{ opacity: 1, x: 0 }}
              transition={smoothTransition}
            >
              <motion.div
                className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                  entry.isUser
                    ? 'bg-primary text-primary-foreground'
                    : 'glass'
                }`}
                animate={
                  isAiStreaming && !shouldReduceMotion
                    ? { opacity: [0.7, 1, 0.7] }
                    : undefined
                }
                transition={
                  isAiStreaming
                    ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
                    : undefined
                }
              >
                <p className="text-xs font-medium mb-0.5 opacity-70 font-mono">
                  {entry.isUser ? 'You' : 'Lumina'}
                </p>
                {entry.text}
              </motion.div>
            </motion.div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
});
