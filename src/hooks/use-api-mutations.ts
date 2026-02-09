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
