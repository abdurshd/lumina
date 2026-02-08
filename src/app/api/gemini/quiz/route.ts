import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/gemini/client';
import { QUIZ_GENERATION_PROMPT } from '@/lib/gemini/prompts';
import { QuizQuestionsResponseSchema } from '@/lib/schemas/quiz';

export async function POST(req: NextRequest) {
  try {
    const { dataContext, previousAnswers, batchIndex } = await req.json();

    const client = getGeminiClient();

    const previousContext = previousAnswers?.length > 0
      ? `\n\nPrevious answers from this user:\n${previousAnswers.map((a: { questionId: string; answer: string | number }) => `Q${a.questionId}: ${a.answer}`).join('\n')}\n\nAdapt the next questions based on these answers.`
      : '';

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

Generate exactly ${batchIndex === 0 ? 4 : 3} questions for batch #${batchIndex + 1}. Each question needs: id (string like "q1", "q2"...), type ("multiple_choice" | "slider" | "freetext"), question, options (for multiple_choice, 4 options), sliderMin/sliderMax/sliderLabels (for slider), category.

Respond with valid JSON: { "questions": [...] }`,
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text ?? '';
    const parsed = JSON.parse(text);
    const validated = QuizQuestionsResponseSchema.parse(parsed);

    return NextResponse.json(validated);
  } catch (error) {
    console.error('Quiz generation error:', error);
    return NextResponse.json({ error: 'Failed to generate quiz' }, { status: 500 });
  }
}
