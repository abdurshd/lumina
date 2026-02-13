import { useAgentStore } from '@/stores/agent-store';
import { apiClient } from '@/lib/api/client';
import { computeProfileConfidence, identifyGaps } from '@/lib/agent/confidence';
import {
  getDataInsights,
  getQuizScores,
  getSessionInsights,
  getUserSignals,
  getComputedProfile,
  getModuleProgress,
} from '@/lib/firebase/firestore';
import type { AgentState, ComputedProfile, QuizModuleId } from '@/types';

const EMPTY_PROFILE: ComputedProfile = {
  riasecCode: '',
  dimensionScores: {},
  confidenceScores: {},
};

/**
 * Fire-and-forget function to evaluate the current agent state.
 * Fetches all assessment data, computes confidence, calls the evaluate API,
 * and writes results to the agent store.
 *
 * Safe to call from any callback — never throws or blocks the assessment flow.
 */
export async function triggerAgentEvaluation(uid: string): Promise<void> {
  const store = useAgentStore.getState();
  if (store.isEvaluating) return;

  store.setEvaluating(true);
  try {
    const [insights, quizScoresData, sessionInsights, , profile, moduleProgress] =
      await Promise.all([
        getDataInsights(uid),
        getQuizScores(uid),
        getSessionInsights(uid),
        getUserSignals(uid),
        getComputedProfile(uid),
        getModuleProgress(uid),
      ]);

    const computedProfile = profile ?? EMPTY_PROFILE;
    const quizScores = quizScoresData?.scores ?? [];

    const confidenceProfile = computeProfileConfidence(
      computedProfile,
      insights,
      quizScores,
      sessionInsights,
    );

    const gaps = identifyGaps(confidenceProfile);

    // Derive connected sources from insights
    const connectedSources = [...new Set(insights.map((i) => i.source))];

    // Derive completed/in-progress quiz modules
    const completedModules: QuizModuleId[] = [];
    const inProgressModules: QuizModuleId[] = [];
    for (const mod of Object.values(moduleProgress)) {
      if (mod.status === 'completed') completedModules.push(mod.moduleId);
      else if (mod.status === 'in_progress') inProgressModules.push(mod.moduleId);
    }

    const agentState: AgentState = {
      connectedSources,
      quizCompletedModules: completedModules,
      quizInProgressModules: inProgressModules,
      sessionCompleted: sessionInsights.length > 0,
      sessionInsightsCount: sessionInsights.length,
      confidenceProfile,
      gaps,
      reportGenerated: false, // caller context doesn't matter — orchestrator decides
      overallConfidence: confidenceProfile.overallConfidence,
    };

    const response = await apiClient.agent.evaluate(agentState);

    // Write to store
    const currentStore = useAgentStore.getState();
    currentStore.addDecision(response.decision);
    currentStore.setPlan(response.actions);
    currentStore.setConfidenceProfile(confidenceProfile);
  } catch (err) {
    console.error('[agent-evaluate] evaluation failed:', err);
  } finally {
    useAgentStore.getState().setEvaluating(false);
  }
}
