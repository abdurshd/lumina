'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';
import { useAssessmentStore } from '@/stores/assessment-store';
import {
  saveTalentReport,
  saveReportVersion,
  getDataInsights,
  getQuizAnswers,
  getSessionInsights,
  getQuizScores,
  getConstraints,
  saveComputedProfile,
  saveCareerRecommendations,
} from '@/lib/firebase/firestore';
import { buildComputedProfile } from '@/lib/career/profile-builder';
import { FetchError } from '@/lib/fetch-client';
import { useReportMutation, useFeedbackMutation, useRegenerateReportMutation } from '@/hooks/use-api-mutations';
import { useTalentReportQuery } from '@/hooks/use-api-queries';
import { TalentRadarChart } from '@/components/report/talent-radar-chart';
import { CareerPaths } from '@/components/report/career-paths';
import { StrengthsGrid } from '@/components/report/strengths-grid';
import { ReportHistory } from '@/components/report/report-history';
import { ThoughtChain } from '@/components/report/thought-chain';
import { EmptyState, LoadingButton, ErrorAlert, ReportSkeleton } from '@/components/shared';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { staggerContainer, staggerItem, fadeInUp, scaleIn, reducedMotionVariants } from '@/lib/motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Target, Lightbulb, Rocket, Eye, RefreshCw } from 'lucide-react';
import { LuminaIcon } from '@/components/icons/lumina-icon';

export default function ReportPage() {
  const { user } = useAuthStore();
  const { dataInsights, quizAnswers, sessionInsights, constraints, report, setReport, advanceStage } = useAssessmentStore();

  const reportMutation = useReportMutation();
  const feedbackMutation = useFeedbackMutation();
  const regenerateMutation = useRegenerateReportMutation();
  const reportQuery = useTalentReportQuery(user?.uid);
  const [hasFeedback, setHasFeedback] = useState(false);
  const [regenerateFeedback, setRegenerateFeedback] = useState('');
  const [showRegenerateForm, setShowRegenerateForm] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Sync fetched report into store
  useEffect(() => {
    if (reportQuery.data && !report) {
      setReport(reportQuery.data);
    }
  }, [reportQuery.data, report, setReport]);

  const generateReport = useCallback(async () => {
    if (!user) return;

    try {
      const insights = dataInsights.length > 0 ? dataInsights : await getDataInsights(user.uid);
      const quiz = quizAnswers.length > 0 ? quizAnswers : await getQuizAnswers(user.uid);
      const session = sessionInsights.length > 0 ? sessionInsights : await getSessionInsights(user.uid);
      const quizScoresData = await getQuizScores(user.uid);
      const resolvedConstraints = constraints ?? await getConstraints(user.uid) ?? undefined;
      const computedProfile = quizScoresData
        ? buildComputedProfile({
            quizDimensionScores: quizScoresData.dimensionSummary,
            sessionInsights: session,
            constraints: resolvedConstraints,
            dimensionConfidence: quizScoresData.dimensionConfidence,
          })
        : undefined;

      reportMutation.mutate({
        dataInsights: insights,
        quizAnswers: quiz,
        sessionInsights: session,
        quizScores: quizScoresData?.dimensionSummary,
        quizConfidence: quizScoresData?.dimensionConfidence,
        computedProfile,
        constraints: resolvedConstraints,
      }, {
        onSuccess: async (reportData) => {
          await saveTalentReport(user.uid, reportData);
          await saveReportVersion(user.uid, reportData, quizScoresData?.dimensionSummary);
          if (computedProfile) {
            await saveComputedProfile(user.uid, computedProfile);
          }
          if (reportData.careerRecommendations && reportData.careerRecommendations.length > 0) {
            await saveCareerRecommendations(user.uid, reportData.careerRecommendations);
          }
          setReport(reportData);
          await advanceStage('report');
          toast.success('Your talent report is ready!');
        },
        onError: (err) => {
          const message = err instanceof FetchError ? err.message : 'Report generation failed. Please try again.';
          toast.error(message);
        },
      });
    } catch {
      toast.error('Failed to load assessment data.');
    }
  }, [user, dataInsights, quizAnswers, sessionInsights, constraints, setReport, advanceStage, reportMutation]);

  const handleCareerFeedback = useCallback((pathTitle: string, feedback: 'agree' | 'disagree', reason?: string) => {
    feedbackMutation.mutate({ itemType: 'career', itemId: pathTitle, feedback, reason });
    if (feedback === 'disagree') setHasFeedback(true);
  }, [feedbackMutation]);

  const handleStrengthFeedback = useCallback((strengthName: string, feedback: 'agree' | 'disagree', reason?: string) => {
    feedbackMutation.mutate({ itemType: 'strength', itemId: strengthName, feedback, reason });
    if (feedback === 'disagree') setHasFeedback(true);
  }, [feedbackMutation]);

  const handleRegenerate = useCallback(async () => {
    if (!user || !regenerateFeedback.trim()) return;
    regenerateMutation.mutate({
      feedback: regenerateFeedback,
      context: {
        dataInsights,
        quizAnswers,
        sessionInsights,
        existingReport: report ?? undefined,
      },
    }, {
      onSuccess: async (reportData) => {
        await saveTalentReport(user.uid, reportData);
        await saveReportVersion(user.uid, reportData);
        setReport(reportData);
        setShowRegenerateForm(false);
        setRegenerateFeedback('');
        setHasFeedback(false);
        toast.success('Report has been regenerated with your feedback!');
      },
      onError: (err) => {
        const message = err instanceof FetchError ? err.message : 'Regeneration failed. Please try again.';
        toast.error(message);
      },
    });
  }, [user, regenerateFeedback, regenerateMutation, setReport, dataInsights, quizAnswers, sessionInsights, report]);

  if (reportQuery.isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10">
        <ReportSkeleton />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-10">
        {reportMutation.error && (
          <ErrorAlert
            message={reportMutation.error instanceof FetchError ? reportMutation.error.message : 'Report generation failed. Please try again.'}
            onRetry={generateReport}
            className="mb-6"
          />
        )}
        <EmptyState
          icon={LuminaIcon}
          title="Generate Your Talent Report"
          description="Lumina will analyze all your assessment data to create a comprehensive talent discovery report."
          action={
            <LoadingButton
              onClick={generateReport}
              loading={reportMutation.isPending}
              loadingText="Generating your report (this may take a minute)..."
              icon={LuminaIcon}
              size="lg"
              className=""
            >
              Generate Report
            </LoadingButton>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      {/* Hero */}
      <motion.div
        className="mb-10 text-center"
        initial="hidden"
        animate="visible"
        variants={shouldReduceMotion ? reducedMotionVariants : staggerContainer}
      >
        <motion.div variants={shouldReduceMotion ? reducedMotionVariants : scaleIn}>
          <Badge className="mb-4" variant="secondary">Your Talent Report</Badge>
        </motion.div>
        <motion.h1
          className="text-4xl font-bold mb-2 text-gradient-gold"
          variants={shouldReduceMotion ? reducedMotionVariants : scaleIn}
        >
          {report.headline}
        </motion.h1>
        <motion.p
          className="text-lg text-muted-foreground"
          variants={shouldReduceMotion ? reducedMotionVariants : fadeInUp}
        >
          {report.tagline}
        </motion.p>
      </motion.div>

      {/* Radar Chart */}
      <ScrollReveal>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-sans">
              <Target className="h-5 w-5 text-primary" />
              Talent Dimensions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TalentRadarChart dimensions={report.radarDimensions} />
            <div className="grid grid-cols-2 gap-3 mt-4 sm:grid-cols-3">
              {report.radarDimensions.map((dim, i) => (
                <div key={i} className="text-center">
                  <p className="text-sm font-bold font-sans">{dim.label}: {dim.value}</p>
                  <p className="text-xs text-muted-foreground">{dim.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </ScrollReveal>

      {/* Strengths */}
      <ScrollReveal>
        <div className="mb-8">
          <h2 className="flex items-center gap-2 text-xl font-bold mb-4">
            <LuminaIcon className="h-5 w-5 text-primary" />
            <span className="text-primary">Top</span> Strengths
          </h2>
          <StrengthsGrid strengths={report.topStrengths} onFeedback={handleStrengthFeedback} />
        </div>
      </ScrollReveal>

      {/* Hidden Talents */}
      <ScrollReveal>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-sans">
              <Eye className="h-5 w-5 text-primary" />
              Hidden Talents You Didn&apos;t Know About
            </CardTitle>
          </CardHeader>
          <CardContent>
            <motion.div
              className="space-y-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={shouldReduceMotion ? reducedMotionVariants : staggerContainer}
            >
              {report.hiddenTalents.map((talent, i) => (
                <motion.div
                  key={i}
                  className="flex items-start gap-3 rounded-xl bg-primary/[0.03] border-2 border-primary/10 p-3"
                  variants={shouldReduceMotion ? reducedMotionVariants : staggerItem}
                >
                  <Lightbulb className="h-5 w-5 mt-0.5 text-primary shrink-0" />
                  <p className="text-sm">{talent}</p>
                </motion.div>
              ))}
            </motion.div>
          </CardContent>
        </Card>
      </ScrollReveal>

      {/* Personality Insights */}
      <ScrollReveal>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="font-sans">Personality Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <motion.div
              className="grid gap-3 sm:grid-cols-2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={shouldReduceMotion ? reducedMotionVariants : staggerContainer}
            >
              {report.personalityInsights.map((insight, i) => (
                <motion.div
                  key={i}
                  className="rounded-xl bg-overlay-subtle border-2 border-overlay-light p-4 text-sm"
                  variants={shouldReduceMotion ? reducedMotionVariants : staggerItem}
                >
                  {insight}
                </motion.div>
              ))}
            </motion.div>
          </CardContent>
        </Card>
      </ScrollReveal>

      {/* Confidence Notes */}
      {(report.confidenceNotes ?? []).length > 0 && (
        <ScrollReveal>
          <Card className="mb-8 border-yellow-500/25">
            <CardHeader>
              <CardTitle className="font-sans">Confidence Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(report.confidenceNotes ?? []).map((note, i) => (
                <p key={i} className="text-sm text-muted-foreground">
                  {note}
                </p>
              ))}
            </CardContent>
          </Card>
        </ScrollReveal>
      )}

      <div className="h-[2px] bg-overlay-light my-12" />

      {/* Career Paths */}
      <ScrollReveal>
        <div className="mb-8">
          <h2 className="flex items-center gap-2 text-xl font-bold mb-4">
            <Rocket className="h-5 w-5 text-primary" />
            <span className="text-primary">Recommended</span> Career Paths
          </h2>
          <CareerPaths paths={report.careerPaths} recommendations={report.careerRecommendations} onFeedback={handleCareerFeedback} />
        </div>
      </ScrollReveal>

      {/* Action Plan */}
      <ScrollReveal>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="font-sans">Your Action Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <motion.div
              className="space-y-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={shouldReduceMotion ? reducedMotionVariants : staggerContainer}
            >
              {report.actionPlan.map((item, i) => (
                <motion.div
                  key={i}
                  className="flex items-start gap-3 rounded-xl border-2 border-overlay-light bg-overlay-subtle p-4"
                  variants={shouldReduceMotion ? reducedMotionVariants : staggerItem}
                >
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white font-mono border-2 ${
                    item.priority === 'high' ? 'bg-destructive/80 border-destructive/30' : item.priority === 'medium' ? 'bg-primary/80 border-primary/30' : 'bg-primary/60 border-primary/20'
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold font-sans">{item.title}</h4>
                      <Badge variant="outline">{item.timeframe}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </CardContent>
        </Card>
      </ScrollReveal>

      {/* Thought Chain — How the Report Was Built */}
      {report.generationTrace && report.generationTrace.length > 0 && (
        <ScrollReveal>
          <div className="mb-8">
            <ThoughtChain steps={report.generationTrace} />
          </div>
        </ScrollReveal>
      )}

      {/* Regenerate with Feedback */}
      <AnimatePresence>
        {hasFeedback && (
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <Card className="mb-8 border-primary/30">
              <CardContent className="pt-6">
                {showRegenerateForm ? (
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Tell Lumina what to adjust in your report:</p>
                    <Input
                      value={regenerateFeedback}
                      onChange={(e) => setRegenerateFeedback(e.target.value)}
                      placeholder="e.g., I'm more interested in creative roles than analytical ones..."
                    />
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setShowRegenerateForm(false)}>
                        Cancel
                      </Button>
                      <LoadingButton
                        size="sm"
                        onClick={handleRegenerate}
                        loading={regenerateMutation.isPending}
                        loadingText="Regenerating..."
                        disabled={!regenerateFeedback.trim()}
                        icon={RefreshCw}
                      >
                        Regenerate Report
                      </LoadingButton>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Not quite right?</p>
                      <p className="text-xs text-muted-foreground">Regenerate your report with your feedback to get better recommendations.</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setShowRegenerateForm(true)}>
                      <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                      Regenerate with Feedback
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report History */}
      {user && (
        <ScrollReveal>
          <div className="mb-8">
            <ReportHistory uid={user.uid} />
          </div>
        </ScrollReveal>
      )}
    </div>
  );
}
