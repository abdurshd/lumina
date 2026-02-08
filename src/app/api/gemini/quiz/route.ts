import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, errorResponse, ErrorCode, safeParseJson, GeminiError } from '@/lib/api-helpers';
import { getGeminiClient } from '@/lib/gemini/client';
import { QUIZ_GENERATION_PROMPT } from '@/lib/gemini/prompts';
import { QuizQuestionsResponseSchema } from '@/lib/schemas/quiz';
import { z } from 'zod';

const RequestSchema = z.object({
  dataContext: z.string().default(''),
  previousAnswers: z.array(z.object({
    questionId: z.string(),
    answer: z.union([z.string(), z.number()]),
  })).default([]),
  batchIndex: z.number().int().min(0).max(10).default(0),
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
    return errorResponse(
      parsed.error.issues[0]?.message ?? 'Invalid request data',
      ErrorCode.VALIDATION_ERROR,
      400
    );
  }

  const { dataContext, previousAnswers, batchIndex } = parsed.data;

  try {
    const client = getGeminiClient();

    const previousContext = previousAnswers.length > 0
      ? `\n\nPrevious answers from this user:\n${previousAnswers.map((a) => `Q${a.questionId}: ${a.answer}`).join('\n')}\n\nAdapt the next questions based on these answers.`
      : '';

    const questionCount = batchIndex === 0 ? 4 : 3;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash-preview-05-20',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${QUIZ_GENERATION_PROMPT}

${dataContext ? `User's data analysis:\n${dataContext}\n` : ''}
${previousContext}

Generate exactly ${questionCount} questions for batch #${batchIndex + 1}. Each question needs: id (string like "q${batchIndex * 3 + 1}"), type ("multiple_choice" | "slider" | "freetext"), question, options (for multiple_choice, 4 options), sliderMin/sliderMax/sliderLabels (for slider), category.

Respond with valid JSON: { "questions": [...] }`,
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;
    if (!text) {
      throw new GeminiError('Gemini returned an empty response');
    }

    const jsonData = safeParseJson(text);
    const validated = QuizQuestionsResponseSchema.parse(jsonData);

    return NextResponse.json(validated);
  } catch (error) {
    if (error instanceof GeminiError) {
      return errorResponse(error.message, ErrorCode.GEMINI_ERROR, 502, error.code);
    }
    if (error instanceof z.ZodError) {
      console.error('[Quiz Validation Error]', error.issues);
      return errorResponse(
        'AI returned an unexpected question format. Please try again.',
        ErrorCode.GEMINI_ERROR,
        502
      );
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Quiz Error]', message);
    return errorResponse('Failed to generate quiz questions. Please try again.', ErrorCode.INTERNAL_ERROR, 500);
  }
}
