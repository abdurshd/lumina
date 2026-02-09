'use client';

import { useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';
import { useAssessmentStore } from '@/stores/assessment-store';
import { saveTalentReport, getDataInsights, getQuizAnswers, getSessionInsights } from '@/lib/firebase/firestore';
import { FetchError } from '@/lib/fetch-client';
import { useReportMutation } from '@/hooks/use-api-mutations';
import { useTalentReportQuery } from '@/hooks/use-api-queries';
import { TalentRadarChart } from '@/components/report/talent-radar-chart';
import { CareerPaths } from '@/components/report/career-paths';
import { StrengthsGrid } from '@/components/report/strengths-grid';
import { EmptyState, LoadingButton, ErrorAlert, ReportSkeleton } from '@/components/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Target, Lightbulb, Rocket, Eye } from 'lucide-react';

export default function ReportPage() {
  const { user } = useAuthStore();
  const { dataInsights, quizAnswers, sessionInsights, report, setReport, advanceStage } = useAssessmentStore();

  const reportMutation = useReportMutation();
  const reportQuery = useTalentReportQuery(user?.uid);

  // Sync fetched report into store
  useEffect(() => {
    if (reportQuery.data && !report) {
      setReport(reportQuery.data);
    }
  }, [reportQuery.data, report, setReport]);

  const generateReport = useCallback(() => {
    if (!user) return;

    const doGenerate = async () => {
      // Fetch data from Firestore if not in context
      const insights = dataInsights.length > 0 ? dataInsights : await getDataInsights(user.uid);
      const quiz = quizAnswers.length > 0 ? quizAnswers : await getQuizAnswers(user.uid);
      const session = sessionInsights.length > 0 ? sessionInsights : await getSessionInsights(user.uid);

      reportMutation.mutate({
        dataInsights: insights,
        quizAnswers: quiz,
        sessionInsights: session,
      }, {
        onSuccess: async (reportData) => {
          await saveTalentReport(user.uid, reportData);
          setReport(reportData);
          await advanceStage('report');
          toast.success('Your talent report is ready!');
        },
        onError: (err) => {
          const message = err instanceof FetchError ? err.message : 'Report generation failed. Please try again.';
          toast.error(message);
        },
      });
    };

    doGenerate();
  }, [user, dataInsights, quizAnswers, sessionInsights, setReport, advanceStage, reportMutation]);

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
          icon={Sparkles}
          title="Generate Your Talent Report"
          description="Lumina will analyze all your assessment data to create a comprehensive talent discovery report."
          action={
            <LoadingButton
              onClick={generateReport}
              loading={reportMutation.isPending}
              loadingText="Generating your report (this may take a minute)..."
              icon={Sparkles}
              size="lg"
              className="glow-amber"
            >
              Generate Report
            </LoadingButton>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      {/* Hero */}
      <div className="mb-10 text-center animate-fade-in-up">
        <Badge className="mb-4 bg-white/[0.06]" variant="secondary">Your Talent Report</Badge>
        <h1 className="text-4xl font-bold mb-2 text-gradient-gold">
          {report.headline}
        </h1>
        <p className="text-lg text-muted-foreground">{report.tagline}</p>
      </div>

      {/* Radar Chart */}
      <Card className="mb-8 glass animate-fade-in-up" style={{ animationDelay: '100ms' }}>
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
                <p className="text-sm font-medium font-sans">{dim.label}: {dim.value}</p>
                <p className="text-xs text-muted-foreground">{dim.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Strengths */}
      <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <h2 className="flex items-center gap-2 text-xl font-bold mb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          Top Strengths
        </h2>
        <StrengthsGrid strengths={report.topStrengths} />
      </div>

      {/* Hidden Talents */}
      <Card className="mb-8 glass animate-fade-in-up" style={{ animationDelay: '300ms' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-sans">
            <Eye className="h-5 w-5 text-primary" />
            Hidden Talents You Didn&apos;t Know About
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {report.hiddenTalents.map((talent, i) => (
              <div key={i} className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 mt-0.5 text-primary shrink-0" />
                <p className="text-sm">{talent}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Personality Insights */}
      <Card className="mb-8 glass animate-fade-in-up" style={{ animationDelay: '400ms' }}>
        <CardHeader>
          <CardTitle className="font-sans">Personality Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {report.personalityInsights.map((insight, i) => (
              <div key={i} className="rounded-lg bg-white/[0.04] border border-white/[0.06] p-3 text-sm">
                {insight}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="h-px bg-white/[0.06] my-8" />

      {/* Career Paths */}
      <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
        <h2 className="flex items-center gap-2 text-xl font-bold mb-4">
          <Rocket className="h-5 w-5 text-primary" />
          Recommended Career Paths
        </h2>
        <CareerPaths paths={report.careerPaths} />
      </div>

      {/* Action Plan */}
      <Card className="mb-8 glass animate-fade-in-up" style={{ animationDelay: '600ms' }}>
        <CardHeader>
          <CardTitle className="font-sans">Your Action Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {report.actionPlan.map((item, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white font-mono ${
                  item.priority === 'high' ? 'bg-red-500/80' : item.priority === 'medium' ? 'bg-primary/80' : 'bg-emerald-500/80'
                }`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-medium font-sans">{item.title}</h4>
                    <Badge variant="outline" className="text-xs border-white/[0.1]">{item.timeframe}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
