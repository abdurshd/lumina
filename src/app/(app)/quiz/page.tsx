'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';
import { useAssessmentStore } from '@/stores/assessment-store';
import { saveQuizAnswers, saveQuizScores } from '@/lib/firebase/firestore';
import { FetchError } from '@/lib/fetch-client';
import { useQuizMutation, useQuizScoreMutation } from '@/hooks/use-api-mutations';
import { QuestionCard } from '@/components/quiz/question-card';
import { PageHeader, LoadingButton, ErrorAlert, EmptyState, QuestionSkeleton } from '@/components/shared';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, ArrowRight } from 'lucide-react';
import type { QuizQuestion, QuizAnswer, QuizDimensionSummary } from '@/types';

const TOTAL_QUESTIONS = 15;
const BATCH_SIZE = 5;

export default function QuizPage() {
  const { user } = useAuthStore();
  const { dataInsights, setQuizAnswers, advanceStage } = useAssessmentStore();
  const router = useRouter();

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

  const dataContext = useMemo(
    () => dataInsights.length > 0
      ? dataInsights.map((d) => `${d.source}: ${d.summary}`).join('\n')
      : '',
    [dataInsights]
  );

  const fetchQuestions = useCallback((prevAnswers: QuizAnswer[], batch: number) => {
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
  }, [dataContext, quizMutation]);

  useEffect(() => {
    fetchQuestions([], 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAnswer = useCallback(async (answer: string | number) => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    const newAnswer: QuizAnswer = { questionId: currentQ.id, answer };
    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    const nextIndex = currentIndex + 1;

    // Check if quiz is complete
    if (nextIndex >= TOTAL_QUESTIONS) {
      setIsScoring(true);
      try {
        if (user) {
          await saveQuizAnswers(user.uid, updatedAnswers);
          setQuizAnswers(updatedAnswers);

          // Score the quiz
          quizScoreMutation.mutate({ answers: updatedAnswers, questions }, {
            onSuccess: async (result) => {
              try {
                await saveQuizScores(user.uid, result.scores, result.dimensionSummary);
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
              // Still mark complete even if scoring fails
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
        return;
      }
    } else {
      setCurrentIndex(nextIndex);

      // Fetch next batch if needed
      if (nextIndex % BATCH_SIZE === 0 && nextIndex >= questions.length) {
        const newBatch = batchIndex + 1;
        setBatchIndex(newBatch);
        fetchQuestions(updatedAnswers, newBatch);
      }
    }
  }, [currentIndex, questions, answers, batchIndex, fetchQuestions, user, setQuizAnswers, advanceStage, quizScoreMutation]);

  if (isScoring) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12">
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
      <div className="mx-auto max-w-2xl px-6 py-12">
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
    <div className="mx-auto max-w-3xl px-6 py-12">
      <PageHeader
        icon={Brain}
        title="Talent Quiz"
        description="Answer these questions to help Lumina understand your unique abilities."
      />

      <div className="mb-8 animate-fade-in">
        <Progress value={(currentIndex / TOTAL_QUESTIONS) * 100} />
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
            totalQuestions={TOTAL_QUESTIONS}
          />
        ) : null}
      </div>
    </div>
  );
}
