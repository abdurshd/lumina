/**
 * Evaluation benchmark runner.
 * Run with: npx tsx src/lib/eval/benchmark-runner.ts
 *
 * Tests the profile builder against synthetic profiles and measures accuracy.
 * Supports --json flag for structured output.
 */

import { SYNTHETIC_PROFILES } from './synthetic-profiles';
import { buildComputedProfile } from '../career/profile-builder';
import { getClustersByRiasec } from '../career/onet-clusters';
import { riasecAccuracy, recommendationOverlap, stabilityScore } from './metrics';

/** Known baseline values for regression detection */
const BASELINE = {
  avgRiasecAccuracy: 0.7,
  avgClusterOverlap: 0.3,
} as const;

/** Maximum acceptable accuracy drop before flagging regression (5%) */
const REGRESSION_THRESHOLD = 0.05;

export interface BenchmarkProfileResult {
  id: string;
  name: string;
  riasecAcc: number;
  clusterOverlap: number;
  computedRiasec: string;
  expectedRiasec: string;
}

export interface BenchmarkSummary {
  avgRiasecAccuracy: number;
  avgClusterOverlap: number;
  stability: number;
  profileCount: number;
  passing: boolean;
}

export interface BenchmarkResult {
  profiles: BenchmarkProfileResult[];
  summary: BenchmarkSummary;
  regressionDetected: boolean;
}

/**
 * Core benchmark logic extracted for reuse.
 * Runs all synthetic profiles through the profile builder and collects metrics.
 */
export function runBenchmarkSuite(): BenchmarkResult {
  const profiles: BenchmarkProfileResult[] = [];

  for (const profile of SYNTHETIC_PROFILES) {
    const computed = buildComputedProfile({
      quizDimensionScores: profile.dimensionScores,
    });

    const matchedClusters = getClustersByRiasec(computed.riasecCode)
      .slice(0, 3)
      .map((c) => c.id);

    const riasecAcc = riasecAccuracy(computed.riasecCode, profile.expectedRiasecCode);
    const clusterOvlp = recommendationOverlap(matchedClusters, profile.expectedClusters);

    profiles.push({
      id: profile.id,
      name: profile.name,
      riasecAcc,
      clusterOverlap: clusterOvlp,
      computedRiasec: computed.riasecCode,
      expectedRiasec: profile.expectedRiasecCode,
    });
  }

  const avgRiasecAccuracy = profiles.reduce((s, r) => s + r.riasecAcc, 0) / profiles.length;
  const avgClusterOverlap = profiles.reduce((s, r) => s + r.clusterOverlap, 0) / profiles.length;

  // Stability: run profile builder 5 times on first profile (deterministic, so should be 1.0)
  const stabilityCodes = Array.from({ length: 5 }, () =>
    buildComputedProfile({ quizDimensionScores: SYNTHETIC_PROFILES[0].dimensionScores }).riasecCode
  );
  const stability = stabilityScore(stabilityCodes);

  const passing = avgRiasecAccuracy >= 0.7 && avgClusterOverlap >= 0.3;

  // Regression detection: check if accuracy dropped more than threshold from baseline
  const riasecDrop = BASELINE.avgRiasecAccuracy - avgRiasecAccuracy;
  const clusterDrop = BASELINE.avgClusterOverlap - avgClusterOverlap;
  const regressionDetected = riasecDrop > REGRESSION_THRESHOLD || clusterDrop > REGRESSION_THRESHOLD;

  return {
    profiles,
    summary: {
      avgRiasecAccuracy,
      avgClusterOverlap,
      stability,
      profileCount: profiles.length,
      passing,
    },
    regressionDetected,
  };
}

/** CLI entry point */
function runBenchmarkCLI() {
  const jsonMode = process.argv.includes('--json');
  const result = runBenchmarkSuite();

  if (jsonMode) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log('=== Lumina Profile Builder Benchmark ===\n');

    for (const p of result.profiles) {
      console.log(
        `${p.id} ${p.name.padEnd(20)} | ` +
        `RIASEC: ${p.computedRiasec} (expected ${p.expectedRiasec}) acc=${p.riasecAcc.toFixed(2)} | ` +
        `overlap=${p.clusterOverlap.toFixed(2)}`
      );
    }

    console.log('\n=== Summary ===');
    console.log(`Profiles tested: ${result.summary.profileCount}`);
    console.log(`Avg RIASEC accuracy: ${(result.summary.avgRiasecAccuracy * 100).toFixed(1)}%`);
    console.log(`Avg cluster overlap: ${(result.summary.avgClusterOverlap * 100).toFixed(1)}%`);
    console.log(`Stability score: ${(result.summary.stability * 100).toFixed(1)}%`);

    if (result.regressionDetected) {
      console.log('\n[WARNING] Regression detected: accuracy dropped >5% from baseline');
    }

    console.log(`\nResult: ${result.summary.passing ? 'PASS' : 'FAIL'}`);
  }

  process.exit(result.summary.passing ? 0 : 1);
}

// Only run CLI when executed directly (not when imported as a module)
const isDirectExecution =
  typeof process !== 'undefined' &&
  process.argv[1] &&
  process.argv[1].includes('benchmark-runner');

if (isDirectExecution) {
  runBenchmarkCLI();
}
