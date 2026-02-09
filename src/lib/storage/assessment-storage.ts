import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export type RetentionMode = 'session_only' | 'persistent';

export type AssessmentDocKey =
  | 'dataInsights'
  | 'quizAnswers'
  | 'quizScores'
  | 'sessionInsights'
  | 'talentReport'
  | 'signals'
  | 'feedback'
  | 'moduleProgress'
  | 'constraints'
  | 'computedProfile'
  | 'careerRecommendations'
  | 'actionPlanProgress';

export interface AssessmentStorageAdapter {
  get<T>(uid: string, key: AssessmentDocKey): Promise<T | null>;
  set<T>(uid: string, key: AssessmentDocKey, value: T): Promise<void>;
  remove(uid: string, key: AssessmentDocKey): Promise<void>;
  clear(uid: string, keys: AssessmentDocKey[]): Promise<void>;
}

const RETENTION_KEY_PREFIX = 'lumina:retention_mode:';
const ASSESSMENT_KEY_PREFIX = 'lumina:assessment:';

function hasSessionStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
}

function assessmentKey(uid: string, key: AssessmentDocKey): string {
  return `${ASSESSMENT_KEY_PREFIX}${uid}:${key}`;
}

function retentionKey(uid: string): string {
  return `${RETENTION_KEY_PREFIX}${uid}`;
}

export class SessionStorageAssessmentAdapter implements AssessmentStorageAdapter {
  async get<T>(uid: string, key: AssessmentDocKey): Promise<T | null> {
    if (!hasSessionStorage()) return null;
    const raw = window.sessionStorage.getItem(assessmentKey(uid, key));
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async set<T>(uid: string, key: AssessmentDocKey, value: T): Promise<void> {
    if (!hasSessionStorage()) return;
    window.sessionStorage.setItem(assessmentKey(uid, key), JSON.stringify(value));
  }

  async remove(uid: string, key: AssessmentDocKey): Promise<void> {
    if (!hasSessionStorage()) return;
    window.sessionStorage.removeItem(assessmentKey(uid, key));
  }

  async clear(uid: string, keys: AssessmentDocKey[]): Promise<void> {
    if (!hasSessionStorage()) return;
    for (const key of keys) {
      window.sessionStorage.removeItem(assessmentKey(uid, key));
    }
  }
}

export class FirestoreAssessmentAdapter implements AssessmentStorageAdapter {
  async get<T>(uid: string, key: AssessmentDocKey): Promise<T | null> {
    const snap = await getDoc(doc(db, 'users', uid, 'assessment', key));
    return snap.exists() ? (snap.data() as T) : null;
  }

  async set<T>(uid: string, key: AssessmentDocKey, value: T): Promise<void> {
    await setDoc(doc(db, 'users', uid, 'assessment', key), value as object);
  }

  async remove(uid: string, key: AssessmentDocKey): Promise<void> {
    await deleteDoc(doc(db, 'users', uid, 'assessment', key));
  }

  async clear(uid: string, keys: AssessmentDocKey[]): Promise<void> {
    for (const key of keys) {
      await deleteDoc(doc(db, 'users', uid, 'assessment', key));
    }
  }
}

const sessionAdapter = new SessionStorageAssessmentAdapter();
const firestoreAdapter = new FirestoreAssessmentAdapter();

export function getAdapter(mode: RetentionMode): AssessmentStorageAdapter {
  return mode === 'session_only' ? sessionAdapter : firestoreAdapter;
}

export function resolveRetentionMode(value: unknown): RetentionMode {
  return value === 'persistent' ? 'persistent' : 'session_only';
}

export function setCachedRetentionMode(uid: string, mode: RetentionMode): void {
  if (!hasSessionStorage()) return;
  window.sessionStorage.setItem(retentionKey(uid), mode);
}

export function getCachedRetentionMode(uid: string): RetentionMode | null {
  if (!hasSessionStorage()) return null;
  const raw = window.sessionStorage.getItem(retentionKey(uid));
  if (!raw) return null;
  return resolveRetentionMode(raw);
}

export function clearCachedRetentionMode(uid: string): void {
  if (!hasSessionStorage()) return;
  window.sessionStorage.removeItem(retentionKey(uid));
}

export function canUseSessionStorage(): boolean {
  return hasSessionStorage();
}

export async function clearAssessmentSessionCache(uid: string): Promise<void> {
  if (!hasSessionStorage()) return;
  const keys: AssessmentDocKey[] = [
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
  await sessionAdapter.clear(uid, keys);
}
