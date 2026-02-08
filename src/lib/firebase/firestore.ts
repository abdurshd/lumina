import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './config';
import type { UserProfile, DataInsight, QuizAnswer, SessionInsight, TalentReport, StageStatus, AssessmentStage } from '@/types';

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
