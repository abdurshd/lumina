import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAuth, errorResponse, ErrorCode } from '@/lib/api-helpers';
import { evaluateState } from '@/lib/agent/orchestrator';
import type { ConfidenceProfile, DimensionGap, QuizModuleId } from '@/types';
import type { AgentState, AgentDecision, EvaluateResponse } from '@/lib/agent/types';

const QuizModuleIds: [string, ...string[]] = [
  'interests',
  'work_values',
  'strengths_skills',
  'learning_environment',
  'constraints',
];

const ConfidenceSourceSchema = z.object({
  type: z.enum(['quiz', 'session', 'data_source']),
  dimension: z.string(),
  score: z.number().min(0).max(100),
  evidence: z.string(),
  timestamp: z.number(),
});

const DimensionConfidenceSchema = z.object({
  dimension: z.string(),
  confidence: z.number().min(0).max(100),
  sourceCount: z.number(),
  sourceTypes: z.array(z.enum(['quiz', 'session', 'data_source'])),
  sources: z.array(ConfidenceSourceSchema),
});

const ConfidenceProfileSchema = z.object({
  dimensions: z.record(z.string(), DimensionConfidenceSchema),
  overallConfidence: z.number().min(0).max(100),
  lastUpdated: z.number(),
});

const DimensionGapSchema = z.object({
  dimension: z.string(),
  currentConfidence: z.number(),
  targetConfidence: z.number(),
  missingSourceTypes: z.array(z.enum(['quiz', 'session', 'data_source'])),
  importance: z.number(),
});

const RequestSchema = z.object({
  connectedSources: z.array(z.string()),
  quizCompletedModules: z.array(z.enum(QuizModuleIds)),
  quizInProgressModules: z.array(z.enum(QuizModuleIds)).optional().default([]),
  sessionCompleted: z.boolean(),
  sessionInsightsCount: z.number().int().min(0),
  confidenceProfile: ConfidenceProfileSchema,
  gaps: z.array(DimensionGapSchema),
  reportGenerated: z.boolean(),
  overallConfidence: z.number().min(0).max(100),
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

  const agentState: AgentState = {
    connectedSources: parsed.data.connectedSources,
    quizCompletedModules: parsed.data.quizCompletedModules as QuizModuleId[],
    quizInProgressModules: parsed.data.quizInProgressModules as QuizModuleId[],
    sessionCompleted: parsed.data.sessionCompleted,
    sessionInsightsCount: parsed.data.sessionInsightsCount,
    confidenceProfile: parsed.data.confidenceProfile as ConfidenceProfile,
    gaps: parsed.data.gaps as DimensionGap[],
    reportGenerated: parsed.data.reportGenerated,
    overallConfidence: parsed.data.overallConfidence,
  };

  const actions = evaluateState(agentState);

  const decision: AgentDecision = {
    id: `decision_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
    action: actions.length > 0 ? actions[0].type : 'analyze_source',
    reason:
      actions.length > 0
        ? `Evaluated state → top recommendation: ${actions[0].reason}`
        : 'No actions recommended — profile is complete.',
    confidenceBefore: agentState.overallConfidence,
    confidenceAfter: agentState.overallConfidence,
    outcome: 'pending',
    metadata: {
      totalActions: actions.length,
      uid: auth.uid,
    },
  };

  const response: EvaluateResponse = {
    actions,
    state: agentState,
    decision,
  };

  return NextResponse.json(response);
}
