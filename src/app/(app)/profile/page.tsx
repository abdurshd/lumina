'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';
import { useUpdateProfileMutation } from '@/hooks/use-api-mutations';
import { useComputedProfileQuery, useIterationStateQuery, useProfileEvolutionQuery } from '@/hooks/use-api-queries';
import { FetchError } from '@/lib/fetch-client';
import { smoothTransition } from '@/lib/motion';
import { PageHeader } from '@/components/shared';
import { StaggerList, StaggerItem } from '@/components/motion/stagger-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StatusBadge } from '@/components/shared';
import {
  UserCircle,
  Plug,
  Brain,
  Video,
  FileText,
  ArrowRight,
  CheckCircle2,
  Database,
  BarChart3,
  Layers,
  Zap,
} from 'lucide-react';
import type { AssessmentStage } from '@/types';

const STAGE_CONFIG: { key: AssessmentStage; label: string; icon: typeof Plug }[] = [
  { key: 'connections', label: 'Connections', icon: Plug },
  { key: 'quiz', label: 'Quiz', icon: Brain },
  { key: 'session', label: 'Session', icon: Video },
  { key: 'report', label: 'Report', icon: FileText },
];

const CONSENT_SOURCE_LABELS: Record<string, string> = {
  gmail: 'Gmail',
  chatgpt: 'ChatGPT Export',
  file_upload: 'File Uploads',
  drive: 'Google Drive',
  notion: 'Notion',
};

export default function ProfilePage() {
  const { profile, user, refreshProfile } = useAuthStore();
  const updateProfileMutation = useUpdateProfileMutation();
  const shouldReduceMotion = useReducedMotion();

  const uid = user?.uid;
  const { data: computedProfile } = useComputedProfileQuery(uid);
  const { data: iterationState } = useIterationStateQuery(uid);
  const { data: snapshots } = useProfileEvolutionQuery(uid);

  const [displayName, setDisplayName] = useState(profile?.displayName ?? '');
  const [isEditingName, setIsEditingName] = useState(false);

  const handleSaveName = useCallback(() => {
    if (!displayName.trim()) return;
    updateProfileMutation.mutate({ displayName: displayName.trim() }, {
      onSuccess: async () => {
        await refreshProfile();
        setIsEditingName(false);
        toast.success('Display name updated.');
      },
      onError: (err) => {
        const message = err instanceof FetchError ? err.message : 'Failed to update name';
        toast.error(message);
      },
    });
  }, [displayName, updateProfileMutation, refreshProfile]);

  if (!profile) return null;

  const stagesCompleted = Object.values(profile.stages).filter((s) => s === 'completed').length;
  const sourcesConnected = profile.consentSources?.length ?? 0;
  const challengesDone = iterationState?.completedChallengeCount ?? 0;
  const profileVersion = snapshots?.length ?? 0;
  const quizDone = profile.stages.quiz === 'completed';

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-12">
      <PageHeader
        icon={UserCircle}
        title="Profile"
        description="Your identity and progress in Lumina."
      />

      <StaggerList className="space-y-6">
        {/* Hero Card */}
        <StaggerItem>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                <Avatar className="h-20 w-20 border-2 border-overlay-medium">
                  <AvatarImage src={profile.photoURL} />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                    {profile.displayName?.charAt(0) ?? 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <AnimatePresence mode="wait">
                      {isEditingName ? (
                        <motion.div
                          key="edit"
                          className="flex items-center gap-2"
                          initial={shouldReduceMotion ? false : { opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
                          transition={smoothTransition}
                        >
                          <Input
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="h-8 w-60"
                          />
                          <Button size="sm" onClick={handleSaveName} disabled={updateProfileMutation.isPending}>
                            Save
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => { setIsEditingName(false); setDisplayName(profile.displayName ?? ''); }}>
                            Cancel
                          </Button>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="display"
                          className="flex items-center gap-2"
                          initial={shouldReduceMotion ? false : { opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0 }}
                          transition={{ duration: 0.15 }}
                        >
                          <h2 className="text-xl font-bold">{profile.displayName}</h2>
                          <Button variant="ghost" size="sm" onClick={() => setIsEditingName(true)}>
                            Edit
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <p className="text-sm text-muted-foreground">{profile.email}</p>
                  {profile.createdAt > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Member since {new Date(profile.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </StaggerItem>

        {/* Assessment Progress */}
        <StaggerItem>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-sans">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Assessment Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center gap-3">
                <Progress value={(stagesCompleted / 4) * 100} className="h-2.5 flex-1" />
                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                  {stagesCompleted}/4
                </span>
              </div>
              {/* Horizontal stepper (desktop) / vertical (mobile) */}
              <div className="hidden sm:grid grid-cols-4 gap-3">
                {STAGE_CONFIG.map(({ key, label, icon: Icon }) => {
                  const status = profile.stages[key];
                  return (
                    <div key={key} className="flex flex-col items-center gap-2 text-center">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl border-2 ${
                        status === 'completed'
                          ? 'bg-primary/10 border-primary/30'
                          : status === 'active'
                          ? 'bg-primary/5 border-primary/20'
                          : 'bg-muted/30 border-border'
                      }`}>
                        <Icon className={`h-5 w-5 ${
                          status === 'completed' ? 'text-primary' : status === 'active' ? 'text-primary/70' : 'text-muted-foreground'
                        }`} />
                      </div>
                      <p className="text-xs font-medium">{label}</p>
                      <StatusBadge status={status} />
                    </div>
                  );
                })}
              </div>
              {/* Vertical (mobile) */}
              <div className="sm:hidden space-y-3">
                {STAGE_CONFIG.map(({ key, label, icon: Icon }) => {
                  const status = profile.stages[key];
                  return (
                    <div key={key} className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2 ${
                        status === 'completed'
                          ? 'bg-primary/10 border-primary/30'
                          : status === 'active'
                          ? 'bg-primary/5 border-primary/20'
                          : 'bg-muted/30 border-border'
                      }`}>
                        <Icon className={`h-4 w-4 ${
                          status === 'completed' ? 'text-primary' : status === 'active' ? 'text-primary/70' : 'text-muted-foreground'
                        }`} />
                      </div>
                      <span className="text-sm font-medium flex-1">{label}</span>
                      <StatusBadge status={status} />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </StaggerItem>

        {/* Talent Summary (conditional) */}
        {quizDone && computedProfile && (
          <StaggerItem>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-sans">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Talent Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* RIASEC Code */}
                {computedProfile.riasecCode && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
                      RIASEC Code
                    </p>
                    <div className="flex gap-1.5">
                      {computedProfile.riasecCode.split('').map((letter, i) => (
                        <Badge key={i} variant="secondary" className="text-sm font-bold px-2.5 py-0.5">
                          {letter}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Top Dimension Scores */}
                {Object.keys(computedProfile.dimensionScores).length > 0 && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
                      Top Dimensions
                    </p>
                    <div className="space-y-2.5">
                      {Object.entries(computedProfile.dimensionScores)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 5)
                        .map(([dim, score]) => (
                          <div key={dim} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm capitalize">{dim.replace(/_/g, ' ')}</span>
                              <span className="text-xs text-muted-foreground">{Math.round(score)}%</span>
                            </div>
                            <Progress value={score} className="h-1.5" />
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Overall Confidence */}
                {computedProfile.confidenceScores && Object.keys(computedProfile.confidenceScores).length > 0 && (
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm font-medium">Overall Confidence</span>
                    <span className="text-sm font-bold text-primary">
                      {Math.round(
                        Object.values(computedProfile.confidenceScores).reduce((a, b) => a + b, 0)
                          / Object.values(computedProfile.confidenceScores).length
                      )}%
                    </span>
                  </div>
                )}

                <Link
                  href="/report"
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mt-2"
                >
                  View full report <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </CardContent>
            </Card>
          </StaggerItem>
        )}

        {/* Connected Accounts */}
        <StaggerItem>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-sans">
                <Database className="h-5 w-5 text-primary" />
                Connected Accounts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Google Account</p>
                  <p className="text-xs text-muted-foreground">{profile.email}</p>
                </div>
                <Badge>Connected</Badge>
              </div>
              {profile.notionAccessToken && (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Notion</p>
                    <p className="text-xs text-muted-foreground">Workspace connected</p>
                  </div>
                  <Badge>Connected</Badge>
                </div>
              )}
              {profile.consentSources && profile.consentSources.length > 0 && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2 mt-2">
                    Consented Sources
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.consentSources.map((src) => (
                      <Badge key={src} variant="secondary">
                        {CONSENT_SOURCE_LABELS[src] ?? src}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <Link
                href="/connections"
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mt-2"
              >
                Manage connections <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardContent>
          </Card>
        </StaggerItem>

        {/* Quick Stats */}
        <StaggerItem>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-sans">
                <Zap className="h-5 w-5 text-primary" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Stages Completed" value={stagesCompleted} icon={CheckCircle2} />
                <StatCard label="Sources Connected" value={sourcesConnected} icon={Plug} />
                <StatCard label="Challenges Done" value={challengesDone} icon={Layers} />
                <StatCard label="Profile Version" value={profileVersion} icon={BarChart3} />
              </div>
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerList>
    </div>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: typeof CheckCircle2 }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border-2 border-overlay-subtle p-4 text-center">
      <Icon className="h-5 w-5 text-primary" />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
