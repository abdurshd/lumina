import type {
  ConfidenceSource,
  ConfidenceSourceType,
  ConfidenceProfile,
  DimensionConfidence,
  DimensionGap,
  ComputedProfile,
  DataInsight,
  QuizScore,
  SessionInsight,
} from '@/types';

// --- Constants ---

const DEFAULT_TARGET_CONFIDENCE = 60;
const SOURCE_DIVERSITY_MULTIPLIERS: Record<number, number> = {
  1: 0.6,
  2: 0.8,
};
const MAX_SOURCE_DIVERSITY_MULTIPLIER = 1.0;
const EVIDENCE_COUNT_DIVISOR = 3;
const AGREEMENT_BONUS = 0.1;
const AGREEMENT_RANGE = 0.15; // 15% range for agreement check

// Importance weights for dimensions (how critical they are for career recommendations)
const DIMENSION_IMPORTANCE: Record<string, number> = {
  Realistic: 0.8,
  Investigative: 0.8,
  Artistic: 0.8,
  Social: 0.8,
  Enterprising: 0.8,
  Conventional: 0.8,
  analytical_thinking: 0.7,
  creative_thinking: 0.7,
  communication: 0.7,
  leadership: 0.6,
  teamwork: 0.6,
  problem_solving: 0.7,
  adaptability: 0.5,
  emotional_intelligence: 0.5,
  technical_aptitude: 0.7,
  work_values: 0.6,
};
const DEFAULT_IMPORTANCE = 0.5;

// --- Core Functions ---

/**
 * Compute confidence for a single dimension based on its evidence sources.
 * Returns a 0-100 score that is deterministic given the same inputs.
 */
export function computeDimensionConfidence(
  dimension: string,
  sources: ConfidenceSource[]
): number {
  if (sources.length === 0) return 0;

  // Compute base score as average of source scores
  const totalScore = sources.reduce((sum, s) => sum + s.score, 0);
  const baseScore = totalScore / sources.length;

  // Compute source diversity multiplier
  const uniqueTypes = new Set(sources.map((s) => s.type));
  const typeCount = uniqueTypes.size;
  const diversityMultiplier =
    SOURCE_DIVERSITY_MULTIPLIERS[typeCount] ?? MAX_SOURCE_DIVERSITY_MULTIPLIER;

  // Compute evidence count factor: min(count / 3, 1.0)
  const evidenceCountFactor = Math.min(
    sources.length / EVIDENCE_COUNT_DIVISOR,
    1.0
  );

  // Compute agreement bonus: +0.1 if all sources agree within 15% range
  let agreementBonus = 0;
  if (sources.length > 1) {
    const scores = sources.map((s) => s.score);
    const minScore = Math.min(...scores);
    const maxScore = Math.max(...scores);
    const range = maxScore - minScore;
    // Check if range is within 15% of the max possible score (100)
    if (range <= AGREEMENT_RANGE * 100) {
      agreementBonus = AGREEMENT_BONUS;
    }
  }

  // Final confidence: base_score * diversity * evidence_count + agreement_bonus (scaled to 100)
  const rawConfidence =
    baseScore * diversityMultiplier * evidenceCountFactor + agreementBonus * 100;

  // Clamp to 0-100
  return Math.round(Math.max(0, Math.min(100, rawConfidence)));
}

/**
 * Build a full ConfidenceProfile from all available assessment data.
 * Aggregates quiz scores, session insights, and data source insights into
 * per-dimension confidence scores.
 */
export function computeProfileConfidence(
  profile: ComputedProfile,
  insights: DataInsight[],
  quizScores: QuizScore[],
  sessionInsights: SessionInsight[]
): ConfidenceProfile {
  const now = Date.now();
  const sourcesByDimension: Record<string, ConfidenceSource[]> = {};

  // Helper to add a source
  function addSource(
    dimension: string,
    type: ConfidenceSourceType,
    score: number,
    evidence: string,
    timestamp: number
  ) {
    if (!sourcesByDimension[dimension]) {
      sourcesByDimension[dimension] = [];
    }
    sourcesByDimension[dimension].push({
      type,
      dimension,
      score,
      evidence,
      timestamp,
    });
  }

  // Extract sources from quiz scores
  for (const qs of quizScores) {
    for (const ds of qs.dimensionScores) {
      // Normalize quiz score from 1-10 range to 0-100
      const normalizedScore = Math.min(100, Math.max(0, ds.score * 10));
      addSource(
        ds.dimension,
        'quiz',
        normalizedScore,
        ds.rationale,
        now
      );
    }
  }

  // Extract sources from session insights
  for (const si of sessionInsights) {
    // Map session categories to dimensions
    const dimensions = mapSessionCategoryToDimensions(si.category);
    for (const dim of dimensions) {
      addSource(
        dim,
        'session',
        si.confidence * 100, // session confidence is 0-1
        si.observation,
        si.timestamp
      );
    }
  }

  // Extract sources from data insights
  for (const di of insights) {
    // Map data source themes/skills to dimensions
    const dimensionSignals = extractDimensionSignals(di);
    for (const { dimension, score, evidence } of dimensionSignals) {
      addSource(dimension, 'data_source', score, evidence, now);
    }
  }

  // Also include any existing profile dimension scores as baseline
  for (const [dimension, score] of Object.entries(
    profile.dimensionScores
  )) {
    // Only add if we don't already have sources for this dimension
    if (
      !sourcesByDimension[dimension] ||
      sourcesByDimension[dimension].length === 0
    ) {
      addSource(
        dimension,
        'quiz',
        Math.min(100, Math.max(0, score * 10)),
        'Computed profile score',
        now
      );
    }
  }

  // Compute per-dimension confidence
  const dimensions: Record<string, DimensionConfidence> = {};
  for (const [dimension, sources] of Object.entries(sourcesByDimension)) {
    const confidence = computeDimensionConfidence(dimension, sources);
    const sourceTypes = [
      ...new Set(sources.map((s) => s.type)),
    ] as ConfidenceSourceType[];
    dimensions[dimension] = {
      dimension,
      confidence,
      sourceCount: sources.length,
      sourceTypes,
      sources,
    };
  }

  // Compute overall confidence as weighted average
  const dimensionEntries = Object.values(dimensions);
  let overallConfidence = 0;
  if (dimensionEntries.length > 0) {
    const totalWeight = dimensionEntries.reduce(
      (sum, d) =>
        sum + (DIMENSION_IMPORTANCE[d.dimension] ?? DEFAULT_IMPORTANCE),
      0
    );
    const weightedSum = dimensionEntries.reduce(
      (sum, d) =>
        sum +
        d.confidence *
          (DIMENSION_IMPORTANCE[d.dimension] ?? DEFAULT_IMPORTANCE),
      0
    );
    overallConfidence = Math.round(weightedSum / totalWeight);
  }

  return {
    dimensions,
    overallConfidence,
    lastUpdated: now,
  };
}

/**
 * Identify dimensions with confidence below threshold, ranked by importance.
 * Returns the weakest dimensions first.
 */
export function identifyGaps(
  confidenceProfile: ConfidenceProfile,
  targetConfidence: number = DEFAULT_TARGET_CONFIDENCE
): DimensionGap[] {
  const allSourceTypes: ConfidenceSourceType[] = [
    'quiz',
    'session',
    'data_source',
  ];
  const gaps: DimensionGap[] = [];

  for (const [dimension, dc] of Object.entries(
    confidenceProfile.dimensions
  )) {
    if (dc.confidence < targetConfidence) {
      const missingSourceTypes = allSourceTypes.filter(
        (t) => !dc.sourceTypes.includes(t)
      );
      gaps.push({
        dimension,
        currentConfidence: dc.confidence,
        targetConfidence,
        missingSourceTypes,
        importance:
          DIMENSION_IMPORTANCE[dimension] ?? DEFAULT_IMPORTANCE,
      });
    }
  }

  // Sort: highest importance first, then lowest confidence first
  gaps.sort((a, b) => {
    if (b.importance !== a.importance) return b.importance - a.importance;
    return a.currentConfidence - b.currentConfidence;
  });

  return gaps;
}

// --- Internal Helpers ---

/**
 * Map session insight categories to psychometric dimensions.
 */
function mapSessionCategoryToDimensions(
  category: SessionInsight['category']
): string[] {
  const mapping: Record<SessionInsight['category'], string[]> = {
    engagement: ['Enterprising', 'Social'],
    hesitation: ['adaptability', 'emotional_intelligence'],
    emotional_intensity: ['emotional_intelligence', 'Artistic'],
    clarity_structure: ['analytical_thinking', 'Conventional'],
    collaboration_orientation: ['teamwork', 'Social'],
    body_language: ['communication', 'emotional_intelligence'],
    voice_tone: ['communication', 'leadership'],
    enthusiasm: ['Enterprising', 'creative_thinking'],
    analytical: ['Investigative', 'analytical_thinking'],
    creative: ['Artistic', 'creative_thinking'],
    interpersonal: ['Social', 'teamwork'],
  };

  return mapping[category] ?? [];
}

/**
 * Extract dimension signals from a data insight based on its themes and skills.
 */
function extractDimensionSignals(
  insight: DataInsight
): { dimension: string; score: number; evidence: string }[] {
  const signals: { dimension: string; score: number; evidence: string }[] =
    [];

  // Map common theme/skill keywords to dimensions
  const keywordMap: Record<string, string> = {
    // RIASEC dimensions
    technical: 'Realistic',
    engineering: 'Realistic',
    building: 'Realistic',
    mechanical: 'Realistic',
    research: 'Investigative',
    analysis: 'Investigative',
    data: 'Investigative',
    science: 'Investigative',
    design: 'Artistic',
    creative: 'Artistic',
    writing: 'Artistic',
    art: 'Artistic',
    music: 'Artistic',
    teaching: 'Social',
    mentoring: 'Social',
    counseling: 'Social',
    helping: 'Social',
    leadership: 'Enterprising',
    management: 'Enterprising',
    sales: 'Enterprising',
    business: 'Enterprising',
    organizing: 'Conventional',
    planning: 'Conventional',
    accounting: 'Conventional',
    administrative: 'Conventional',
    // Skill dimensions
    communication: 'communication',
    presenting: 'communication',
    coding: 'technical_aptitude',
    programming: 'technical_aptitude',
    software: 'technical_aptitude',
    problem: 'problem_solving',
    debugging: 'problem_solving',
    team: 'teamwork',
    collaboration: 'teamwork',
  };

  const allTerms = [
    ...insight.themes,
    ...insight.skills,
    ...insight.interests,
  ];

  const matchedDimensions = new Set<string>();

  for (const term of allTerms) {
    const lowerTerm = term.toLowerCase();
    for (const [keyword, dimension] of Object.entries(keywordMap)) {
      if (lowerTerm.includes(keyword) && !matchedDimensions.has(dimension)) {
        matchedDimensions.add(dimension);
        signals.push({
          dimension,
          score: 65, // Moderate confidence from keyword matching
          evidence: `${insight.source}: "${term}"`,
        });
      }
    }
  }

  return signals;
}
