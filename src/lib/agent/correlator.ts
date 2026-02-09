import { z } from 'zod';
import type {
  DataInsight,
  QuizScore,
  SessionInsight,
  UserSignal,
  CorrelatedInsight,
} from '@/types';
import { getGeminiClientForUser } from '@/lib/gemini/client';
import { GEMINI_MODELS } from '@/lib/gemini/models';
import { safeParseJson, GeminiError } from '@/lib/api-helpers';
import { trackGeminiUsage } from '@/lib/gemini/byok';
import { AGENT_CORRELATION_PROMPT } from '@/lib/gemini/prompts';

// --- Response Schema ---

const EvidenceSourceSchema = z.object({
  sourceType: z.enum(['data_source', 'quiz', 'session']),
  sourceName: z.string(),
  excerpt: z.string(),
});

const CorrelatedInsightSchema = z.object({
  title: z.string(),
  description: z.string(),
  dimensions: z.array(z.string()),
  evidenceSources: z.array(EvidenceSourceSchema),
  correlationStrength: z.number().min(0).max(100),
  surpriseFactor: z.enum(['expected', 'moderate', 'surprising', 'very_surprising']),
  patternType: z.enum(['convergent', 'divergent', 'hidden_talent']),
});

const CorrelationResponseSchema = z.object({
  insights: z.array(CorrelatedInsightSchema),
  summary: z.string(),
});

// --- Helper: Build evidence summaries ---

function buildDataSummary(dataInsights: DataInsight[]): string {
  if (dataInsights.length === 0) return 'No connected data sources.';
  return dataInsights
    .map((d) =>
      `[${d.source.toUpperCase()}]\nSummary: ${d.summary}\nSkills: ${d.skills.join(', ')}\nInterests: ${d.interests.join(', ')}\nThemes: ${d.themes.join(', ')}`
    )
    .join('\n\n');
}

function buildQuizSummary(quizScores: QuizScore[]): string {
  if (quizScores.length === 0) return 'No quiz data.';

  // Aggregate dimension scores across all questions
  const dimensionAgg = new Map<string, { total: number; count: number; rationales: string[] }>();
  for (const qs of quizScores) {
    for (const ds of qs.dimensionScores) {
      const entry = dimensionAgg.get(ds.dimension) ?? { total: 0, count: 0, rationales: [] };
      entry.total += ds.score;
      entry.count += 1;
      if (ds.rationale) entry.rationales.push(ds.rationale);
      dimensionAgg.set(ds.dimension, entry);
    }
  }

  return Array.from(dimensionAgg.entries())
    .map(([dim, { total, count, rationales }]) => {
      const avg = Math.round(total / count);
      const topRationale = rationales.slice(0, 2).join('; ');
      return `${dim}: ${avg}/100 (${count} questions) — ${topRationale}`;
    })
    .join('\n');
}

function buildSessionSummary(
  sessionInsights: SessionInsight[],
  signals: UserSignal[]
): string {
  if (sessionInsights.length === 0 && signals.length === 0) return 'No session data.';

  const parts: string[] = [];

  if (sessionInsights.length > 0) {
    const byCat = new Map<string, SessionInsight[]>();
    for (const si of sessionInsights) {
      const existing = byCat.get(si.category) ?? [];
      existing.push(si);
      byCat.set(si.category, existing);
    }

    parts.push('Session Observations:');
    for (const [cat, items] of byCat.entries()) {
      const avgConfidence = Math.round(
        items.reduce((s, i) => s + i.confidence, 0) / items.length
      );
      const sample = items.slice(0, 2).map((i) => i.observation).join('; ');
      parts.push(`  ${cat} (${items.length}x, avg confidence ${avgConfidence}%): ${sample}`);
    }
  }

  if (signals.length > 0) {
    parts.push('\nUser Signals:');
    for (const sig of signals.slice(0, 10)) {
      parts.push(`  [${sig.source}] ${sig.signal} — ${sig.evidence} (confidence: ${sig.confidence}%)`);
    }
  }

  return parts.join('\n');
}

// --- Main Correlation Function ---

/**
 * Find cross-source patterns that no single source reveals alone.
 * Uses Gemini 3 Pro for deep multi-step reasoning.
 */
export async function correlateEvidence(params: {
  uid: string;
  dataInsights: DataInsight[];
  quizScores: QuizScore[];
  sessionInsights: SessionInsight[];
  signals: UserSignal[];
}): Promise<{ insights: CorrelatedInsight[]; summary: string }> {
  const { uid, dataInsights, quizScores, sessionInsights, signals } = params;

  // Build structured evidence
  const dataSummary = buildDataSummary(dataInsights);
  const quizSummary = buildQuizSummary(quizScores);
  const sessionSummary = buildSessionSummary(sessionInsights, signals);

  // Count available source types for context
  const sourceTypes: string[] = [];
  if (dataInsights.length > 0) sourceTypes.push(`data (${dataInsights.map((d) => d.source).join(', ')})`);
  if (quizScores.length > 0) sourceTypes.push('quiz');
  if (sessionInsights.length > 0 || signals.length > 0) sourceTypes.push('session');

  if (sourceTypes.length < 2) {
    return {
      insights: [],
      summary: 'Need at least 2 different source types to find cross-source correlations.',
    };
  }

  const promptText = `${AGENT_CORRELATION_PROMPT}

AVAILABLE SOURCE TYPES: ${sourceTypes.join(', ')}

--- DATA SOURCE ANALYSIS ---
${dataSummary}

--- QUIZ SCORES ---
${quizSummary}

--- SESSION OBSERVATIONS ---
${sessionSummary}

Respond with valid JSON matching this schema:
{
  "insights": [{
    "title": "string",
    "description": "string",
    "dimensions": ["string"],
    "evidenceSources": [{ "sourceType": "data_source"|"quiz"|"session", "sourceName": "string", "excerpt": "string" }],
    "correlationStrength": 0-100,
    "surpriseFactor": "expected"|"moderate"|"surprising"|"very_surprising",
    "patternType": "convergent"|"divergent"|"hidden_talent"
  }],
  "summary": "string"
}`;

  const { client, keySource } = await getGeminiClientForUser({
    uid,
    model: GEMINI_MODELS.DEEP,
  });

  const response = await client.models.generateContent({
    model: GEMINI_MODELS.DEEP,
    contents: [{ role: 'user', parts: [{ text: promptText }] }],
    config: { responseMimeType: 'application/json' },
  });

  const text = response.text;
  if (!text) {
    throw new GeminiError('Correlation agent returned empty response');
  }

  await trackGeminiUsage({
    uid,
    model: GEMINI_MODELS.DEEP,
    feature: 'agent_correlation',
    keySource,
    inputChars: promptText.length,
    outputChars: text.length,
  });

  const jsonData = safeParseJson(text);
  const validated = CorrelationResponseSchema.parse(jsonData);

  return validated;
}
