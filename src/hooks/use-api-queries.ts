import { useQuery } from '@tanstack/react-query';
import { getTalentReport, getChallenges, getReflections, getProfileSnapshots, getCorpusDocuments, getActionPlanProgress } from '@/lib/firebase/firestore';

export function useTalentReportQuery(uid: string | undefined) {
  return useQuery({
    queryKey: ['talentReport', uid],
    queryFn: () => getTalentReport(uid!),
    enabled: !!uid,
    staleTime: Infinity,
  });
}

export function useChallengesQuery(uid: string | undefined) {
  return useQuery({
    queryKey: ['challenges', uid],
    queryFn: () => getChallenges(uid!),
    enabled: !!uid,
    staleTime: 30_000,
  });
}

export function useReflectionsQuery(uid: string | undefined) {
  return useQuery({
    queryKey: ['reflections', uid],
    queryFn: () => getReflections(uid!),
    enabled: !!uid,
    staleTime: 30_000,
  });
}

export function useProfileEvolutionQuery(uid: string | undefined) {
  return useQuery({
    queryKey: ['profileEvolution', uid],
    queryFn: () => getProfileSnapshots(uid!),
    enabled: !!uid,
    staleTime: 30_000,
  });
}

export function useCorpusDocumentsQuery(uid: string | undefined) {
  return useQuery({
    queryKey: ['corpusDocuments', uid],
    queryFn: () => getCorpusDocuments(uid!),
    enabled: !!uid,
    staleTime: 60_000,
  });
}

export function useActionPlanProgressQuery(uid: string | undefined) {
  return useQuery({
    queryKey: ['actionPlanProgress', uid],
    queryFn: () => getActionPlanProgress(uid!),
    enabled: !!uid,
    staleTime: 30_000,
  });
}
