'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
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

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  googleAccessToken: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);

  const refreshProfile = async () => {
    if (!user) return;
    const p = await getUserProfile(user.uid);
    setProfile(p);
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const existing = await getUserProfile(u.uid);
        if (existing) {
          setProfile(existing);
        }
      } else {
        setProfile(null);
        setGoogleAccessToken(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/gmail.readonly');
    provider.addScope('https://www.googleapis.com/auth/drive.readonly');

    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken ?? null;
    setGoogleAccessToken(accessToken);

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
    setProfile(existing);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setProfile(null);
    setGoogleAccessToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, googleAccessToken, signInWithGoogle, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
