export const maxDuration = 120;

import { randomUUID } from 'crypto';
import { after, NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateReportWithAgent } from '@/lib/agent/report-agent';
import {
  verifyAuth,
  errorResponse,
  ErrorCode,
  GeminiError,
  getClientByokApiKey,
} from '@/lib/api-helpers';
import { REPORT_GENERATION_PROMPT } from '@/lib/gemini/prompts';
import { getAdminDb } from '@/lib/firebase/admin';
import { buildComputedProfile } from '@/lib/career/profile-builder';
import { SESSION_INSIGHT_CATEGORIES } from '@/lib/psychometrics/dimension-model';
import { UserConstraintsSchema } from '@/lib/schemas/quiz';
import type { ComputedProfile, TalentReport } from '@/types';

type ReportJobStatus = 'queued' | 'running' | 'completed' | 'failed';

interface ReportJobState {
  jobId: string;
  status: ReportJobStatus;
  createdAt: number;
  updatedAt: number;
  startedAt?: number;
  completedAt?: number;
  failedAt?: number;
  error?: string | null;
  reportHeadline?: string;
}

const RequestSchema = z.object({
  dataInsights: z
    .array(
      z.object({
        source: z.string(),
        summary: z.string(),
        skills: z.array(z.string()),
        interests: z.array(z.string()),
      }),
    )
    .default([]),
  quizAnswers: z
    .array(
      z.object({
        questionId: z.string(),
        answer: z.union([z.string(), z.number()]),
      }),
    )
    .default([]),
  sessionInsights: z
    .array(
      z.object({
        category: z.enum(SESSION_INSIGHT_CATEGORIES),
        observation: z.string(),
        confidence: z.number().min(0).max(1),
        evidence: z.string().optional(),
      }),
    )
    .default([]),
  quizScores: z.record(z.string(), z.number()).optional(),
  quizConfidence: z.record(z.string(), z.number()).optional(),
  computedProfile: z
    .object({
      riasecCode: z.string(),
      dimensionScores: z.record(z.string(), z.number()),
      confidenceScores: z.record(z.string(), z.number()),
      constraints: UserConstraintsSchema.optional(),
    })
    .optional(),
  constraints: UserConstraintsSchema.optional(),
  background: z.boolean().optional().default(false),
});

type ReportRequestData = z.infer<typeof RequestSchema>;

function truncateText(value: string, maxChars: number): string {
  const trimmed = value.trim();
  if (trimmed.length <= maxChars) return trimmed;
  return `${trimmed.slice(0, maxChars)}…`;
}

function buildReportInputs(payload: ReportRequestData): {
  context: string;
  reportPrompt: string;
  resolvedComputedProfile?: ComputedProfile;
} {
  const {
    dataInsights,
    quizAnswers,
    sessionInsights,
    quizScores,
    quizConfidence,
    computedProfile,
    constraints,
  } = payload;

  const resolvedComputedProfile =
    computedProfile ??
    (quizScores
      ? buildComputedProfile({
          quizDimensionScores: quizScores,
          sessionInsights: sessionInsights.map((insight) => ({
            timestamp: Date.now(),
            category: insight.category,
            observation: insight.observation,
            confidence: insight.confidence,
          })),
          constraints,
          dimensionConfidence: quizConfidence,
        })
      : undefined);

  const insightsText =
    dataInsights
      .slice(0, 30)
      .map((d) => {
        const summary = truncateText(d.summary, 1_400);
        return `Source: ${d.source}\nSummary: ${summary}\nSkills: ${d.skills.join(', ')}\nInterests: ${d.interests.join(', ')}`;
      })
      .join('\n\n') || 'No data analysis available.';

  const answersText =
    quizAnswers
      .slice(0, 120)
      .map((a) => `Question ${a.questionId}: ${String(a.answer)}`)
      .join('\n') || 'No quiz answers available.';

  const sessionText =
    sessionInsights
      .slice(0, 120)
      .map(
        (i) =>
          `[${i.category}] (confidence: ${i.confidence}): ${truncateText(i.observation, 400)}${i.evidence ? ` | evidence: ${truncateText(i.evidence, 250)}` : ''}`,
      )
      .join('\n') || 'No session insights available.';

  const quizScoresText = quizScores
    ? Object.entries(quizScores)
        .map(([dim, score]) => `${dim}: ${score}/100`)
        .join('\n')
    : 'No dimension scores available.';

  const quizConfidenceText = quizConfidence
    ? Object.entries(quizConfidence)
        .map(([dim, conf]) => `${dim}: ${conf}%`)
        .join('\n')
    : '';

  const computedProfileText = resolvedComputedProfile
    ? `RIASEC Code: ${resolvedComputedProfile.riasecCode}
Dimension Scores: ${Object.entries(resolvedComputedProfile.dimensionScores)
    .map(([dim, score]) => `${dim}: ${score}/100`)
    .join(', ')}
Confidence Scores: ${Object.entries(resolvedComputedProfile.confidenceScores)
    .map(([dim, conf]) => `${dim}: ${conf}%`)
    .join(', ')}`
    : '';

  const constraintsText = constraints
    ? `Location: ${constraints.locationFlexibility}
Salary Priority: ${constraints.salaryPriority}
Time Availability: ${constraints.timeAvailability}
Education Willingness: ${constraints.educationWillingness}
Relocation: ${constraints.relocationWillingness}`
    : '';

  const context = `
=== DATA ANALYSIS ===
${insightsText}

=== QUIZ ANSWERS ===
${answersText}

=== VIDEO SESSION INSIGHTS ===
${sessionText}

=== QUIZ DIMENSION SCORES ===
${quizScoresText}

${quizConfidenceText ? `=== QUIZ DIMENSION CONFIDENCE ===
${quizConfidenceText}` : ''}

${computedProfileText ? `=== COMPUTED PROFILE ===
${computedProfileText}` : ''}

${constraintsText ? `=== USER CONSTRAINTS ===
${constraintsText}` : ''}
`;

  const reportPrompt = `${REPORT_GENERATION_PROMPT}\n\n${context}\n\nGenerate the talent report as JSON matching this schema:
{
  "headline": "string - specific surprising headline talent",
  "tagline": "string - short inspiring tagline",
  "radarDimensions": [{"label": "string", "value": 0-100, "description": "string"}],
  "topStrengths": [{"name": "string", "score": 0-100, "evidence": "string", "evidenceSources": [{"source": "string", "excerpt": "string"}], "confidenceLevel": "high|medium|low"}],
  "hiddenTalents": ["string"],
  "careerPaths": [{"title": "string", "match": 0-100, "description": "string", "nextSteps": ["string"], "riasecCodes": "string", "onetCluster": "string", "evidenceSources": ["string"], "confidence": 0-100, "whyYou": "string"}],
  "actionPlan": [{"title": "string", "description": "string", "timeframe": "string", "priority": "high|medium|low"}],
  "personalityInsights": ["string"],
  "confidenceNotes": ["string"]
}

Include exactly 6 radar dimensions (Creativity, Analysis, Leadership, Empathy, Resilience, Vision), 5 top strengths, 3-5 hidden talents, 4 career paths, 5 action items, and 4 personality insights.${resolvedComputedProfile ? `

Also include "careerRecommendations" array with 4 entries, each having: clusterId, matchScore (0-100), confidence (0-100), whyYou, whatYouDo, howToTest, skillsToBuild (array of 3-5 strings), evidenceChain (array of {type: "quiz"|"session"|"data_source"|"signal", excerpt: string}).` : ''}`;

  return { context, reportPrompt, resolvedComputedProfile };
}

async function runReportGeneration(params: {
  uid: string;
  payload: ReportRequestData;
  clientProvidedApiKey?: string;
}): Promise<{
  report: TalentReport;
  trace: NonNullable<TalentReport['generationTrace']>;
  resolvedComputedProfile?: ComputedProfile;
}> {
  const { uid, payload, clientProvidedApiKey } = params;
  const { context, reportPrompt, resolvedComputedProfile } = buildReportInputs(payload);
  const { report, trace } = await generateReportWithAgent({
    uid,
    context,
    reportPrompt,
    clientProvidedApiKey,
  });
  return {
    report: { ...report, generationTrace: trace },
    trace,
    resolvedComputedProfile,
  };
}

function getReportJobDocRef(uid: string) {
  const db = getAdminDb();
  return db.doc(`users/${uid}/assessment/reportJob`);
}

async function readReportJob(uid: string): Promise<ReportJobState | null> {
  const snap = await getReportJobDocRef(uid).get();
  return snap.exists ? (snap.data() as ReportJobState) : null;
}

async function upsertReportJob(uid: string, state: Partial<ReportJobState> & { jobId: string }): Promise<void> {
  const now = Date.now();
  await getReportJobDocRef(uid).set(
    {
      updatedAt: now,
      ...state,
    },
    { merge: true },
  );
}

async function persistGeneratedReport(params: {
  uid: string;
  report: TalentReport;
  resolvedComputedProfile?: ComputedProfile;
}): Promise<void> {
  const { uid, report, resolvedComputedProfile } = params;
  const db = getAdminDb();
  const now = Date.now();
  const assessmentRef = db.collection('users').doc(uid).collection('assessment');

  await Promise.all([
    assessmentRef.doc('talentReport').set({ report, updatedAt: now }),
    assessmentRef.doc('reportHistory').collection('versions').doc(String(now)).set({ report, timestamp: now }),
    resolvedComputedProfile
      ? assessmentRef.doc('computedProfile').set({ profile: resolvedComputedProfile, updatedAt: now })
      : Promise.resolve(),
    report.careerRecommendations && report.careerRecommendations.length > 0
      ? assessmentRef
          .doc('careerRecommendations')
          .set({ recommendations: report.careerRecommendations, updatedAt: now })
      : Promise.resolve(),
  ]);

  try {
    await db.doc(`users/${uid}`).update({ 'stages.report': 'completed' });
  } catch {
    await db.doc(`users/${uid}`).set({ stages: { report: 'completed' } }, { merge: true });
  }
}

function getReportFailureMessage(error: unknown): string {
  if (error instanceof GeminiError) {
    return error.message;
  }
  if (error instanceof z.ZodError) {
    return 'AI returned an unexpected report format. Please try again.';
  }
  const message = error instanceof Error ? error.message : 'Unknown error';
  if (message.includes('BYOK required')) {
    return message;
  }
  if (message.includes('budget exceeded')) {
    return 'Monthly Gemini budget exceeded. Update BYOK settings or wait for next cycle.';
  }
  return 'Report generation failed. Please try again.';
}

function toReportHttpError(error: unknown): NextResponse {
  if (error instanceof GeminiError) {
    return errorResponse(error.message, ErrorCode.GEMINI_ERROR, 502, error.code);
  }
  if (error instanceof z.ZodError) {
    console.error('[Report Validation Error]', error.issues);
    return errorResponse(
      'AI returned an unexpected report format. Please try again.',
      ErrorCode.GEMINI_ERROR,
      502,
    );
  }

  const message = error instanceof Error ? error.message : 'Unknown error';
  if (message.includes('BYOK required')) {
    return errorResponse(message, ErrorCode.FORBIDDEN, 403);
  }
  if (message.includes('budget exceeded')) {
    return errorResponse(
      'Monthly Gemini budget exceeded. Update BYOK settings or wait for next cycle.',
      ErrorCode.RATE_LIMITED,
      429,
    );
  }

  console.error('[Report Error]', message);
  return errorResponse('Report generation failed. Please try again.', ErrorCode.INTERNAL_ERROR, 500);
}

export async function GET(req: NextRequest) {
  const authResult = await verifyAuth(req);
  if (!authResult) {
    return errorResponse('Authentication required', ErrorCode.UNAUTHORIZED, 401);
  }

  try {
    const job = await readReportJob(authResult.uid);
    return NextResponse.json({ job });
  } catch (error) {
    console.error('[Report Job Status Error]', error);
    return errorResponse('Failed to load report job status.', ErrorCode.INTERNAL_ERROR, 500);
  }
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
    return errorResponse(
      parsed.error.issues[0]?.message ?? 'Invalid request data',
      ErrorCode.VALIDATION_ERROR,
      400,
    );
  }

  const payload = parsed.data;
  const { dataInsights, quizAnswers, sessionInsights, background } = payload;
  const uid = authResult.uid;

  if (dataInsights.length === 0 && quizAnswers.length === 0 && sessionInsights.length === 0) {
    return errorResponse(
      'No assessment data available. Complete at least one assessment stage first.',
      ErrorCode.VALIDATION_ERROR,
      400,
    );
  }

  const clientProvidedApiKey = getClientByokApiKey(req);

  if (background) {
    try {
      const existingJob = await readReportJob(uid);
      if (existingJob && (existingJob.status === 'queued' || existingJob.status === 'running')) {
        return NextResponse.json(
          { jobId: existingJob.jobId, status: existingJob.status },
          { status: 202 },
        );
      }

      const jobId = randomUUID();
      const createdAt = Date.now();

      await upsertReportJob(uid, {
        jobId,
        status: 'queued',
        createdAt,
        error: null,
      });

      after(async () => {
        await upsertReportJob(uid, {
          jobId,
          status: 'running',
          startedAt: Date.now(),
          error: null,
        });

        try {
          const { report, resolvedComputedProfile } = await runReportGeneration({
            uid,
            payload,
            clientProvidedApiKey,
          });

          await persistGeneratedReport({
            uid,
            report,
            resolvedComputedProfile,
          });

          await upsertReportJob(uid, {
            jobId,
            status: 'completed',
            completedAt: Date.now(),
            reportHeadline: report.headline,
            error: null,
          });
        } catch (error) {
          const failureMessage = getReportFailureMessage(error);
          console.error('[Report Job Error]', error);
          await upsertReportJob(uid, {
            jobId,
            status: 'failed',
            failedAt: Date.now(),
            error: failureMessage,
          });
        }
      });

      return NextResponse.json({ jobId, status: 'queued' }, { status: 202 });
    } catch (error) {
      console.error('[Report Job Start Error]', error);
      return errorResponse('Failed to start background report generation.', ErrorCode.INTERNAL_ERROR, 500);
    }
  }

  try {
    const { report, trace } = await runReportGeneration({
      uid,
      payload,
      clientProvidedApiKey,
    });
    return NextResponse.json({ ...report, generationTrace: trace });
  } catch (error) {
    return toReportHttpError(error);
  }
}
