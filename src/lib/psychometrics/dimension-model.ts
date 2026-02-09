export const RIASEC_DIMENSIONS = [
  'Realistic',
  'Investigative',
  'Artistic',
  'Social',
  'Enterprising',
  'Conventional',
] as const;

export const WORK_VALUE_DIMENSIONS = [
  'Autonomy',
  'Stability',
  'Helping_Others',
  'Achievement',
  'Variety',
  'Recognition',
] as const;

export const SKILL_CONFIDENCE_DIMENSIONS = [
  'Creative_Thinking',
  'Analytical_Ability',
  'Interpersonal_Skills',
] as const;

export const LEARNING_ENVIRONMENT_DIMENSIONS = [
  'Learning_Style',
  'Environment_Preference',
  'Risk_Tolerance',
] as const;

export const CONSTRAINT_SIGNAL_DIMENSIONS = [
  'Location',
  'Salary',
  'Time',
  'Education',
  'Relocation',
] as const;

export const BEHAVIORAL_SIGNAL_FACTORS = [
  'engagement',
  'hesitation',
  'emotional_intensity',
  'clarity_structure',
  'collaboration_orientation',
] as const;

export const LEGACY_SESSION_INSIGHT_CATEGORIES = [
  'body_language',
  'voice_tone',
  'enthusiasm',
  'analytical',
  'creative',
  'interpersonal',
] as const;

export const SESSION_INSIGHT_CATEGORIES = [
  'engagement',
  'hesitation',
  'emotional_intensity',
  'clarity_structure',
  'collaboration_orientation',
  'body_language',
  'voice_tone',
  'enthusiasm',
  'analytical',
  'creative',
  'interpersonal',
] as const;

export const ALL_PSYCHOMETRIC_DIMENSIONS = [
  ...RIASEC_DIMENSIONS,
  ...WORK_VALUE_DIMENSIONS,
  ...SKILL_CONFIDENCE_DIMENSIONS,
  ...LEARNING_ENVIRONMENT_DIMENSIONS,
  ...CONSTRAINT_SIGNAL_DIMENSIONS,
  ...BEHAVIORAL_SIGNAL_FACTORS,
] as const;

export type PsychometricDimension = (typeof ALL_PSYCHOMETRIC_DIMENSIONS)[number];
export type SessionInsightCategory = (typeof SESSION_INSIGHT_CATEGORIES)[number];

const DIMENSION_ALIAS_LOOKUP: Record<string, PsychometricDimension> = {
  realistic: 'Realistic',
  investigative: 'Investigative',
  artistic: 'Artistic',
  social: 'Social',
  enterprising: 'Enterprising',
  conventional: 'Conventional',
  autonomy: 'Autonomy',
  stability: 'Stability',
  helping_others: 'Helping_Others',
  helpingothers: 'Helping_Others',
  helpingotherssocialimpact: 'Helping_Others',
  achievement: 'Achievement',
  variety: 'Variety',
  recognition: 'Recognition',
  creative_thinking: 'Creative_Thinking',
  creativethinking: 'Creative_Thinking',
  analytical_ability: 'Analytical_Ability',
  analyticalability: 'Analytical_Ability',
  interpersonal_skills: 'Interpersonal_Skills',
  interpersonalskills: 'Interpersonal_Skills',
  learning_style: 'Learning_Style',
  learningstyle: 'Learning_Style',
  environment_preference: 'Environment_Preference',
  environmentpreference: 'Environment_Preference',
  risk_tolerance: 'Risk_Tolerance',
  risktolerance: 'Risk_Tolerance',
  location: 'Location',
  salary: 'Salary',
  time: 'Time',
  education: 'Education',
  relocation: 'Relocation',
  engagement: 'engagement',
  hesitation: 'hesitation',
  emotional_intensity: 'emotional_intensity',
  emotionalintensity: 'emotional_intensity',
  clarity_structure: 'clarity_structure',
  claritystructure: 'clarity_structure',
  collaboration_orientation: 'collaboration_orientation',
  collaborationorientation: 'collaboration_orientation',
};

export const SESSION_CATEGORY_DIMENSION_WEIGHTS: Record<
  SessionInsightCategory,
  Partial<Record<PsychometricDimension, number>>
> = {
  engagement: {
    engagement: 0.75,
    collaboration_orientation: 0.35,
    Social: 0.2,
  },
  hesitation: {
    hesitation: 0.9,
    emotional_intensity: 0.2,
  },
  emotional_intensity: {
    emotional_intensity: 0.5,
    clarity_structure: 0.45,
    Social: 0.15,
  },
  clarity_structure: {
    Analytical_Ability: 0.85,
    Investigative: 0.5,
    clarity_structure: 0.4,
  },
  collaboration_orientation: {
    Interpersonal_Skills: 0.85,
    Social: 0.6,
    collaboration_orientation: 0.55,
  },
  body_language: {
    engagement: 0.7,
    collaboration_orientation: 0.35,
    Social: 0.2,
  },
  voice_tone: {
    emotional_intensity: 0.45,
    clarity_structure: 0.45,
    Social: 0.15,
  },
  enthusiasm: {
    engagement: 0.85,
    emotional_intensity: 0.35,
    Enterprising: 0.2,
    Artistic: 0.15,
  },
  analytical: {
    clarity_structure: 0.55,
    Analytical_Ability: 0.8,
    Investigative: 0.45,
  },
  creative: {
    Creative_Thinking: 0.85,
    Artistic: 0.55,
  },
  interpersonal: {
    collaboration_orientation: 0.65,
    Interpersonal_Skills: 0.8,
    Social: 0.6,
  },
};

export function normalizeDimensionName(raw: string): PsychometricDimension | null {
  const normalized = raw.trim().toLowerCase().replace(/[\s-]+/g, '_');
  return DIMENSION_ALIAS_LOOKUP[normalized] ?? null;
}

export function isKnownDimension(value: string): value is PsychometricDimension {
  return normalizeDimensionName(value) !== null;
}

export function normalizeSessionInsightCategory(value: string): SessionInsightCategory | null {
  const normalized = value.trim().toLowerCase().replace(/[\s-]+/g, '_');
  const categories = new Set<string>(SESSION_INSIGHT_CATEGORIES);
  if (categories.has(normalized)) {
    return normalized as SessionInsightCategory;
  }

  const aliases: Record<string, SessionInsightCategory> = {
    bodylanguage: 'body_language',
    voicetone: 'voice_tone',
  };
  return aliases[normalized] ?? null;
}
