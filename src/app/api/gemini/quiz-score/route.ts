import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, errorResponse, ErrorCode, safeParseJson } from '@/lib/api-helpers';
import { getGeminiClient } from '@/lib/gemini/client';
import { GEMINI_MODELS } from '@/lib/gemini/models';
import { QUIZ_SCORING_PROMPT } from '@/lib/gemini/prompts';
import { z } from 'zod';
import type { QuizScore, QuizDimensionSummary } from '@/types';
import { ALL_PSYCHOMETRIC_DIMENSIONS, normalizeDimensionName } from '@/lib/psychometrics/dimension-model';

const RequestSchema = z.object({
  answers: z.array(z.object({
    questionId: z.string(),
    answer: z.union([z.string(), z.number()]),
  })),
  questions: z.array(z.object({
    id: z.string(),
    type: z.enum(['multiple_choice', 'slider', 'freetext']),
    question: z.string(),
    dimension: z.string(),
    scoringRubric: z.record(z.string(), z.number()).optional(),
    options: z.array(z.string()).optional(),
    sliderMin: z.number().optional(),
    sliderMax: z.number().optional(),
  })),
});

const FreetextResponseSchema = z.object({
  results: z.array(
    z.object({
      questionId: z.string(),
      dimensionScores: z.array(
        z.object({
          dimension: z.string(),
          score: z.number(),
          rationale: z.string(),
          confidence: z.number().min(0).max(1).optional(),
        }),
      ),
    }),
  ),
});

type ScoreSource = 'rubric' | 'slider' | 'freetext';

interface ScoreAtom {
  questionId: string;
  dimension: string;
  score: number;
  rationale: string;
  source: ScoreSource;
  confidence: number;
}

export async function POST(req: NextRequest) {
  const authResult = await verifyAuth(req);
  if (!authResult) {
    return errorResponse('Authentication required', ErrorCode.UNAUTHORIZED, 401);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse('Invalid request body', ErrorCode.BAD_REQUEST, 400);
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? 'Invalid request data', ErrorCode.VALIDATION_ERROR, 400);
  }

  const { answers, questions } = parsed.data;
  const questionMap = new Map(questions.map((q) => [q.id, q]));
  const scoreAtoms: ScoreAtom[] = [];
  const freetextToScore: { questionId: string; question: string; answer: string; dimension: string }[] = [];

  for (const answer of answers) {
    const question = questionMap.get(answer.questionId);
    if (!question) continue;

    const dimension = normalizeDimensionName(question.dimension ?? question.type);
    if (!dimension) continue;

    if (question.type === 'multiple_choice' && question.scoringRubric) {
      const rubricScore = question.scoringRubric[String(answer.answer)] ?? 50;
      scoreAtoms.push({
        questionId: answer.questionId,
        dimension,
        score: clampScore(rubricScore),
        rationale: 'Scored via rubric',
        source: 'rubric',
        confidence: 0.85,
      });
    } else if (question.type === 'slider') {
      const min = question.sliderMin ?? 0;
      const max = question.sliderMax ?? 100;
      const range = Math.max(1, max - min);
      const normalized = Math.round(((Number(answer.answer) - min) / range) * 100);
      scoreAtoms.push({
        questionId: answer.questionId,
        dimension,
        score: clampScore(normalized),
        rationale: 'Normalized slider value',
        source: 'slider',
        confidence: 0.75,
      });
    } else if (question.type === 'freetext') {
      freetextToScore.push({
        questionId: answer.questionId,
        question: question.question,
        answer: String(answer.answer),
        dimension,
      });
    }
  }

  // Batch score freetext answers with Gemini
  if (freetextToScore.length > 0) {
    try {
      const client = getGeminiClient();

      const context = freetextToScore.map((ft) =>
        `Question (${ft.questionId}, dimension: ${ft.dimension}): ${ft.question}\nAnswer: ${ft.answer}`
      ).join('\n\n');

      const response = await client.models.generateContent({
        model: GEMINI_MODELS.FAST,
        contents: [{
          role: 'user',
          parts: [{
            text: `${QUIZ_SCORING_PROMPT}

Allowed dimensions:
${ALL_PSYCHOMETRIC_DIMENSIONS.map((d) => `- ${d}`).join('\n')}

Score each of the following answers:

${context}

Return strict JSON:
{
  "results": [
    {
      "questionId": "string",
      "dimensionScores": [
        {
          "dimension": "string",
          "score": 0-100,
          "rationale": "string",
          "confidence": 0-1
        }
      ]
    }
  ]
}`,
          }],
        }],
        config: { responseMimeType: 'application/json' },
      });

      const text = response.text;
      if (text) {
        const parsedResponse = FreetextResponseSchema.safeParse(safeParseJson(text));
        if (parsedResponse.success) {
          for (const result of parsedResponse.data.results) {
            const defaultDimension = freetextToScore.find((item) => item.questionId === result.questionId)?.dimension;
            for (const dimensionScore of result.dimensionScores) {
              const normalizedDimension = normalizeDimensionName(dimensionScore.dimension)
                ?? (defaultDimension ? normalizeDimensionName(defaultDimension) : null);
              if (!normalizedDimension) continue;
              scoreAtoms.push({
                questionId: result.questionId,
                dimension: normalizedDimension,
                score: clampScore(dimensionScore.score),
                rationale: dimensionScore.rationale || 'Scored via freetext analysis',
                source: 'freetext',
                confidence: normalizeConfidence(dimensionScore.confidence ?? 0.6),
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('[Quiz Scoring Error]', error);
    }
  }

  // Fallback: give neutral scores for unanswered freetext items.
  const freetextQuestionIds = new Set(scoreAtoms.filter((atom) => atom.source === 'freetext').map((atom) => atom.questionId));
  for (const freetext of freetextToScore) {
    if (freetextQuestionIds.has(freetext.questionId)) continue;
    scoreAtoms.push({
      questionId: freetext.questionId,
      dimension: freetext.dimension,
      score: 50,
      rationale: 'AI scoring unavailable',
      source: 'freetext',
      confidence: 0.4,
    });
  }

  const scores: QuizScore[] = Array.from(
    scoreAtoms.reduce<Map<string, QuizScore>>((acc, atom) => {
      const existing = acc.get(atom.questionId) ?? { questionId: atom.questionId, dimensionScores: [] };
      existing.dimensionScores.push({
        dimension: atom.dimension,
        score: atom.score,
        rationale: atom.rationale,
        confidence: atom.confidence,
      });
      acc.set(atom.questionId, existing);
      return acc;
    }, new Map()),
  ).map(([, score]) => score);

  // Compute normalized dimension summary and calibrated confidence.
  const byDimension = new Map<string, ScoreAtom[]>();
  for (const atom of scoreAtoms) {
    const current = byDimension.get(atom.dimension) ?? [];
    current.push(atom);
    byDimension.set(atom.dimension, current);
  }

  const dimensionSummary: QuizDimensionSummary = {};
  const dimensionConfidence: QuizDimensionSummary = {};

  for (const [dimension, atoms] of byDimension.entries()) {
    const scoresByWeight = winsorizeScores(atoms.map((atom) => atom.score));
    let weightedSum = 0;
    let totalWeight = 0;

    for (let i = 0; i < atoms.length; i++) {
      const atom = atoms[i];
      const sourceWeight = atom.source === 'rubric' ? 1 : atom.source === 'slider' ? 0.9 : 0.8;
      weightedSum += scoresByWeight[i] * sourceWeight;
      totalWeight += sourceWeight;
    }

    const summaryScore = totalWeight > 0 ? weightedSum / totalWeight : 50;
    dimensionSummary[dimension] = clampScore(summaryScore);

    const sourceDiversity = new Set(atoms.map((atom) => atom.source)).size / 3;
    const coverage = Math.min(1, atoms.length / 3);
    const signalQuality = atoms.reduce((sum, atom) => sum + normalizeConfidence(atom.confidence), 0) / atoms.length;
    const calibratedConfidence = Math.round((0.45 * coverage + 0.25 * sourceDiversity + 0.3 * signalQuality) * 100);
    dimensionConfidence[dimension] = clampScore(Math.max(20, calibratedConfidence));
  }

  return NextResponse.json({ scores, dimensionSummary, dimensionConfidence });
}

function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function normalizeConfidence(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value > 1 ? value / 100 : value));
}

function winsorizeScores(values: number[]): number[] {
  if (values.length < 4) return values.map((value) => clampScore(value));
  const sorted = [...values].sort((a, b) => a - b);
  const low = sorted[1];
  const high = sorted[sorted.length - 2];
  return sorted.map((value) => Math.max(low, Math.min(high, value)));
}
