import { z } from 'zod';

export const RadarDimensionSchema = z.object({
  label: z.string(),
  value: z.number().min(0).max(100),
  description: z.string(),
});

export const StrengthSchema = z.object({
  name: z.string(),
  score: z.number().min(0).max(100),
  evidence: z.string(),
});

export const CareerPathSchema = z.object({
  title: z.string(),
  match: z.number().min(0).max(100),
  description: z.string(),
  nextSteps: z.array(z.string()),
});

export const ActionItemSchema = z.object({
  title: z.string(),
  description: z.string(),
  timeframe: z.string(),
  priority: z.enum(['high', 'medium', 'low']),
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
});

export type TalentReportResponse = z.infer<typeof TalentReportSchema>;
