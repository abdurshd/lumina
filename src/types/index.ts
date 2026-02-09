export type AssessmentStage = 'connections' | 'quiz' | 'session' | 'report';
export type StageStatus = 'locked' | 'active' | 'completed';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  createdAt: number;
  stages: Record<AssessmentStage, StageStatus>;
  googleAccessToken?: string;
  notionAccessToken?: string;
  consentGiven?: boolean;
  consentTimestamp?: number;
  consentSources?: string[];
}

export interface DataInsight {
  source: 'gmail' | 'drive' | 'notion' | 'chatgpt' | 'file_upload';
  summary: string;
  themes: string[];
  skills: string[];
  interests: string[];
  rawTokenCount: number;
}

export interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'slider' | 'freetext';
  question: string;
  options?: string[];
  sliderMin?: number;
  sliderMax?: number;
  sliderLabels?: { min: string; max: string };
  category: string;
  dimension?: string;
  scoringRubric?: Record<string, number>;
}

export interface QuizAnswer {
  questionId: string;
  answer: string | number;
}

export interface QuizScore {
  questionId: string;
  dimensionScores: { dimension: string; score: number; rationale: string }[];
}

export type QuizDimensionSummary = Record<string, number>;

export interface SessionInsight {
  timestamp: number;
  observation: string;
  category: 'body_language' | 'voice_tone' | 'enthusiasm' | 'analytical' | 'creative' | 'interpersonal';
  confidence: number;
}

export interface TalentReport {
  headline: string;
  tagline: string;
  radarDimensions: RadarDimension[];
  topStrengths: Strength[];
  hiddenTalents: string[];
  careerPaths: CareerPath[];
  actionPlan: ActionItem[];
  personalityInsights: string[];
}

export interface RadarDimension {
  label: string;
  value: number;
  description: string;
}

export interface EvidenceSource {
  source: string;
  excerpt: string;
}

export interface Strength {
  name: string;
  score: number;
  evidence: string;
  evidenceSources?: EvidenceSource[];
  confidenceLevel?: 'high' | 'medium' | 'low';
}

export interface CareerPath {
  title: string;
  match: number;
  description: string;
  nextSteps: string[];
  riasecCodes?: string;
  onetCluster?: string;
  evidenceSources?: string[];
  confidence?: number;
  whyYou?: string;
}

export interface ActionItem {
  title: string;
  description: string;
  timeframe: string;
  priority: 'high' | 'medium' | 'low';
}

export interface UserSignal {
  id: string;
  signal: string;
  source: string;
  evidence: string;
  confidence: number;
  timestamp: number;
}

export interface UserFeedback {
  itemType: 'career' | 'strength';
  itemId: string;
  feedback: 'agree' | 'disagree';
  reason?: string;
  timestamp: number;
}

export interface ProfileVersion {
  version: number;
  timestamp: number;
  report: TalentReport;
  quizScores?: QuizDimensionSummary;
}
