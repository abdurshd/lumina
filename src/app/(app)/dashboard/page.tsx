'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';
import { useAssessmentStore } from '@/stores/assessment-store';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge, StageCardSkeleton, LoadingButton } from '@/components/shared';
import { Plug, Brain, Video, FileText, ChevronRight, RotateCcw } from 'lucide-react';
import { LuminaIcon } from '@/components/icons/lumina-icon';
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
  const { resetForRetake } = useAssessmentStore();
  const [isRetaking, setIsRetaking] = useState(false);

  const completedCount = profile
    ? Object.values(profile.stages).filter((s) => s === 'completed').length
    : 0;

  const allCompleted = completedCount === 4;

  const handleRetake = useCallback(async () => {
    setIsRetaking(true);
    try {
      await resetForRetake();
      toast.success('Assessment reset! You can now retake the quiz and session.');
    } catch {
      toast.error('Failed to reset assessment.');
    } finally {
      setIsRetaking(false);
    }
  }, [resetForRetake]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-8 animate-fade-in-up">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border-2 border-primary/20">
            <LuminaIcon className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">
            Welcome back{profile?.displayName ? `, ${profile.displayName.split(' ')[0]}` : ''}
          </h1>
        </div>
        <p className="text-muted-foreground ml-[52px]">
          Complete all four stages to unlock your personalized talent report.
        </p>
        <div className="mt-5 flex items-center gap-3">
          <div className="h-4 flex-1 rounded-full bg-overlay-light overflow-hidden">
            <div
              className="h-4 rounded-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${(completedCount / 4) * 100}%` }}
            />
          </div>
          <span className="text-sm font-bold text-muted-foreground font-mono">{completedCount}/4</span>
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
                    ? 'border-primary/30 bg-primary/[0.03]'
                    : isCompleted
                    ? 'border-primary/20'
                    : 'opacity-50'
                }`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <CardHeader className="flex flex-row items-center gap-4 py-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-colors border-2 ${
                      isActive
                        ? 'bg-primary/10 text-primary border-primary/20'
                        : isCompleted
                        ? 'bg-primary/10 text-primary border-primary/20'
                        : 'bg-overlay-subtle text-muted-foreground border-overlay-light'
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
                      <Button variant={isActive ? 'default' : 'outline'} size="sm">
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

      {allCompleted && (
        <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <Card className="border-primary/20">
            <CardHeader className="flex flex-row items-center gap-4 py-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary border-2 border-primary/20">
                <RotateCcw className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg font-sans">Retake Assessment</CardTitle>
                <CardDescription>
                  Reset quiz, session, and report to generate a fresh talent analysis. Your data connections will be preserved.
                </CardDescription>
              </div>
              <LoadingButton
                variant="outline"
                onClick={handleRetake}
                loading={isRetaking}
                loadingText="Resetting..."
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Retake
              </LoadingButton>
            </CardHeader>
          </Card>
        </div>
      )}
    </div>
  );
}
