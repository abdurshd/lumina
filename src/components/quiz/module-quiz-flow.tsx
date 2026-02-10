'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
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
import { smoothTransition, fadeInUp } from '@/lib/motion';
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
  const prefersReducedMotion = useReducedMotion();

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isScoring, setIsScoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const quizMutation = useQuizMutation();
  const quizScoreMutation = useQuizScoreMutation();
  const requestQuizQuestions = quizMutation.mutate;
  const scoreQuizAnswers = quizScoreMutation.mutate;

  const dataContext = useMemo(
    () => dataInsights.length > 0
      ? dataInsights.map((d) => `${d.source}: ${d.summary}`).join('\n')
      : '',
    [dataInsights]
  );

  const applyQuestions = useCallback((rawQuestions: unknown) => {
    const normalized = normalizeClientQuestions(rawQuestions, moduleConfig.questionCount, moduleId, moduleConfig.dimensions);

    if (normalized.length === 0) {
      setError('Unable to load quiz questions. Please retry.');
      return;
    }

    setError(null);
    setQuestions(normalized);
    setCurrentIndex(0);
    setAnswers([]);
    updateModuleProgress({
      moduleId,
      status: 'in_progress',
      answeredCount: 0,
      totalCount: normalized.length,
    });
  }, [moduleConfig.questionCount, moduleConfig.dimensions, moduleId, updateModuleProgress]);

  // Fetch questions for this module
  useEffect(() => {
    setError(null);
    requestQuizQuestions({ dataContext, previousAnswers: [], batchIndex: 0, moduleId } as Parameters<typeof requestQuizQuestions>[0], {
      onSuccess: (result) => {
        applyQuestions(result.questions);
      },
      onError: (err) => {
        const message = err instanceof FetchError ? err.message : 'Failed to load questions';
        setError(message);
      },
    });
  }, [moduleId, dataContext, requestQuizQuestions, applyQuestions]);

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
        scoreQuizAnswers({ answers: updatedAnswers, questions }, {
          onSuccess: async (result) => {
            try {
              await saveQuizScores(user.uid, result.scores, result.dimensionSummary, result.dimensionConfidence);
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
  }, [currentIndex, questions, answers, moduleId, moduleConfig.label, user, allAnswers, setQuizAnswers, updateModuleProgress, setConstraints, scoreQuizAnswers]);

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
        <Progress value={questions.length > 0 ? (currentIndex / questions.length) * 100 : 0} />
        <p className="mt-1 text-xs text-muted-foreground text-right">
          {questions.length > 0 ? `${currentIndex + 1} of ${questions.length}` : 'Loading questions...'}
        </p>
      </div>

      {error && (
        <ErrorAlert
          message={error}
          onRetry={() => {
            setError(null);
            requestQuizQuestions({ dataContext, previousAnswers: [], batchIndex: 0, moduleId } as Parameters<typeof requestQuizQuestions>[0], {
              onSuccess: (result) => {
                applyQuestions(result.questions);
              },
              onError: (err) => setError(err instanceof FetchError ? err.message : 'Failed to load questions'),
            });
          }}
          className="mb-6"
        />
      )}

      <AnimatePresence mode="wait">
        {quizMutation.isPending && questions.length === 0 ? (
          <motion.div
            key="skeleton"
            variants={prefersReducedMotion ? undefined : fadeInUp}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <QuestionSkeleton />
          </motion.div>
        ) : questions[currentIndex] ? (
          <motion.div
            key={currentIndex}
            variants={prefersReducedMotion ? undefined : fadeInUp}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={smoothTransition}
          >
            <QuestionCard
              question={questions[currentIndex]}
              onAnswer={handleAnswer}
              questionNumber={currentIndex + 1}
              totalQuestions={questions.length}
            />
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            variants={prefersReducedMotion ? undefined : fadeInUp}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <EmptyState
              icon={Brain}
              title="No Questions Loaded"
              description="We couldn’t load quiz questions for this module. Retry to continue."
              action={(
                <LoadingButton
                  onClick={() => {
                    setError(null);
                    requestQuizQuestions(
                      { dataContext, previousAnswers: [], batchIndex: 0, moduleId } as Parameters<typeof requestQuizQuestions>[0],
                      {
                        onSuccess: (result) => {
                          applyQuestions(result.questions);
                        },
                        onError: (err) => setError(err instanceof FetchError ? err.message : 'Failed to load questions'),
                      },
                    );
                  }}
                >
                  Retry
                </LoadingButton>
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const FALLBACK_OPTIONS = [
  'Strongly resonates with me',
  'Often true for me',
  'Sometimes true for me',
  'Rarely true for me',
] as const;

function normalizeClientQuestions(
  rawQuestions: unknown,
  questionCount: number,
  moduleId: QuizModuleId,
  dimensions: string[],
): QuizQuestion[] {
  const list = Array.isArray(rawQuestions) ? rawQuestions : [];
  const normalized: QuizQuestion[] = [];

  for (let i = 0; i < list.length && normalized.length < questionCount; i++) {
    const raw = list[i];
    if (!raw || typeof raw !== 'object') continue;

    const candidate = raw as Record<string, unknown>;
    const fallbackDimension = dimensions[normalized.length % Math.max(dimensions.length, 1)] ?? 'General';
    const type = normalizeQuestionType(candidate.type);

    const question: QuizQuestion = {
      id:
        typeof candidate.id === 'string' && candidate.id.trim().length > 0
          ? candidate.id.trim()
          : `${moduleId}_q_${normalized.length + 1}`,
      type,
      question:
        typeof candidate.question === 'string' && candidate.question.trim().length > 0
          ? candidate.question.trim()
          : `How strongly do you relate to this ${fallbackDimension.toLowerCase()} statement?`,
      category:
        typeof candidate.category === 'string' && candidate.category.trim().length > 0
          ? candidate.category.trim()
          : fallbackDimension,
      dimension:
        typeof candidate.dimension === 'string' && candidate.dimension.trim().length > 0
          ? candidate.dimension.trim()
          : fallbackDimension,
      moduleId,
    };

    if (type === 'multiple_choice') {
      const options = Array.isArray(candidate.options)
        ? candidate.options
            .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
            .slice(0, 4)
        : [];

      question.options = options.length >= 2 ? options : [...FALLBACK_OPTIONS];
    }

    if (type === 'slider') {
      const sliderMin = typeof candidate.sliderMin === 'number' ? candidate.sliderMin : 0;
      const sliderMax = typeof candidate.sliderMax === 'number' ? candidate.sliderMax : 100;
      const labels =
        candidate.sliderLabels && typeof candidate.sliderLabels === 'object'
          ? (candidate.sliderLabels as Record<string, unknown>)
          : null;

      question.sliderMin = sliderMin;
      question.sliderMax = sliderMax > sliderMin ? sliderMax : sliderMin + 100;
      question.sliderLabels = {
        min: typeof labels?.min === 'string' && labels.min.trim().length > 0 ? labels.min.trim() : 'Low',
        max: typeof labels?.max === 'string' && labels.max.trim().length > 0 ? labels.max.trim() : 'High',
      };
    }

    normalized.push(question);
  }

  while (normalized.length < questionCount) {
    const fallbackDimension = dimensions[normalized.length % Math.max(dimensions.length, 1)] ?? 'General';
    normalized.push({
      id: `${moduleId}_fallback_${normalized.length + 1}`,
      type: 'multiple_choice',
      question: `How much does this reflect your ${fallbackDimension.toLowerCase()} preference?`,
      options: [...FALLBACK_OPTIONS],
      category: fallbackDimension,
      dimension: fallbackDimension,
      moduleId,
    });
  }

  return normalized;
}

function normalizeQuestionType(value: unknown): QuizQuestion['type'] {
  if (value === 'multiple_choice' || value === 'slider' || value === 'freetext') {
    return value;
  }
  return 'multiple_choice';
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
