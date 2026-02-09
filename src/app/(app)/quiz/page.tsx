'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';
import { useAssessmentStore } from '@/stores/assessment-store';
import { saveQuizAnswers, saveQuizScores, getModuleProgress } from '@/lib/firebase/firestore';
import { FetchError } from '@/lib/fetch-client';
import { useQuizMutation, useQuizScoreMutation } from '@/hooks/use-api-mutations';
import { QUIZ_MODULES } from '@/lib/quiz/module-config';
import { ModuleSelector } from '@/components/quiz/module-selector';
import { ModuleQuizFlow } from '@/components/quiz/module-quiz-flow';
import { QuestionCard } from '@/components/quiz/question-card';
import { PageHeader, LoadingButton, ErrorAlert, EmptyState, QuestionSkeleton } from '@/components/shared';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, ArrowRight, Sparkles } from 'lucide-react';
import { recommendNextModule } from '@/lib/agent/orchestrator';
import type { QuizModuleId, QuizQuestion, QuizAnswer, QuizDimensionSummary, AgentState } from '@/types';

const LEGACY_TOTAL_QUESTIONS = 15;
const LEGACY_BATCH_SIZE = 5;

export default function QuizPage() {
  const { user } = useAuthStore();
  const { dataInsights, setQuizAnswers, advanceStage, moduleProgress, setModuleProgress } = useAssessmentStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  const moduleParam = searchParams.get('module') as QuizModuleId | null;
  const [selectedModule, setSelectedModule] = useState<QuizModuleId | null>(moduleParam);
  const useModuleMode = true;

  // Legacy flat quiz state (fallback)
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isScoring, setIsScoring] = useState(false);
  const [dimensionSummary, setDimensionSummary] = useState<QuizDimensionSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [batchIndex, setBatchIndex] = useState(0);

  const quizMutation = useQuizMutation();
  const quizScoreMutation = useQuizScoreMutation();

  // Load module progress on mount
  useEffect(() => {
    if (user) {
      getModuleProgress(user.uid).then((progress) => {
        if (Object.keys(progress).length > 0) {
          setModuleProgress(progress);
        }
      });
    }
  }, [user, setModuleProgress]);

  const dataContext = useMemo(
    () => dataInsights.length > 0
      ? dataInsights.map((d) => `${d.source}: ${d.summary}`).join('\n')
      : '',
    [dataInsights]
  );

  const completedModules = Object.values(moduleProgress).filter((p) => p.status === 'completed').length;
  const allModulesComplete = completedModules >= QUIZ_MODULES.length;

  const handleModuleComplete = useCallback(async () => {
    if (allModulesComplete && user) {
      await advanceStage('quiz');
      router.push('/session');
    } else {
      setSelectedModule(null);
    }
  }, [allModulesComplete, user, advanceStage, router]);

  // --- MODULE MODE ---
  if (useModuleMode) {
    if (selectedModule) {
      return (
        <ModuleQuizFlow
          moduleId={selectedModule}
          onBack={() => setSelectedModule(null)}
          onComplete={handleModuleComplete}
        />
      );
    }

    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12">
        <PageHeader
          icon={Brain}
          title="Talent Quiz"
          description="Complete each module to help Lumina understand your unique abilities."
        />

        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">{completedModules} of {QUIZ_MODULES.length} modules complete</span>
            {allModulesComplete && (
              <LoadingButton onClick={() => { advanceStage('quiz'); router.push('/session'); }} size="sm" icon={ArrowRight}>
                Continue to Session
              </LoadingButton>
            )}
          </div>
          <Progress value={(completedModules / QUIZ_MODULES.length) * 100} />
        </div>

        {/* Agent Module Recommendation */}
        {!allModulesComplete && (() => {
          const completedModuleIds = Object.entries(moduleProgress)
            .filter(([, p]) => p.status === 'completed')
            .map(([id]) => id as QuizModuleId);
          const inProgressModuleIds = Object.entries(moduleProgress)
            .filter(([, p]) => p.status === 'in_progress')
            .map(([id]) => id as QuizModuleId);
          const availableModules = QUIZ_MODULES
            .map((m) => m.id as QuizModuleId)
            .filter((id) => !completedModuleIds.includes(id) && !inProgressModuleIds.includes(id));

          // Build minimal AgentState for recommendation
          const minimalState: AgentState = {
            connectedSources: dataInsights.map((d) => d.source),
            quizCompletedModules: completedModuleIds,
            quizInProgressModules: inProgressModuleIds,
            sessionCompleted: false,
            sessionInsightsCount: 0,
            confidenceProfile: { dimensions: {}, overallConfidence: 0, lastUpdated: Date.now() },
            gaps: [],
            reportGenerated: false,
            overallConfidence: 0,
          };

          const rec = recommendNextModule(minimalState, availableModules);
          if (!rec) return null;

          return (
            <Card className="mb-6 border-primary/30 bg-primary/[0.03]">
              <CardContent className="flex items-start gap-3 py-4">
                <Sparkles className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    Agent recommends: <span className="text-primary">{QUIZ_MODULES.find((m) => m.id === rec.module)?.label ?? rec.module}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{rec.reason}</p>
                </div>
                <LoadingButton
                  size="sm"
                  onClick={() => setSelectedModule(rec.module)}
                  icon={ArrowRight}
                >
                  Start
                </LoadingButton>
              </CardContent>
            </Card>
          );
        })()}

        <ModuleSelector moduleProgress={moduleProgress} onSelectModule={setSelectedModule} />
      </div>
    );
  }

  // --- LEGACY FLAT QUIZ MODE (fallback) ---
  const fetchQuestions = (prevAnswers: QuizAnswer[], batch: number) => {
    setError(null);
    quizMutation.mutate({ dataContext, previousAnswers: prevAnswers, batchIndex: batch }, {
      onSuccess: (result) => {
        if (!result.questions || result.questions.length === 0) {
          setError('No questions returned from AI. Please try again.');
          toast.error('No questions returned from AI. Please try again.');
          return;
        }
        setQuestions((prev) => [...prev, ...result.questions]);
      },
      onError: (err) => {
        const message = err instanceof FetchError ? err.message : 'Failed to load questions';
        setError(message);
        toast.error(message);
      },
    });
  };

  const handleAnswer = async (answer: string | number) => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    const newAnswer: QuizAnswer = { questionId: currentQ.id, answer };
    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    const nextIndex = currentIndex + 1;

    if (nextIndex >= LEGACY_TOTAL_QUESTIONS) {
      setIsScoring(true);
      try {
        if (user) {
          await saveQuizAnswers(user.uid, updatedAnswers);
          setQuizAnswers(updatedAnswers);

          quizScoreMutation.mutate({ answers: updatedAnswers, questions }, {
            onSuccess: async (result) => {
              try {
                await saveQuizScores(user.uid, result.scores, result.dimensionSummary, result.dimensionConfidence);
                setDimensionSummary(result.dimensionSummary);
                await advanceStage('quiz');
                setIsComplete(true);
                toast.success('Quiz complete! Your answers have been scored.');
              } catch {
                toast.error('Failed to save quiz scores.');
              } finally {
                setIsScoring(false);
              }
            },
            onError: () => {
              advanceStage('quiz');
              setIsComplete(true);
              setIsScoring(false);
              toast.success('Quiz complete!');
            },
          });
        }
      } catch {
        toast.error('Failed to save quiz answers. Please try again.');
        setIsScoring(false);
      }
    } else {
      setCurrentIndex(nextIndex);
      if (nextIndex % LEGACY_BATCH_SIZE === 0 && nextIndex >= questions.length) {
        const newBatch = batchIndex + 1;
        setBatchIndex(newBatch);
        fetchQuestions(updatedAnswers, newBatch);
      }
    }
  };

  if (isScoring) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8 sm:py-12">
        <EmptyState
          icon={Brain}
          title="Scoring Your Answers..."
          description="Lumina is analyzing your responses across multiple talent dimensions."
          action={
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          }
        />
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8 sm:py-12">
        <EmptyState
          icon={Brain}
          title="Quiz Complete!"
          description="Great job! Your answers will help Lumina understand your unique strengths. Now let's have a live conversation."
          action={
            <div className="space-y-6 w-full max-w-md">
              {dimensionSummary && (
                <Card className="animate-fade-in">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-sans">Your Dimension Scores</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(dimensionSummary)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 6)
                        .map(([dim, score]) => (
                          <Badge key={dim} variant={score >= 70 ? 'default' : 'secondary'}>
                            {dim.replace(/_/g, ' ')}: {score}
                          </Badge>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              <LoadingButton onClick={() => router.push('/session')} size="lg" icon={ArrowRight} className="w-full">
                Start Live Session
              </LoadingButton>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-12">
      <PageHeader
        icon={Brain}
        title="Talent Quiz"
        description="Answer these questions to help Lumina understand your unique abilities."
      />

      <div className="mb-8 animate-fade-in">
        <Progress value={(currentIndex / LEGACY_TOTAL_QUESTIONS) * 100} />
      </div>

      {error && (
        <ErrorAlert
          message={error}
          onRetry={() => fetchQuestions(answers, batchIndex)}
          className="mb-6"
        />
      )}

      <div className="animate-fade-in">
        {quizMutation.isPending && questions.length <= currentIndex ? (
          <QuestionSkeleton />
        ) : questions[currentIndex] ? (
          <QuestionCard
            question={questions[currentIndex]}
            onAnswer={handleAnswer}
            questionNumber={currentIndex + 1}
            totalQuestions={LEGACY_TOTAL_QUESTIONS}
          />
        ) : null}
      </div>
    </div>
  );
}
