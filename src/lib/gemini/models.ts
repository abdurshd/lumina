/** Centralized Gemini model constants — single source of truth */
export const GEMINI_MODELS = {
  /** Fast model for quiz, scoring, analysis, file processing */
  FAST: 'gemini-2.5-flash',
  /** Deep model for report generation (higher quality reasoning) */
  DEEP: 'gemini-2.5-pro',
  /** Live audio/video sessions */
  LIVE: 'gemini-2.5-flash-native-audio-preview-12-2025',
} as const;

export type GeminiModelId = (typeof GEMINI_MODELS)[keyof typeof GEMINI_MODELS];
