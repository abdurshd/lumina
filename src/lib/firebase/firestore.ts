import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { db } from './config';
import type { UserProfile, DataInsight, QuizAnswer, SessionInsight, TalentReport, StageStatus, AssessmentStage, QuizScore, QuizDimensionSummary, UserSignal, UserFeedback, QuizModuleProgress, UserConstraints, ComputedProfile, CareerRecommendation, MicroChallenge, Reflection, ProfileSnapshot, IterationState, ActionPlanProgress, CorpusDocument, AnalyticsEvent, AgentDecision } from '@/types';
import {
  canUseSessionStorage,
  clearAssessmentSessionCache,
  getAdapter,
  getCachedRetentionMode,
  resolveRetentionMode,
  setCachedRetentionMode,
  type AssessmentDocKey,
  type RetentionMode,
} from '@/lib/storage/assessment-storage';

const REPORT_HISTORY_SESSION_PREFIX = 'lumina:assessment:reportHistory:';
const LEGACY_ASSESSMENT_DOCS: AssessmentDocKey[] = [
  'dataInsights',
  'quizAnswers',
  'quizScores',
  'sessionInsights',
  'talentReport',
  'signals',
  'feedback',
  'moduleProgress',
  'constraints',
  'computedProfile',
  'careerRecommendations',
  'actionPlanProgress',
];

function reportHistorySessionKey(uid: string): string {
  return `${REPORT_HISTORY_SESSION_PREFIX}${uid}`;
}

function readReportHistorySession(uid: string): { report: TalentReport; timestamp: number; quizScores?: QuizDimensionSummary }[] {
  if (!canUseSessionStorage()) return [];
  const raw = window.sessionStorage.getItem(reportHistorySessionKey(uid));
  if (!raw) return [];
  try {
    return JSON.parse(raw) as { report: TalentReport; timestamp: number; quizScores?: QuizDimensionSummary }[];
  } catch {
    return [];
  }
}

function writeReportHistorySession(uid: string, value: { report: TalentReport; timestamp: number; quizScores?: QuizDimensionSummary }[]): void {
  if (!canUseSessionStorage()) return;
  window.sessionStorage.setItem(reportHistorySessionKey(uid), JSON.stringify(value));
}

function clearReportHistorySession(uid: string): void {
  if (!canUseSessionStorage()) return;
  window.sessionStorage.removeItem(reportHistorySessionKey(uid));
}

async function getRetentionMode(uid: string): Promise<RetentionMode> {
  const cached = getCachedRetentionMode(uid);
  if (cached) return cached;

  const snap = await getDoc(doc(db, 'users', uid));
  const mode = resolveRetentionMode(snap.exists() ? snap.data().dataRetentionMode : undefined);
  setCachedRetentionMode(uid, mode);
  return mode;
}

async function shouldUseSessionStorage(uid: string): Promise<boolean> {
  if (!canUseSessionStorage()) return false;
  return (await getRetentionMode(uid)) === 'session_only';
}

async function getAssessmentDoc<T>(uid: string, key: AssessmentDocKey): Promise<T | null> {
  if (await shouldUseSessionStorage(uid)) {
    const sessionDoc = await getAdapter('session_only').get<T>(uid, key);
    if (sessionDoc !== null) return sessionDoc;

    // Migration fallback: read legacy persisted data if it exists.
    const fallbackDoc = await getAdapter('persistent').get<T>(uid, key);
    if (fallbackDoc !== null) {
      await getAdapter('session_only').set(uid, key, fallbackDoc);
    }
    return fallbackDoc;
  }

  return getAdapter('persistent').get<T>(uid, key);
}

async function setAssessmentDoc<T>(uid: string, key: AssessmentDocKey, value: T): Promise<void> {
  if (await shouldUseSessionStorage(uid)) {
    await getAdapter('session_only').set(uid, key, value);
    return;
  }
  await getAdapter('persistent').set(uid, key, value);
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  const profile = snap.exists() ? (snap.data() as UserProfile) : null;
  if (profile) {
    setCachedRetentionMode(uid, resolveRetentionMode(profile.dataRetentionMode));
  }
  return profile;
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
  await setAssessmentDoc(uid, 'dataInsights', { insights, updatedAt: Date.now() });
}

export async function getDataInsights(uid: string): Promise<DataInsight[]> {
  const data = await getAssessmentDoc<{ insights: DataInsight[] }>(uid, 'dataInsights');
  return data?.insights ?? [];
}

export async function saveQuizAnswers(uid: string, answers: QuizAnswer[]): Promise<void> {
  await setAssessmentDoc(uid, 'quizAnswers', { answers, updatedAt: Date.now() });
}

export async function getQuizAnswers(uid: string): Promise<QuizAnswer[]> {
  const data = await getAssessmentDoc<{ answers: QuizAnswer[] }>(uid, 'quizAnswers');
  return data?.answers ?? [];
}

export async function saveSessionInsights(uid: string, insights: SessionInsight[]): Promise<void> {
  await setAssessmentDoc(uid, 'sessionInsights', { insights, updatedAt: Date.now() });
}

export async function getSessionInsights(uid: string): Promise<SessionInsight[]> {
  const data = await getAssessmentDoc<{ insights: SessionInsight[] }>(uid, 'sessionInsights');
  return data?.insights ?? [];
}

export async function saveTalentReport(uid: string, report: TalentReport): Promise<void> {
  await setAssessmentDoc(uid, 'talentReport', { report, updatedAt: Date.now() });
}

export async function getTalentReport(uid: string): Promise<TalentReport | null> {
  const data = await getAssessmentDoc<{ report: TalentReport }>(uid, 'talentReport');
  return data?.report ?? null;
}

export async function saveQuizScores(
  uid: string,
  scores: QuizScore[],
  dimensionSummary: QuizDimensionSummary,
  dimensionConfidence?: QuizDimensionSummary,
): Promise<void> {
  const existing = await getQuizScores(uid);

  const scoreByQuestion = new Map<string, QuizScore>();
  for (const score of existing?.scores ?? []) {
    scoreByQuestion.set(score.questionId, score);
  }
  for (const score of scores) {
    scoreByQuestion.set(score.questionId, score);
  }

  const mergedScores = Array.from(scoreByQuestion.values());
  const totals: Record<string, { sum: number; count: number }> = {};
  for (const score of mergedScores) {
    for (const dimScore of score.dimensionScores) {
      if (!totals[dimScore.dimension]) {
        totals[dimScore.dimension] = { sum: 0, count: 0 };
      }
      totals[dimScore.dimension].sum += Math.max(0, Math.min(100, dimScore.score));
      totals[dimScore.dimension].count += 1;
    }
  }

  const mergedDimensionSummary: QuizDimensionSummary = { ...dimensionSummary };
  for (const [dimension, total] of Object.entries(totals)) {
    mergedDimensionSummary[dimension] = Math.round(total.sum / total.count);
  }

  const mergedDimensionConfidence: QuizDimensionSummary = {
    ...(existing?.dimensionConfidence ?? {}),
    ...(dimensionConfidence ?? {}),
  };

  await setAssessmentDoc(uid, 'quizScores', {
    scores: mergedScores,
    dimensionSummary: mergedDimensionSummary,
    dimensionConfidence: Object.keys(mergedDimensionConfidence).length > 0 ? mergedDimensionConfidence : undefined,
    updatedAt: Date.now(),
  });
}

export async function getQuizScores(
  uid: string,
): Promise<{ scores: QuizScore[]; dimensionSummary: QuizDimensionSummary; dimensionConfidence?: QuizDimensionSummary } | null> {
  const data = await getAssessmentDoc<{
    scores: QuizScore[];
    dimensionSummary: QuizDimensionSummary;
    dimensionConfidence?: QuizDimensionSummary;
  }>(uid, 'quizScores');
  return data
    ? {
        scores: data.scores,
        dimensionSummary: data.dimensionSummary,
        dimensionConfidence: data.dimensionConfidence,
      }
    : null;
}

export async function saveUserSignals(uid: string, signals: UserSignal[]): Promise<void> {
  await setAssessmentDoc(uid, 'signals', { signals, updatedAt: Date.now() });
}

export async function getUserSignals(uid: string): Promise<UserSignal[]> {
  const data = await getAssessmentDoc<{ signals: UserSignal[] }>(uid, 'signals');
  return data?.signals ?? [];
}

export async function saveFeedback(uid: string, feedback: UserFeedback): Promise<void> {
  const existing = await getFeedback(uid);
  existing.push(feedback);
  await setAssessmentDoc(uid, 'feedback', { items: existing, updatedAt: Date.now() });
}

export async function getFeedback(uid: string): Promise<UserFeedback[]> {
  const data = await getAssessmentDoc<{ items: UserFeedback[] }>(uid, 'feedback');
  return data?.items ?? [];
}

// --- Module Progress ---

export async function saveModuleProgress(uid: string, progress: QuizModuleProgress): Promise<void> {
  const existing = await getModuleProgress(uid);
  existing[progress.moduleId] = progress;
  await setAssessmentDoc(uid, 'moduleProgress', { modules: existing, updatedAt: Date.now() });
}

export async function getModuleProgress(uid: string): Promise<Record<string, QuizModuleProgress>> {
  const data = await getAssessmentDoc<{ modules: Record<string, QuizModuleProgress> }>(uid, 'moduleProgress');
  return data?.modules ?? {};
}

export async function saveConstraints(uid: string, constraints: UserConstraints): Promise<void> {
  await setAssessmentDoc(uid, 'constraints', { constraints, updatedAt: Date.now() });
}

export async function getConstraints(uid: string): Promise<UserConstraints | null> {
  const data = await getAssessmentDoc<{ constraints: UserConstraints }>(uid, 'constraints');
  return data?.constraints ?? null;
}

// --- Computed Profile & Career Recommendations ---

export async function saveComputedProfile(uid: string, profile: ComputedProfile): Promise<void> {
  await setAssessmentDoc(uid, 'computedProfile', { profile, updatedAt: Date.now() });
}

export async function getComputedProfile(uid: string): Promise<ComputedProfile | null> {
  const data = await getAssessmentDoc<{ profile: ComputedProfile }>(uid, 'computedProfile');
  return data?.profile ?? null;
}

export async function saveCareerRecommendations(uid: string, recommendations: CareerRecommendation[]): Promise<void> {
  await setAssessmentDoc(uid, 'careerRecommendations', { recommendations, updatedAt: Date.now() });
}

export async function getCareerRecommendations(uid: string): Promise<CareerRecommendation[]> {
  const data = await getAssessmentDoc<{ recommendations: CareerRecommendation[] }>(uid, 'careerRecommendations');
  return data?.recommendations ?? [];
}

// --- User Profile Updates ---

export async function updateUserProfile(
  uid: string,
  updates: Partial<
    Pick<
      UserProfile,
      | 'displayName'
      | 'consentSources'
      | 'consentVersion'
      | 'consentTimestamp'
      | 'ageGateConfirmed'
      | 'videoBehaviorConsent'
      | 'dataRetentionMode'
      | 'byokEnabled'
      | 'byokKeyLast4'
      | 'byokMonthlyBudgetUsd'
      | 'byokHardStop'
    >
  >
): Promise<void> {
  await updateDoc(doc(db, 'users', uid), updates);
  if (updates.dataRetentionMode) {
    setCachedRetentionMode(uid, resolveRetentionMode(updates.dataRetentionMode));
  }
}

export async function disconnectNotion(uid: string): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { notionAccessToken: null });
}

export async function deleteAssessmentData(uid: string, sources?: string[]): Promise<void> {
  await clearAssessmentSessionCache(uid);
  clearReportHistorySession(uid);

  const mode = await getRetentionMode(uid);
  if (mode === 'session_only') return;

  if (!sources || sources.length === 0) {
    for (const docName of LEGACY_ASSESSMENT_DOCS) {
      try {
        await deleteDoc(doc(db, 'users', uid, 'assessment', docName));
      } catch { /* ignore if doesn't exist */ }
    }
    const historyRef = collection(db, 'users', uid, 'assessment', 'reportHistory', 'versions');
    const historySnap = await getDocs(historyRef);
    for (const d of historySnap.docs) {
      await deleteDoc(d.ref);
    }
    return;
  }

  for (const source of sources) {
    try {
      await deleteDoc(doc(db, 'users', uid, 'assessment', source));
    } catch { /* ignore */ }
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
  if (await shouldUseSessionStorage(uid)) {
    await getAdapter('session_only').clear(uid, ['quizAnswers', 'quizScores', 'sessionInsights', 'talentReport', 'signals']);
    clearReportHistorySession(uid);
  } else {
    const toDelete: AssessmentDocKey[] = ['quizAnswers', 'quizScores', 'sessionInsights', 'talentReport', 'signals'];
    for (const docName of toDelete) {
      try {
        await deleteDoc(doc(db, 'users', uid, 'assessment', docName));
      } catch { /* ignore */ }
    }
  }
  await updateDoc(doc(db, 'users', uid), {
    'stages.quiz': 'active',
    'stages.session': 'locked',
    'stages.report': 'locked',
  });
}

export async function saveReportVersion(uid: string, report: TalentReport, quizScores?: QuizDimensionSummary): Promise<void> {
  const timestamp = Date.now();
  if (await shouldUseSessionStorage(uid)) {
    const versions = readReportHistorySession(uid);
    versions.push({ report, quizScores, timestamp });
    writeReportHistorySession(uid, versions);
    return;
  }
  await setDoc(doc(db, 'users', uid, 'assessment', 'reportHistory', 'versions', String(timestamp)), {
    report,
    quizScores,
    timestamp,
  });
}

export async function getReportHistory(uid: string): Promise<{ report: TalentReport; timestamp: number; quizScores?: QuizDimensionSummary }[]> {
  if (await shouldUseSessionStorage(uid)) {
    const sessionHistory = readReportHistorySession(uid);
    if (sessionHistory.length > 0) {
      return [...sessionHistory].sort((a, b) => b.timestamp - a.timestamp);
    }
    // Migration fallback
  }

  const ref = collection(db, 'users', uid, 'assessment', 'reportHistory', 'versions');
  const snap = await getDocs(ref);
  const history = snap.docs
    .map((d) => d.data() as { report: TalentReport; timestamp: number; quizScores?: QuizDimensionSummary })
    .sort((a, b) => b.timestamp - a.timestamp);

  if (await shouldUseSessionStorage(uid) && history.length > 0) {
    writeReportHistorySession(uid, history);
  }

  return history;
}

// --- Challenges ---

export async function getChallenges(uid: string): Promise<MicroChallenge[]> {
  const ref = collection(db, 'users', uid, 'challenges');
  const snap = await getDocs(ref);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as MicroChallenge));
}

export async function saveChallenge(uid: string, challenge: MicroChallenge): Promise<void> {
  await setDoc(doc(db, 'users', uid, 'challenges', challenge.id), challenge);
}

export async function saveChallenges(uid: string, challenges: MicroChallenge[]): Promise<void> {
  for (const challenge of challenges) {
    await setDoc(doc(db, 'users', uid, 'challenges', challenge.id), challenge);
  }
}

export async function updateChallenge(uid: string, challengeId: string, updates: Partial<MicroChallenge>): Promise<void> {
  await updateDoc(doc(db, 'users', uid, 'challenges', challengeId), updates);
}

// --- Reflections ---

export async function getReflections(uid: string): Promise<Reflection[]> {
  const ref = collection(db, 'users', uid, 'reflections');
  const snap = await getDocs(ref);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Reflection));
}

export async function saveReflection(uid: string, reflection: Reflection): Promise<void> {
  await setDoc(doc(db, 'users', uid, 'reflections', reflection.id), reflection);
}

// --- Profile Snapshots ---

export async function getProfileSnapshots(uid: string): Promise<ProfileSnapshot[]> {
  const ref = collection(db, 'users', uid, 'profileSnapshots');
  const snap = await getDocs(ref);
  return snap.docs
    .map((d) => d.data() as ProfileSnapshot)
    .sort((a, b) => a.timestamp - b.timestamp);
}

export async function saveProfileSnapshot(uid: string, snapshot: ProfileSnapshot): Promise<void> {
  await setDoc(doc(db, 'users', uid, 'profileSnapshots', `v${snapshot.version}_${snapshot.timestamp}`), snapshot);
}

// --- Action Plan Progress ---

export async function getActionPlanProgress(uid: string): Promise<ActionPlanProgress | null> {
  return getAssessmentDoc<ActionPlanProgress>(uid, 'actionPlanProgress');
}

export async function saveActionPlanProgress(uid: string, progress: ActionPlanProgress): Promise<void> {
  await setAssessmentDoc(uid, 'actionPlanProgress', progress);
}

// --- Corpus Documents ---

export async function getCorpusDocuments(uid: string): Promise<CorpusDocument[]> {
  const ref = collection(db, 'users', uid, 'corpusDocuments');
  const snap = await getDocs(ref);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as CorpusDocument));
}

export async function saveCorpusDocument(uid: string, document: CorpusDocument): Promise<void> {
  await setDoc(doc(db, 'users', uid, 'corpusDocuments', document.id), document);
}

export async function deleteCorpusDocument(uid: string, documentId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid, 'corpusDocuments', documentId));
}

// --- Iteration State ---

export async function getIterationState(uid: string): Promise<IterationState | null> {
  const snap = await getDoc(doc(db, 'users', uid, 'assessment', 'iterationState'));
  return snap.exists() ? (snap.data() as IterationState) : null;
}

export async function updateIterationState(uid: string, state: Partial<IterationState>): Promise<void> {
  const ref = doc(db, 'users', uid, 'assessment', 'iterationState');
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await updateDoc(ref, state);
  } else {
    await setDoc(ref, {
      currentChallenges: [],
      completedChallengeCount: 0,
      totalReflections: 0,
      lastProfileUpdate: Date.now(),
      iterationCount: 0,
      ...state,
    });
  }
}

// --- Analytics ---

export async function trackEvent(uid: string, event: AnalyticsEvent): Promise<void> {
  const ref = doc(db, 'users', uid, 'analytics', String(event.timestamp));
  await setDoc(ref, event);
}

// --- Export All User Data ---

export async function getAllUserData(uid: string): Promise<Record<string, unknown>> {
  const userProfile = await getUserProfile(uid);
  const dataInsights = await getDataInsights(uid);
  const quizAnswers = await getQuizAnswers(uid);
  const sessionInsights = await getSessionInsights(uid);
  const talentReport = await getTalentReport(uid);
  const feedback = await getFeedback(uid);
  const challenges = await getChallenges(uid);
  const reflections = await getReflections(uid);
  const snapshots = await getProfileSnapshots(uid);

  return {
    profile: userProfile,
    dataInsights,
    quizAnswers,
    sessionInsights,
    talentReport,
    feedback,
    challenges,
    reflections,
    profileSnapshots: snapshots,
  };
}

// --- Agent Decisions ---

export async function saveAgentDecision(uid: string, decision: AgentDecision): Promise<void> {
  await setDoc(doc(db, 'users', uid, 'agent_decisions', decision.id), decision);
}

export async function getAgentDecisions(uid: string): Promise<AgentDecision[]> {
  const ref = collection(db, 'users', uid, 'agent_decisions');
  const snap = await getDocs(ref);
  return snap.docs
    .map((d) => d.data() as AgentDecision)
    .sort((a, b) => a.timestamp - b.timestamp);
}
