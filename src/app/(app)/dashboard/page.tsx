'use client';

import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plug, Brain, Video, FileText, ChevronRight, Lock, CheckCircle2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import type { AssessmentStage, StageStatus } from '@/types';

const stages: { key: AssessmentStage; label: string; description: string; icon: typeof Plug; href: string }[] = [
  { key: 'connections', label: 'Data Connections', description: 'Connect your digital footprint sources', icon: Plug, href: '/connections' },
  { key: 'quiz', label: 'Talent Quiz', description: 'AI-adaptive assessment of your skills and interests', icon: Brain, href: '/quiz' },
  { key: 'session', label: 'Live Session', description: 'Video conversation with your AI career counselor', icon: Video, href: '/session' },
  { key: 'report', label: 'Talent Report', description: 'Your comprehensive talent discovery report', icon: FileText, href: '/report' },
];

function StatusBadge({ status }: { status: StageStatus }) {
  if (status === 'completed') return <Badge variant="default" className="bg-green-600"><CheckCircle2 className="mr-1 h-3 w-3" />Done</Badge>;
  if (status === 'active') return <Badge variant="default">Active</Badge>;
  return <Badge variant="secondary"><Lock className="mr-1 h-3 w-3" />Locked</Badge>;
}

export default function DashboardPage() {
  const { profile } = useAuth();

  const completedCount = profile
    ? Object.values(profile.stages).filter((s) => s === 'completed').length
    : 0;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Welcome back, {profile?.displayName?.split(' ')[0]}</h1>
        </div>
        <p className="text-muted-foreground">
          Complete all four stages to unlock your personalized talent report.
        </p>
        <div className="mt-4 flex items-center gap-2">
          <div className="h-2 flex-1 rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-primary transition-all"
              style={{ width: `${(completedCount / 4) * 100}%` }}
            />
          </div>
          <span className="text-sm text-muted-foreground">{completedCount}/4</span>
        </div>
      </div>

      <div className="space-y-4">
        {stages.map((stage, i) => {
          const status = profile?.stages[stage.key] ?? 'locked';
          const isActive = status === 'active';
          const isCompleted = status === 'completed';

          return (
            <Card
              key={stage.key}
              className={isActive ? 'border-primary/50 shadow-md' : isCompleted ? 'border-green-500/30' : 'opacity-60'}
            >
              <CardHeader className="flex flex-row items-center gap-4 py-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${isActive ? 'bg-primary/10 text-primary' : isCompleted ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                  <stage.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">
                      <span className="mr-2 text-muted-foreground">0{i + 1}</span>
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
        })}
      </div>
    </div>
  );
}
