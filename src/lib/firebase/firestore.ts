import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { db } from './config';
import type { UserProfile, DataInsight, QuizAnswer, SessionInsight, TalentReport, StageStatus, AssessmentStage, QuizScore, QuizDimensionSummary, UserSignal, UserFeedback, QuizModuleProgress, UserConstraints, ComputedProfile, CareerRecommendation } from '@/types';

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function createUserProfile(profile: UserProfile): Promise<void> {
  await setDoc(doc(db, 'users', profile.uid), profile);
}

export async function updateStage(uid: string, stage: AssessmentStage, status: StageStatus): Promise<void> {
  await updateDoc(doc(db, 'users', uid), {
    [`stages.${stage}`]: status,
  });
}

export async function saveDataInsights(uid: string, insights: DataInsight[]): Promise<void> {
  await setDoc(doc(db, 'users', uid, 'assessment', 'dataInsights'), { insights, updatedAt: Date.now() });
}

export async function getDataInsights(uid: string): Promise<DataInsight[]> {
  const snap = await getDoc(doc(db, 'users', uid, 'assessment', 'dataInsights'));
  return snap.exists() ? snap.data().insights : [];
}

export async function saveQuizAnswers(uid: string, answers: QuizAnswer[]): Promise<void> {
  await setDoc(doc(db, 'users', uid, 'assessment', 'quizAnswers'), { answers, updatedAt: Date.now() });
}

export async function getQuizAnswers(uid: string): Promise<QuizAnswer[]> {
  const snap = await getDoc(doc(db, 'users', uid, 'assessment', 'quizAnswers'));
  return snap.exists() ? snap.data().answers : [];
}

export async function saveSessionInsights(uid: string, insights: SessionInsight[]): Promise<void> {
  await setDoc(doc(db, 'users', uid, 'assessment', 'sessionInsights'), { insights, updatedAt: Date.now() });
}

export async function getSessionInsights(uid: string): Promise<SessionInsight[]> {
  const snap = await getDoc(doc(db, 'users', uid, 'assessment', 'sessionInsights'));
  return snap.exists() ? snap.data().insights : [];
}

export async function saveTalentReport(uid: string, report: TalentReport): Promise<void> {
  await setDoc(doc(db, 'users', uid, 'assessment', 'talentReport'), { report, updatedAt: Date.now() });
}

export async function getTalentReport(uid: string): Promise<TalentReport | null> {
  const snap = await getDoc(doc(db, 'users', uid, 'assessment', 'talentReport'));
  return snap.exists() ? snap.data().report : null;
}

export async function saveQuizScores(uid: string, scores: QuizScore[], dimensionSummary: QuizDimensionSummary): Promise<void> {
  await setDoc(doc(db, 'users', uid, 'assessment', 'quizScores'), { scores, dimensionSummary, updatedAt: Date.now() });
}

export async function getQuizScores(uid: string): Promise<{ scores: QuizScore[]; dimensionSummary: QuizDimensionSummary } | null> {
  const snap = await getDoc(doc(db, 'users', uid, 'assessment', 'quizScores'));
  return snap.exists() ? { scores: snap.data().scores, dimensionSummary: snap.data().dimensionSummary } : null;
}

export async function saveUserSignals(uid: string, signals: UserSignal[]): Promise<void> {
  await setDoc(doc(db, 'users', uid, 'assessment', 'signals'), { signals, updatedAt: Date.now() });
}

export async function getUserSignals(uid: string): Promise<UserSignal[]> {
  const snap = await getDoc(doc(db, 'users', uid, 'assessment', 'signals'));
  return snap.exists() ? snap.data().signals : [];
}

export async function saveFeedback(uid: string, feedback: UserFeedback): Promise<void> {
  const ref = doc(db, 'users', uid, 'assessment', 'feedback');
  const snap = await getDoc(ref);
  const existing: UserFeedback[] = snap.exists() ? snap.data().items : [];
  existing.push(feedback);
  await setDoc(ref, { items: existing, updatedAt: Date.now() });
}

export async function getFeedback(uid: string): Promise<UserFeedback[]> {
  const snap = await getDoc(doc(db, 'users', uid, 'assessment', 'feedback'));
  return snap.exists() ? snap.data().items : [];
}

// --- Module Progress ---

export async function saveModuleProgress(uid: string, progress: QuizModuleProgress): Promise<void> {
  const ref = doc(db, 'users', uid, 'assessment', 'moduleProgress');
  const snap = await getDoc(ref);
  const existing: Record<string, QuizModuleProgress> = snap.exists() ? snap.data().modules : {};
  existing[progress.moduleId] = progress;
  await setDoc(ref, { modules: existing, updatedAt: Date.now() });
}

export async function getModuleProgress(uid: string): Promise<Record<string, QuizModuleProgress>> {
  const snap = await getDoc(doc(db, 'users', uid, 'assessment', 'moduleProgress'));
  return snap.exists() ? snap.data().modules : {};
}

export async function saveConstraints(uid: string, constraints: UserConstraints): Promise<void> {
  await setDoc(doc(db, 'users', uid, 'assessment', 'constraints'), { constraints, updatedAt: Date.now() });
}

export async function getConstraints(uid: string): Promise<UserConstraints | null> {
  const snap = await getDoc(doc(db, 'users', uid, 'assessment', 'constraints'));
  return snap.exists() ? snap.data().constraints : null;
}

// --- Computed Profile & Career Recommendations ---

export async function saveComputedProfile(uid: string, profile: ComputedProfile): Promise<void> {
  await setDoc(doc(db, 'users', uid, 'assessment', 'computedProfile'), { profile, updatedAt: Date.now() });
}

export async function getComputedProfile(uid: string): Promise<ComputedProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid, 'assessment', 'computedProfile'));
  return snap.exists() ? snap.data().profile : null;
}

export async function saveCareerRecommendations(uid: string, recommendations: CareerRecommendation[]): Promise<void> {
  await setDoc(doc(db, 'users', uid, 'assessment', 'careerRecommendations'), { recommendations, updatedAt: Date.now() });
}

export async function getCareerRecommendations(uid: string): Promise<CareerRecommendation[]> {
  const snap = await getDoc(doc(db, 'users', uid, 'assessment', 'careerRecommendations'));
  return snap.exists() ? snap.data().recommendations : [];
}

// --- User Profile Updates ---

export async function updateUserProfile(uid: string, updates: Partial<Pick<UserProfile, 'displayName' | 'consentSources' | 'consentVersion'>>): Promise<void> {
  await updateDoc(doc(db, 'users', uid), updates);
}

export async function disconnectNotion(uid: string): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { notionAccessToken: null });
}

export async function deleteAssessmentData(uid: string, sources?: string[]): Promise<void> {
  if (!sources || sources.length === 0) {
    // Delete all assessment data
    const assessmentDocs = ['dataInsights', 'quizAnswers', 'quizScores', 'sessionInsights', 'talentReport', 'signals', 'feedback'];
    for (const docName of assessmentDocs) {
      try {
        await deleteDoc(doc(db, 'users', uid, 'assessment', docName));
      } catch { /* ignore if doesn't exist */ }
    }
    // Delete report history
    const historyRef = collection(db, 'users', uid, 'assessment', 'reportHistory', 'versions');
    const historySnap = await getDocs(historyRef);
    for (const d of historySnap.docs) {
      await deleteDoc(d.ref);
    }
  } else {
    for (const source of sources) {
      try {
        await deleteDoc(doc(db, 'users', uid, 'assessment', source));
      } catch { /* ignore */ }
    }
  }
}

export async function resetStages(uid: string): Promise<void> {
  await updateDoc(doc(db, 'users', uid), {
    'stages.connections': 'active',
    'stages.quiz': 'locked',
    'stages.session': 'locked',
    'stages.report': 'locked',
  });
}

export async function resetForRetake(uid: string): Promise<void> {
  // Delete quiz, session, and report but keep data insights
  const toDelete = ['quizAnswers', 'quizScores', 'sessionInsights', 'talentReport', 'signals'];
  for (const docName of toDelete) {
    try {
      await deleteDoc(doc(db, 'users', uid, 'assessment', docName));
    } catch { /* ignore */ }
  }
  await updateDoc(doc(db, 'users', uid), {
    'stages.quiz': 'active',
    'stages.session': 'locked',
    'stages.report': 'locked',
  });
}

export async function saveReportVersion(uid: string, report: TalentReport, quizScores?: QuizDimensionSummary): Promise<void> {
  const timestamp = Date.now();
  await setDoc(doc(db, 'users', uid, 'assessment', 'reportHistory', 'versions', String(timestamp)), {
    report,
    quizScores,
    timestamp,
  });
}

export async function getReportHistory(uid: string): Promise<{ report: TalentReport; timestamp: number; quizScores?: QuizDimensionSummary }[]> {
  const ref = collection(db, 'users', uid, 'assessment', 'reportHistory', 'versions');
  const snap = await getDocs(ref);
  return snap.docs
    .map((d) => d.data() as { report: TalentReport; timestamp: number; quizScores?: QuizDimensionSummary })
    .sort((a, b) => b.timestamp - a.timestamp);
}
