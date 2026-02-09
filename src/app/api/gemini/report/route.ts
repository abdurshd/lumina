export const maxDuration = 120;

import { NextRequest, NextResponse } from "next/server";
import {
  verifyAuth,
  errorResponse,
  ErrorCode,
  GeminiError,
} from "@/lib/api-helpers";
import { REPORT_GENERATION_PROMPT } from "@/lib/gemini/prompts";
import { UserConstraintsSchema } from "@/lib/schemas/quiz";
import { buildComputedProfile } from "@/lib/career/profile-builder";
import { SESSION_INSIGHT_CATEGORIES } from "@/lib/psychometrics/dimension-model";
import { generateReportWithAgent } from "@/lib/agent/report-agent";
import { z } from "zod";

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
  computedProfile: z.object({
    riasecCode: z.string(),
    dimensionScores: z.record(z.string(), z.number()),
    confidenceScores: z.record(z.string(), z.number()),
    constraints: UserConstraintsSchema.optional(),
  }).optional(),
  constraints: UserConstraintsSchema.optional(),
});

export async function POST(req: NextRequest) {
  const authResult = await verifyAuth(req);
  if (!authResult) {
    return errorResponse(
      "Authentication required",
      ErrorCode.UNAUTHORIZED,
      401,
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse("Invalid request body", ErrorCode.BAD_REQUEST, 400);
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(
      parsed.error.issues[0]?.message ?? "Invalid request data",
      ErrorCode.VALIDATION_ERROR,
      400,
    );
  }

  const {
    dataInsights,
    quizAnswers,
    sessionInsights,
    quizScores,
    quizConfidence,
    computedProfile,
    constraints,
  } = parsed.data;

  // Ensure there's at least some data to generate a report from
  if (
    dataInsights.length === 0 &&
    quizAnswers.length === 0 &&
    sessionInsights.length === 0
  ) {
    return errorResponse(
      "No assessment data available. Complete at least one assessment stage first.",
      ErrorCode.VALIDATION_ERROR,
      400,
    );
  }

  try {
    const resolvedComputedProfile = computedProfile
      ?? (quizScores
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

    const context = `
=== DATA ANALYSIS ===
${
  dataInsights
    .map(
      (d) =>
        `Source: ${d.source}\nSummary: ${d.summary}\nSkills: ${d.skills.join(", ")}\nInterests: ${d.interests.join(", ")}`,
    )
    .join("\n\n") || "No data analysis available."
}

=== QUIZ ANSWERS ===
${quizAnswers.map((a) => `Question ${a.questionId}: ${a.answer}`).join("\n") || "No quiz answers available."}

=== VIDEO SESSION INSIGHTS ===
${
  sessionInsights
    .map(
      (i) => `[${i.category}] (confidence: ${i.confidence}): ${i.observation}${i.evidence ? ` | evidence: ${i.evidence}` : ""}`,
    )
    .join("\n") || "No session insights available."
}

=== QUIZ DIMENSION SCORES ===
${quizScores ? Object.entries(quizScores).map(([dim, score]) => `${dim}: ${score}/100`).join("\n") : "No dimension scores available."}

${quizConfidence ? `=== QUIZ DIMENSION CONFIDENCE ===
${Object.entries(quizConfidence).map(([dim, conf]) => `${dim}: ${conf}%`).join("\n")}` : ""}

${resolvedComputedProfile ? `=== COMPUTED PROFILE ===
RIASEC Code: ${resolvedComputedProfile.riasecCode}
Dimension Scores: ${Object.entries(resolvedComputedProfile.dimensionScores).map(([dim, score]) => `${dim}: ${score}/100`).join(", ")}
Confidence Scores: ${Object.entries(resolvedComputedProfile.confidenceScores).map(([dim, conf]) => `${dim}: ${conf}%`).join(", ")}` : ""}

${constraints ? `=== USER CONSTRAINTS ===
Location: ${constraints.locationFlexibility}
Salary Priority: ${constraints.salaryPriority}
Time Availability: ${constraints.timeAvailability}
Education Willingness: ${constraints.educationWillingness}
Relocation: ${constraints.relocationWillingness}` : ""}
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

    // Use multi-step agent loop instead of single Gemini call
    const { report, trace } = await generateReportWithAgent({
      uid: authResult.uid,
      context,
      reportPrompt,
    });

    return NextResponse.json({ ...report, generationTrace: trace });
  } catch (error) {
    if (error instanceof GeminiError) {
      return errorResponse(
        error.message,
        ErrorCode.GEMINI_ERROR,
        502,
        error.code,
      );
    }
    if (error instanceof z.ZodError) {
      console.error("[Report Validation Error]", error.issues);
      return errorResponse(
        "AI returned an unexpected report format. Please try again.",
        ErrorCode.GEMINI_ERROR,
        502,
      );
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message.includes("budget exceeded")) {
      return errorResponse(
        "Monthly Gemini budget exceeded. Update BYOK settings or wait for next cycle.",
        ErrorCode.RATE_LIMITED,
        429,
      );
    }
    console.error("[Report Error]", message);
    return errorResponse(
      "Report generation failed. Please try again.",
      ErrorCode.INTERNAL_ERROR,
      500,
    );
  }
}
