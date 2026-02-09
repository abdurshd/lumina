import type {
  QuizModuleId,
  AgentState,
  AgentAction,
  AgentActionPriority,
  DimensionGap,
  SourceRecommendation,
} from '@/types';

// --- Thresholds ---

const REPORT_GENERATION_THRESHOLD = 60;
const CAREER_MATCH_THRESHOLD = 50;
const HIGH_CONFIDENCE = 70;
const LOW_CONFIDENCE = 30;

const ALL_QUIZ_MODULES: QuizModuleId[] = [
  'interests',
  'work_values',
  'strengths_skills',
  'learning_environment',
  'constraints',
];

const ALL_DATA_SOURCES = ['gmail', 'drive', 'notion', 'chatgpt', 'file_upload'];

// --- Core Evaluation ---

/**
 * Pure function that examines current agent state and returns a prioritized
 * list of recommended actions. The orchestrator does NOT execute actions —
 * it recommends them.
 */
export function evaluateState(state: AgentState): AgentAction[] {
  const actions: AgentAction[] = [];

  // 1. Check if we need more data sources
  const unconnectedSources = ALL_DATA_SOURCES.filter(
    (s) => !state.connectedSources.includes(s)
  );

  if (state.connectedSources.length === 0) {
    // No data sources at all — critical
    actions.push({
      type: 'request_additional_data',
      priority: 'critical',
      reason:
        'No data sources connected. Connect at least one data source to begin building your profile.',
      confidenceImpact: 25,
      blockedBy: [],
      metadata: { suggestedSources: unconnectedSources.join(',') },
    });
  }

  // 2. Analyze any connected but unanalyzed sources
  for (const source of state.connectedSources) {
    const hasSourceEvidence = Object.values(
      state.confidenceProfile.dimensions
    ).some((d) =>
      d.sources.some(
        (s) => s.type === 'data_source' && s.evidence.startsWith(source)
      )
    );

    if (!hasSourceEvidence) {
      actions.push({
        type: 'analyze_source',
        priority: 'high',
        reason: `Connected source "${source}" has not been analyzed yet. Analyzing it will extract career signals and improve dimension confidence.`,
        confidenceImpact: 15,
        blockedBy: [],
        metadata: { source },
      });
    }
  }

  // 3. Identify quiz modules to run
  const completedModuleSet = new Set(state.quizCompletedModules);
  const inProgressModuleSet = new Set(state.quizInProgressModules);
  const availableModules = ALL_QUIZ_MODULES.filter(
    (m) => !completedModuleSet.has(m) && !inProgressModuleSet.has(m)
  );

  if (availableModules.length > 0) {
    // Recommend the module that covers the most low-confidence dimensions
    const recommended = recommendNextModule(state, availableModules);
    if (recommended) {
      const priority = computeQuizPriority(state);
      actions.push({
        type: 'run_quiz_module',
        priority,
        reason: recommended.reason,
        confidenceImpact: recommended.expectedImpact,
        blockedBy: [],
        metadata: { module: recommended.module },
      });
    }
  }

  // 4. Probe specific weak dimensions
  for (const gap of state.gaps) {
    if (
      gap.currentConfidence < LOW_CONFIDENCE &&
      gap.missingSourceTypes.length > 0
    ) {
      actions.push({
        type: 'probe_dimension',
        priority: 'medium',
        reason: `Dimension "${gap.dimension}" has very low confidence (${gap.currentConfidence}%). Missing evidence from: ${gap.missingSourceTypes.join(', ')}.`,
        confidenceImpact: Math.min(
          gap.targetConfidence - gap.currentConfidence,
          30
        ),
        blockedBy: [],
        metadata: {
          dimension: gap.dimension,
          currentConfidence: gap.currentConfidence,
        },
      });
    }
  }

  // 5. Recommend session if quiz data exists but no session
  if (
    state.quizCompletedModules.length >= 2 &&
    !state.sessionCompleted &&
    state.sessionInsightsCount === 0
  ) {
    actions.push({
      type: 'start_session',
      priority: computeSessionPriority(state),
      reason:
        state.overallConfidence >= CAREER_MATCH_THRESHOLD
          ? 'You have enough quiz data to benefit from a live session. A session will strengthen weak dimensions through adaptive conversation.'
          : 'A live session will help fill confidence gaps that quiz alone cannot address, especially for behavioral and communication dimensions.',
      confidenceImpact: 20,
      blockedBy: [],
    });
  }

  // 6. Recommend report generation if confidence is sufficient
  if (
    state.overallConfidence >= REPORT_GENERATION_THRESHOLD &&
    !state.reportGenerated
  ) {
    actions.push({
      type: 'generate_report',
      priority: 'high',
      reason: `Overall confidence is ${state.overallConfidence}% (above ${REPORT_GENERATION_THRESHOLD}% threshold). Ready to generate your talent report.`,
      confidenceImpact: 0,
      blockedBy: [],
    });
  } else if (
    state.overallConfidence >= CAREER_MATCH_THRESHOLD &&
    !state.reportGenerated
  ) {
    // Marginal — can generate but should get more data
    actions.push({
      type: 'generate_report',
      priority: 'low',
      reason: `Overall confidence is ${state.overallConfidence}% — enough for a preliminary report, but additional data would improve career match accuracy. Consider completing more modules or connecting additional sources first.`,
      confidenceImpact: 0,
      blockedBy: [],
    });
  }

  // 7. Recommend refining existing report if confidence has improved
  if (state.reportGenerated && state.overallConfidence >= HIGH_CONFIDENCE) {
    actions.push({
      type: 'refine_report_section',
      priority: 'medium',
      reason:
        'New data has been collected since the report was generated. Refining weak sections with updated evidence would improve accuracy.',
      confidenceImpact: 5,
      blockedBy: [],
    });
  }

  // 8. Request additional data sources if gaps remain
  if (
    state.gaps.length > 0 &&
    unconnectedSources.length > 0 &&
    state.connectedSources.length > 0
  ) {
    const sourceRecommendations = recommendDataSources(
      state.gaps,
      state.connectedSources
    );
    for (const rec of sourceRecommendations.slice(0, 2)) {
      actions.push({
        type: 'request_additional_data',
        priority: 'medium',
        reason: rec.reason,
        confidenceImpact: rec.expectedImpact,
        blockedBy: [],
        metadata: { source: rec.source },
      });
    }
  }

  // Sort by priority
  return sortByPriority(actions);
}

// --- Helper Functions ---

interface ModuleRecommendation {
  module: QuizModuleId;
  reason: string;
  expectedImpact: number;
}

/**
 * Recommend the next quiz module based on confidence gaps.
 * Exported for direct use in quiz page module selection.
 */
export function recommendNextModule(
  state: AgentState,
  availableModules: QuizModuleId[]
): ModuleRecommendation | null {
  if (availableModules.length === 0) return null;

  // Map dimensions to modules that cover them
  const moduleDimensionCoverage: Record<QuizModuleId, string[]> = {
    interests: [
      'Realistic',
      'Investigative',
      'Artistic',
      'Social',
      'Enterprising',
      'Conventional',
    ],
    work_values: ['work_values', 'adaptability', 'emotional_intelligence'],
    strengths_skills: [
      'analytical_thinking',
      'creative_thinking',
      'communication',
      'technical_aptitude',
      'problem_solving',
    ],
    learning_environment: ['adaptability', 'teamwork', 'leadership'],
    constraints: ['work_values'],
  };

  // Score each available module by how many gap dimensions it covers
  let bestModule: QuizModuleId = availableModules[0];
  let bestScore = -1;
  let bestGapDimensions: string[] = [];

  for (const mod of availableModules) {
    const coveredDimensions = moduleDimensionCoverage[mod] ?? [];
    const gapDimensions = state.gaps
      .filter((g) => coveredDimensions.includes(g.dimension))
      .map((g) => g.dimension);
    const score = gapDimensions.reduce((sum, dim) => {
      const gap = state.gaps.find((g) => g.dimension === dim);
      return sum + (gap ? gap.importance * (gap.targetConfidence - gap.currentConfidence) : 0);
    }, 0);

    if (score > bestScore) {
      bestScore = score;
      bestModule = mod;
      bestGapDimensions = gapDimensions;
    }
  }

  const reason =
    bestGapDimensions.length > 0
      ? `Module "${bestModule}" covers ${bestGapDimensions.length} weak dimensions (${bestGapDimensions.slice(0, 3).join(', ')}${bestGapDimensions.length > 3 ? '...' : ''}). Taking this quiz will improve confidence in these areas.`
      : `Module "${bestModule}" hasn't been completed yet. It will expand your profile coverage.`;

  return {
    module: bestModule,
    reason,
    expectedImpact: Math.min(Math.round(bestScore / 2), 25),
  };
}

/**
 * Recommend data sources that would best fill confidence gaps.
 * Exported for use in the evaluate endpoint.
 */
export function recommendDataSources(
  gaps: DimensionGap[],
  connectedSources: string[]
): SourceRecommendation[] {
  // Map dimensions to the data sources most likely to provide evidence
  const dimensionToSources: Record<string, string[]> = {
    communication: ['gmail', 'notion'],
    Social: ['gmail', 'notion'],
    Investigative: ['drive', 'chatgpt'],
    analytical_thinking: ['drive', 'chatgpt'],
    technical_aptitude: ['drive', 'file_upload'],
    Realistic: ['drive', 'file_upload'],
    Artistic: ['drive', 'notion'],
    creative_thinking: ['notion', 'drive'],
    Enterprising: ['gmail', 'drive'],
    leadership: ['gmail', 'drive'],
    Conventional: ['drive', 'gmail'],
    teamwork: ['gmail', 'notion'],
    problem_solving: ['chatgpt', 'drive'],
    work_values: ['gmail', 'chatgpt'],
    adaptability: ['chatgpt', 'notion'],
    emotional_intelligence: ['gmail', 'chatgpt'],
  };

  const connectedSet = new Set(connectedSources);
  const sourceScores: Record<string, { score: number; dimensions: string[] }> =
    {};

  for (const gap of gaps) {
    const relevantSources = dimensionToSources[gap.dimension] ?? [];
    for (const source of relevantSources) {
      if (connectedSet.has(source)) continue;
      if (!sourceScores[source]) {
        sourceScores[source] = { score: 0, dimensions: [] };
      }
      sourceScores[source].score +=
        gap.importance * (gap.targetConfidence - gap.currentConfidence);
      sourceScores[source].dimensions.push(gap.dimension);
    }
  }

  return Object.entries(sourceScores)
    .sort(([, a], [, b]) => b.score - a.score)
    .map(([source, data]) => ({
      source,
      reason: `Connecting ${source} would strengthen ${data.dimensions.length} weak dimensions (${data.dimensions.slice(0, 3).join(', ')}${data.dimensions.length > 3 ? '...' : ''}).`,
      expectedImpact: Math.min(Math.round(data.score / 3), 25),
      dimensions: data.dimensions,
    }));
}

function computeQuizPriority(state: AgentState): AgentActionPriority {
  if (state.quizCompletedModules.length === 0) return 'high';
  if (state.overallConfidence < LOW_CONFIDENCE) return 'high';
  if (state.overallConfidence < CAREER_MATCH_THRESHOLD) return 'medium';
  return 'low';
}

function computeSessionPriority(state: AgentState): AgentActionPriority {
  // Session is more valuable when there are behavioral/communication gaps
  const behavioralGaps = state.gaps.filter((g) =>
    ['communication', 'emotional_intelligence', 'teamwork', 'leadership'].includes(
      g.dimension
    )
  );
  if (behavioralGaps.length >= 2) return 'high';
  if (behavioralGaps.length >= 1) return 'medium';
  return 'low';
}

const PRIORITY_ORDER: Record<AgentActionPriority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

function sortByPriority(actions: AgentAction[]): AgentAction[] {
  return [...actions].sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
  );
}
