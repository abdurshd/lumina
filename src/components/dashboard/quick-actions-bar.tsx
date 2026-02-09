'use client';

import { useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { fadeInUp } from '@/lib/motion';
import { Brain, Video, FileText, Plug, TrendingUp } from 'lucide-react';
import Link from 'next/link';

const actions = [
  { label: 'Retake Quiz', href: '/quiz', icon: Brain },
  { label: 'New Session', href: '/session', icon: Video },
  { label: 'Full Report', href: '/report', icon: FileText },
  { label: 'Connect Data', href: '/connections', icon: Plug },
  { label: 'Evolution', href: '/evolution', icon: TrendingUp },
] as const;

export function QuickActionsBar() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <ScrollReveal variants={shouldReduceMotion ? undefined : fadeInUp}>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.href} href={action.href}>
              <Button variant="outline" size="sm" className="shrink-0 text-xs h-8 gap-1.5">
                <Icon className="h-3.5 w-3.5" />
                {action.label}
              </Button>
            </Link>
          );
        })}
      </div>
    </ScrollReveal>
  );
}
