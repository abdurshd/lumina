import { z } from 'zod';

const VALID_SOURCES = ['gmail', 'drive', 'notion', 'chatgpt', 'file_upload', 'gemini_app', 'claude_app'] as const;
type ValidSource = typeof VALID_SOURCES[number];

/** Coerce any value into a string array — handles objects, missing values, etc. */
function coerceStringArray(val: unknown): string[] {
  if (Array.isArray(val)) return val.filter((v): v is string => typeof v === 'string');
  if (val && typeof val === 'object') return Object.values(val).filter((v): v is string => typeof v === 'string');
  return [];
}

export const DataInsightSchema = z.object({
  source: z.string().transform((s): ValidSource => {
    const lower = s.toLowerCase();
    // Match against known source keywords anywhere in the string
    if (lower.includes('gmail') || lower.includes('google mail')) return 'gmail';
    if (lower.includes('drive') || lower.includes('google doc')) return 'drive';
    if (lower.includes('notion')) return 'notion';
    if (lower.includes('chatgpt') || lower.includes('openai')) return 'chatgpt';
    if (lower.includes('gemini')) return 'gemini_app';
    if (lower.includes('claude') || lower.includes('anthropic')) return 'claude_app';
    if (lower.includes('file') || lower.includes('upload') || lower.includes('resume') || lower.includes('portfolio')) return 'file_upload';
    // Default to gmail since that's the most common source
    return 'gmail';
  }),
  summary: z.string(),
  themes: z.unknown().transform(coerceStringArray).default([]),
  skills: z.unknown().transform(coerceStringArray).default([]),
  interests: z.unknown().transform(coerceStringArray).default([]),
  rawTokenCount: z.coerce.number().default(0),
});

export const AnalysisResponseSchema = z.object({
  insights: z.array(DataInsightSchema),
  overallSummary: z.string().optional().default(''),
  keyPatterns: z.unknown().transform(coerceStringArray).default([]),
});

export type AnalysisResponse = z.infer<typeof AnalysisResponseSchema>;
