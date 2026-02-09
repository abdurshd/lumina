import { z } from 'zod';

export const DataInsightSchema = z.object({
  source: z.enum(['gmail', 'drive', 'notion', 'chatgpt', 'file_upload']),
  summary: z.string(),
  themes: z.array(z.string()),
  skills: z.array(z.string()),
  interests: z.array(z.string()),
  rawTokenCount: z.number(),
});

export const AnalysisResponseSchema = z.object({
  insights: z.array(DataInsightSchema),
  overallSummary: z.string(),
  keyPatterns: z.array(z.string()),
});

export type AnalysisResponse = z.infer<typeof AnalysisResponseSchema>;
