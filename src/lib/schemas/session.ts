import { z } from 'zod';
import { Type } from '@google/genai';
import type { FunctionDeclaration } from '@google/genai';

export const SessionInsightSchema = z.object({
  timestamp: z.number(),
  observation: z.string(),
  category: z.enum(['body_language', 'voice_tone', 'enthusiasm', 'analytical', 'creative', 'interpersonal']),
  confidence: z.number().min(0).max(1),
});

export const SaveInsightFunctionDeclaration: FunctionDeclaration = {
  name: 'saveInsight',
  description: 'Save a behavioral observation about the user during the conversation. Call this whenever you notice something noteworthy about the user\'s behavior, tone, enthusiasm, or engagement.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      observation: {
        type: Type.STRING,
        description: 'A detailed description of what you observed',
      },
      category: {
        type: Type.STRING,
        enum: ['body_language', 'voice_tone', 'enthusiasm', 'analytical', 'creative', 'interpersonal'],
        description: 'The category of the observation',
      },
      confidence: {
        type: Type.NUMBER,
        description: 'How confident you are in this observation (0-1)',
      },
    },
    required: ['observation', 'category', 'confidence'],
  },
};

export const FetchUserProfileDeclaration: FunctionDeclaration = {
  name: 'fetchUserProfile',
  description: 'Retrieve the user\'s data insights and quiz dimension scores to personalize the conversation. Call this early in the session to understand the user better.',
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

export const SaveSignalDeclaration: FunctionDeclaration = {
  name: 'saveSignal',
  description: 'Save an atomic talent signal when you identify a clear pattern in the user. Examples: "enjoys organizing events", "thinks visually", "energized by debate".',
  parameters: {
    type: Type.OBJECT,
    properties: {
      signal: {
        type: Type.STRING,
        description: 'A concise description of the talent signal',
      },
      evidence: {
        type: Type.STRING,
        description: 'What evidence supports this signal (what the user said/did)',
      },
      confidence: {
        type: Type.NUMBER,
        description: 'Confidence level (0-1)',
      },
    },
    required: ['signal', 'evidence', 'confidence'],
  },
};
