/**
 * Synthetic test profiles for benchmarking the profile builder and report generator.
 * Each profile has dimension scores and expected RIASEC code + career clusters.
 */

import type { QuizDimensionSummary } from '@/types';

export interface SyntheticProfile {
  id: string;
  name: string;
  dimensionScores: QuizDimensionSummary;
  expectedRiasecCode: string;
  expectedClusters: string[];
}

export const SYNTHETIC_PROFILES: SyntheticProfile[] = [
  { id: 'p01', name: 'Creative Designer', dimensionScores: { Artistic: 90, Social: 60, Enterprising: 50, Investigative: 40, Realistic: 20, Conventional: 15 }, expectedRiasecCode: 'ASE', expectedClusters: ['arts', 'marketing'] },
  { id: 'p02', name: 'Data Scientist', dimensionScores: { Investigative: 95, Conventional: 70, Realistic: 55, Artistic: 30, Social: 25, Enterprising: 20 }, expectedRiasecCode: 'ICR', expectedClusters: ['it', 'science'] },
  { id: 'p03', name: 'Social Worker', dimensionScores: { Social: 92, Artistic: 55, Enterprising: 45, Investigative: 35, Conventional: 30, Realistic: 20 }, expectedRiasecCode: 'SAE', expectedClusters: ['human_services', 'education'] },
  { id: 'p04', name: 'Entrepreneur', dimensionScores: { Enterprising: 88, Social: 65, Artistic: 50, Investigative: 40, Conventional: 35, Realistic: 20 }, expectedRiasecCode: 'ESA', expectedClusters: ['business', 'marketing'] },
  { id: 'p05', name: 'Engineer', dimensionScores: { Realistic: 90, Investigative: 80, Conventional: 60, Enterprising: 30, Social: 25, Artistic: 20 }, expectedRiasecCode: 'RIC', expectedClusters: ['science', 'architecture'] },
  { id: 'p06', name: 'Teacher', dimensionScores: { Social: 85, Artistic: 60, Investigative: 50, Enterprising: 45, Conventional: 40, Realistic: 20 }, expectedRiasecCode: 'SAI', expectedClusters: ['education', 'human_services'] },
  { id: 'p07', name: 'Accountant', dimensionScores: { Conventional: 90, Investigative: 65, Enterprising: 50, Realistic: 35, Social: 30, Artistic: 15 }, expectedRiasecCode: 'CIE', expectedClusters: ['finance', 'business'] },
  { id: 'p08', name: 'Nurse', dimensionScores: { Social: 88, Investigative: 70, Realistic: 55, Conventional: 45, Artistic: 20, Enterprising: 20 }, expectedRiasecCode: 'SIR', expectedClusters: ['health', 'human_services'] },
  { id: 'p09', name: 'Marketing Manager', dimensionScores: { Enterprising: 85, Artistic: 70, Social: 65, Investigative: 40, Conventional: 30, Realistic: 15 }, expectedRiasecCode: 'EAS', expectedClusters: ['marketing', 'business'] },
  { id: 'p10', name: 'Software Developer', dimensionScores: { Investigative: 88, Realistic: 65, Conventional: 60, Artistic: 35, Enterprising: 25, Social: 20 }, expectedRiasecCode: 'IRC', expectedClusters: ['it', 'science'] },
  { id: 'p11', name: 'Chef', dimensionScores: { Realistic: 80, Artistic: 75, Enterprising: 55, Social: 45, Conventional: 30, Investigative: 25 }, expectedRiasecCode: 'RAE', expectedClusters: ['hospitality', 'arts'] },
  { id: 'p12', name: 'Lawyer', dimensionScores: { Enterprising: 85, Investigative: 75, Social: 55, Conventional: 50, Artistic: 30, Realistic: 15 }, expectedRiasecCode: 'EIS', expectedClusters: ['law', 'government'] },
  { id: 'p13', name: 'Scientist', dimensionScores: { Investigative: 95, Realistic: 60, Conventional: 55, Artistic: 40, Enterprising: 20, Social: 20 }, expectedRiasecCode: 'IRC', expectedClusters: ['science', 'health'] },
  { id: 'p14', name: 'Event Planner', dimensionScores: { Enterprising: 78, Social: 75, Artistic: 70, Conventional: 45, Investigative: 25, Realistic: 20 }, expectedRiasecCode: 'ESA', expectedClusters: ['hospitality', 'marketing'] },
  { id: 'p15', name: 'Mechanic', dimensionScores: { Realistic: 92, Investigative: 55, Conventional: 50, Enterprising: 30, Social: 20, Artistic: 15 }, expectedRiasecCode: 'RIC', expectedClusters: ['manufacturing', 'transportation'] },
  { id: 'p16', name: 'Writer', dimensionScores: { Artistic: 92, Investigative: 60, Social: 55, Enterprising: 35, Conventional: 20, Realistic: 15 }, expectedRiasecCode: 'AIS', expectedClusters: ['arts', 'education'] },
  { id: 'p17', name: 'Financial Advisor', dimensionScores: { Enterprising: 80, Conventional: 75, Investigative: 55, Social: 50, Realistic: 20, Artistic: 15 }, expectedRiasecCode: 'ECI', expectedClusters: ['finance', 'business'] },
  { id: 'p18', name: 'Physical Therapist', dimensionScores: { Social: 85, Realistic: 70, Investigative: 65, Conventional: 40, Artistic: 25, Enterprising: 25 }, expectedRiasecCode: 'SRI', expectedClusters: ['health', 'human_services'] },
  { id: 'p19', name: 'Graphic Artist', dimensionScores: { Artistic: 95, Realistic: 50, Investigative: 45, Social: 40, Enterprising: 30, Conventional: 20 }, expectedRiasecCode: 'ARI', expectedClusters: ['arts', 'it'] },
  { id: 'p20', name: 'Policy Analyst', dimensionScores: { Investigative: 80, Social: 70, Enterprising: 65, Conventional: 55, Artistic: 30, Realistic: 20 }, expectedRiasecCode: 'ISE', expectedClusters: ['government', 'education'] },
];
