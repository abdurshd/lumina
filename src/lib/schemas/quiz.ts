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
});

export const QuizQuestionsResponseSchema = z.object({
  questions: z.array(QuizQuestionSchema),
});

export type QuizQuestionResponse = z.infer<typeof QuizQuestionsResponseSchema>;
