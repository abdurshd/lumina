// Re-export agent types from the canonical types location
export type {
  AgentActionType,
  AgentActionPriority,
  AgentAction,
  AgentState,
  AgentDecision,
} from '@/types';

// --- Evaluate Response (API-specific) ---

export interface EvaluateResponse {
  actions: import('@/types').AgentAction[];
  state: import('@/types').AgentState;
  decision: import('@/types').AgentDecision;
}
