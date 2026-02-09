import { create } from 'zustand';
import {
  onAuthStateChanged,
  getRedirectResult,
  signInWithPopup,
  signInWithRedirect,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  type User,
  type UserCredential,
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { getUserProfile, createUserProfile } from '@/lib/firebase/firestore';
import { clearAssessmentSessionCache, clearCachedRetentionMode, resolveRetentionMode, setCachedRetentionMode } from '@/lib/storage/assessment-storage';
import type { UserProfile } from '@/types';
import { useAssessmentStore } from './assessment-store';

function buildDefaultProfile(user: User, accessToken?: string | null): UserProfile {
  return {
    uid: user.uid,
    email: user.email ?? '',
    displayName: user.displayName ?? '',
    photoURL: user.photoURL ?? '',
    createdAt: Date.now(),
    stages: {
      connections: 'active',
      quiz: 'locked',
      session: 'locked',
      report: 'locked',
    },
    googleAccessToken: accessToken ?? undefined,
    dataRetentionMode: 'session_only',
    byokEnabled: false,
    byokMonthlyBudgetUsd: 25,
    byokHardStop: false,
  };
}

async function ensureUserProfile(user: User, accessToken?: string | null): Promise<UserProfile> {
  const existing = await getUserProfile(user.uid);
  if (existing) {
    return existing;
  }

  const profile = buildDefaultProfile(user, accessToken);
  await createUserProfile(profile);
  return profile;
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  googleAccessToken: string | null;
  _listenerInitialized: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  initAuthListener: () => () => void;
  requestGmailAccess: () => Promise<string | null>;
  requestDriveAccess: () => Promise<string | null>;
  connectNotion: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  googleAccessToken: null,
  _listenerInitialized: false,

  initAuthListener: () => {
    if (get()._listenerInitialized) return () => {};
    set({ _listenerInitialized: true });
    let redirectResultChecked = false;

    const unsub = onAuthStateChanged(auth, async (u) => {
      set({ user: u });
      if (u) {
        let accessToken: string | null = null;

        if (!redirectResultChecked) {
          redirectResultChecked = true;
          try {
            const redirectResult: UserCredential | null = await getRedirectResult(auth);
            const redirectCredential = redirectResult
              ? GoogleAuthProvider.credentialFromResult(redirectResult)
              : null;
            accessToken = redirectCredential?.accessToken ?? null;
          } catch (error) {
            console.warn('Failed to resolve redirect result', error);
          }
        }

        const profile = await ensureUserProfile(u, accessToken);
        setCachedRetentionMode(u.uid, resolveRetentionMode(profile.dataRetentionMode));
        set({
          profile,
          googleAccessToken: accessToken ?? profile.googleAccessToken ?? null,
        });
      } else {
        set({ profile: null, googleAccessToken: null });
      }
      set({ loading: false });
    });

    return unsub;
  },

  signInWithGoogle: async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      // Redirect flow avoids COOP popup/window.closed browser restrictions.
      await signInWithRedirect(auth, provider);
    } catch {
      // Popup fallback for environments where redirect initiation fails.
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken ?? null;
      set({ googleAccessToken: accessToken });

      const profile = await ensureUserProfile(result.user, accessToken);
      setCachedRetentionMode(result.user.uid, resolveRetentionMode(profile.dataRetentionMode));
      set({ profile });
    }
  },

  signOut: async () => {
    const uid = get().user?.uid;
    if (uid) {
      await clearAssessmentSessionCache(uid);
      clearCachedRetentionMode(uid);
    }
    await firebaseSignOut(auth);
    set({ user: null, profile: null, googleAccessToken: null });
    useAssessmentStore.getState().reset();
  },

  refreshProfile: async () => {
    const { user } = get();
    if (!user) return;
    const p = await getUserProfile(user.uid);
    if (p) {
      setCachedRetentionMode(user.uid, resolveRetentionMode(p.dataRetentionMode));
    }
    set({ profile: p });
  },

  requestGmailAccess: async () => {
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/gmail.readonly');

    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken ?? null;
      if (accessToken) {
        set({ googleAccessToken: accessToken });
      }
      return accessToken;
    } catch {
      return null;
    }
  },

  requestDriveAccess: async () => {
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/drive.readonly');

    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken ?? null;
      if (accessToken) {
        set({ googleAccessToken: accessToken });
      }
      return accessToken;
    } catch {
      return null;
    }
  },

  connectNotion: () => {
    const clientId = process.env.NEXT_PUBLIC_NOTION_CLIENT_ID;
    if (!clientId) {
      console.error('NEXT_PUBLIC_NOTION_CLIENT_ID not configured');
      return;
    }
    const redirectUri = `${window.location.origin}/api/auth/notion/callback`;
    const url = `https://api.notion.com/v1/oauth/authorize?client_id=${clientId}&response_type=code&owner=user&redirect_uri=${encodeURIComponent(redirectUri)}`;
    window.open(url, '_blank', 'width=600,height=700');
  },
}));
