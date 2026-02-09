import { z } from 'zod';
import { Type } from '@google/genai';
import type { FunctionDeclaration } from '@google/genai';
import { BEHAVIORAL_SIGNAL_FACTORS, SESSION_INSIGHT_CATEGORIES } from '@/lib/psychometrics/dimension-model';

export const SessionInsightSchema = z.object({
  timestamp: z.number(),
  observation: z.string(),
  category: z.enum(SESSION_INSIGHT_CATEGORIES),
  confidence: z.number().min(0).max(1),
  evidence: z.string().optional(),
});

export const SaveInsightFunctionDeclaration: FunctionDeclaration = {
  name: 'saveInsight',
  description: 'Save a behavioral observation using the behavioral taxonomy. Include concise evidence from what the user said or did.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      observation: {
        type: Type.STRING,
        description: 'A detailed description of what you observed',
      },
      category: {
        type: Type.STRING,
        enum: [...BEHAVIORAL_SIGNAL_FACTORS],
        description: 'Behavioral taxonomy category',
      },
      confidence: {
        type: Type.NUMBER,
        description: 'How confident you are in this observation (0-1)',
      },
      evidence: {
        type: Type.STRING,
        description: 'Short evidence snippet describing what triggered this observation',
      },
    },
    required: ['observation', 'category', 'confidence', 'evidence'],
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

export const StartQuizModuleDeclaration: FunctionDeclaration = {
  name: 'startQuizModule',
  description: 'Suggest a specific quiz module for the user to take based on the conversation. Use this when you notice gaps in the user\'s assessment data that a particular module would fill. Valid modules: interests, work_values, strengths_skills, learning_environment, constraints.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      moduleId: {
        type: Type.STRING,
        enum: ['interests', 'work_values', 'strengths_skills', 'learning_environment', 'constraints'],
        description: 'The quiz module to suggest',
      },
      reason: {
        type: Type.STRING,
        description: 'Why this module would be helpful for the user right now',
      },
    },
    required: ['moduleId', 'reason'],
  },
};

export const ScheduleNextStepDeclaration: FunctionDeclaration = {
  name: 'scheduleNextStep',
  description: 'Record a concrete next step or action item that emerged from the conversation. Use this when the user expresses interest in trying something or when you identify a specific actionable suggestion.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: 'Short title for the next step',
      },
      description: {
        type: Type.STRING,
        description: 'What the user should do and why',
      },
      timeframe: {
        type: Type.STRING,
        description: 'Suggested timeframe (e.g., "this week", "next month")',
      },
    },
    required: ['title', 'description', 'timeframe'],
  },
};
