import { z } from 'zod';
import type { ConfidenceProfile, ConfidenceSourceType } from '@/types';
import { computeDimensionConfidence } from './confidence';
import { getGeminiClientForUser } from '@/lib/gemini/client';
import { GEMINI_MODELS } from '@/lib/gemini/models';
import { safeParseJson, GeminiError } from '@/lib/api-helpers';
import { trackGeminiUsage } from '@/lib/gemini/byok';
import { AGENT_DATA_ANALYSIS_PROMPT } from '@/lib/gemini/prompts';

// --- Response Schema ---

const DimensionSignalSchema = z.object({
  dimension: z.string(),
  score: z.number().min(0).max(100),
  evidence: z.string(),
});

const DataAnalysisResultSchema = z.object({
  signals: z.array(DimensionSignalSchema),
  themes: z.array(z.string()),
  strengthenedDimensions: z.array(z.string()),
  missingDimensions: z.array(z.string()),
  recommendedNextSources: z.array(z.string()),
  summary: z.string(),
});

export type DimensionSignal = z.infer<typeof DimensionSignalSchema>;

export interface DataAnalysisResult {
  signals: DimensionSignal[];
  themes: string[];
  strengthenedDimensions: string[];
  missingDimensions: string[];
  recommendedNextSources: string[];
  summary: string;
  updatedConfidence: Record<string, number>;
}

// --- Main Analysis Function ---

/**
 * Analyze a connected data source using Gemini to extract dimension-mapped signals.
 * Returns extracted signals, updated confidence scores, and recommendations.
 */
export async function analyzeDataSource(params: {
  uid: string;
  source: string;
  rawData: string;
  existingProfile: ConfidenceProfile;
}): Promise<DataAnalysisResult> {
  const { uid, source, rawData, existingProfile } = params;

  // Build existing confidence context for the prompt
  const confidenceContext = Object.entries(existingProfile.dimensions)
    .map(([dim, dc]) => `  ${dim}: ${dc.confidence}% (${dc.sourceTypes.join(', ')})`)
    .join('\n');

  const promptText = `${AGENT_DATA_ANALYSIS_PROMPT}

SOURCE: ${source.toUpperCase()}

CURRENT DIMENSION CONFIDENCE:
${confidenceContext || '  No dimensions scored yet.'}

DATA TO ANALYZE:
${rawData.slice(0, 50000)}

Respond with valid JSON matching this schema:
{
  "signals": [{ "dimension": "string", "score": 0-100, "evidence": "string" }],
  "themes": ["string"],
  "strengthenedDimensions": ["string"],
  "missingDimensions": ["string"],
  "recommendedNextSources": ["string"],
  "summary": "string"
}`;

  const { client, keySource } = await getGeminiClientForUser({
    uid,
    model: GEMINI_MODELS.FAST,
  });

  const response = await client.models.generateContent({
    model: GEMINI_MODELS.FAST,
    contents: [{ role: 'user', parts: [{ text: promptText }] }],
    config: { responseMimeType: 'application/json' },
  });

  const text = response.text;
  if (!text) {
    throw new GeminiError('Agent data analysis returned empty response');
  }

  await trackGeminiUsage({
    uid,
    model: GEMINI_MODELS.FAST,
    feature: 'agent_data_analysis',
    keySource,
    inputChars: promptText.length,
    outputChars: text.length,
  });

  const jsonData = safeParseJson(text);
  const validated = DataAnalysisResultSchema.parse(jsonData);

  // Compute updated confidence for each dimension found in signals
  const updatedConfidence: Record<string, number> = {};
  for (const signal of validated.signals) {
    const existingDimension = existingProfile.dimensions[signal.dimension];
    const existingSources = existingDimension?.sources ?? [];
    const newSource = {
      type: 'data_source' as ConfidenceSourceType,
      dimension: signal.dimension,
      score: signal.score,
      evidence: `${source}: ${signal.evidence}`,
      timestamp: Date.now(),
    };
    const allSources = [...existingSources, newSource];
    updatedConfidence[signal.dimension] = computeDimensionConfidence(
      signal.dimension,
      allSources
    );
  }

  return {
    ...validated,
    updatedConfidence,
  };
}
