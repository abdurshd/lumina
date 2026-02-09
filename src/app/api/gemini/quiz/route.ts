import { NextRequest, NextResponse } from "next/server";
import {
  verifyAuth,
  errorResponse,
  ErrorCode,
  safeParseJson,
} from "@/lib/api-helpers";
import { getGeminiClientForUser } from "@/lib/gemini/client";
import { GEMINI_MODELS } from "@/lib/gemini/models";
import { QUIZ_GENERATION_PROMPT, getModuleQuizPrompt } from "@/lib/gemini/prompts";
import { QuizQuestionsResponseSchema, QuizModuleIdSchema } from "@/lib/schemas/quiz";
import { getModuleConfig } from "@/lib/quiz/module-config";
import { trackGeminiUsage } from "@/lib/gemini/byok";
import { ALL_PSYCHOMETRIC_DIMENSIONS, normalizeDimensionName } from "@/lib/psychometrics/dimension-model";
import type { QuizQuestion } from "@/types";
import { z } from "zod";

const QUESTION_TYPE_VALUES = ["multiple_choice", "slider", "freetext"] as const;
type QuestionType = (typeof QUESTION_TYPE_VALUES)[number];
const QUESTION_TYPES = new Set<QuestionType>(QUESTION_TYPE_VALUES);

const MULTIPLE_CHOICE_FALLBACK_OPTIONS = [
  "Strongly resonates with me",
  "Often true for me",
  "Sometimes true for me",
  "Rarely true for me",
] as const;

const MULTIPLE_CHOICE_FALLBACK_SCORES = [90, 70, 45, 20] as const;

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

interface QuestionEnvelope {
  questions?: unknown;
  adaptationReason?: unknown;
}

interface NormalizeQuestionsOptions {
  questionCount: number;
  moduleId?: z.infer<typeof QuizModuleIdSchema>;
  batchIndex: number;
  allowedDimensions: string[];
}

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

  const allowedDimensions = getAllowedDimensions(moduleId);

  const previousContext =
    previousAnswers.length > 0
      ? `\n\nPrevious answers from this user:\n${previousAnswers.map((a) => `Q${a.questionId}: ${a.answer}`).join("\n")}\n\nAdapt the next questions based on these answers.`
      : "";

  let confidenceContext = "";
  if (confidenceGaps && confidenceGaps.length > 0) {
    const gapLines = confidenceGaps
      .slice(0, 5)
      .map((g) => `  - ${g.dimension}: ${g.currentConfidence}% confidence (target: ${g.targetConfidence}%, importance: ${g.importance})`)
      .join("\n");
    confidenceContext = `\n\nCONFIDENCE GAPS (prioritize questions for these weak dimensions):\n${gapLines}\n\nGenerate questions that specifically probe the low-confidence dimensions listed above.`;
  }

  let scoresContext = "";
  if (previousScores && Object.keys(previousScores).length > 0) {
    const scoreLines = Object.entries(previousScores)
      .map(([dim, score]) => `  - ${dim}: ${score}/100`)
      .join("\n");
    scoresContext = `\n\nPREVIOUS DIMENSION SCORES:\n${scoreLines}\n\nUse these to generate deeper, more targeted questions.`;
  }

  const promptText = `${prompt}

${dataContext ? `User's data analysis:\n${dataContext}\n` : ""}
${previousContext}${confidenceContext}${scoresContext}

Generate exactly ${questionCount} questions${moduleId ? ` for module \"${moduleId}\"` : ` for batch #${batchIndex + 1}`}.
Each question must include: id, type (multiple_choice|slider|freetext), question, category, dimension.
For multiple_choice include 4 options and scoringRubric.
For slider include sliderMin, sliderMax, and sliderLabels {min,max}.
${moduleId ? `Always set moduleId to \"${moduleId}\".` : ""}

Return valid JSON with this shape:
{ "questions": [...], "adaptationReason": "string" }`;

  let questions: QuizQuestion[] | null = null;
  let adaptationReason: string | undefined;
  let generationError: Error | null = null;

  try {
    const { client, keySource } = await getGeminiClientForUser({
      uid: authResult.uid,
      model: GEMINI_MODELS.FAST,
    });

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
      throw new Error("Gemini returned an empty response");
    }

    await trackGeminiUsage({
      uid: authResult.uid,
      model: GEMINI_MODELS.FAST,
      feature: "quiz_generate",
      keySource,
      inputChars: promptText.length,
      outputChars: text.length,
    });

    const parsedJson = safeParseJson(text);
    const envelope = (parsedJson && typeof parsedJson === "object" ? parsedJson : {}) as QuestionEnvelope;

    if (typeof envelope.adaptationReason === "string" && envelope.adaptationReason.trim().length > 0) {
      adaptationReason = envelope.adaptationReason.trim();
    }

    const normalized = normalizeQuizQuestions(parsedJson, {
      questionCount,
      moduleId,
      batchIndex,
      allowedDimensions,
    });

    const validated = QuizQuestionsResponseSchema.parse({ questions: normalized });
    questions = validated.questions;
  } catch (error) {
    generationError = error instanceof Error ? error : new Error(String(error));
  }

  if (!questions || questions.length === 0) {
    questions = buildFallbackQuestions({
      questionCount,
      moduleId,
      batchIndex,
      allowedDimensions,
    });
  }

  const finalValidation = QuizQuestionsResponseSchema.safeParse({ questions });
  if (!finalValidation.success) {
    return errorResponse(
      "Failed to generate valid quiz questions.",
      ErrorCode.INTERNAL_ERROR,
      500,
      finalValidation.error.issues[0]?.message,
    );
  }

  if (!adaptationReason) {
    adaptationReason = generationError
      ? "Using resilient fallback question generation because AI output was temporarily unavailable."
      : confidenceGaps && confidenceGaps.length > 0
        ? `Questions target ${confidenceGaps.slice(0, 3).map((g) => g.dimension).join(", ")} based on confidence gaps.`
        : "Questions adapted based on your profile context.";
  }

  if (generationError) {
    console.error("[Quiz Fallback]", generationError.message);
  }

  return NextResponse.json({
    questions: finalValidation.data.questions,
    adaptationReason,
    fallbackUsed: Boolean(generationError),
  });
}

function normalizeQuizQuestions(raw: unknown, options: NormalizeQuestionsOptions): QuizQuestion[] {
  const envelope = (raw && typeof raw === "object" ? raw : {}) as QuestionEnvelope;
  const rawQuestions = Array.isArray(envelope.questions) ? envelope.questions : [];

  const normalized: QuizQuestion[] = [];
  const usedIds = new Set<string>();

  for (let i = 0; i < rawQuestions.length && normalized.length < options.questionCount; i++) {
    const rawQuestion = rawQuestions[i];
    if (!rawQuestion || typeof rawQuestion !== "object") continue;

    const candidate = rawQuestion as Record<string, unknown>;
    const questionType = coerceQuestionType(candidate.type, candidate);
    const fallbackDimension = options.allowedDimensions[normalized.length % options.allowedDimensions.length] ?? "Artistic";

    const candidateDimension =
      typeof candidate.dimension === "string"
        ? candidate.dimension
        : typeof candidate.category === "string"
          ? candidate.category
          : fallbackDimension;

    const normalizedDimension = normalizeDimensionName(candidateDimension) ?? normalizeDimensionName(fallbackDimension) ?? "Artistic";

    const questionText =
      typeof candidate.question === "string" && candidate.question.trim().length > 0
        ? candidate.question.trim()
        : buildFallbackQuestionText(normalizedDimension, questionType);

    const category =
      typeof candidate.category === "string" && candidate.category.trim().length > 0
        ? candidate.category.trim()
        : buildFallbackCategory(normalizedDimension);

    const rawId = typeof candidate.id === "string" && candidate.id.trim().length > 0
      ? candidate.id.trim()
      : buildQuestionId(options.moduleId, options.batchIndex, normalized.length);

    let id = rawId;
    while (usedIds.has(id)) {
      id = `${rawId}_${usedIds.size + 1}`;
    }
    usedIds.add(id);

    const question: QuizQuestion = {
      id,
      type: questionType,
      question: questionText,
      category,
      dimension: normalizedDimension,
      moduleId: options.moduleId,
    };

    if (questionType === "multiple_choice") {
      const providedOptions = Array.isArray(candidate.options)
        ? candidate.options.filter((value): value is string => typeof value === "string" && value.trim().length > 0).map((value) => value.trim())
        : [];

      const optionPool = providedOptions.length >= 2
        ? providedOptions.slice(0, 4)
        : [...MULTIPLE_CHOICE_FALLBACK_OPTIONS];

      while (optionPool.length < 4) {
        optionPool.push(MULTIPLE_CHOICE_FALLBACK_OPTIONS[optionPool.length]);
      }

      const scoringRubric = buildScoringRubric(optionPool, candidate.scoringRubric);
      question.options = optionPool;
      question.scoringRubric = scoringRubric;
    }

    if (questionType === "slider") {
      const sliderMin = toFiniteNumber(candidate.sliderMin, 0);
      const sliderMaxRaw = toFiniteNumber(candidate.sliderMax, 100);
      const sliderMax = sliderMaxRaw <= sliderMin ? sliderMin + 100 : sliderMaxRaw;

      const labelsSource =
        candidate.sliderLabels && typeof candidate.sliderLabels === "object"
          ? (candidate.sliderLabels as Record<string, unknown>)
          : null;

      const minLabel = typeof labelsSource?.min === "string" && labelsSource.min.trim().length > 0
        ? labelsSource.min.trim()
        : "Low";
      const maxLabel = typeof labelsSource?.max === "string" && labelsSource.max.trim().length > 0
        ? labelsSource.max.trim()
        : "High";

      question.sliderMin = sliderMin;
      question.sliderMax = sliderMax;
      question.sliderLabels = { min: minLabel, max: maxLabel };
    }

    normalized.push(question);
  }

  while (normalized.length < options.questionCount) {
    const fallback = buildFallbackQuestion(options, normalized.length);
    if (!usedIds.has(fallback.id)) {
      usedIds.add(fallback.id);
      normalized.push(fallback);
      continue;
    }

    fallback.id = `${fallback.id}_${usedIds.size + 1}`;
    usedIds.add(fallback.id);
    normalized.push(fallback);
  }

  return normalized;
}

function buildFallbackQuestions(options: NormalizeQuestionsOptions): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  for (let i = 0; i < options.questionCount; i++) {
    questions.push(buildFallbackQuestion(options, i));
  }
  return questions;
}

function buildFallbackQuestion(options: NormalizeQuestionsOptions, index: number): QuizQuestion {
  const questionType = QUESTION_TYPE_VALUES[index % QUESTION_TYPE_VALUES.length];
  const fallbackDimension = options.allowedDimensions[index % options.allowedDimensions.length] ?? "Artistic";
  const dimension = normalizeDimensionName(fallbackDimension) ?? "Artistic";

  const question: QuizQuestion = {
    id: buildQuestionId(options.moduleId, options.batchIndex, index),
    type: questionType,
    question: buildFallbackQuestionText(dimension, questionType),
    category: buildFallbackCategory(dimension),
    dimension,
    moduleId: options.moduleId,
  };

  if (questionType === "multiple_choice") {
    question.options = [...MULTIPLE_CHOICE_FALLBACK_OPTIONS];
    question.scoringRubric = buildScoringRubric(question.options);
  }

  if (questionType === "slider") {
    question.sliderMin = 0;
    question.sliderMax = 100;
    question.sliderLabels = { min: "Low", max: "High" };
  }

  return question;
}

function getAllowedDimensions(moduleId?: z.infer<typeof QuizModuleIdSchema>): string[] {
  if (!moduleId) {
    return [...ALL_PSYCHOMETRIC_DIMENSIONS];
  }

  const moduleConfig = getModuleConfig(moduleId);
  return moduleConfig.dimensions.length > 0
    ? [...moduleConfig.dimensions]
    : [...ALL_PSYCHOMETRIC_DIMENSIONS];
}

function buildFallbackQuestionText(dimension: string, type: QuestionType): string {
  if (type === "slider") {
    return `How strongly does ${humanizeDimension(dimension)} influence your career decisions today?`;
  }

  if (type === "multiple_choice") {
    return `Which statement best describes your current preference for ${humanizeDimension(dimension)}?`;
  }

  return `Describe a recent example where ${humanizeDimension(dimension)} showed up in your work or learning.`;
}

function buildFallbackCategory(dimension: string): string {
  return dimension.replace(/_/g, " ").toLowerCase();
}

function buildQuestionId(moduleId: z.infer<typeof QuizModuleIdSchema> | undefined, batchIndex: number, index: number): string {
  const moduleTag = moduleId ?? "general";
  return `q_${moduleTag}_${batchIndex}_${index + 1}`;
}

function coerceQuestionType(rawType: unknown, candidate: Record<string, unknown>): QuestionType {
  if (typeof rawType === "string" && QUESTION_TYPES.has(rawType as QuestionType)) {
    return rawType as QuestionType;
  }

  if (Array.isArray(candidate.options) && candidate.options.length > 0) {
    return "multiple_choice";
  }

  if (typeof candidate.sliderMin === "number" || typeof candidate.sliderMax === "number") {
    return "slider";
  }

  return "freetext";
}

function buildScoringRubric(
  options: string[],
  rawScoringRubric?: unknown,
): Record<string, number> {
  const rubric: Record<string, number> = {};
  const source = rawScoringRubric && typeof rawScoringRubric === "object"
    ? (rawScoringRubric as Record<string, unknown>)
    : {};

  for (let i = 0; i < options.length; i++) {
    const option = options[i];
    const maybeScore = source[option];
    const fallbackScore = MULTIPLE_CHOICE_FALLBACK_SCORES[Math.min(i, MULTIPLE_CHOICE_FALLBACK_SCORES.length - 1)];
    rubric[option] = clampScore(typeof maybeScore === "number" ? maybeScore : fallbackScore);
  }

  return rubric;
}

function toFiniteNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function humanizeDimension(dimension: string): string {
  return dimension.replace(/_/g, " ").toLowerCase();
}
