import { apiFetch } from '@/lib/fetch-client';
import type { DataInsight, QuizQuestion, QuizAnswer, TalentReport, QuizScore, QuizDimensionSummary, UserFeedback } from '@/types';

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
}

interface QuizScoreRequest {
  answers: QuizAnswer[];
  questions: QuizQuestion[];
}

interface ReportRequest {
  dataInsights: DataInsight[];
  quizAnswers: QuizAnswer[];
  sessionInsights: { timestamp: number; observation: string; category: string; confidence: number }[];
  quizScores?: QuizDimensionSummary;
}

interface FeedbackRequest {
  itemType: 'career' | 'strength';
  itemId: string;
  feedback: 'agree' | 'disagree';
  reason?: string;
}

// Response types
interface DataSourceResponse {
  data: string;
  tokenCount: number;
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
}

interface EphemeralTokenResponse {
  apiKey: string;
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
  },

  user: {
    deleteData: (req: { sources?: string[] }) =>
      apiFetch<{ success: boolean }>('/api/user/delete-data', {
        method: 'POST',
        body: JSON.stringify(req),
      }),
  },
};
