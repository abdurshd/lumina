import { apiFetch } from '@/lib/fetch-client';
import type { DataInsight, QuizQuestion, QuizAnswer, TalentReport, QuizScore, QuizDimensionSummary, QuizModuleId, ComputedProfile, UserConstraints, MicroChallenge, Reflection, ActionPlanProgress } from '@/types';
// Note: MicroChallenge, Reflection, and ActionPlanProgress are used in the iteration/corpus/user API methods

// Request types
interface GmailRequest {
  accessToken: string;
}

interface ChatGPTRequest {
  content: string;
}

interface DriveRequest {
  accessToken: string;
}

interface NotionRequest {
  accessToken: string;
}

interface NotionAuthRequest {
  code: string;
  redirectUri: string;
}

interface AnalyzeRequest {
  dataSources: Record<string, string>;
}

interface QuizRequest {
  dataContext: string;
  previousAnswers: QuizAnswer[];
  batchIndex: number;
  moduleId?: QuizModuleId;
}

interface QuizScoreRequest {
  answers: QuizAnswer[];
  questions: QuizQuestion[];
}

interface ReportRequest {
  dataInsights: DataInsight[];
  quizAnswers: QuizAnswer[];
  sessionInsights: { timestamp: number; observation: string; category: string; confidence: number; evidence?: string }[];
  quizScores?: QuizDimensionSummary;
  quizConfidence?: QuizDimensionSummary;
  computedProfile?: ComputedProfile;
  constraints?: UserConstraints;
}

interface RegenerateReportRequest {
  feedback: string;
  context?: {
    dataInsights?: DataInsight[];
    quizAnswers?: QuizAnswer[];
    sessionInsights?: { timestamp: number; observation: string; category: string; confidence: number; evidence?: string }[];
    quizScores?: QuizDimensionSummary;
    existingReport?: TalentReport;
    feedbackItems?: { itemType: 'career' | 'strength'; itemId: string; feedback: 'agree' | 'disagree'; reason?: string }[];
  };
}

interface UpdateProfileRequest {
  displayName?: string;
  consentSources?: string[];
  ageGateConfirmed?: boolean;
  videoBehaviorConsent?: boolean;
  dataRetentionMode?: 'session_only' | 'persistent';
  byokEnabled?: boolean;
  byokKeyLast4?: string;
  byokMonthlyBudgetUsd?: number;
  byokHardStop?: boolean;
}

interface FeedbackRequest {
  itemType: 'career' | 'strength';
  itemId: string;
  feedback: 'agree' | 'disagree';
  reason?: string;
}

interface ByokUpdateRequest {
  enabled?: boolean;
  apiKey?: string;
  clearKey?: boolean;
  monthlyBudgetUsd?: number;
  hardStop?: boolean;
}

// Response types
interface DataSourceResponse {
  source: 'gmail' | 'drive' | 'notion' | 'chatgpt' | 'file_upload' | 'gemini_app' | 'claude_app';
  data: string;
  tokenCount: number;
  metadata: {
    itemCount: number;
    charCount: number;
    byteSize: number;
    parseQuality: 'high' | 'medium' | 'low';
    truncated: boolean;
    truncationSummary?: string;
    warnings: string[];
  };
}

interface AnalyzeResponse {
  insights: DataInsight[];
}

interface QuizResponse {
  questions: QuizQuestion[];
}

interface QuizScoreResponse {
  scores: QuizScore[];
  dimensionSummary: QuizDimensionSummary;
  dimensionConfidence?: QuizDimensionSummary;
}

interface EphemeralTokenResponse {
  token: string;
  apiVersion: 'v1alpha' | 'v1';
  model: string;
  expireTime: string;
  newSessionExpireTime: string;
  uses: number;
}

export const apiClient = {
  data: {
    gmail: (req: GmailRequest) =>
      apiFetch<DataSourceResponse>('/api/data/gmail', {
        method: 'POST',
        body: JSON.stringify(req),
      }),

    chatgpt: (req: ChatGPTRequest) =>
      apiFetch<DataSourceResponse>('/api/data/chatgpt', {
        method: 'POST',
        body: JSON.stringify(req),
      }),

    fileUpload: (formData: FormData) =>
      apiFetch<DataSourceResponse>('/api/data/file-upload', {
        method: 'POST',
        body: formData,
      }),

    drive: (req: DriveRequest) =>
      apiFetch<DataSourceResponse>('/api/data/drive', {
        method: 'POST',
        body: JSON.stringify(req),
      }),

    notion: (req: NotionRequest) =>
      apiFetch<DataSourceResponse>('/api/data/notion', {
        method: 'POST',
        body: JSON.stringify(req),
      }),

    geminiApp: (req: ChatGPTRequest) =>
      apiFetch<DataSourceResponse>('/api/data/gemini-app', {
        method: 'POST',
        body: JSON.stringify(req),
      }),

    claudeApp: (req: ChatGPTRequest) =>
      apiFetch<DataSourceResponse>('/api/data/claude-app', {
        method: 'POST',
        body: JSON.stringify(req),
      }),
  },

  auth: {
    notionCallback: (req: NotionAuthRequest) =>
      apiFetch<{ success: boolean }>('/api/auth/notion', {
        method: 'POST',
        body: JSON.stringify(req),
      }),
  },

  gemini: {
    analyze: (req: AnalyzeRequest) =>
      apiFetch<AnalyzeResponse>('/api/gemini/analyze', {
        method: 'POST',
        body: JSON.stringify(req),
      }),

    quiz: (req: QuizRequest) =>
      apiFetch<QuizResponse>('/api/gemini/quiz', {
        method: 'POST',
        body: JSON.stringify(req),
      }),

    quizScore: (req: QuizScoreRequest) =>
      apiFetch<QuizScoreResponse>('/api/gemini/quiz-score', {
        method: 'POST',
        body: JSON.stringify(req),
      }),

    report: (req: ReportRequest) =>
      apiFetch<TalentReport>('/api/gemini/report', {
        method: 'POST',
        body: JSON.stringify(req),
      }),

    ephemeralToken: () =>
      apiFetch<EphemeralTokenResponse>('/api/gemini/ephemeral-token', {
        method: 'POST',
      }),

    feedback: (req: FeedbackRequest) =>
      apiFetch<{ success: boolean }>('/api/gemini/feedback', {
        method: 'POST',
        body: JSON.stringify(req),
      }),

    regenerateReport: (req: RegenerateReportRequest) =>
      apiFetch<TalentReport>('/api/gemini/regenerate-report', {
        method: 'POST',
        body: JSON.stringify(req),
      }),
  },

  user: {
    deleteData: (req: { sources?: string[] }) =>
      apiFetch<{ success: boolean }>('/api/user/delete-data', {
        method: 'POST',
        body: JSON.stringify(req),
      }),

    updateProfile: (req: UpdateProfileRequest) =>
      apiFetch<{ success: boolean }>('/api/user/update-profile', {
        method: 'POST',
        body: JSON.stringify(req),
      }),

    updateActionPlanProgress: (req: { items: ActionPlanProgress['items'] }) =>
      apiFetch<{ success: boolean }>('/api/user/action-plan-progress', {
        method: 'POST',
        body: JSON.stringify(req),
      }),

    getByok: () =>
      apiFetch<{
        enabled: boolean;
        keyLast4: string | null;
        monthlyBudgetUsd: number;
        hardStop: boolean;
        estimatedMonthlySpendUsd: number;
        budgetExceeded: boolean;
      }>('/api/user/byok'),

    updateByok: (req: ByokUpdateRequest) =>
      apiFetch<{ success: boolean }>('/api/user/byok', {
        method: 'POST',
        body: JSON.stringify(req),
      }),
  },

  iteration: {
    generateChallenges: () =>
      apiFetch<{ challenges: MicroChallenge[] }>('/api/gemini/challenges/generate', {
        method: 'POST',
      }),

    completeChallenge: (challengeId: string, req: { evidence: string; reflection?: string }) =>
      apiFetch<{ success: boolean }>(`/api/gemini/challenges/${challengeId}/complete`, {
        method: 'POST',
        body: JSON.stringify(req),
      }),

    submitReflection: (req: { content: string; challengeId?: string }) =>
      apiFetch<Reflection>('/api/gemini/reflections', {
        method: 'POST',
        body: JSON.stringify(req),
      }),
  },

  corpus: {
    upload: (formData: FormData) =>
      apiFetch<{ success: boolean }>('/api/corpus', {
        method: 'POST',
        body: formData,
      }),

    deleteDocument: (docId: string) =>
      apiFetch<{ success: boolean }>(`/api/corpus/documents/${docId}`, {
        method: 'DELETE',
      }),
  },
};
