'use client';

import { useCallback } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useAuthStore } from '@/stores/auth-store';
import { useQueryClient } from '@tanstack/react-query';
import {
  useTalentReportQuery,
  useChallengesQuery,
  useProfileEvolutionQuery,
  useActionPlanProgressQuery,
} from '@/hooks/use-api-queries';
import {
  useGenerateChallengesMutation,
  useUpdateActionPlanProgressMutation,
} from '@/hooks/use-api-mutations';
import { TalentSummaryHero } from './talent-summary-hero';
import { QuickActionsBar } from './quick-actions-bar';
import { StrengthsSummary } from './strengths-summary';
import { CareerOverview } from './career-overview';
import { ActionPlanTracker } from './action-plan-tracker';
import { MicroChallengesSection } from './micro-challenges-section';
import { IterationHistory } from './iteration-history';
import { CardSkeleton } from '@/components/shared';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { fadeInUp } from '@/lib/motion';
import type { TalentReport } from '@/types';

interface PostCompletionDashboardProps {
  report: TalentReport;
}

export function PostCompletionDashboard({ report }: PostCompletionDashboardProps) {
  const shouldReduceMotion = useReducedMotion();
  const { profile } = useAuthStore();
  const uid = profile?.uid;
  const queryClient = useQueryClient();

  const { data: challenges, isLoading: challengesLoading } = useChallengesQuery(uid);
  const { data: snapshots, isLoading: snapshotsLoading } = useProfileEvolutionQuery(uid);
  const { data: actionPlanProgress } = useActionPlanProgressQuery(uid);

  const generateChallenges = useGenerateChallengesMutation();
  const updateActionPlan = useUpdateActionPlanProgressMutation();

  const handleGenerateChallenges = useCallback(() => {
    generateChallenges.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['challenges', uid] });
      },
    });
  }, [generateChallenges, queryClient, uid]);

  const handleUpdateActionProgress = useCallback(
    (itemTitle: string, status: 'pending' | 'completed') => {
      const currentItems = actionPlanProgress?.items ?? {};
      const updatedItems = {
        ...currentItems,
        [itemTitle]: {
          ...currentItems[itemTitle],
          status,
          ...(status === 'completed' ? { completedAt: Date.now() } : {}),
        },
      };
      updateActionPlan.mutate(
        { items: updatedItems },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['actionPlanProgress', uid] });
          },
        }
      );
    },
    [updateActionPlan, queryClient, uid, actionPlanProgress]
  );

  // Derive RIASEC code from radar dimensions (first letter of top 3 dimensions)
  const riasecCode = report.radarDimensions
    .slice()
    .sort((a, b) => b.value - a.value)
    .slice(0, 3)
    .map((d) => d.label.charAt(0).toUpperCase())
    .join('');

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <TalentSummaryHero
        headline={report.headline}
        tagline={report.tagline}
        riasecCode={riasecCode}
        radarDimensions={report.radarDimensions}
      />

      <QuickActionsBar />

      {report.topStrengths.length > 0 && (
        <StrengthsSummary strengths={report.topStrengths} />
      )}

      {report.careerPaths.length > 0 && (
        <CareerOverview careerPaths={report.careerPaths} />
      )}

      {report.actionPlan.length > 0 && (
        <ActionPlanTracker
          actionItems={report.actionPlan}
          progress={actionPlanProgress ?? null}
          onUpdateProgress={handleUpdateActionProgress}
        />
      )}

      {challengesLoading ? (
        <ScrollReveal variants={shouldReduceMotion ? undefined : fadeInUp}>
          <CardSkeleton />
        </ScrollReveal>
      ) : (
        <MicroChallengesSection
          challenges={challenges ?? []}
          onGenerate={handleGenerateChallenges}
          isGenerating={generateChallenges.isPending}
        />
      )}

      {snapshotsLoading ? (
        <ScrollReveal variants={shouldReduceMotion ? undefined : fadeInUp}>
          <CardSkeleton />
        </ScrollReveal>
      ) : (
        <IterationHistory snapshots={snapshots ?? []} />
      )}
    </div>
  );
}
