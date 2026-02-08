'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useAssessment } from '@/contexts/assessment-context';
import { saveTalentReport, getTalentReport, getDataInsights, getQuizAnswers, getSessionInsights } from '@/lib/firebase/firestore';
import { TalentRadarChart } from '@/components/report/talent-radar-chart';
import { CareerPaths } from '@/components/report/career-paths';
import { StrengthsGrid } from '@/components/report/strengths-grid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sparkles, Target, Lightbulb, Rocket, Loader2, Eye } from 'lucide-react';
import type { TalentReport } from '@/types';

export default function ReportPage() {
  const { user } = useAuth();
  const { dataInsights, quizAnswers, sessionInsights, report, setReport, advanceStage } = useAssessment();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Try loading existing report
  useEffect(() => {
    async function loadReport() {
      if (!user || report) return;
      const existing = await getTalentReport(user.uid);
      if (existing) setReport(existing);
    }
    loadReport();
  }, [user, report, setReport]);

  const generateReport = useCallback(async () => {
    if (!user) return;
    setIsGenerating(true);
    setError(null);

    try {
      // Fetch data from Firestore if not in context
      const insights = dataInsights.length > 0 ? dataInsights : await getDataInsights(user.uid);
      const quiz = quizAnswers.length > 0 ? quizAnswers : await getQuizAnswers(user.uid);
      const session = sessionInsights.length > 0 ? sessionInsights : await getSessionInsights(user.uid);

      const res = await fetch('/api/gemini/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataInsights: insights,
          quizAnswers: quiz,
          sessionInsights: session,
        }),
      });

      if (!res.ok) throw new Error('Report generation failed');

      const reportData: TalentReport = await res.json();
      await saveTalentReport(user.uid, reportData);
      setReport(reportData);
      await advanceStage('report');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
    setIsGenerating(false);
  }, [user, dataInsights, quizAnswers, sessionInsights, setReport, advanceStage]);

  if (!report) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Generate Your Talent Report</h1>
        <p className="text-muted-foreground mb-8">
          Lumina will analyze all your assessment data to create a comprehensive talent discovery report.
        </p>
        {error && (
          <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        <Button onClick={generateReport} disabled={isGenerating} size="lg">
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generating your report...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Generate Report
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      {/* Hero */}
      <div className="mb-10 text-center">
        <Badge className="mb-4" variant="secondary">Your Talent Report</Badge>
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          {report.headline}
        </h1>
        <p className="text-lg text-muted-foreground">{report.tagline}</p>
      </div>

      {/* Radar Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Talent Dimensions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TalentRadarChart dimensions={report.radarDimensions} />
          <div className="grid grid-cols-2 gap-3 mt-4 sm:grid-cols-3">
            {report.radarDimensions.map((dim, i) => (
              <div key={i} className="text-center">
                <p className="text-sm font-medium">{dim.label}: {dim.value}</p>
                <p className="text-xs text-muted-foreground">{dim.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Strengths */}
      <div className="mb-8">
        <h2 className="flex items-center gap-2 text-xl font-bold mb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          Top Strengths
        </h2>
        <StrengthsGrid strengths={report.topStrengths} />
      </div>

      {/* Hidden Talents */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Hidden Talents You Didn&apos;t Know About
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {report.hiddenTalents.map((talent, i) => (
              <div key={i} className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 mt-0.5 text-yellow-500 shrink-0" />
                <p className="text-sm">{talent}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Personality Insights */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Personality Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {report.personalityInsights.map((insight, i) => (
              <div key={i} className="rounded-lg bg-muted p-3 text-sm">
                {insight}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      {/* Career Paths */}
      <div className="mb-8">
        <h2 className="flex items-center gap-2 text-xl font-bold mb-4">
          <Rocket className="h-5 w-5 text-primary" />
          Recommended Career Paths
        </h2>
        <CareerPaths paths={report.careerPaths} />
      </div>

      {/* Action Plan */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Your Action Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {report.actionPlan.map((item, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border p-4">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ${
                  item.priority === 'high' ? 'bg-red-500' : item.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`}>
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{item.title}</h4>
                    <Badge variant="outline" className="text-xs">{item.timeframe}</Badge>
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
