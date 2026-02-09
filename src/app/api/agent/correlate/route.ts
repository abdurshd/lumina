import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAuth, errorResponse, ErrorCode } from '@/lib/api-helpers';
import { correlateEvidence } from '@/lib/agent/correlator';
import type { DataInsight, QuizScore, SessionInsight, UserSignal } from '@/types';

const DataInsightSchema = z.object({
  source: z.enum(['gmail', 'drive', 'notion', 'chatgpt', 'file_upload']),
  summary: z.string(),
  themes: z.array(z.string()),
  skills: z.array(z.string()),
  interests: z.array(z.string()),
  rawTokenCount: z.number(),
});

const QuizScoreSchema = z.object({
  questionId: z.string(),
  dimensionScores: z.array(
    z.object({
      dimension: z.string(),
      score: z.number(),
      rationale: z.string(),
      confidence: z.number().optional(),
    })
  ),
});

const SessionInsightSchema = z.object({
  timestamp: z.number(),
  observation: z.string(),
  category: z.enum([
    'engagement',
    'hesitation',
    'emotional_intensity',
    'clarity_structure',
    'collaboration_orientation',
    'body_language',
    'voice_tone',
    'enthusiasm',
    'analytical',
    'creative',
    'interpersonal',
  ]),
  confidence: z.number(),
  evidence: z.string().optional(),
  dimension: z.string().optional(),
});

const UserSignalSchema = z.object({
  id: z.string(),
  signal: z.string(),
  source: z.string(),
  evidence: z.string(),
  confidence: z.number(),
  timestamp: z.number(),
  dimensions: z.array(z.string()).optional(),
});

const RequestSchema = z.object({
  dataInsights: z.array(DataInsightSchema),
  quizScores: z.array(QuizScoreSchema),
  sessionInsights: z.array(SessionInsightSchema),
  signals: z.array(UserSignalSchema),
});

export async function POST(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (!auth) {
    return errorResponse('Unauthorized', ErrorCode.UNAUTHORIZED, 401);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse('Invalid JSON body', ErrorCode.BAD_REQUEST, 400);
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(
      'Invalid request data',
      ErrorCode.VALIDATION_ERROR,
      400,
      parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')
    );
  }

  try {
    const result = await correlateEvidence({
      uid: auth.uid,
      dataInsights: parsed.data.dataInsights as DataInsight[],
      quizScores: parsed.data.quizScores as QuizScore[],
      sessionInsights: parsed.data.sessionInsights as SessionInsight[],
      signals: parsed.data.signals as UserSignal[],
    });

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Correlation failed';
    return errorResponse(message, ErrorCode.INTERNAL_ERROR, 500);
  }
}
