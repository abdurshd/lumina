import { create } from 'zustand';
import type { AgentAction, AgentDecision } from '@/types';

interface AgentStoreState {
  decisions: AgentDecision[];
  currentPlan: AgentAction[];
  isEvaluating: boolean;

  addDecision: (decision: AgentDecision) => void;
  setPlan: (plan: AgentAction[]) => void;
  markActionComplete: (actionType: AgentAction['type'], outcome: AgentDecision['outcome']) => void;
  clearLog: () => void;
  setEvaluating: (evaluating: boolean) => void;
  loadDecisions: (decisions: AgentDecision[]) => void;
}

export const useAgentStore = create<AgentStoreState>((set) => ({
  decisions: [],
  currentPlan: [],
  isEvaluating: false,

  addDecision: (decision) =>
    set((state) => ({
      decisions: [...state.decisions, decision],
    })),

  setPlan: (plan) => set({ currentPlan: plan }),

  markActionComplete: (actionType, outcome) =>
    set((state) => ({
      currentPlan: state.currentPlan.filter((a) => a.type !== actionType),
      decisions: state.decisions.map((d) =>
        d.action === actionType && d.outcome === 'pending'
          ? { ...d, outcome }
          : d
      ),
    })),

  clearLog: () => set({ decisions: [], currentPlan: [] }),

  setEvaluating: (evaluating) => set({ isEvaluating: evaluating }),

  loadDecisions: (decisions) => set({ decisions }),
}));
