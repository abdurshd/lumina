'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { TrendingUp, RefreshCw } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useChallengesQuery, useProfileEvolutionQuery } from '@/hooks/use-api-queries';
import { useGenerateChallengesMutation, useCompleteChallengeMutation, useSubmitReflectionMutation } from '@/hooks/use-api-mutations';
import { PageHeader } from '@/components/shared';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { ProfileTimeline } from '@/components/evolution/profile-timeline';
import { DimensionTrends } from '@/components/evolution/dimension-trends';
import { ChallengeList } from '@/components/evolution/challenge-list';
import { ReflectionForm } from '@/components/evolution/reflection-form';
import { ProfileComparison } from '@/components/evolution/profile-comparison';
import { LoadingButton, EmptyState, CardSkeleton } from '@/components/shared';
import { FetchError } from '@/lib/fetch-client';
import { Button } from '@/components/ui/button';
import type { ProfileSnapshot } from '@/types';

export default function EvolutionPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const challengesQuery = useChallengesQuery(user?.uid);
  const evolutionQuery = useProfileEvolutionQuery(user?.uid);

  const generateChallengesMutation = useGenerateChallengesMutation();
  const completeChallengeMutation = useCompleteChallengeMutation();
  const submitReflectionMutation = useSubmitReflectionMutation();

  const [comparisonA, setComparisonA] = useState<ProfileSnapshot | null>(null);
  const [comparisonB, setComparisonB] = useState<ProfileSnapshot | null>(null);

  const challenges = challengesQuery.data ?? [];
  const snapshots = evolutionQuery.data ?? [];

  const handleGenerateChallenges = useCallback(() => {
    generateChallengesMutation.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['challenges', user?.uid] });
        toast.success('New challenges generated!');
      },
      onError: (err) => {
        const message = err instanceof FetchError ? err.message : 'Failed to generate challenges.';
        toast.error(message);
      },
    });
  }, [generateChallengesMutation, queryClient, user?.uid]);

  const handleAcceptChallenge = useCallback((id: string) => {
    // Optimistically update the challenge status locally
    queryClient.setQueryData(['challenges', user?.uid], (old: typeof challenges) =>
      old?.map((c) => (c.id === id ? { ...c, status: 'accepted' as const } : c))
    );
    toast.success('Challenge accepted!');
  }, [queryClient, user?.uid]);

  const handleSkipChallenge = useCallback((id: string) => {
    queryClient.setQueryData(['challenges', user?.uid], (old: typeof challenges) =>
      old?.map((c) => (c.id === id ? { ...c, status: 'skipped' as const } : c))
    );
    toast('Challenge skipped');
  }, [queryClient, user?.uid]);

  const handleCompleteChallenge = useCallback((id: string, evidence: string) => {
    completeChallengeMutation.mutate({ challengeId: id, evidence }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['challenges', user?.uid] });
        queryClient.invalidateQueries({ queryKey: ['profileEvolution', user?.uid] });
        toast.success('Challenge completed! Your profile may have been updated.');
      },
      onError: (err) => {
        const message = err instanceof FetchError ? err.message : 'Failed to complete challenge.';
        toast.error(message);
      },
    });
  }, [completeChallengeMutation, queryClient, user?.uid]);

  const handleSubmitReflection = useCallback((content: string, challengeId?: string) => {
    submitReflectionMutation.mutate({ content, challengeId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['reflections', user?.uid] });
        queryClient.invalidateQueries({ queryKey: ['profileEvolution', user?.uid] });
        toast.success('Reflection submitted! Your profile may have been updated.');
      },
      onError: (err) => {
        const message = err instanceof FetchError ? err.message : 'Failed to submit reflection.';
        toast.error(message);
      },
    });
  }, [submitReflectionMutation, queryClient, user?.uid]);

  const handleSelectComparison = useCallback((snapshot: ProfileSnapshot) => {
    if (!comparisonA) {
      setComparisonA(snapshot);
    } else if (!comparisonB) {
      setComparisonB(snapshot);
    } else {
      setComparisonA(snapshot);
      setComparisonB(null);
    }
  }, [comparisonA, comparisonB]);

  const isLoading = challengesQuery.isLoading || evolutionQuery.isLoading;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-10">
        <div className="space-y-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-10">
      <PageHeader
        icon={TrendingUp}
        title="Evolution"
        description="Track your growth, complete challenges, and watch your profile evolve over time."
      >
        <LoadingButton
          size="sm"
          variant="outline"
          onClick={handleGenerateChallenges}
          loading={generateChallengesMutation.isPending}
          loadingText="Generating..."
          icon={RefreshCw}
        >
          New Challenges
        </LoadingButton>
      </PageHeader>

      {/* Dimension Trends */}
      <ScrollReveal className="mb-8">
        <DimensionTrends snapshots={snapshots} />
      </ScrollReveal>

      {/* Profile Timeline */}
      <ScrollReveal className="mb-8">
        <h2 className="text-lg font-bold mb-4">Profile Timeline</h2>
        <ProfileTimeline snapshots={snapshots} />
      </ScrollReveal>

      {/* Snapshot Comparison Selector */}
      {snapshots.length >= 2 && (
        <ScrollReveal className="mb-8">
          <h2 className="text-lg font-bold mb-4">Compare Snapshots</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {[...snapshots]
              .sort((a, b) => a.timestamp - b.timestamp)
              .map((s) => {
                const isSelectedA = comparisonA?.version === s.version && comparisonA?.timestamp === s.timestamp;
                const isSelectedB = comparisonB?.version === s.version && comparisonB?.timestamp === s.timestamp;
                return (
                  <Button
                    key={`${s.version}-${s.timestamp}`}
                    variant={isSelectedA || isSelectedB ? 'default' : 'outline'}
                    size="xs"
                    onClick={() => handleSelectComparison(s)}
                  >
                    v{s.version}
                    {isSelectedA && ' (A)'}
                    {isSelectedB && ' (B)'}
                  </Button>
                );
              })}
          </div>

          {comparisonA && comparisonB && (
            <ProfileComparison snapshotA={comparisonA} snapshotB={comparisonB} />
          )}

          {comparisonA && !comparisonB && (
            <p className="text-sm text-muted-foreground">
              Select a second snapshot to compare.
            </p>
          )}
        </ScrollReveal>
      )}

      {/* Challenges */}
      <ScrollReveal className="mb-8">
        <h2 className="text-lg font-bold mb-4">Challenges</h2>
        {challenges.length === 0 ? (
          <EmptyState
            icon={TrendingUp}
            title="No Challenges Yet"
            description="Generate your first set of personalized micro-challenges to start growing."
            action={
              <LoadingButton
                onClick={handleGenerateChallenges}
                loading={generateChallengesMutation.isPending}
                loadingText="Generating..."
                icon={RefreshCw}
              >
                Generate Challenges
              </LoadingButton>
            }
          />
        ) : (
          <ChallengeList
            challenges={challenges}
            onAccept={handleAcceptChallenge}
            onSkip={handleSkipChallenge}
            onComplete={handleCompleteChallenge}
          />
        )}
      </ScrollReveal>

      {/* Reflection Form */}
      <ScrollReveal className="mb-8">
        <ReflectionForm
          onSubmit={handleSubmitReflection}
          isSubmitting={submitReflectionMutation.isPending}
          challenges={challenges}
        />
      </ScrollReveal>
    </div>
  );
}
