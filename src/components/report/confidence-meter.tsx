'use client';

import { memo } from 'react';
import { Progress } from '@/components/ui/progress';

interface ConfidenceMeterProps {
  level: 'high' | 'medium' | 'low';
}

const levelConfig = {
  high: { value: 90, label: 'High confidence' },
  medium: { value: 60, label: 'Medium confidence' },
  low: { value: 30, label: 'Low confidence' },
};

export const ConfidenceMeter = memo(function ConfidenceMeter({ level }: ConfidenceMeterProps) {
  const config = levelConfig[level];
  return (
    <div className="flex items-center gap-2">
      <Progress value={config.value} className="h-1.5 w-16" />
      <span className="text-[10px] text-muted-foreground">{config.label}</span>
    </div>
  );
});
