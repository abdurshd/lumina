import type { ComputedProfile, ProfileSnapshot, ProfileSnapshotTrigger } from '@/types';

const RIASEC_DIMENSIONS = ['Realistic', 'Investigative', 'Artistic', 'Social', 'Enterprising', 'Conventional'];
const RIASEC_LETTER_MAP: Record<string, string> = {
  Realistic: 'R',
  Investigative: 'I',
  Artistic: 'A',
  Social: 'S',
  Enterprising: 'E',
  Conventional: 'C',
};

/** Max points a single adjustment can apply to any dimension */
const MAX_ADJUSTMENT_PER_DIM = 5;

/** Max total drift from the baseline for any dimension across all evolutions */
const MAX_DRIFT_PER_DIM = 30;

interface EvolveProfileResult {
  updatedProfile: ComputedProfile;
  snapshot: ProfileSnapshot;
  deltas: Record<string, number>;
}

/**
 * Evolves a computed profile by applying dimension adjustments within safety bounds,
 * recalculating the RIASEC code, and producing a snapshot for the timeline.
 */
export function evolveProfile(
  currentProfile: ComputedProfile,
  newSignals: string[],
  dimensionAdjustments: Record<string, number>,
  trigger: ProfileSnapshotTrigger,
  snapshotVersion: number
): EvolveProfileResult {
  const updatedDimensionScores = { ...currentProfile.dimensionScores };
  const updatedConfidenceScores = { ...currentProfile.confidenceScores };
  const deltas: Record<string, number> = {};

  // Apply dimension adjustments with clamping
  for (const [dim, rawAdjustment] of Object.entries(dimensionAdjustments)) {
    // Clamp individual adjustment to +/- MAX_ADJUSTMENT_PER_DIM
    const clampedAdjustment = Math.max(-MAX_ADJUSTMENT_PER_DIM, Math.min(MAX_ADJUSTMENT_PER_DIM, rawAdjustment));

    const currentScore = updatedDimensionScores[dim] ?? 50;

    // Calculate what the new score would be
    let newScore = currentScore + clampedAdjustment;

    // Enforce max drift from a reasonable baseline (clamp total score within bounds)
    // Score must stay within [0, 100] and within +/- MAX_DRIFT_PER_DIM of the original
    const originalScore = currentProfile.dimensionScores[dim] ?? 50;
    const lowerBound = Math.max(0, originalScore - MAX_DRIFT_PER_DIM);
    const upperBound = Math.min(100, originalScore + MAX_DRIFT_PER_DIM);
    newScore = Math.max(lowerBound, Math.min(upperBound, newScore));

    const actualDelta = newScore - currentScore;
    if (actualDelta !== 0) {
      deltas[dim] = actualDelta;
    }

    updatedDimensionScores[dim] = newScore;

    // Slightly boost confidence for dimensions that received signal evidence
    const currentConfidence = updatedConfidenceScores[dim] ?? 20;
    updatedConfidenceScores[dim] = Math.min(100, currentConfidence + Math.abs(clampedAdjustment) * 2);
  }

  // Boost confidence for dimensions mentioned in new signals
  for (const signal of newSignals) {
    for (const dim of Object.keys(updatedDimensionScores)) {
      if (signal.toLowerCase().includes(dim.toLowerCase())) {
        const currentConfidence = updatedConfidenceScores[dim] ?? 20;
        updatedConfidenceScores[dim] = Math.min(100, currentConfidence + 3);
      }
    }
  }

  // Recalculate RIASEC code from updated dimension scores
  const riasecCode = computeRiasecCode(updatedDimensionScores);

  const updatedProfile: ComputedProfile = {
    riasecCode,
    dimensionScores: updatedDimensionScores,
    confidenceScores: updatedConfidenceScores,
    constraints: currentProfile.constraints,
  };

  const snapshot: ProfileSnapshot = {
    version: snapshotVersion,
    timestamp: Date.now(),
    computedProfile: updatedProfile,
    dimensionScores: updatedDimensionScores,
    riasecCode,
    trigger,
    deltas: Object.keys(deltas).length > 0 ? deltas : undefined,
  };

  return { updatedProfile, snapshot, deltas };
}

/**
 * Computes the top-3 RIASEC code string from dimension scores.
 * Returns a string like "SAE" representing the three highest-scoring RIASEC dimensions.
 */
function computeRiasecCode(dimensionScores: Record<string, number>): string {
  const sortedRiasec = RIASEC_DIMENSIONS
    .map((dim) => ({ dim, score: dimensionScores[dim] ?? 0 }))
    .sort((a, b) => b.score - a.score);

  return sortedRiasec
    .slice(0, 3)
    .map((r) => RIASEC_LETTER_MAP[r.dim])
    .join('');
}
