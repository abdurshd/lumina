'use client';

import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Compass, Heart, Zap, BookOpen, Settings } from 'lucide-react';
import { QUIZ_MODULES, type QuizModuleConfig } from '@/lib/quiz/module-config';
import type { QuizModuleProgress, QuizModuleId } from '@/types';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Compass,
  Heart,
  Zap,
  BookOpen,
  Settings,
};

interface ModuleSelectorProps {
  moduleProgress: Record<string, QuizModuleProgress>;
  onSelectModule: (moduleId: QuizModuleId) => void;
}

export const ModuleSelector = memo(function ModuleSelector({ moduleProgress, onSelectModule }: ModuleSelectorProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {QUIZ_MODULES.map((module) => (
        <ModuleCard
          key={module.id}
          module={module}
          progress={moduleProgress[module.id]}
          onSelect={() => onSelectModule(module.id)}
        />
      ))}
    </div>
  );
});

interface ModuleCardProps {
  module: QuizModuleConfig;
  progress?: QuizModuleProgress;
  onSelect: () => void;
}

function ModuleCard({ module, progress, onSelect }: ModuleCardProps) {
  const Icon = ICON_MAP[module.icon] ?? Compass;
  const isCompleted = progress?.status === 'completed';
  const isInProgress = progress?.status === 'in_progress';
  const progressPercent = progress ? (progress.answeredCount / progress.totalCount) * 100 : 0;

  return (
    <Card
      className={`cursor-pointer transition-all hover:border-primary/40 ${isCompleted ? 'border-primary/30 bg-primary/[0.02]' : ''}`}
      onClick={onSelect}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isCompleted ? 'bg-primary/15' : 'bg-overlay-subtle'}`}>
              <Icon className={`h-4 w-4 ${isCompleted ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
            <CardTitle className="text-sm font-sans">{module.label}</CardTitle>
          </div>
          {isCompleted && <Badge variant="default" className="text-[10px]">Done</Badge>}
          {isInProgress && <Badge variant="secondary" className="text-[10px]">In Progress</Badge>}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-3">{module.description}</p>
        <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
          <span>{module.questionCount} questions</span>
          {progress && <span>{progress.answeredCount}/{progress.totalCount}</span>}
        </div>
        <Progress value={progressPercent} className="h-1.5" />
      </CardContent>
    </Card>
  );
}
