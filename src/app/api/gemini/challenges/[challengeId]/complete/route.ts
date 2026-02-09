export const maxDuration = 60;

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, errorResponse, ErrorCode, safeParseJson, GeminiError } from '@/lib/api-helpers';
import { getGeminiClient } from '@/lib/gemini/client';
import { GEMINI_MODELS } from '@/lib/gemini/models';
import { REFLECTION_ANALYSIS_PROMPT } from '@/lib/gemini/prompts';
import { ReflectionAnalysisSchema } from '@/lib/schemas/iteration';
import {
  updateChallenge,
  getComputedProfile,
  saveComputedProfile,
  saveProfileSnapshot,
  getProfileSnapshots,
  saveReflection,
  updateIterationState,
  getIterationState,
} from '@/lib/firebase/firestore';
import { evolveProfile } from '@/lib/career/profile-evolution';
import { z } from 'zod';
import type { Reflection, ProfileSnapshot } from '@/types';

const RequestSchema = z.object({
  evidence: z.string().min(1, 'Evidence is required'),
  reflection: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ challengeId: string }> }
) {
  const authResult = await verifyAuth(req);
  if (!authResult) {
    return errorResponse('Authentication required', ErrorCode.UNAUTHORIZED, 401);
  }

  const { uid } = authResult;
  const { challengeId } = await params;

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

  const { evidence, reflection } = parsed.data;

  try {
    // Mark challenge as completed
    await updateChallenge(uid, challengeId, {
      status: 'completed',
      evidence,
      completedAt: Date.now(),
    });

    let snapshot: ProfileSnapshot | undefined;

    // If a reflection is provided, analyze it and evolve the profile
    if (reflection) {
      const client = getGeminiClient();

      const response = await client.models.generateContent({
        model: GEMINI_MODELS.FAST,
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `${REFLECTION_ANALYSIS_PROMPT}\n\nUser reflection after completing a challenge:\n"${reflection}"`,
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
      const analysis = ReflectionAnalysisSchema.parse(jsonData);

      // Save the reflection
      const reflectionObj: Reflection = {
        id: crypto.randomUUID(),
        challengeId,
        content: reflection,
        sentiment: analysis.sentiment,
        extractedSignals: analysis.extractedSignals,
        dimensionUpdates: analysis.dimensionUpdates,
        createdAt: Date.now(),
      };
      await saveReflection(uid, reflectionObj);

      // Evolve the profile
      const currentProfile = await getComputedProfile(uid);
      if (currentProfile) {
        const snapshots = await getProfileSnapshots(uid);
        const nextVersion = snapshots.length + 1;

        const result = evolveProfile(
          currentProfile,
          analysis.extractedSignals,
          analysis.dimensionUpdates,
          'challenge_complete',
          nextVersion
        );

        await saveComputedProfile(uid, result.updatedProfile);
        await saveProfileSnapshot(uid, result.snapshot);
        snapshot = result.snapshot;
      }
    } else {
      // Even without a reflection, evolve the profile minimally on challenge completion
      const currentProfile = await getComputedProfile(uid);
      if (currentProfile) {
        const snapshots = await getProfileSnapshots(uid);
        const nextVersion = snapshots.length + 1;

        const result = evolveProfile(
          currentProfile,
          [],
          {},
          'challenge_complete',
          nextVersion
        );

        await saveComputedProfile(uid, result.updatedProfile);
        await saveProfileSnapshot(uid, result.snapshot);
        snapshot = result.snapshot;
      }
    }

    // Update iteration state
    const iterationState = await getIterationState(uid);
    await updateIterationState(uid, {
      completedChallengeCount: (iterationState?.completedChallengeCount ?? 0) + 1,
      lastProfileUpdate: Date.now(),
      iterationCount: (iterationState?.iterationCount ?? 0) + 1,
    });

    return NextResponse.json({ success: true, snapshot });
  } catch (error) {
    if (error instanceof GeminiError) {
      return errorResponse(error.message, ErrorCode.GEMINI_ERROR, 502, error.code);
    }
    if (error instanceof z.ZodError) {
      console.error('[Challenge Complete Validation Error]', error.issues);
      return errorResponse(
        'AI returned an unexpected response format. Please try again.',
        ErrorCode.GEMINI_ERROR,
        502
      );
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Challenge Complete Error]', message);
    return errorResponse('Failed to complete challenge. Please try again.', ErrorCode.INTERNAL_ERROR, 500);
  }
}
