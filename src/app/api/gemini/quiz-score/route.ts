import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, errorResponse, ErrorCode, safeParseJson } from '@/lib/api-helpers';
import { getGeminiClient } from '@/lib/gemini/client';
import { GEMINI_MODELS } from '@/lib/gemini/models';
import { QUIZ_SCORING_PROMPT } from '@/lib/gemini/prompts';
import { z } from 'zod';
import type { QuizScore, QuizDimensionSummary } from '@/types';

const RequestSchema = z.object({
  answers: z.array(z.object({
    questionId: z.string(),
    answer: z.union([z.string(), z.number()]),
  })),
  questions: z.array(z.object({
    id: z.string(),
    type: z.enum(['multiple_choice', 'slider', 'freetext']),
    question: z.string(),
    dimension: z.string().optional(),
    scoringRubric: z.record(z.string(), z.number()).optional(),
    options: z.array(z.string()).optional(),
    sliderMin: z.number().optional(),
    sliderMax: z.number().optional(),
  })),
});

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
  const scores: QuizScore[] = [];
  const freetextToScore: { questionId: string; question: string; answer: string; dimension: string }[] = [];

  for (const answer of answers) {
    const question = questionMap.get(answer.questionId);
    if (!question) continue;

    const dimension = question.dimension ?? question.type;

    if (question.type === 'multiple_choice' && question.scoringRubric) {
      const rubricScore = question.scoringRubric[String(answer.answer)] ?? 50;
      scores.push({
        questionId: answer.questionId,
        dimensionScores: [{ dimension, score: rubricScore, rationale: 'Scored via rubric' }],
      });
    } else if (question.type === 'slider') {
      const min = question.sliderMin ?? 0;
      const max = question.sliderMax ?? 100;
      const normalized = Math.round(((Number(answer.answer) - min) / (max - min)) * 100);
      scores.push({
        questionId: answer.questionId,
        dimensionScores: [{ dimension, score: Math.max(0, Math.min(100, normalized)), rationale: 'Normalized slider value' }],
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
            text: `${QUIZ_SCORING_PROMPT}\n\nScore each of the following answers:\n\n${context}\n\nReturn JSON: { "results": [{ "questionId": "string", "dimensionScores": [{ "dimension": "string", "score": 0-100, "rationale": "string" }] }] }`,
          }],
        }],
        config: { responseMimeType: 'application/json' },
      });

      const text = response.text;
      if (text) {
        const parsed = safeParseJson(text) as { results: QuizScore[] };
        if (parsed.results) {
          scores.push(...parsed.results);
        }
      }
    } catch (error) {
      console.error('[Quiz Scoring Error]', error);
      // Fallback: give neutral scores for freetext
      for (const ft of freetextToScore) {
        scores.push({
          questionId: ft.questionId,
          dimensionScores: [{ dimension: ft.dimension, score: 50, rationale: 'AI scoring unavailable' }],
        });
      }
    }
  }

  // Compute dimension summary (average scores per dimension)
  const dimensionTotals: Record<string, { sum: number; count: number }> = {};
  for (const score of scores) {
    for (const ds of score.dimensionScores) {
      if (!dimensionTotals[ds.dimension]) {
        dimensionTotals[ds.dimension] = { sum: 0, count: 0 };
      }
      dimensionTotals[ds.dimension].sum += ds.score;
      dimensionTotals[ds.dimension].count += 1;
    }
  }

  const dimensionSummary: QuizDimensionSummary = {};
  for (const [dim, totals] of Object.entries(dimensionTotals)) {
    dimensionSummary[dim] = Math.round(totals.sum / totals.count);
  }

  return NextResponse.json({ scores, dimensionSummary });
}
