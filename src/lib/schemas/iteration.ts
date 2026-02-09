import { z } from 'zod';

export const MicroChallengeSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.enum(['explore', 'create', 'connect', 'learn', 'reflect']),
  targetDimensions: z.array(z.string()),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  suggestedDuration: z.string(),
  status: z.enum(['suggested', 'accepted', 'in_progress', 'completed', 'skipped']),
  linkedCareerPath: z.string().optional(),
  evidence: z.string().optional(),
  reflection: z.string().optional(),
  createdAt: z.number(),
  completedAt: z.number().optional(),
});

export const MicroChallengeResponseSchema = z.object({
  challenges: z.array(z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum(['explore', 'create', 'connect', 'learn', 'reflect']),
    targetDimensions: z.array(z.string()),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    suggestedDuration: z.string(),
    linkedCareerPath: z.string().optional(),
  })),
});

export const ReflectionAnalysisSchema = z.object({
  sentiment: z.enum(['positive', 'neutral', 'negative', 'mixed']),
  extractedSignals: z.array(z.string()),
  dimensionUpdates: z.record(z.string(), z.number().min(-5).max(5)),
});

export const ProfileSnapshotSchema = z.object({
  version: z.number(),
  timestamp: z.number(),
  computedProfile: z.object({
    riasecCode: z.string(),
    dimensionScores: z.record(z.string(), z.number()),
    confidenceScores: z.record(z.string(), z.number()),
  }),
  dimensionScores: z.record(z.string(), z.number()),
  reportHeadline: z.string().optional(),
  riasecCode: z.string(),
  trigger: z.enum(['initial', 'quiz_retake', 'challenge_complete', 'reflection', 'feedback']),
  deltas: z.record(z.string(), z.number()).optional(),
});

export const ChallengeGenerationResponseSchema = MicroChallengeResponseSchema;

export type MicroChallengeResponse = z.infer<typeof MicroChallengeResponseSchema>;
export type ReflectionAnalysis = z.infer<typeof ReflectionAnalysisSchema>;
