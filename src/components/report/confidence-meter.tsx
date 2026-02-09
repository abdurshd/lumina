'use client';

import { memo } from 'react';
import { Progress } from '@/components/ui/progress';

interface ConfidenceMeterProps {
  level?: 'high' | 'medium' | 'low';
  value?: number;
}

const levelConfig = {
  high: { value: 90, label: 'High confidence' },
  medium: { value: 60, label: 'Medium confidence' },
  low: { value: 30, label: 'Low confidence' },
};

function getLabel(v: number): string {
  if (v >= 75) return 'High confidence';
  if (v >= 45) return 'Medium confidence';
  return 'Low confidence';
}

export const ConfidenceMeter = memo(function ConfidenceMeter({ level, value }: ConfidenceMeterProps) {
  const numericValue = value ?? (level ? levelConfig[level].value : 50);
  const label = value != null ? getLabel(value) : (level ? levelConfig[level].label : 'Unknown');

  return (
    <div className="flex items-center gap-2">
      <Progress value={numericValue} className="h-1.5 w-16" />
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
});
