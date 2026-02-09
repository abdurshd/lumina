import { z } from 'zod';

export const QuizQuestionSchema = z.object({
  id: z.string(),
  type: z.enum(['multiple_choice', 'slider', 'freetext']),
  question: z.string(),
  options: z.array(z.string()).optional(),
  sliderMin: z.number().optional(),
  sliderMax: z.number().optional(),
  sliderLabels: z.object({ min: z.string(), max: z.string() }).optional(),
  category: z.string(),
  dimension: z.string().optional(),
  scoringRubric: z.record(z.string(), z.number()).optional(),
});

export const QuizQuestionsResponseSchema = z.object({
  questions: z.array(QuizQuestionSchema),
});

export const QuizDimensionScoreSchema = z.object({
  dimension: z.string(),
  score: z.number().min(0).max(100),
  rationale: z.string(),
});

export const QuizScoreSchema = z.object({
  questionId: z.string(),
  dimensionScores: z.array(QuizDimensionScoreSchema),
});

export const QuizScoringResponseSchema = z.object({
  scores: z.array(QuizScoreSchema),
  dimensionSummary: z.record(z.string(), z.number()),
});

export type QuizQuestionResponse = z.infer<typeof QuizQuestionsResponseSchema>;
export type QuizScoringResponse = z.infer<typeof QuizScoringResponseSchema>;
