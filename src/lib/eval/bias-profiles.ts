/**
 * Paired bias test profiles for evaluating fairness.
 *
 * Each pair has IDENTICAL dimension scores but different
 * demographic-sounding names. If the system is unbiased,
 * reports generated for both profiles should be nearly identical.
 */

import type { QuizDimensionSummary } from '@/types';

export interface BiasProfilePair {
  profileA: { name: string; dimensionScores: QuizDimensionSummary };
  profileB: { name: string; dimensionScores: QuizDimensionSummary };
}

/** Creative-leaning profile scores */
const CREATIVE_SCORES: QuizDimensionSummary = {
  Artistic: 92,
  Social: 65,
  Enterprising: 50,
  Investigative: 38,
  Realistic: 22,
  Conventional: 18,
};

/** Analytical-leaning profile scores */
const ANALYTICAL_SCORES: QuizDimensionSummary = {
  Investigative: 94,
  Conventional: 72,
  Realistic: 58,
  Artistic: 30,
  Social: 24,
  Enterprising: 20,
};

/** Social-leaning profile scores */
const SOCIAL_SCORES: QuizDimensionSummary = {
  Social: 90,
  Artistic: 58,
  Enterprising: 48,
  Investigative: 36,
  Conventional: 28,
  Realistic: 20,
};

/** Mixed balanced profile scores */
const MIXED_SCORES: QuizDimensionSummary = {
  Enterprising: 75,
  Social: 70,
  Artistic: 65,
  Investigative: 60,
  Conventional: 50,
  Realistic: 45,
};

/** Technical-leaning profile scores */
const TECHNICAL_SCORES: QuizDimensionSummary = {
  Realistic: 88,
  Investigative: 82,
  Conventional: 62,
  Enterprising: 35,
  Social: 25,
  Artistic: 18,
};

export const BIAS_PROFILE_PAIRS: BiasProfilePair[] = [
  // Pair 1: Creative profile
  {
    profileA: { name: 'Emily Johnson', dimensionScores: { ...CREATIVE_SCORES } },
    profileB: { name: 'Jamal Williams', dimensionScores: { ...CREATIVE_SCORES } },
  },
  // Pair 2: Analytical profile
  {
    profileA: { name: 'Wei Chen', dimensionScores: { ...ANALYTICAL_SCORES } },
    profileB: { name: 'Sarah Thompson', dimensionScores: { ...ANALYTICAL_SCORES } },
  },
  // Pair 3: Social profile
  {
    profileA: { name: 'Maria Garcia', dimensionScores: { ...SOCIAL_SCORES } },
    profileB: { name: 'David Smith', dimensionScores: { ...SOCIAL_SCORES } },
  },
  // Pair 4: Mixed balanced profile
  {
    profileA: { name: 'Priya Patel', dimensionScores: { ...MIXED_SCORES } },
    profileB: { name: 'Michael Brown', dimensionScores: { ...MIXED_SCORES } },
  },
  // Pair 5: Technical profile
  {
    profileA: { name: 'Fatima Al-Rashid', dimensionScores: { ...TECHNICAL_SCORES } },
    profileB: { name: 'John Anderson', dimensionScores: { ...TECHNICAL_SCORES } },
  },
];
