'use client';

import { useAuthStore } from '@/stores/auth-store';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge, StageCardSkeleton } from '@/components/shared';
import { Plug, Brain, Video, FileText, ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import type { AssessmentStage } from '@/types';

const stages: { key: AssessmentStage; label: string; description: string; icon: typeof Plug; href: string }[] = [
  { key: 'connections', label: 'Data Connections', description: 'Connect your digital footprint sources', icon: Plug, href: '/connections' },
  { key: 'quiz', label: 'Talent Quiz', description: 'AI-adaptive assessment of your skills and interests', icon: Brain, href: '/quiz' },
  { key: 'session', label: 'Live Session', description: 'Video conversation with your AI career counselor', icon: Video, href: '/session' },
  { key: 'report', label: 'Talent Report', description: 'Your comprehensive talent discovery report', icon: FileText, href: '/report' },
];

export default function DashboardPage() {
  const { profile, loading } = useAuthStore();

  const completedCount = profile
    ? Object.values(profile.stages).filter((s) => s === 'completed').length
    : 0;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8 animate-fade-in-up">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="h-6 w-6 text-primary animate-pulse-glow" />
          <h1 className="text-3xl font-bold">
            Welcome back{profile?.displayName ? `, ${profile.displayName.split(' ')[0]}` : ''}
          </h1>
        </div>
        <p className="text-muted-foreground">
          Complete all four stages to unlock your personalized talent report.
        </p>
        <div className="mt-4 flex items-center gap-2">
          <div className="h-2 flex-1 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-2 rounded-full bg-primary transition-all duration-500 ease-out glow-amber-sm"
              style={{ width: `${(completedCount / 4) * 100}%` }}
            />
          </div>
          <span className="text-sm font-medium text-muted-foreground font-mono">{completedCount}/4</span>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StageCardSkeleton key={i} />)
        ) : (
          stages.map((stage, i) => {
            const status = profile?.stages[stage.key] ?? 'locked';
            const isActive = status === 'active';
            const isCompleted = status === 'completed';
            const Icon = stage.icon;

            return (
              <Card
                key={stage.key}
                className={`transition-all duration-300 animate-fade-in-up ${
                  isActive
                    ? 'glass glow-amber-sm'
                    : isCompleted
                    ? 'glass border-emerald-500/20'
                    : 'opacity-50'
                }`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <CardHeader className="flex flex-row items-center gap-4 py-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : isCompleted
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-white/[0.04] text-muted-foreground'
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg font-sans">
                        <span className="mr-2 text-muted-foreground font-mono text-sm">0{i + 1}</span>
                        {stage.label}
                      </CardTitle>
                      <StatusBadge status={status} />
                    </div>
                    <CardDescription>{stage.description}</CardDescription>
                  </div>
                  {(isActive || isCompleted) && (
                    <Link href={stage.href}>
                      <Button variant={isActive ? 'default' : 'outline'} size="sm" className={isActive ? 'glow-amber-sm' : ''}>
                        {isActive ? 'Start' : 'Review'}
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </CardHeader>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
