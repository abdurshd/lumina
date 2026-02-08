import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/gemini/client';
import { DATA_ANALYSIS_PROMPT } from '@/lib/gemini/prompts';
import { AnalysisResponseSchema } from '@/lib/schemas/analysis';

export async function POST(req: NextRequest) {
  try {
    const { dataSources } = await req.json();

    if (!dataSources || typeof dataSources !== 'object') {
      return NextResponse.json({ error: 'Missing data sources' }, { status: 400 });
    }

    const client = getGeminiClient();

    // Build context from all data sources
    const contextParts: string[] = [];
    for (const [source, data] of Object.entries(dataSources)) {
      if (data) {
        contextParts.push(`=== ${source.toUpperCase()} DATA ===\n${data}`);
      }
    }

    const response = await client.models.generateContent({
      model: 'gemini-2.5-pro-preview-06-05',
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

    const text = response.text ?? '';
    const parsed = JSON.parse(text);
    const validated = AnalysisResponseSchema.parse(parsed);

    return NextResponse.json(validated);
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
