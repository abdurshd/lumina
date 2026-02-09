import { z } from 'zod';

export const QuizModuleIdSchema = z.enum(['interests', 'work_values', 'strengths_skills', 'learning_environment', 'constraints']);

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
  moduleId: QuizModuleIdSchema.optional(),
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

export const QuizModuleProgressSchema = z.object({
  moduleId: QuizModuleIdSchema,
  status: z.enum(['pending', 'in_progress', 'completed']),
  answeredCount: z.number().min(0),
  totalCount: z.number().min(0),
});

export const UserConstraintsSchema = z.object({
  locationFlexibility: z.enum(['anywhere', 'prefer_remote', 'specific_location', 'no_preference']),
  salaryPriority: z.enum(['critical', 'important', 'flexible']),
  timeAvailability: z.enum(['full_time', 'part_time', 'flexible', 'transitioning']),
  educationWillingness: z.enum(['none', 'short_courses', 'certificate', 'degree']),
  relocationWillingness: z.enum(['yes', 'maybe', 'no']),
});

export type QuizQuestionResponse = z.infer<typeof QuizQuestionsResponseSchema>;
export type QuizScoringResponse = z.infer<typeof QuizScoringResponseSchema>;
