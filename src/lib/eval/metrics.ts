/**
 * Evaluation metrics — pure functions for measuring profile builder
 * and report generation quality.
 */

/**
 * Measures how well the computed RIASEC code matches the expected code.
 * Returns a score 0-1. Position-weighted: first letter matters most.
 */
export function riasecAccuracy(computed: string, expected: string): number {
  if (!computed || !expected) return 0;
  const weights = [3, 2, 1];
  let score = 0;
  let maxScore = 0;

  for (let i = 0; i < Math.min(3, expected.length); i++) {
    maxScore += weights[i];
    const idx = computed.indexOf(expected[i]);
    if (idx !== -1) {
      // Full credit if same position, partial credit if in code at all
      score += idx === i ? weights[i] : weights[i] * 0.5;
    }
  }

  return maxScore > 0 ? score / maxScore : 0;
}

/**
 * Measures overlap between recommended career clusters and expected clusters.
 * Returns Jaccard similarity (0-1).
 */
export function recommendationOverlap(computed: string[], expected: string[]): number {
  if (computed.length === 0 && expected.length === 0) return 1;
  if (computed.length === 0 || expected.length === 0) return 0;

  const computedSet = new Set(computed.map((s) => s.toLowerCase()));
  const expectedSet = new Set(expected.map((s) => s.toLowerCase()));

  let intersection = 0;
  for (const item of computedSet) {
    if (expectedSet.has(item)) intersection++;
  }

  const union = new Set([...computedSet, ...expectedSet]).size;
  return union > 0 ? intersection / union : 0;
}

/**
 * Measures stability of outputs across multiple runs.
 * Given an array of RIASEC codes from N runs, returns consistency score (0-1).
 */
export function stabilityScore(codes: string[]): number {
  if (codes.length <= 1) return 1;

  let totalSimilarity = 0;
  let comparisons = 0;

  for (let i = 0; i < codes.length; i++) {
    for (let j = i + 1; j < codes.length; j++) {
      totalSimilarity += riasecAccuracy(codes[i], codes[j]);
      comparisons++;
    }
  }

  return comparisons > 0 ? totalSimilarity / comparisons : 0;
}

/** Data shape for bias comparison between two generated reports */
export interface BiasReportData {
  careerPaths: string[];
  strengths: string[];
  radarScores: Record<string, number>;
}

export interface BiasScoreResult {
  careerDivergence: number;
  strengthDivergence: number;
  radarDivergence: number;
  overall: number;
}

/**
 * Computes bias divergence between two reports generated from identical inputs
 * but different demographic-sounding names.
 *
 * Lower scores = less bias. 0 = identical outputs, 1 = completely different.
 */
export function biasScore(reportA: BiasReportData, reportB: BiasReportData): BiasScoreResult {
  const careerDivergence = 1 - jaccardSimilarity(
    reportA.careerPaths.map((s) => s.toLowerCase()),
    reportB.careerPaths.map((s) => s.toLowerCase())
  );

  const strengthDivergence = 1 - jaccardSimilarity(
    reportA.strengths.map((s) => s.toLowerCase()),
    reportB.strengths.map((s) => s.toLowerCase())
  );

  const radarDivergence = averageAbsoluteDifference(reportA.radarScores, reportB.radarScores);

  const overall = 0.4 * careerDivergence + 0.3 * strengthDivergence + 0.3 * radarDivergence;

  return { careerDivergence, strengthDivergence, radarDivergence, overall };
}

/** Jaccard similarity: |intersection| / |union| */
function jaccardSimilarity(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 1;
  if (a.length === 0 || b.length === 0) return 0;

  const setA = new Set(a);
  const setB = new Set(b);

  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }

  const union = new Set([...setA, ...setB]).size;
  return union > 0 ? intersection / union : 0;
}

/** Average absolute difference of radar scores normalized to 0-1 */
function averageAbsoluteDifference(a: Record<string, number>, b: Record<string, number>): number {
  const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
  if (allKeys.size === 0) return 0;

  let totalDiff = 0;
  for (const key of allKeys) {
    const valA = a[key] ?? 0;
    const valB = b[key] ?? 0;
    totalDiff += Math.abs(valA - valB);
  }

  return totalDiff / (allKeys.size * 100);
}
