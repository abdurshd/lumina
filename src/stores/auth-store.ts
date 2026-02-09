import { create } from 'zustand';
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { getUserProfile, createUserProfile } from '@/lib/firebase/firestore';
import type { UserProfile } from '@/types';
import { useAssessmentStore } from './assessment-store';

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

    const unsub = onAuthStateChanged(auth, async (u) => {
      set({ user: u });
      if (u) {
        const existing = await getUserProfile(u.uid);
        if (existing) {
          set({ profile: existing });
        }
      } else {
        set({ profile: null, googleAccessToken: null });
      }
      set({ loading: false });
    });

    return unsub;
  },

  signInWithGoogle: async () => {
    const provider = new GoogleAuthProvider();

    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken ?? null;
    set({ googleAccessToken: accessToken });

    const u = result.user;
    let existing = await getUserProfile(u.uid);
    if (!existing) {
      const newProfile: UserProfile = {
        uid: u.uid,
        email: u.email ?? '',
        displayName: u.displayName ?? '',
        photoURL: u.photoURL ?? '',
        createdAt: Date.now(),
        stages: {
          connections: 'active',
          quiz: 'locked',
          session: 'locked',
          report: 'locked',
        },
        googleAccessToken: accessToken ?? undefined,
      };
      await createUserProfile(newProfile);
      existing = newProfile;
    }
    set({ profile: existing });
  },

  signOut: async () => {
    await firebaseSignOut(auth);
    set({ user: null, profile: null, googleAccessToken: null });
    useAssessmentStore.getState().reset();
  },

  refreshProfile: async () => {
    const { user } = get();
    if (!user) return;
    const p = await getUserProfile(user.uid);
    set({ profile: p });
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
