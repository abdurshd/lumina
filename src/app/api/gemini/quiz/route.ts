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

  const { dataContext, previousAnswers, batchIndex, moduleId } = parsed.data;

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

    const promptText = `${prompt}

${dataContext ? `User's data analysis:\n${dataContext}\n` : ""}
${previousContext}

Generate exactly ${questionCount} questions${moduleId ? ` for the "${moduleId}" module` : ` for batch #${batchIndex + 1}`}. Each question needs: id (string like "q${moduleId ? moduleId + '_' : ''}${batchIndex * 3 + 1}"), type ("multiple_choice" | "slider" | "freetext"), question, options (for multiple_choice, 4 options), sliderMin/sliderMax/sliderLabels (for slider), category${moduleId ? `, moduleId ("${moduleId}")` : ''}.

Respond with valid JSON: { "questions": [...] }`;

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

    const jsonData = safeParseJson(text);
    const validated = QuizQuestionsResponseSchema.parse(jsonData);

    return NextResponse.json(validated);
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
