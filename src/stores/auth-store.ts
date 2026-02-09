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
    // Clear assessment data on sign-out
    const { useAssessmentStore } = await import('./assessment-store');
    useAssessmentStore.getState().reset();
  },

  refreshProfile: async () => {
    const { user } = get();
    if (!user) return;
    const p = await getUserProfile(user.uid);
    set({ profile: p });
  },
}));
