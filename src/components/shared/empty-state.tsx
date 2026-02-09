'use client';

import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in-up">
      <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 border-2 border-primary/20">
        <Icon className="h-10 w-10 text-primary" />
      </div>
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <p className="max-w-md text-muted-foreground mb-6">{description}</p>
      {action}
    </div>
  );
}
