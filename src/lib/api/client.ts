import { apiFetch } from '@/lib/fetch-client';
import type { DataInsight, QuizQuestion, QuizAnswer, TalentReport } from '@/types';

// Request types
interface GmailRequest {
  accessToken: string;
}

interface ChatGPTRequest {
  content: string;
}

interface AnalyzeRequest {
  dataSources: Record<string, string>;
}

interface QuizRequest {
  dataContext: string;
  previousAnswers: QuizAnswer[];
  batchIndex: number;
}

interface ReportRequest {
  dataInsights: DataInsight[];
  quizAnswers: QuizAnswer[];
  sessionInsights: { timestamp: number; observation: string; category: string; confidence: number }[];
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

    report: (req: ReportRequest) =>
      apiFetch<TalentReport>('/api/gemini/report', {
        method: 'POST',
        body: JSON.stringify(req),
      }),

    ephemeralToken: () =>
      apiFetch<EphemeralTokenResponse>('/api/gemini/ephemeral-token', {
        method: 'POST',
      }),
  },
};
