'use client';

import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Lock, Circle } from 'lucide-react';
import type { StageStatus } from '@/types';

interface StatusBadgeProps {
  status: StageStatus;
}

const config: Record<StageStatus, { label: string; icon: typeof CheckCircle2; variant: 'default' | 'secondary'; className?: string }> = {
  completed: { label: 'Done', icon: CheckCircle2, variant: 'default' },
  active: { label: 'Active', icon: Circle, variant: 'default' },
  locked: { label: 'Locked', icon: Lock, variant: 'secondary' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const { label, icon: Icon, variant, className } = config[status];
  return (
    <Badge variant={variant} className={className}>
      <Icon className="mr-1 h-3 w-3" />
      {label}
    </Badge>
  );
}
