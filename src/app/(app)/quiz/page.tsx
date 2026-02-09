'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';
import { useAssessmentStore } from '@/stores/assessment-store';
import { saveQuizAnswers } from '@/lib/firebase/firestore';
import { FetchError } from '@/lib/fetch-client';
import { useQuizMutation } from '@/hooks/use-api-mutations';
import { QuestionCard } from '@/components/quiz/question-card';
import { PageHeader, LoadingButton, ErrorAlert, EmptyState, QuestionSkeleton } from '@/components/shared';
import { Progress } from '@/components/ui/progress';
import { Brain, ArrowRight } from 'lucide-react';
import type { QuizQuestion, QuizAnswer } from '@/types';

const TOTAL_QUESTIONS = 10;
const BATCH_SIZE = 3;

export default function QuizPage() {
  const { user } = useAuthStore();
  const { dataInsights, setQuizAnswers, advanceStage } = useAssessmentStore();
  const router = useRouter();

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [batchIndex, setBatchIndex] = useState(0);

  const quizMutation = useQuizMutation();

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
      try {
        if (user) {
          await saveQuizAnswers(user.uid, updatedAnswers);
          setQuizAnswers(updatedAnswers);
          await advanceStage('quiz');
        }
        setIsComplete(true);
        toast.success('Quiz complete!');
      } catch {
        toast.error('Failed to save quiz answers. Please try again.');
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
  }, [currentIndex, questions, answers, batchIndex, fetchQuestions, user, setQuizAnswers, advanceStage]);

  if (isComplete) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-10">
        <EmptyState
          icon={Brain}
          title="Quiz Complete!"
          description="Great job! Your answers will help Lumina understand your unique strengths. Now let's have a live conversation."
          action={
            <LoadingButton onClick={() => router.push('/session')} size="lg" icon={ArrowRight} className="glow-amber-sm">
              Start Live Session
            </LoadingButton>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
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
