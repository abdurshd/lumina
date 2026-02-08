'use client';

import { Clock } from 'lucide-react';

interface SessionTimerProps {
  seconds: number;
}

export function SessionTimer({ seconds }: SessionTimerProps) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Clock className="h-4 w-4" />
      <span className="font-mono">
        {mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}
      </span>
    </div>
  );
}
