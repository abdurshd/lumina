import { create } from 'zustand';
import { updateStage, resetForRetake as resetForRetakeFirestore } from '@/lib/firebase/firestore';
import { useAuthStore } from './auth-store';
import type { AssessmentStage, DataInsight, QuizAnswer, SessionInsight, TalentReport, QuizModuleProgress, UserConstraints } from '@/types';

const STAGE_ORDER: AssessmentStage[] = ['connections', 'quiz', 'session', 'report'];

interface AssessmentState {
  dataInsights: DataInsight[];
  quizAnswers: QuizAnswer[];
  sessionInsights: SessionInsight[];
  report: TalentReport | null;
  moduleProgress: Record<string, QuizModuleProgress>;
  constraints: UserConstraints | null;
  setDataInsights: (insights: DataInsight[]) => void;
  setQuizAnswers: (answers: QuizAnswer[]) => void;
  setSessionInsights: (insights: SessionInsight[]) => void;
  setReport: (report: TalentReport) => void;
  setModuleProgress: (progress: Record<string, QuizModuleProgress>) => void;
  updateModuleProgress: (progress: QuizModuleProgress) => void;
  setConstraints: (constraints: UserConstraints) => void;
  advanceStage: (current: AssessmentStage) => Promise<void>;
  resetForRetake: () => Promise<void>;
  reset: () => void;
}

export const useAssessmentStore = create<AssessmentState>((set) => ({
  dataInsights: [],
  quizAnswers: [],
  sessionInsights: [],
  report: null,
  moduleProgress: {},
  constraints: null,

  setDataInsights: (insights) => set({ dataInsights: insights }),
  setQuizAnswers: (answers) => set({ quizAnswers: answers }),
  setSessionInsights: (insights) => set({ sessionInsights: insights }),
  setReport: (report) => set({ report }),
  setModuleProgress: (progress) => set({ moduleProgress: progress }),
  updateModuleProgress: (progress) => set((state) => ({
    moduleProgress: { ...state.moduleProgress, [progress.moduleId]: progress },
  })),
  setConstraints: (constraints) => set({ constraints }),

  advanceStage: async (current) => {
    const { user, refreshProfile } = useAuthStore.getState();
    if (!user) return;
    const idx = STAGE_ORDER.indexOf(current);
    await updateStage(user.uid, current, 'completed');
    if (idx < STAGE_ORDER.length - 1) {
      await updateStage(user.uid, STAGE_ORDER[idx + 1], 'active');
    }
    await refreshProfile();
  },

  resetForRetake: async () => {
    const { user, refreshProfile } = useAuthStore.getState();
    if (!user) return;
    await resetForRetakeFirestore(user.uid);
    set({ quizAnswers: [], sessionInsights: [], report: null, moduleProgress: {}, constraints: null });
    await refreshProfile();
  },

  reset: () => set({
    dataInsights: [],
    quizAnswers: [],
    sessionInsights: [],
    report: null,
    moduleProgress: {},
    constraints: null,
  }),
}));
