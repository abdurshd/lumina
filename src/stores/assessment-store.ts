import { create } from 'zustand';
import { updateStage } from '@/lib/firebase/firestore';
import type { AssessmentStage, DataInsight, QuizAnswer, SessionInsight, TalentReport } from '@/types';

const STAGE_ORDER: AssessmentStage[] = ['connections', 'quiz', 'session', 'report'];

interface AssessmentState {
  dataInsights: DataInsight[];
  quizAnswers: QuizAnswer[];
  sessionInsights: SessionInsight[];
  report: TalentReport | null;
  setDataInsights: (insights: DataInsight[]) => void;
  setQuizAnswers: (answers: QuizAnswer[]) => void;
  setSessionInsights: (insights: SessionInsight[]) => void;
  setReport: (report: TalentReport) => void;
  advanceStage: (current: AssessmentStage) => Promise<void>;
  reset: () => void;
}

export const useAssessmentStore = create<AssessmentState>((set) => ({
  dataInsights: [],
  quizAnswers: [],
  sessionInsights: [],
  report: null,

  setDataInsights: (insights) => set({ dataInsights: insights }),
  setQuizAnswers: (answers) => set({ quizAnswers: answers }),
  setSessionInsights: (insights) => set({ sessionInsights: insights }),
  setReport: (report) => set({ report }),

  advanceStage: async (current) => {
    const { useAuthStore } = await import('./auth-store');
    const { user, refreshProfile } = useAuthStore.getState();
    if (!user) return;
    const idx = STAGE_ORDER.indexOf(current);
    await updateStage(user.uid, current, 'completed');
    if (idx < STAGE_ORDER.length - 1) {
      await updateStage(user.uid, STAGE_ORDER[idx + 1], 'active');
    }
    await refreshProfile();
  },

  reset: () => set({
    dataInsights: [],
    quizAnswers: [],
    sessionInsights: [],
    report: null,
  }),
}));
