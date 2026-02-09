import { useQuery } from '@tanstack/react-query';
import { getTalentReport } from '@/lib/firebase/firestore';

export function useTalentReportQuery(uid: string | undefined) {
  return useQuery({
    queryKey: ['talentReport', uid],
    queryFn: () => getTalentReport(uid!),
    enabled: !!uid,
    staleTime: Infinity,
  });
}
