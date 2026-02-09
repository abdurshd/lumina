import type { QuizModuleId } from '@/types';
import {
  RIASEC_DIMENSIONS,
  WORK_VALUE_DIMENSIONS,
  SKILL_CONFIDENCE_DIMENSIONS,
  LEARNING_ENVIRONMENT_DIMENSIONS,
  CONSTRAINT_SIGNAL_DIMENSIONS,
} from '@/lib/psychometrics/dimension-model';

export interface QuizModuleConfig {
  id: QuizModuleId;
  label: string;
  description: string;
  questionCount: number;
  dimensions: string[];
  icon: string;
}

export const QUIZ_MODULES: QuizModuleConfig[] = [
  {
    id: 'interests',
    label: 'Interests',
    description: 'Explore what naturally draws your attention and energy using RIASEC dimensions.',
    questionCount: 5,
    dimensions: [...RIASEC_DIMENSIONS],
    icon: 'Compass',
  },
  {
    id: 'work_values',
    label: 'Work Values',
    description: 'Understand what matters most to you in a work environment.',
    questionCount: 4,
    dimensions: [...WORK_VALUE_DIMENSIONS],
    icon: 'Heart',
  },
  {
    id: 'strengths_skills',
    label: 'Strengths & Skills',
    description: 'Identify your natural abilities across creative, analytical, and interpersonal domains.',
    questionCount: 4,
    dimensions: [...SKILL_CONFIDENCE_DIMENSIONS],
    icon: 'Zap',
  },
  {
    id: 'learning_environment',
    label: 'Learning & Environment',
    description: 'Discover how you learn best and what work environment suits you.',
    questionCount: 3,
    dimensions: [...LEARNING_ENVIRONMENT_DIMENSIONS],
    icon: 'BookOpen',
  },
  {
    id: 'constraints',
    label: 'Life Constraints',
    description: 'Help us understand your practical considerations for career recommendations.',
    questionCount: 4,
    dimensions: [...CONSTRAINT_SIGNAL_DIMENSIONS],
    icon: 'Settings',
  },
];

export const TOTAL_MODULE_QUESTIONS = QUIZ_MODULES.reduce((sum, m) => sum + m.questionCount, 0);

export function getModuleConfig(moduleId: QuizModuleId): QuizModuleConfig {
  const config = QUIZ_MODULES.find((m) => m.id === moduleId);
  if (!config) throw new Error(`Unknown quiz module: ${moduleId}`);
  return config;
}
