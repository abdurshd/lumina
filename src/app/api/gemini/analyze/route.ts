import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, errorResponse, ErrorCode, safeParseJson, GeminiError } from '@/lib/api-helpers';
import { getGeminiClient } from '@/lib/gemini/client';
import { DATA_ANALYSIS_PROMPT } from '@/lib/gemini/prompts';
import { AnalysisResponseSchema } from '@/lib/schemas/analysis';
import { z } from 'zod';

const RequestSchema = z.object({
  dataSources: z.record(z.string(), z.string()).refine(
    (obj) => Object.keys(obj).length > 0,
    { message: 'At least one data source is required' }
  ),
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

  const { dataSources } = parsed.data;

  try {
    const client = getGeminiClient();

    const contextParts: string[] = [];
    for (const [source, data] of Object.entries(dataSources)) {
      if (data.trim()) {
        contextParts.push(`=== ${source.toUpperCase()} DATA ===\n${data}`);
      }
    }

    if (contextParts.length === 0) {
      return errorResponse('All data sources are empty', ErrorCode.VALIDATION_ERROR, 400);
    }

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash-preview-05-20',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${DATA_ANALYSIS_PROMPT}\n\n${contextParts.join('\n\n')}\n\nRespond with valid JSON matching this schema: { insights: [{ source, summary, themes, skills, interests, rawTokenCount }], overallSummary, keyPatterns }`,
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
    const validated = AnalysisResponseSchema.parse(jsonData);

    return NextResponse.json(validated);
  } catch (error) {
    if (error instanceof GeminiError) {
      return errorResponse(error.message, ErrorCode.GEMINI_ERROR, 502, error.code);
    }
    if (error instanceof z.ZodError) {
      console.error('[Analysis Validation Error]', error.issues);
      return errorResponse(
        'AI returned an unexpected response format. Please try again.',
        ErrorCode.GEMINI_ERROR,
        502
      );
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Analysis Error]', message);
    return errorResponse('Data analysis failed. Please try again.', ErrorCode.INTERNAL_ERROR, 500);
  }
}
