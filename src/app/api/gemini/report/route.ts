import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/gemini/client';
import { REPORT_GENERATION_PROMPT } from '@/lib/gemini/prompts';
import { TalentReportSchema } from '@/lib/schemas/report';

export async function POST(req: NextRequest) {
  try {
    const { dataInsights, quizAnswers, sessionInsights } = await req.json();

    const client = getGeminiClient();

    const context = `
=== DATA ANALYSIS ===
${(dataInsights ?? []).map((d: { source: string; summary: string; skills: string[]; interests: string[] }) =>
  `Source: ${d.source}\nSummary: ${d.summary}\nSkills: ${d.skills.join(', ')}\nInterests: ${d.interests.join(', ')}`
).join('\n\n')}

=== QUIZ ANSWERS ===
${(quizAnswers ?? []).map((a: { questionId: string; answer: string | number }) => `Question ${a.questionId}: ${a.answer}`).join('\n')}

=== VIDEO SESSION INSIGHTS ===
${(sessionInsights ?? []).map((i: { category: string; observation: string; confidence: number }) =>
  `[${i.category}] (confidence: ${i.confidence}): ${i.observation}`
).join('\n')}
`;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-pro-preview-06-05',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${REPORT_GENERATION_PROMPT}\n\n${context}\n\nGenerate the talent report as JSON matching this schema:
{
  "headline": "string - specific surprising headline talent",
  "tagline": "string - short inspiring tagline",
  "radarDimensions": [{"label": "string", "value": 0-100, "description": "string"}],
  "topStrengths": [{"name": "string", "score": 0-100, "evidence": "string"}],
  "hiddenTalents": ["string"],
  "careerPaths": [{"title": "string", "match": 0-100, "description": "string", "nextSteps": ["string"]}],
  "actionPlan": [{"title": "string", "description": "string", "timeframe": "string", "priority": "high|medium|low"}],
  "personalityInsights": ["string"]
}

Include exactly 6 radar dimensions (Creativity, Analysis, Leadership, Empathy, Resilience, Vision), 5 top strengths, 3-5 hidden talents, 4 career paths, 5 action items, and 4 personality insights.`,
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
    const validated = TalentReportSchema.parse(parsed);

    return NextResponse.json(validated);
  } catch (error) {
    console.error('Report generation error:', error);
    return NextResponse.json({ error: 'Report generation failed' }, { status: 500 });
  }
}
