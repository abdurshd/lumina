/** Centralized Gemini model constants — single source of truth */
export const GEMINI_MODELS = {
  /** Fast model for quiz, scoring, analysis, file processing */
  FAST: 'gemini-3-flash-preview',
  /** Deep model for report generation (higher quality reasoning) */
  DEEP: 'gemini-3-pro-preview',
  /** Live audio/video sessions */
  LIVE: 'gemini-2.5-flash-native-audio-preview-12-2025',
} as const;

export type GeminiModelId = (typeof GEMINI_MODELS)[keyof typeof GEMINI_MODELS];

/**
 * Live endpoints are strict about fully-qualified model resource names.
 * Keep constants canonical (without prefix) and normalize only when needed.
 */
export function toLiveApiModelName(model: string): string {
  return model.startsWith('models/') ? model : `models/${model}`;
}
