'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';
import { useAssessmentStore } from '@/stores/assessment-store';
import { saveQuizAnswers, saveQuizScores, saveModuleProgress, saveConstraints } from '@/lib/firebase/firestore';
import { FetchError } from '@/lib/fetch-client';
import { useQuizMutation, useQuizScoreMutation } from '@/hooks/use-api-mutations';
import { getModuleConfig } from '@/lib/quiz/module-config';
import { QuestionCard } from '@/components/quiz/question-card';
import { LoadingButton, ErrorAlert, QuestionSkeleton, EmptyState } from '@/components/shared';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Brain, CheckCircle } from 'lucide-react';
import type { QuizModuleId, QuizQuestion, QuizAnswer, UserConstraints } from '@/types';

interface ModuleQuizFlowProps {
  moduleId: QuizModuleId;
  onBack: () => void;
  onComplete: () => void;
}

export function ModuleQuizFlow({ moduleId, onBack, onComplete }: ModuleQuizFlowProps) {
  const { user } = useAuthStore();
  const { dataInsights, quizAnswers: allAnswers, setQuizAnswers, updateModuleProgress, setConstraints } = useAssessmentStore();
  const moduleConfig = getModuleConfig(moduleId);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isScoring, setIsScoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const quizMutation = useQuizMutation();
  const quizScoreMutation = useQuizScoreMutation();

  const dataContext = useMemo(
    () => dataInsights.length > 0
      ? dataInsights.map((d) => `${d.source}: ${d.summary}`).join('\n')
      : '',
    [dataInsights]
  );

  // Fetch questions for this module
  useEffect(() => {
    setError(null);
    quizMutation.mutate({ dataContext, previousAnswers: [], batchIndex: 0, moduleId } as Parameters<typeof quizMutation.mutate>[0], {
      onSuccess: (result) => {
        if (!result.questions || result.questions.length === 0) {
          setError('No questions returned. Please try again.');
          return;
        }
        setQuestions(result.questions);
        updateModuleProgress({
          moduleId,
          status: 'in_progress',
          answeredCount: 0,
          totalCount: result.questions.length,
        });
      },
      onError: (err) => {
        const message = err instanceof FetchError ? err.message : 'Failed to load questions';
        setError(message);
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleId]);

  const handleAnswer = useCallback(async (answer: string | number) => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    const newAnswer: QuizAnswer = { questionId: currentQ.id, answer };
    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    const nextIndex = currentIndex + 1;

    updateModuleProgress({
      moduleId,
      status: nextIndex >= questions.length ? 'completed' : 'in_progress',
      answeredCount: updatedAnswers.length,
      totalCount: questions.length,
    });

    if (nextIndex >= questions.length) {
      // Module complete — score and save
      setIsScoring(true);

      if (!user) return;

      try {
        // Save module-specific answers merged with all answers
        const mergedAnswers = [...allAnswers.filter((a) => !updatedAnswers.some((u) => u.questionId === a.questionId)), ...updatedAnswers];
        await saveQuizAnswers(user.uid, mergedAnswers);
        setQuizAnswers(mergedAnswers);

        await saveModuleProgress(user.uid, {
          moduleId,
          status: 'completed',
          answeredCount: updatedAnswers.length,
          totalCount: questions.length,
        });

        // Extract constraints from answers if this is the constraints module
        if (moduleId === 'constraints') {
          const constraintsData = extractConstraints(updatedAnswers, questions);
          await saveConstraints(user.uid, constraintsData);
          setConstraints(constraintsData);
        }

        // Score the module
        quizScoreMutation.mutate({ answers: updatedAnswers, questions }, {
          onSuccess: async (result) => {
            try {
              await saveQuizScores(user.uid, result.scores, result.dimensionSummary);
              setIsComplete(true);
              toast.success(`${moduleConfig.label} module complete!`);
            } catch {
              toast.error('Failed to save scores.');
            } finally {
              setIsScoring(false);
            }
          },
          onError: () => {
            setIsComplete(true);
            setIsScoring(false);
            toast.success(`${moduleConfig.label} module complete!`);
          },
        });
      } catch {
        toast.error('Failed to save answers.');
        setIsScoring(false);
      }
    } else {
      setCurrentIndex(nextIndex);
    }
  }, [currentIndex, questions, answers, moduleId, moduleConfig.label, user, allAnswers, setQuizAnswers, updateModuleProgress, setConstraints, quizScoreMutation]);

  if (isScoring) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12">
        <EmptyState
          icon={Brain}
          title="Scoring Your Answers..."
          description={`Analyzing your ${moduleConfig.label.toLowerCase()} responses.`}
          action={
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          }
        />
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12">
        <EmptyState
          icon={CheckCircle}
          title={`${moduleConfig.label} Complete!`}
          description="Your answers have been saved and scored."
          action={
            <div className="flex gap-3">
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Modules
              </Button>
              <LoadingButton onClick={onComplete}>
                Continue
              </LoadingButton>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-xl font-bold">{moduleConfig.label}</h2>
          <p className="text-sm text-muted-foreground">{moduleConfig.description}</p>
        </div>
      </div>

      <div className="mb-8">
        <Progress value={(currentIndex / questions.length) * 100} />
        <p className="mt-1 text-xs text-muted-foreground text-right">
          {currentIndex + 1} of {questions.length}
        </p>
      </div>

      {error && (
        <ErrorAlert
          message={error}
          onRetry={() => {
            setError(null);
            quizMutation.mutate({ dataContext, previousAnswers: [], batchIndex: 0, moduleId } as Parameters<typeof quizMutation.mutate>[0], {
              onSuccess: (result) => setQuestions(result.questions),
              onError: (err) => setError(err instanceof FetchError ? err.message : 'Failed to load questions'),
            });
          }}
          className="mb-6"
        />
      )}

      <div className="animate-fade-in">
        {quizMutation.isPending && questions.length === 0 ? (
          <QuestionSkeleton />
        ) : questions[currentIndex] ? (
          <QuestionCard
            question={questions[currentIndex]}
            onAnswer={handleAnswer}
            questionNumber={currentIndex + 1}
            totalQuestions={questions.length}
          />
        ) : null}
      </div>
    </div>
  );
}

function extractConstraints(answers: QuizAnswer[], questions: QuizQuestion[]): UserConstraints {
  const defaults: UserConstraints = {
    locationFlexibility: 'no_preference',
    salaryPriority: 'important',
    timeAvailability: 'full_time',
    educationWillingness: 'short_courses',
    relocationWillingness: 'maybe',
  };

  for (const answer of answers) {
    const q = questions.find((q) => q.id === answer.questionId);
    if (!q) continue;
    const val = String(answer.answer).toLowerCase();

    if (q.dimension === 'Location') {
      if (val.includes('anywhere') || val.includes('remote')) defaults.locationFlexibility = 'anywhere';
      else if (val.includes('prefer remote')) defaults.locationFlexibility = 'prefer_remote';
      else if (val.includes('specific')) defaults.locationFlexibility = 'specific_location';
    } else if (q.dimension === 'Salary') {
      if (val.includes('critical') || val.includes('top priority')) defaults.salaryPriority = 'critical';
      else if (val.includes('flexible') || val.includes('not important')) defaults.salaryPriority = 'flexible';
    } else if (q.dimension === 'Time') {
      if (val.includes('part')) defaults.timeAvailability = 'part_time';
      else if (val.includes('flex')) defaults.timeAvailability = 'flexible';
      else if (val.includes('transition')) defaults.timeAvailability = 'transitioning';
    } else if (q.dimension === 'Education') {
      if (val.includes('none') || val.includes('no')) defaults.educationWillingness = 'none';
      else if (val.includes('degree')) defaults.educationWillingness = 'degree';
      else if (val.includes('certificate')) defaults.educationWillingness = 'certificate';
    }
  }

  return defaults;
}
