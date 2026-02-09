export type AssessmentStage = 'connections' | 'quiz' | 'session' | 'report';
export type StageStatus = 'locked' | 'active' | 'completed';

export type QuizModuleId = 'interests' | 'work_values' | 'strengths_skills' | 'learning_environment' | 'constraints';

export interface QuizModuleProgress {
  moduleId: QuizModuleId;
  status: 'pending' | 'in_progress' | 'completed';
  answeredCount: number;
  totalCount: number;
}

export interface UserConstraints {
  locationFlexibility: 'anywhere' | 'prefer_remote' | 'specific_location' | 'no_preference';
  salaryPriority: 'critical' | 'important' | 'flexible';
  timeAvailability: 'full_time' | 'part_time' | 'flexible' | 'transitioning';
  educationWillingness: 'none' | 'short_courses' | 'certificate' | 'degree';
  relocationWillingness: 'yes' | 'maybe' | 'no';
}

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
  consentVersion?: number;
  ageGateConfirmed?: boolean;
  videoBehaviorConsent?: boolean;
  dataRetentionMode?: 'session_only' | 'persistent';
  byokEnabled?: boolean;
  byokKeyLast4?: string;
  byokMonthlyBudgetUsd?: number;
  byokHardStop?: boolean;
  corpusName?: string;
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
  moduleId?: QuizModuleId;
}

export interface QuizAnswer {
  questionId: string;
  answer: string | number;
}

export interface QuizScore {
  questionId: string;
  dimensionScores: { dimension: string; score: number; rationale: string; confidence?: number }[];
}

export type QuizDimensionSummary = Record<string, number>;

export interface SessionInsight {
  timestamp: number;
  observation: string;
  category:
    | 'engagement'
    | 'hesitation'
    | 'emotional_intensity'
    | 'clarity_structure'
    | 'collaboration_orientation'
    | 'body_language'
    | 'voice_tone'
    | 'enthusiasm'
    | 'analytical'
    | 'creative'
    | 'interpersonal';
  confidence: number;
  evidence?: string;
  dimension?: string;
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
  confidenceNotes: string[];
  careerRecommendations?: CareerRecommendation[];
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
  evidenceSources: EvidenceSource[];
  confidenceLevel: 'high' | 'medium' | 'low';
}

export interface CareerPath {
  title: string;
  match: number;
  description: string;
  nextSteps: string[];
  riasecCodes: string;
  onetCluster: string;
  evidenceSources: string[];
  confidence: number;
  whyYou: string;
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
  evidenceRef?: EvidenceRef;
  dimensions?: string[];
}

export interface EvidenceRef {
  type: 'quiz' | 'session' | 'data_source' | 'signal';
  questionId?: string;
  transcriptTimestamp?: number;
  excerpt: string;
}

export interface ComputedProfile {
  riasecCode: string;
  dimensionScores: Record<string, number>;
  confidenceScores: Record<string, number>;
  constraints?: UserConstraints;
}

export interface CareerRecommendation {
  clusterId: string;
  matchScore: number;
  confidence: number;
  whyYou: string;
  whatYouDo: string;
  howToTest: string;
  skillsToBuild: string[];
  evidenceChain: EvidenceRef[];
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

// --- Iteration Loop Types ---

export type ChallengeCategory = 'explore' | 'create' | 'connect' | 'learn' | 'reflect';
export type ChallengeStatus = 'suggested' | 'accepted' | 'in_progress' | 'completed' | 'skipped';
export type ProfileSnapshotTrigger = 'initial' | 'quiz_retake' | 'challenge_complete' | 'reflection' | 'feedback';

export interface MicroChallenge {
  id: string;
  title: string;
  description: string;
  category: ChallengeCategory;
  targetDimensions: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  suggestedDuration: string;
  status: ChallengeStatus;
  linkedCareerPath?: string;
  evidence?: string;
  reflection?: string;
  createdAt: number;
  completedAt?: number;
}

export interface Reflection {
  id: string;
  challengeId?: string;
  content: string;
  sentiment: 'positive' | 'neutral' | 'negative' | 'mixed';
  extractedSignals: string[];
  dimensionUpdates: Record<string, number>;
  createdAt: number;
}

export interface ProfileSnapshot {
  version: number;
  timestamp: number;
  computedProfile: ComputedProfile;
  dimensionScores: Record<string, number>;
  reportHeadline?: string;
  riasecCode: string;
  trigger: ProfileSnapshotTrigger;
  deltas?: Record<string, number>;
}

export interface IterationState {
  currentChallenges: string[];
  completedChallengeCount: number;
  totalReflections: number;
  lastProfileUpdate: number;
  iterationCount: number;
}

export interface ActionPlanProgress {
  items: Record<string, { status: 'pending' | 'in_progress' | 'completed'; completedAt?: number; notes?: string }>;
  updatedAt: number;
}

export interface CorpusDocument {
  id: string;
  documentName: string;
  source: string;
  title: string;
  uploadedAt: number;
  sizeBytes: number;
  approved: boolean;
}

// --- Agent Confidence Types ---

export type ConfidenceSourceType = 'quiz' | 'session' | 'data_source';

export interface ConfidenceSource {
  type: ConfidenceSourceType;
  dimension: string;
  score: number;
  evidence: string;
  timestamp: number;
}

export interface DimensionConfidence {
  dimension: string;
  confidence: number;
  sourceCount: number;
  sourceTypes: ConfidenceSourceType[];
  sources: ConfidenceSource[];
}

export interface ConfidenceProfile {
  dimensions: Record<string, DimensionConfidence>;
  overallConfidence: number;
  lastUpdated: number;
}

export interface DimensionGap {
  dimension: string;
  currentConfidence: number;
  targetConfidence: number;
  missingSourceTypes: ConfidenceSourceType[];
  importance: number;
}

// --- Agent Orchestrator Types ---

export type AgentActionType =
  | 'analyze_source'
  | 'run_quiz_module'
  | 'start_session'
  | 'generate_report'
  | 'refine_report_section'
  | 'request_additional_data'
  | 'probe_dimension';

export type AgentActionPriority = 'critical' | 'high' | 'medium' | 'low';

export interface AgentAction {
  type: AgentActionType;
  priority: AgentActionPriority;
  reason: string;
  confidenceImpact: number;
  blockedBy: string[];
  metadata?: Record<string, string | number | boolean>;
}

export interface AgentState {
  connectedSources: string[];
  quizCompletedModules: QuizModuleId[];
  quizInProgressModules: QuizModuleId[];
  sessionCompleted: boolean;
  sessionInsightsCount: number;
  confidenceProfile: ConfidenceProfile;
  gaps: DimensionGap[];
  reportGenerated: boolean;
  overallConfidence: number;
}

export interface AgentDecision {
  id: string;
  timestamp: number;
  action: AgentActionType;
  reason: string;
  confidenceBefore: number;
  confidenceAfter: number;
  outcome?: 'success' | 'partial' | 'failed' | 'pending';
  metadata?: Record<string, string | number | boolean>;
}

// --- Correlated Insight Types ---

export interface CorrelatedInsight {
  /** Human-readable title of the pattern */
  title: string;
  /** Detailed description of the cross-source pattern */
  description: string;
  /** Dimensions this pattern affects */
  dimensions: string[];
  /** Evidence sources contributing to this pattern */
  evidenceSources: {
    sourceType: 'data_source' | 'quiz' | 'session';
    sourceName: string;
    excerpt: string;
  }[];
  /** Strength of the correlation 0-100 */
  correlationStrength: number;
  /** Is this expected or a hidden pattern? */
  surpriseFactor: 'expected' | 'moderate' | 'surprising' | 'very_surprising';
  /** Convergent (sources agree) or divergent (sources disagree) */
  patternType: 'convergent' | 'divergent' | 'hidden_talent';
}

// --- Behavioral Timeline Types ---

export type BehavioralCategory = SessionInsight['category'];

export type TrendDirection = 'rising' | 'falling' | 'stable';

export interface BehavioralTrend {
  category: BehavioralCategory;
  direction: TrendDirection;
  /** Average confidence in the first half vs second half */
  startAvg: number;
  endAvg: number;
  /** Percentage change from start to end */
  delta: number;
  sampleCount: number;
}

export interface BehavioralCorrelation {
  /** The behavioral category that changed */
  category: BehavioralCategory;
  /** The topic/dimension being discussed when the change occurred */
  topic: string;
  /** Whether the behavior increased or decreased during this topic */
  effect: 'increase' | 'decrease';
  /** Strength of the correlation 0-1 */
  strength: number;
  /** Human-readable description */
  description: string;
}

export interface TimelineSnapshot {
  timestamp: number;
  /** Category averages at this point in time (rolling window) */
  categories: Partial<Record<BehavioralCategory, number>>;
}

// --- Analytics Types ---

export type AnalyticsEventType =
  | 'stage_started'
  | 'stage_completed'
  | 'session_started'
  | 'session_ended'
  | 'session_reconnected'
  | 'quiz_module_completed'
  | 'report_generated'
  | 'report_feedback'
  | 'report_regenerated'
  | 'data_source_connected'
  | 'satisfaction_rating'
  | 'challenge_completed'
  | 'reflection_submitted';

export interface AnalyticsEvent {
  type: AnalyticsEventType;
  timestamp: number;
  metadata?: Record<string, string | number | boolean>;
}

export interface SatisfactionRating {
  rating: number;
  comment?: string;
  timestamp: number;
}
