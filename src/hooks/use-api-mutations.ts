import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

export function useGmailMutation() {
  return useMutation({
    mutationFn: apiClient.data.gmail,
  });
}

export function useChatGPTMutation() {
  return useMutation({
    mutationFn: apiClient.data.chatgpt,
  });
}

export function useFileUploadMutation() {
  return useMutation({
    mutationFn: apiClient.data.fileUpload,
  });
}

export function useDriveMutation() {
  return useMutation({
    mutationFn: apiClient.data.drive,
  });
}

export function useNotionMutation() {
  return useMutation({
    mutationFn: apiClient.data.notion,
  });
}

export function useGeminiAppMutation() {
  return useMutation({
    mutationFn: apiClient.data.geminiApp,
  });
}

export function useClaudeAppMutation() {
  return useMutation({
    mutationFn: apiClient.data.claudeApp,
  });
}

export function useNotionAuthMutation() {
  return useMutation({
    mutationFn: apiClient.auth.notionCallback,
  });
}

export function useAnalyzeMutation() {
  return useMutation({
    mutationFn: apiClient.gemini.analyze,
  });
}

export function useQuizMutation() {
  return useMutation({
    mutationFn: apiClient.gemini.quiz,
  });
}

export function useQuizScoreMutation() {
  return useMutation({
    mutationFn: apiClient.gemini.quizScore,
  });
}

export function useReportMutation() {
  return useMutation({
    mutationFn: apiClient.gemini.report,
  });
}

export function useEphemeralTokenMutation() {
  return useMutation({
    mutationFn: apiClient.gemini.ephemeralToken,
  });
}

export function useFeedbackMutation() {
  return useMutation({
    mutationFn: apiClient.gemini.feedback,
  });
}

export function useRegenerateReportMutation() {
  return useMutation({
    mutationFn: apiClient.gemini.regenerateReport,
  });
}

export function useDeleteDataMutation() {
  return useMutation({
    mutationFn: apiClient.user.deleteData,
  });
}

export function useUpdateProfileMutation() {
  return useMutation({
    mutationFn: apiClient.user.updateProfile,
  });
}

export function useGenerateChallengesMutation() {
  return useMutation({
    mutationFn: apiClient.iteration.generateChallenges,
  });
}

export function useCompleteChallengeMutation() {
  return useMutation({
    mutationFn: ({ challengeId, ...req }: { challengeId: string; evidence: string; reflection?: string }) =>
      apiClient.iteration.completeChallenge(challengeId, req),
  });
}

export function useSubmitReflectionMutation() {
  return useMutation({
    mutationFn: apiClient.iteration.submitReflection,
  });
}

export function useUpdateActionPlanProgressMutation() {
  return useMutation({
    mutationFn: apiClient.user.updateActionPlanProgress,
  });
}

export function useUploadCorpusDocMutation() {
  return useMutation({
    mutationFn: apiClient.corpus.upload,
  });
}

export function useDeleteCorpusDocMutation() {
  return useMutation({
    mutationFn: apiClient.corpus.deleteDocument,
  });
}
