export const maxDuration = 60;

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, errorResponse, ErrorCode, safeParseJson, GeminiError } from '@/lib/api-helpers';
import { getGeminiClientForUser } from '@/lib/gemini/client';
import { GEMINI_MODELS } from '@/lib/gemini/models';
import { CHALLENGE_GENERATION_PROMPT } from '@/lib/gemini/prompts';
import { MicroChallengeResponseSchema } from '@/lib/schemas/iteration';
import { getTalentReport, getComputedProfile, getChallenges, saveChallenges, updateIterationState } from '@/lib/firebase/firestore';
import { trackGeminiUsage } from '@/lib/gemini/byok';
import { z } from 'zod';
import type { MicroChallenge } from '@/types';

export async function POST(req: NextRequest) {
  const authResult = await verifyAuth(req);
  if (!authResult) {
    return errorResponse('Authentication required', ErrorCode.UNAUTHORIZED, 401);
  }

  const { uid } = authResult;

  try {
    // Fetch user data from Firestore
    const [report, profile, existingChallenges] = await Promise.all([
      getTalentReport(uid),
      getComputedProfile(uid),
      getChallenges(uid),
    ]);

    if (!report) {
      return errorResponse(
        'Talent report not found. Complete the assessment first.',
        ErrorCode.BAD_REQUEST,
        400
      );
    }

    const completedChallenges = existingChallenges.filter((c) => c.status === 'completed');
    const completedTitles = completedChallenges.map((c) => c.title);

    // Build context for Gemini
    const context = `
=== TALENT REPORT ===
Headline: ${report.headline}
Top Strengths: ${report.topStrengths.map((s) => s.name).join(', ')}
Career Paths: ${report.careerPaths.map((p) => `${p.title} (${p.match}% match)`).join(', ')}
Hidden Talents: ${report.hiddenTalents.join(', ')}

${profile ? `=== COMPUTED PROFILE ===
RIASEC Code: ${profile.riasecCode}
Dimension Scores: ${Object.entries(profile.dimensionScores).map(([dim, score]) => `${dim}: ${score}`).join(', ')}` : ''}

=== COMPLETED CHALLENGES ===
${completedTitles.length > 0 ? completedTitles.join('\n') : 'None yet'}
`;

    const { client, keySource } = await getGeminiClientForUser({
      uid,
      model: GEMINI_MODELS.FAST,
    });
    const promptText = `${CHALLENGE_GENERATION_PROMPT}\n\n${context}`;

    const response = await client.models.generateContent({
      model: GEMINI_MODELS.FAST,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: promptText,
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

    await trackGeminiUsage({
      uid,
      model: GEMINI_MODELS.FAST,
      feature: 'challenge_generate',
      keySource,
      inputChars: promptText.length,
      outputChars: text.length,
    });

    const jsonData = safeParseJson(text);
    const validated = MicroChallengeResponseSchema.parse(jsonData);

    // Transform into full MicroChallenge objects with IDs and status
    const now = Date.now();
    const challenges: MicroChallenge[] = validated.challenges.map((c) => ({
      ...c,
      id: crypto.randomUUID(),
      status: 'suggested' as const,
      createdAt: now,
    }));

    // Save to Firestore
    await saveChallenges(uid, challenges);

    // Update iteration state
    await updateIterationState(uid, {
      currentChallenges: challenges.map((c) => c.id),
      lastProfileUpdate: now,
    });

    return NextResponse.json({ challenges });
  } catch (error) {
    if (error instanceof GeminiError) {
      return errorResponse(error.message, ErrorCode.GEMINI_ERROR, 502, error.code);
    }
    if (error instanceof z.ZodError) {
      console.error('[Challenge Generation Validation Error]', error.issues);
      return errorResponse(
        'AI returned an unexpected response format. Please try again.',
        ErrorCode.GEMINI_ERROR,
        502
      );
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('budget exceeded')) {
      return errorResponse(
        'Monthly Gemini budget exceeded. Update BYOK settings or wait for next cycle.',
        ErrorCode.RATE_LIMITED,
        429
      );
    }
    console.error('[Challenge Generation Error]', message);
    return errorResponse('Challenge generation failed. Please try again.', ErrorCode.INTERNAL_ERROR, 500);
  }
}
