'use client';

import type { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  children?: React.ReactNode;
}

export function PageHeader({ icon: Icon, title, description, children }: PageHeaderProps) {
  return (
    <div className="mb-8 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border-2 border-primary/20">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            {title}
          </h1>
          <p className="mt-2 text-muted-foreground ml-[52px]">{description}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
