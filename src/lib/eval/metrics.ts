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
