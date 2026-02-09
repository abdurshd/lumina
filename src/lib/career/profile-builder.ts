import type { ComputedProfile, UserSignal, UserConstraints, QuizDimensionSummary } from '@/types';

const RIASEC_DIMENSIONS = ['Realistic', 'Investigative', 'Artistic', 'Social', 'Enterprising', 'Conventional'];
const RIASEC_LETTER_MAP: Record<string, string> = {
  Realistic: 'R',
  Investigative: 'I',
  Artistic: 'A',
  Social: 'S',
  Enterprising: 'E',
  Conventional: 'C',
};

interface ProfileBuilderInput {
  quizDimensionScores: QuizDimensionSummary;
  signals?: UserSignal[];
  constraints?: UserConstraints;
}

/**
 * Pure deterministic function: takes quiz dimension scores + signals + constraints
 * and returns a ComputedProfile with RIASEC code + confidence scores.
 */
export function buildComputedProfile(input: ProfileBuilderInput): ComputedProfile {
  const { quizDimensionScores, signals, constraints } = input;

  // Extract RIASEC scores from dimension scores
  const riasecScores: Record<string, number> = {};
  for (const dim of RIASEC_DIMENSIONS) {
    riasecScores[dim] = quizDimensionScores[dim] ?? 0;
  }

  // Boost RIASEC scores based on signal evidence
  if (signals && signals.length > 0) {
    for (const signal of signals) {
      const dims = signal.dimensions ?? [];
      for (const dim of dims) {
        if (dim in riasecScores) {
          riasecScores[dim] = Math.min(100, riasecScores[dim] + signal.confidence * 5);
        }
      }
    }
  }

  // Sort RIASEC dimensions by score descending, take top 3 for code
  const sortedRiasec = RIASEC_DIMENSIONS
    .map((dim) => ({ dim, score: riasecScores[dim] }))
    .sort((a, b) => b.score - a.score);

  const riasecCode = sortedRiasec
    .slice(0, 3)
    .map((r) => RIASEC_LETTER_MAP[r.dim])
    .join('');

  // Build complete dimension scores (RIASEC + other quiz dimensions)
  const dimensionScores: Record<string, number> = { ...quizDimensionScores };
  for (const dim of RIASEC_DIMENSIONS) {
    dimensionScores[dim] = riasecScores[dim];
  }

  // Compute confidence scores based on data coverage
  const confidenceScores: Record<string, number> = {};
  const quizDimCount = Object.keys(quizDimensionScores).length;

  for (const dim of Object.keys(dimensionScores)) {
    const hasQuizData = dim in quizDimensionScores && quizDimensionScores[dim] > 0;
    const signalSupport = signals?.filter((s) => s.dimensions?.includes(dim)).length ?? 0;

    let confidence = 20; // baseline
    if (hasQuizData) confidence += 40;
    if (signalSupport > 0) confidence += Math.min(30, signalSupport * 10);
    if (quizDimCount >= 6) confidence += 10;

    confidenceScores[dim] = Math.min(100, confidence);
  }

  return {
    riasecCode,
    dimensionScores,
    confidenceScores,
    constraints,
  };
}
