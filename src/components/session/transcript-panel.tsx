'use client';

import { memo, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
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
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkBreaks]}
                  components={{
                    p: ({ children }) => <p className="leading-relaxed [&:not(:last-child)]:mb-2">{children}</p>,
                    ul: ({ children }) => <ul className="my-2 list-disc space-y-1 pl-5">{children}</ul>,
                    ol: ({ children }) => <ol className="my-2 list-decimal space-y-1 pl-5">{children}</ol>,
                    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                    em: ({ children }) => <em className="italic">{children}</em>,
                    code: ({ children, ...props }) => {
                      const isInline = !('className' in props) || !props.className;
                      if (isInline) {
                        return (
                          <code className="rounded bg-white/10 px-1 py-0.5 font-mono text-[0.85em]">
                            {children}
                          </code>
                        );
                      }
                      return <code className="font-mono text-[0.85em]">{children}</code>;
                    },
                    pre: ({ children }) => (
                      <pre className="my-2 overflow-x-auto rounded-md bg-black/30 p-2">{children}</pre>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="my-2 border-l-2 border-primary/50 pl-3 italic opacity-90">
                        {children}
                      </blockquote>
                    ),
                    a: ({ children, href }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="underline decoration-primary/70 underline-offset-2"
                      >
                        {children}
                      </a>
                    ),
                  }}
                >
                  {entry.text}
                </ReactMarkdown>
              </motion.div>
            </motion.div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
});
