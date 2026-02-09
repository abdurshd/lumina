export const maxDuration = 60;

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, errorResponse, ErrorCode, safeParseJson, GeminiError } from '@/lib/api-helpers';
import { getGeminiClientForUser } from '@/lib/gemini/client';
import { GEMINI_MODELS } from '@/lib/gemini/models';
import { REFLECTION_ANALYSIS_PROMPT } from '@/lib/gemini/prompts';
import { ReflectionAnalysisSchema } from '@/lib/schemas/iteration';
import {
  saveReflection,
  getComputedProfile,
  saveComputedProfile,
  saveProfileSnapshot,
  getProfileSnapshots,
  updateIterationState,
  getIterationState,
} from '@/lib/firebase/firestore';
import { evolveProfile } from '@/lib/career/profile-evolution';
import { trackGeminiUsage } from '@/lib/gemini/byok';
import { z } from 'zod';
import type { Reflection } from '@/types';

const RequestSchema = z.object({
  content: z.string().min(1, 'Reflection content is required'),
  challengeId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const authResult = await verifyAuth(req);
  if (!authResult) {
    return errorResponse('Authentication required', ErrorCode.UNAUTHORIZED, 401);
  }

  const { uid } = authResult;

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

  const { content, challengeId } = parsed.data;

  try {
    const { client, keySource } = await getGeminiClientForUser({
      uid,
      model: GEMINI_MODELS.FAST,
    });
    const promptText = `${REFLECTION_ANALYSIS_PROMPT}\n\nUser reflection:\n"${content}"${challengeId ? `\n\n(This reflection is related to challenge ID: ${challengeId})` : ''}`;

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
      feature: 'reflection_analyze',
      keySource,
      inputChars: promptText.length,
      outputChars: text.length,
    });

    const jsonData = safeParseJson(text);
    const analysis = ReflectionAnalysisSchema.parse(jsonData);

    // Build the reflection object
    const reflection: Reflection = {
      id: crypto.randomUUID(),
      challengeId,
      content,
      sentiment: analysis.sentiment,
      extractedSignals: analysis.extractedSignals,
      dimensionUpdates: analysis.dimensionUpdates,
      createdAt: Date.now(),
    };

    // Save reflection to Firestore
    await saveReflection(uid, reflection);

    // Evolve the profile based on reflection analysis
    const currentProfile = await getComputedProfile(uid);
    if (currentProfile) {
      const snapshots = await getProfileSnapshots(uid);
      const nextVersion = snapshots.length + 1;

      const result = evolveProfile(
        currentProfile,
        analysis.extractedSignals,
        analysis.dimensionUpdates,
        'reflection',
        nextVersion
      );

      await saveComputedProfile(uid, result.updatedProfile);
      await saveProfileSnapshot(uid, result.snapshot);
    }

    // Update iteration state
    const iterationState = await getIterationState(uid);
    await updateIterationState(uid, {
      totalReflections: (iterationState?.totalReflections ?? 0) + 1,
      lastProfileUpdate: Date.now(),
    });

    return NextResponse.json(reflection);
  } catch (error) {
    if (error instanceof GeminiError) {
      return errorResponse(error.message, ErrorCode.GEMINI_ERROR, 502, error.code);
    }
    if (error instanceof z.ZodError) {
      console.error('[Reflection Analysis Validation Error]', error.issues);
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
    console.error('[Reflection Error]', message);
    return errorResponse('Reflection analysis failed. Please try again.', ErrorCode.INTERNAL_ERROR, 500);
  }
}
