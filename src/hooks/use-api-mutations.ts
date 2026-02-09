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

export function useDeleteDataMutation() {
  return useMutation({
    mutationFn: apiClient.user.deleteData,
  });
}
