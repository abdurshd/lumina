/**
 * Report stability tracking.
 *
 * Compares two versions of a TalentReport to measure how much
 * the output changed between generations.
 */

import type { TalentReport } from '@/types';

export interface StabilityResult {
  careerPathChanges: number;
  radarDimensionShifts: Record<string, number>;
  strengthConsistency: number;
  overallStability: number;
}

/**
 * Compare two report versions and compute stability metrics.
 *
 * - careerPathChanges: count of career paths that differ between versions
 * - radarDimensionShifts: absolute difference per radar dimension
 * - strengthConsistency: Jaccard similarity of strength names (0-1)
 * - overallStability: weighted aggregate (0-1, higher = more stable)
 */
export function compareReportVersions(reportA: TalentReport, reportB: TalentReport): StabilityResult {
  // Career path changes: count titles present in one but not both
  const careersA = new Set(reportA.careerPaths.map((c) => c.title.toLowerCase()));
  const careersB = new Set(reportB.careerPaths.map((c) => c.title.toLowerCase()));
  let careerPathChanges = 0;
  for (const title of careersA) {
    if (!careersB.has(title)) careerPathChanges++;
  }
  for (const title of careersB) {
    if (!careersA.has(title)) careerPathChanges++;
  }

  // Radar dimension shifts: absolute difference per dimension label
  const radarMapA = buildRadarMap(reportA);
  const radarMapB = buildRadarMap(reportB);
  const allRadarKeys = new Set([...Object.keys(radarMapA), ...Object.keys(radarMapB)]);
  const radarDimensionShifts: Record<string, number> = {};
  let totalRadarShift = 0;

  for (const key of allRadarKeys) {
    const diff = Math.abs((radarMapA[key] ?? 0) - (radarMapB[key] ?? 0));
    radarDimensionShifts[key] = diff;
    totalRadarShift += diff;
  }

  const avgRadarShift = allRadarKeys.size > 0 ? totalRadarShift / allRadarKeys.size : 0;

  // Strength consistency: Jaccard similarity of strength names
  const strengthsA = new Set(reportA.topStrengths.map((s) => s.name.toLowerCase()));
  const strengthsB = new Set(reportB.topStrengths.map((s) => s.name.toLowerCase()));
  const strengthConsistency = jaccardSimilarity(strengthsA, strengthsB);

  // Career similarity for overall score
  const careerUnion = new Set([...careersA, ...careersB]).size;
  const careerSimilarity = careerUnion > 0
    ? (careersA.size + careersB.size - careerPathChanges) / (2 * careerUnion)
    : 1;

  // Radar stability: normalize shift to 0-1 (100-point scale)
  const radarStability = 1 - Math.min(1, avgRadarShift / 100);

  // Overall stability: weighted average
  const overallStability = 0.35 * careerSimilarity + 0.35 * strengthConsistency + 0.3 * radarStability;

  return {
    careerPathChanges,
    radarDimensionShifts,
    strengthConsistency,
    overallStability,
  };
}

/** Build a label -> value map from radar dimensions */
function buildRadarMap(report: TalentReport): Record<string, number> {
  const map: Record<string, number> = {};
  for (const dim of report.radarDimensions) {
    map[dim.label.toLowerCase()] = dim.value;
  }
  return map;
}

/** Jaccard similarity for two sets */
function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1;
  if (a.size === 0 || b.size === 0) return 0;

  let intersection = 0;
  for (const item of a) {
    if (b.has(item)) intersection++;
  }

  const union = new Set([...a, ...b]).size;
  return union > 0 ? intersection / union : 0;
}
