/**
 * Evaluation benchmark runner.
 * Run with: npx tsx src/lib/eval/benchmark-runner.ts
 *
 * Tests the profile builder against synthetic profiles and measures accuracy.
 */

import { SYNTHETIC_PROFILES } from './synthetic-profiles';
import { buildComputedProfile } from '../career/profile-builder';
import { getClustersByRiasec } from '../career/onet-clusters';
import { riasecAccuracy, recommendationOverlap, stabilityScore } from './metrics';

function runBenchmark() {
  console.log('=== Lumina Profile Builder Benchmark ===\n');

  const results: { id: string; name: string; riasecAcc: number; clusterOverlap: number }[] = [];

  for (const profile of SYNTHETIC_PROFILES) {
    const computed = buildComputedProfile({
      quizDimensionScores: profile.dimensionScores,
    });

    const matchedClusters = getClustersByRiasec(computed.riasecCode)
      .slice(0, 3)
      .map((c) => c.id);

    const riasecAcc = riasecAccuracy(computed.riasecCode, profile.expectedRiasecCode);
    const clusterOvlp = recommendationOverlap(matchedClusters, profile.expectedClusters);

    results.push({
      id: profile.id,
      name: profile.name,
      riasecAcc,
      clusterOverlap: clusterOvlp,
    });

    console.log(
      `${profile.id} ${profile.name.padEnd(20)} | ` +
      `RIASEC: ${computed.riasecCode} (expected ${profile.expectedRiasecCode}) acc=${riasecAcc.toFixed(2)} | ` +
      `Clusters: [${matchedClusters.join(', ')}] (expected [${profile.expectedClusters.join(', ')}]) overlap=${clusterOvlp.toFixed(2)}`
    );
  }

  const avgRiasec = results.reduce((s, r) => s + r.riasecAcc, 0) / results.length;
  const avgCluster = results.reduce((s, r) => s + r.clusterOverlap, 0) / results.length;

  // Stability: run profile builder 5 times on first profile (deterministic, so should be 1.0)
  const stabilityCodes = Array.from({ length: 5 }, () =>
    buildComputedProfile({ quizDimensionScores: SYNTHETIC_PROFILES[0].dimensionScores }).riasecCode
  );
  const stability = stabilityScore(stabilityCodes);

  console.log('\n=== Summary ===');
  console.log(`Profiles tested: ${results.length}`);
  console.log(`Avg RIASEC accuracy: ${(avgRiasec * 100).toFixed(1)}%`);
  console.log(`Avg cluster overlap: ${(avgCluster * 100).toFixed(1)}%`);
  console.log(`Stability score: ${(stability * 100).toFixed(1)}%`);

  const passing = avgRiasec >= 0.7 && avgCluster >= 0.3;
  console.log(`\nResult: ${passing ? 'PASS' : 'FAIL'}`);

  process.exit(passing ? 0 : 1);
}

runBenchmark();
