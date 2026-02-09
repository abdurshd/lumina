import { z } from 'zod';

export const RadarDimensionSchema = z.object({
  label: z.string(),
  value: z.number().min(0).max(100),
  description: z.string(),
});

export const EvidenceSourceSchema = z.object({
  source: z.string(),
  excerpt: z.string(),
});

export const StrengthSchema = z.object({
  name: z.string(),
  score: z.number().min(0).max(100),
  evidence: z.string(),
  evidenceSources: z.array(EvidenceSourceSchema).min(1),
  confidenceLevel: z.enum(['high', 'medium', 'low']),
});

export const CareerPathSchema = z.object({
  title: z.string(),
  match: z.number().min(0).max(100),
  description: z.string(),
  nextSteps: z.array(z.string()),
  riasecCodes: z.string(),
  onetCluster: z.string(),
  evidenceSources: z.array(z.string()).min(1),
  confidence: z.number().min(0).max(100),
  whyYou: z.string(),
});

export const ActionItemSchema = z.object({
  title: z.string(),
  description: z.string(),
  timeframe: z.string(),
  priority: z.enum(['high', 'medium', 'low']),
});

export const EvidenceRefSchema = z.object({
  type: z.enum(['quiz', 'session', 'data_source', 'signal']),
  questionId: z.string().optional(),
  transcriptTimestamp: z.number().optional(),
  excerpt: z.string(),
});

export const CareerRecommendationSchema = z.object({
  clusterId: z.string(),
  matchScore: z.number().min(0).max(100),
  confidence: z.number().min(0).max(100),
  whyYou: z.string(),
  whatYouDo: z.string(),
  howToTest: z.string(),
  skillsToBuild: z.array(z.string()).min(3).max(5),
  evidenceChain: z.array(EvidenceRefSchema).min(2),
});

export const TalentReportSchema = z.object({
  headline: z.string(),
  tagline: z.string(),
  radarDimensions: z.array(RadarDimensionSchema),
  topStrengths: z.array(StrengthSchema),
  hiddenTalents: z.array(z.string()),
  careerPaths: z.array(CareerPathSchema),
  actionPlan: z.array(ActionItemSchema),
  personalityInsights: z.array(z.string()),
  confidenceNotes: z.array(z.string()).min(1),
  careerRecommendations: z.array(CareerRecommendationSchema).optional(),
});

export type TalentReportResponse = z.infer<typeof TalentReportSchema>;
