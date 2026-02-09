import { create } from 'zustand';
import type { MicroChallenge, Reflection, ProfileSnapshot, IterationState } from '@/types';

interface IterationStoreState {
  challenges: MicroChallenge[];
  reflections: Reflection[];
  profileSnapshots: ProfileSnapshot[];
  iterationState: IterationState | null;
  setChallenges: (challenges: MicroChallenge[]) => void;
  addChallenge: (challenge: MicroChallenge) => void;
  updateChallengeStatus: (challengeId: string, status: MicroChallenge['status'], evidence?: string) => void;
  addReflection: (reflection: Reflection) => void;
  setReflections: (reflections: Reflection[]) => void;
  addProfileSnapshot: (snapshot: ProfileSnapshot) => void;
  setProfileSnapshots: (snapshots: ProfileSnapshot[]) => void;
  setIterationState: (state: IterationState) => void;
  reset: () => void;
}

const initialState = {
  challenges: [] as MicroChallenge[],
  reflections: [] as Reflection[],
  profileSnapshots: [] as ProfileSnapshot[],
  iterationState: null as IterationState | null,
};

export const useIterationStore = create<IterationStoreState>((set) => ({
  ...initialState,

  setChallenges: (challenges) => set({ challenges }),

  addChallenge: (challenge) =>
    set((state) => ({
      challenges: [challenge, ...state.challenges],
    })),

  updateChallengeStatus: (challengeId, status, evidence) =>
    set((state) => ({
      challenges: state.challenges.map((c) =>
        c.id === challengeId
          ? {
              ...c,
              status,
              ...(evidence ? { evidence } : {}),
              ...(status === 'completed' ? { completedAt: Date.now() } : {}),
            }
          : c
      ),
    })),

  addReflection: (reflection) =>
    set((state) => ({
      reflections: [reflection, ...state.reflections],
    })),

  setReflections: (reflections) => set({ reflections }),

  addProfileSnapshot: (snapshot) =>
    set((state) => ({
      profileSnapshots: [...state.profileSnapshots, snapshot],
    })),

  setProfileSnapshots: (snapshots) => set({ profileSnapshots: snapshots }),

  setIterationState: (iterationState) => set({ iterationState }),

  reset: () => set(initialState),
}));
