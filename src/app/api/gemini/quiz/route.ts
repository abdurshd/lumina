import { NextRequest, NextResponse } from "next/server";
import {
  verifyAuth,
  errorResponse,
  ErrorCode,
  safeParseJson,
  GeminiError,
} from "@/lib/api-helpers";
import { getGeminiClientForUser } from "@/lib/gemini/client";
import { GEMINI_MODELS } from "@/lib/gemini/models";
import { QUIZ_GENERATION_PROMPT, getModuleQuizPrompt } from "@/lib/gemini/prompts";
import { QuizQuestionsResponseSchema, QuizModuleIdSchema } from "@/lib/schemas/quiz";
import { getModuleConfig } from "@/lib/quiz/module-config";
import { trackGeminiUsage } from "@/lib/gemini/byok";
import { z } from "zod";

const ConfidenceGapSchema = z.object({
  dimension: z.string(),
  currentConfidence: z.number(),
  targetConfidence: z.number(),
  importance: z.number(),
});

const RequestSchema = z.object({
  dataContext: z.string().default(""),
  previousAnswers: z
    .array(
      z.object({
        questionId: z.string(),
        answer: z.union([z.string(), z.number()]),
      }),
    )
    .default([]),
  batchIndex: z.number().int().min(0).max(10).default(0),
  moduleId: QuizModuleIdSchema.optional(),
  confidenceGaps: z.array(ConfidenceGapSchema).optional(),
  previousScores: z.record(z.string(), z.number()).optional(),
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

  const { dataContext, previousAnswers, batchIndex, moduleId, confidenceGaps, previousScores } = parsed.data;

  try {
    const { client, keySource } = await getGeminiClientForUser({
      uid: authResult.uid,
      model: GEMINI_MODELS.FAST,
    });

    const previousContext =
      previousAnswers.length > 0
        ? `\n\nPrevious answers from this user:\n${previousAnswers.map((a) => `Q${a.questionId}: ${a.answer}`).join("\n")}\n\nAdapt the next questions based on these answers.`
        : "";

    // Use module-scoped prompt when moduleId is provided
    let prompt: string;
    let questionCount: number;

    if (moduleId) {
      const moduleConfig = getModuleConfig(moduleId);
      prompt = getModuleQuizPrompt(moduleId, moduleConfig.dimensions);
      questionCount = moduleConfig.questionCount;
    } else {
      prompt = QUIZ_GENERATION_PROMPT;
      questionCount = batchIndex === 0 ? 4 : 3;
    }

    // Build confidence-aware context
    let confidenceContext = "";
    if (confidenceGaps && confidenceGaps.length > 0) {
      const gapLines = confidenceGaps
        .slice(0, 5)
        .map((g) => `  - ${g.dimension}: ${g.currentConfidence}% confidence (target: ${g.targetConfidence}%, importance: ${g.importance})`)
        .join("\n");
      confidenceContext = `\n\nCONFIDENCE GAPS (prioritize questions for these weak dimensions):\n${gapLines}\n\nGenerate questions that specifically probe the low-confidence dimensions listed above. These are the areas where we need the most data.`;
    }

    let scoresContext = "";
    if (previousScores && Object.keys(previousScores).length > 0) {
      const scoreLines = Object.entries(previousScores)
        .map(([dim, score]) => `  - ${dim}: ${score}/100`)
        .join("\n");
      scoresContext = `\n\nPREVIOUS DIMENSION SCORES:\n${scoreLines}\n\nUse these to generate deeper, more targeted questions — go beyond surface-level for dimensions with low or extreme scores.`;
    }

    const promptText = `${prompt}

${dataContext ? `User's data analysis:\n${dataContext}\n` : ""}
${previousContext}${confidenceContext}${scoresContext}

Generate exactly ${questionCount} questions${moduleId ? ` for the "${moduleId}" module` : ` for batch #${batchIndex + 1}`}. Each question needs: id (string like "q${moduleId ? moduleId + '_' : ''}${batchIndex * 3 + 1}"), type ("multiple_choice" | "slider" | "freetext"), question, options (for multiple_choice, 4 options), sliderMin/sliderMax/sliderLabels (for slider), category${moduleId ? `, moduleId ("${moduleId}")` : ''}.

IMPORTANT: Include an "adaptationReason" field in your response explaining WHY you chose these specific questions based on the confidence gaps and previous scores.

Respond with valid JSON: { "questions": [...], "adaptationReason": "string" }`;

    const response = await client.models.generateContent({
      model: GEMINI_MODELS.FAST,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: promptText,
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

    await trackGeminiUsage({
      uid: authResult.uid,
      model: GEMINI_MODELS.FAST,
      feature: "quiz_generate",
      keySource,
      inputChars: promptText.length,
      outputChars: text.length,
    });

    const jsonData = safeParseJson(text) as Record<string, unknown>;
    const validated = QuizQuestionsResponseSchema.parse(jsonData);

    // Extract adaptation reason from the Gemini response
    const adaptationReason = typeof jsonData.adaptationReason === "string"
      ? jsonData.adaptationReason
      : confidenceGaps && confidenceGaps.length > 0
        ? `Questions target ${confidenceGaps.slice(0, 3).map((g) => g.dimension).join(", ")} — dimensions with lowest confidence.`
        : undefined;

    return NextResponse.json({ ...validated, adaptationReason });
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
      console.error("[Quiz Validation Error]", error.issues);
      return errorResponse(
        "AI returned an unexpected question format. Please try again.",
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
    console.error("[Quiz Error]", message);
    return errorResponse(
      "Failed to generate quiz questions. Please try again.",
      ErrorCode.INTERNAL_ERROR,
      500,
    );
  }
}
