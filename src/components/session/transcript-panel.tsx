'use client';

import { memo, useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { TranscriptEntry } from '@/hooks/use-live-session';

interface TranscriptPanelProps {
  entries: TranscriptEntry[];
}

export const TranscriptPanel = memo(function TranscriptPanel({ entries }: TranscriptPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

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
        {entries.map((entry, i) => (
          <div
            key={i}
            className={`flex ${entry.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                entry.isUser
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'
              }`}
            >
              <p className="text-xs font-medium mb-0.5 opacity-70">
                {entry.isUser ? 'You' : 'Lumina'}
              </p>
              {entry.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
});
