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
import {
  encodeNotionOAuthState,
  NOTION_OAUTH_REDIRECT_ORIGIN_KEY,
  NOTION_OAUTH_STATE_KEY,
  resolveNotionRedirectUri,
} from '@/lib/notion/oauth';
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
    byokPlatformAccess: false,
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
  connectNotion: () => { started: boolean; reason?: string };
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

    // Capture access token from any pending redirect (fire-and-forget).
    // This is separate from onAuthStateChanged so auth state is never blocked.
    getRedirectResult(auth)
      .then((result: UserCredential | null) => {
        if (result) {
          const credential = GoogleAuthProvider.credentialFromResult(result);
          const accessToken = credential?.accessToken ?? null;
          if (accessToken) {
            set({ googleAccessToken: accessToken });
          }
        }
      })
      .catch((error) => {
        console.warn('Failed to resolve redirect result', error);
      });

    const unsub = onAuthStateChanged(auth, async (u) => {
      set({ user: u });

      if (u) {
        try {
          const token = get().googleAccessToken;
          const profile = await ensureUserProfile(u, token);
          setCachedRetentionMode(u.uid, resolveRetentionMode(profile.dataRetentionMode));
          set({
            profile,
            googleAccessToken: token ?? profile.googleAccessToken ?? null,
          });
        } catch (error) {
          console.error('Failed to initialize user profile', error);
          set({ profile: null });
        }
      } else {
        set({ profile: null, googleAccessToken: null });
      }
      set({ loading: false });
    });

    return () => {
      unsub();
      set({ _listenerInitialized: false });
    };
  },

  signInWithGoogle: async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      // Popup is the primary flow — works with COOP same-origin-allow-popups
      // and avoids the fragile redirect + getRedirectResult race condition.
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken ?? null;
      set({ googleAccessToken: accessToken });

      const profile = await ensureUserProfile(result.user, accessToken);
      setCachedRetentionMode(result.user.uid, resolveRetentionMode(profile.dataRetentionMode));
      set({ profile });
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      // If popup is blocked by the browser, fall back to redirect flow.
      if (code === 'auth/popup-blocked') {
        await signInWithRedirect(auth, provider);
        return;
      }
      throw err;
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
    provider.setCustomParameters({
      prompt: 'consent select_account',
      include_granted_scopes: 'true',
    });

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
    provider.setCustomParameters({
      prompt: 'consent select_account',
      include_granted_scopes: 'true',
    });

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
    const clientId = process.env.NEXT_PUBLIC_NOTION_CLIENT_ID?.trim();
    if (!clientId) {
      return {
        started: false,
        reason: 'Notion is not configured. Missing NEXT_PUBLIC_NOTION_CLIENT_ID.',
      };
    }

    const redirectUri = resolveNotionRedirectUri(window.location.origin);
    const { state, nonce } = encodeNotionOAuthState(window.location.origin, redirectUri);
    window.sessionStorage.setItem(NOTION_OAUTH_STATE_KEY, nonce);
    window.sessionStorage.setItem(
      NOTION_OAUTH_REDIRECT_ORIGIN_KEY,
      new URL(redirectUri).origin,
    );

    const url = `https://api.notion.com/v1/oauth/authorize?client_id=${encodeURIComponent(clientId)}&response_type=code&owner=user&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}`;
    const popup = window.open(url, 'lumina-notion-oauth', 'width=600,height=700');
    if (!popup) {
      window.sessionStorage.removeItem(NOTION_OAUTH_STATE_KEY);
      window.sessionStorage.removeItem(NOTION_OAUTH_REDIRECT_ORIGIN_KEY);
      return {
        started: false,
        reason: 'Popup was blocked. Please allow popups and try again.',
      };
    }

    popup.focus();
    return { started: true };
  },
}));
