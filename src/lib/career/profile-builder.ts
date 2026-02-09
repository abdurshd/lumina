import type { ComputedProfile, UserSignal, UserConstraints, QuizDimensionSummary, SessionInsight } from '@/types';
import {
  BEHAVIORAL_SIGNAL_FACTORS,
  normalizeDimensionName,
  RIASEC_DIMENSIONS,
  SESSION_CATEGORY_DIMENSION_WEIGHTS,
  type PsychometricDimension,
} from '@/lib/psychometrics/dimension-model';

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
  sessionInsights?: SessionInsight[];
  constraints?: UserConstraints;
  dimensionConfidence?: QuizDimensionSummary;
}

/**
 * Pure deterministic function: takes quiz dimension scores + signals + constraints
 * and returns a ComputedProfile with RIASEC code + confidence scores.
 */
export function buildComputedProfile(input: ProfileBuilderInput): ComputedProfile {
  const {
    quizDimensionScores,
    signals,
    sessionInsights,
    constraints,
    dimensionConfidence,
  } = input;
  const normalizedQuizScores = normalizeDimensionScores(quizDimensionScores);

  // Start from quiz-derived dimension values.
  const dimensionScores: Record<string, number> = { ...normalizedQuizScores };
  for (const dim of RIASEC_DIMENSIONS) {
    dimensionScores[dim] = normalizedQuizScores[dim] ?? 0;
  }
  for (const factor of BEHAVIORAL_SIGNAL_FACTORS) {
    if (!(factor in dimensionScores)) {
      dimensionScores[factor] = 0;
    }
  }

  const signalSupport: Record<string, number> = {};
  const sessionSupport: Record<string, number> = {};

  // Calibrated boost from explicit talent signals.
  for (const signal of signals ?? []) {
    const conf = normalizeConfidence(signal.confidence);
    for (const rawDimension of signal.dimensions ?? []) {
      const dim = normalizeDimensionName(rawDimension);
      if (!dim) continue;
      dimensionScores[dim] = clampScore((dimensionScores[dim] ?? 0) + conf * 10);
      signalSupport[dim] = (signalSupport[dim] ?? 0) + 1;
    }
  }

  // Convert live-session observations into bounded support signals.
  for (const insight of sessionInsights ?? []) {
    const conf = normalizeConfidence(insight.confidence);
    const mapped = SESSION_CATEGORY_DIMENSION_WEIGHTS[insight.category];
    if (!mapped) continue;

    for (const [rawDimension, weight] of Object.entries(mapped)) {
      if (typeof weight !== 'number') continue;
      const dim = normalizeDimensionName(rawDimension);
      if (!dim) continue;

      const isBehaviorFactor = BEHAVIORAL_SIGNAL_FACTORS.includes(dim as (typeof BEHAVIORAL_SIGNAL_FACTORS)[number]);
      const delta = isBehaviorFactor ? conf * weight * 100 : conf * weight * 12;
      dimensionScores[dim] = clampScore((dimensionScores[dim] ?? 0) + delta);
      sessionSupport[dim] = (sessionSupport[dim] ?? 0) + 1;
    }
  }

  calibrateRiasecDistribution(dimensionScores);

  // Sort RIASEC dimensions by score descending, take top 3 for code
  const sortedRiasec = RIASEC_DIMENSIONS
    .map((dim) => ({ dim, score: dimensionScores[dim] }))
    .sort((a, b) => b.score - a.score);

  const riasecCode = sortedRiasec
    .slice(0, 3)
    .map((r) => RIASEC_LETTER_MAP[r.dim])
    .join('');

  // Compute confidence scores based on multi-source coverage + calibrated quiz confidence.
  const confidenceScores: Record<string, number> = {};
  const quizDimCount = Object.keys(normalizedQuizScores).length;

  for (const dim of Object.keys(dimensionScores)) {
    const quizValue = normalizedQuizScores[dim];
    const hasQuizData = typeof quizValue === 'number';
    const signalEvidence = signalSupport[dim] ?? 0;
    const sessionEvidence = sessionSupport[dim] ?? 0;
    const baseline = 15
      + (hasQuizData ? 45 : 0)
      + Math.min(15, signalEvidence * 5)
      + Math.min(15, sessionEvidence * 5)
      + (quizDimCount >= 8 ? 10 : 0);
    const providedConfidence = dimensionConfidence?.[dim];
    const calibrated = typeof providedConfidence === 'number'
      ? Math.round((baseline * 0.6) + (clampScore(providedConfidence) * 0.4))
      : baseline;

    confidenceScores[dim] = clampScore(calibrated);
  }

  return {
    riasecCode,
    dimensionScores,
    confidenceScores,
    constraints,
  };
}

function normalizeDimensionScores(scores: QuizDimensionSummary): Record<string, number> {
  const byDimension = new Map<PsychometricDimension, number[]>();

  for (const [rawDimension, rawScore] of Object.entries(scores)) {
    const dimension = normalizeDimensionName(rawDimension);
    if (!dimension) continue;
    const clamped = clampScore(rawScore);
    const existing = byDimension.get(dimension) ?? [];
    existing.push(clamped);
    byDimension.set(dimension, existing);
  }

  const normalized: Partial<Record<PsychometricDimension, number>> = {};
  for (const [dimension, values] of byDimension.entries()) {
    const winsorized = winsorize(values);
    const avg = winsorized.reduce((sum, value) => sum + value, 0) / winsorized.length;
    normalized[dimension] = Math.round(avg);
  }

  return normalized as Record<string, number>;
}

function winsorize(values: number[]): number[] {
  if (values.length < 4) return values.map((value) => clampScore(value));
  const sorted = [...values].sort((a, b) => a - b);
  const lower = sorted[1];
  const upper = sorted[sorted.length - 2];
  return sorted.map((value) => Math.max(lower, Math.min(upper, value)));
}

function calibrateRiasecDistribution(dimensionScores: Record<string, number>): void {
  const values = RIASEC_DIMENSIONS.map((dim) => dimensionScores[dim] ?? 0);
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  const std = Math.sqrt(variance) || 1;

  for (const dim of RIASEC_DIMENSIONS) {
    const raw = dimensionScores[dim] ?? 0;
    const zScore = (raw - mean) / std;
    const normalized = clampScore(50 + zScore * 15);
    dimensionScores[dim] = Math.round((raw * 0.7) + (normalized * 0.3));
  }
}

function normalizeConfidence(raw: number): number {
  if (raw > 1) return clampScore(raw) / 100;
  return Math.max(0, Math.min(1, raw));
}

function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}
