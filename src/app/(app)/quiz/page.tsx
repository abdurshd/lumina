'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useAssessment } from '@/contexts/assessment-context';
import { saveQuizAnswers } from '@/lib/firebase/firestore';
import { QuestionCard } from '@/components/quiz/question-card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Brain, Loader2, ArrowRight } from 'lucide-react';
import type { QuizQuestion, QuizAnswer } from '@/types';

const TOTAL_QUESTIONS = 10;
const BATCH_SIZE = 3;

export default function QuizPage() {
  const { user } = useAuth();
  const { dataInsights, setQuizAnswers, advanceStage } = useAssessment();
  const router = useRouter();

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [batchIndex, setBatchIndex] = useState(0);

  const dataContext = dataInsights.length > 0
    ? dataInsights.map((d) => `${d.source}: ${d.summary}`).join('\n')
    : '';

  const fetchQuestions = useCallback(async (prevAnswers: QuizAnswer[], batch: number) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/gemini/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataContext, previousAnswers: prevAnswers, batchIndex: batch }),
      });
      const { questions: newQuestions } = await res.json();
      setQuestions((prev) => [...prev, ...newQuestions]);
    } catch (err) {
      console.error('Failed to fetch questions:', err);
    }
    setIsLoading(false);
  }, [dataContext]);

  useEffect(() => {
    fetchQuestions([], 0);
  }, [fetchQuestions]);

  const handleAnswer = useCallback(async (answer: string | number) => {
    const currentQ = questions[currentIndex];
    const newAnswer: QuizAnswer = { questionId: currentQ.id, answer };
    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    const nextIndex = currentIndex + 1;

    // Check if we need to adapt (every BATCH_SIZE questions)
    if (nextIndex < TOTAL_QUESTIONS && nextIndex % BATCH_SIZE === 0 && nextIndex >= questions.length) {
      const newBatch = batchIndex + 1;
      setBatchIndex(newBatch);
      await fetchQuestions(updatedAnswers, newBatch);
    }

    if (nextIndex >= TOTAL_QUESTIONS) {
      // Quiz complete
      if (user) {
        await saveQuizAnswers(user.uid, updatedAnswers);
        setQuizAnswers(updatedAnswers);
        await advanceStage('quiz');
      }
      setIsComplete(true);
    } else {
      setCurrentIndex(nextIndex);
    }
  }, [currentIndex, questions, answers, batchIndex, fetchQuestions, user, setQuizAnswers, advanceStage]);

  if (isComplete) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <Brain className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Quiz Complete!</h1>
        <p className="text-muted-foreground mb-8">
          Great job! Your answers will help Lumina understand your unique strengths.
          Now let&apos;s have a live conversation.
        </p>
        <Button onClick={() => router.push('/session')} size="lg">
          Start Live Session <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Brain className="h-6 w-6 text-primary" />
          Talent Quiz
        </h1>
        <p className="text-muted-foreground">
          Answer these questions to help Lumina understand your unique abilities.
        </p>
        <Progress value={(currentIndex / TOTAL_QUESTIONS) * 100} className="mt-4" />
      </div>

      {isLoading && questions.length <= currentIndex ? (
        <div className="flex flex-col items-center gap-4 py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Generating personalized questions...</p>
        </div>
      ) : questions[currentIndex] ? (
        <QuestionCard
          question={questions[currentIndex]}
          onAnswer={handleAnswer}
          questionNumber={currentIndex + 1}
          totalQuestions={TOTAL_QUESTIONS}
        />
      ) : null}
    </div>
  );
}
