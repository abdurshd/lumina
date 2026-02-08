'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { updateStage } from '@/lib/firebase/firestore';
import { useAuth } from './auth-context';
import type { AssessmentStage, StageStatus, DataInsight, QuizAnswer, SessionInsight, TalentReport } from '@/types';

interface AssessmentContextValue {
  dataInsights: DataInsight[];
  quizAnswers: QuizAnswer[];
  sessionInsights: SessionInsight[];
  report: TalentReport | null;
  setDataInsights: (insights: DataInsight[]) => void;
  setQuizAnswers: (answers: QuizAnswer[]) => void;
  setSessionInsights: (insights: SessionInsight[]) => void;
  setReport: (report: TalentReport) => void;
  advanceStage: (current: AssessmentStage) => Promise<void>;
}

const AssessmentContext = createContext<AssessmentContextValue | null>(null);

const STAGE_ORDER: AssessmentStage[] = ['connections', 'quiz', 'session', 'report'];

export function AssessmentProvider({ children }: { children: ReactNode }) {
  const { user, refreshProfile } = useAuth();
  const [dataInsights, setDataInsights] = useState<DataInsight[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswer[]>([]);
  const [sessionInsights, setSessionInsights] = useState<SessionInsight[]>([]);
  const [report, setReport] = useState<TalentReport | null>(null);

  const advanceStage = async (current: AssessmentStage) => {
    if (!user) return;
    const idx = STAGE_ORDER.indexOf(current);
    await updateStage(user.uid, current, 'completed');
    if (idx < STAGE_ORDER.length - 1) {
      await updateStage(user.uid, STAGE_ORDER[idx + 1], 'active');
    }
    await refreshProfile();
  };

  return (
    <AssessmentContext.Provider
      value={{
        dataInsights, quizAnswers, sessionInsights, report,
        setDataInsights, setQuizAnswers, setSessionInsights, setReport,
        advanceStage,
      }}
    >
      {children}
    </AssessmentContext.Provider>
  );
}

export function useAssessment() {
  const ctx = useContext(AssessmentContext);
  if (!ctx) throw new Error('useAssessment must be used within AssessmentProvider');
  return ctx;
}
