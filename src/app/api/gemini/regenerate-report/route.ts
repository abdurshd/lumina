export const maxDuration = 120;

import { NextRequest, NextResponse } from "next/server";
import {
  verifyAuth,
  errorResponse,
  ErrorCode,
  safeParseJson,
  GeminiError,
} from "@/lib/api-helpers";
import { getGeminiClient } from "@/lib/gemini/client";
import { GEMINI_MODELS } from "@/lib/gemini/models";
import { REPORT_GENERATION_PROMPT, REPORT_REGENERATION_PROMPT } from "@/lib/gemini/prompts";
import { TalentReportSchema } from "@/lib/schemas/report";
import { z } from "zod";
import {
  getDataInsights,
  getQuizAnswers,
  getSessionInsights,
  getQuizScores,
  getTalentReport,
  getFeedback,
} from "@/lib/firebase/firestore";

const RequestSchema = z.object({
  feedback: z.string().min(1, "Feedback is required"),
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

  const { feedback } = parsed.data;
  const uid = authResult.uid;

  try {
    // Fetch all existing assessment data
    const [dataInsights, quizAnswers, sessionInsights, quizScoresData, existingReport, feedbackItems] = await Promise.all([
      getDataInsights(uid),
      getQuizAnswers(uid),
      getSessionInsights(uid),
      getQuizScores(uid),
      getTalentReport(uid),
      getFeedback(uid),
    ]);

    if (!existingReport) {
      return errorResponse(
        "No existing report found. Generate a report first.",
        ErrorCode.VALIDATION_ERROR,
        400,
      );
    }

    const client = getGeminiClient();

    const context = `
=== EXISTING REPORT ===
${JSON.stringify(existingReport, null, 2)}

=== USER FEEDBACK ===
Overall feedback: ${feedback}

${feedbackItems.length > 0 ? `Item-level feedback:\n${feedbackItems.map((f) => `- ${f.itemType} "${f.itemId}": ${f.feedback}${f.reason ? ` (reason: ${f.reason})` : ''}`).join('\n')}` : ''}

=== DATA ANALYSIS ===
${dataInsights.map((d) => `Source: ${d.source}\nSummary: ${d.summary}\nSkills: ${d.skills.join(", ")}\nInterests: ${d.interests.join(", ")}`).join("\n\n") || "No data analysis available."}

=== QUIZ ANSWERS ===
${quizAnswers.map((a) => `Question ${a.questionId}: ${a.answer}`).join("\n") || "No quiz answers available."}

=== SESSION INSIGHTS ===
${sessionInsights.map((i) => `[${i.category}] (confidence: ${i.confidence}): ${i.observation}`).join("\n") || "No session insights available."}

=== QUIZ DIMENSION SCORES ===
${quizScoresData ? Object.entries(quizScoresData.dimensionSummary).map(([dim, score]) => `${dim}: ${score}/100`).join("\n") : "No dimension scores available."}
`;

    const response = await client.models.generateContent({
      model: GEMINI_MODELS.DEEP,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${REPORT_REGENERATION_PROMPT}\n\n${REPORT_GENERATION_PROMPT}\n\n${context}\n\nRegenerate the talent report as JSON with the same schema as the existing report. Address the user's feedback while maintaining evidence-based reasoning.`,
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) {
      throw new GeminiError("Gemini returned an empty response");
    }

    const jsonData = safeParseJson(text);
    const validated = TalentReportSchema.parse(jsonData);

    return NextResponse.json(validated);
  } catch (error) {
    if (error instanceof GeminiError) {
      return errorResponse(error.message, ErrorCode.GEMINI_ERROR, 502, error.code);
    }
    if (error instanceof z.ZodError) {
      console.error("[Regenerate Report Validation Error]", error.issues);
      return errorResponse(
        "AI returned an unexpected report format. Please try again.",
        ErrorCode.GEMINI_ERROR,
        502,
      );
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Regenerate Report Error]", message);
    return errorResponse(
      "Report regeneration failed. Please try again.",
      ErrorCode.INTERNAL_ERROR,
      500,
    );
  }
}
