'use client';

import { memo, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck } from 'lucide-react';
import type { TalentReport } from '@/types';

interface ReportConfidenceSummaryProps {
  report: TalentReport;
  dataSourceCount: number;
  quizResponseCount: number;
  sessionInsightCount: number;
}

export const ReportConfidenceSummary = memo(function ReportConfidenceSummary({
  report,
  dataSourceCount,
  quizResponseCount,
  sessionInsightCount,
}: ReportConfidenceSummaryProps) {
  const overallConfidence = useMemo(() => {
    const strengthConfidences = report.topStrengths
      .map((s) => {
        if (s.confidenceLevel === 'high') return 90;
        if (s.confidenceLevel === 'medium') return 60;
        if (s.confidenceLevel === 'low') return 30;
        return 50;
      });

    const careerConfidences = report.careerPaths
      .map((p) => p.confidence ?? 50);

    const allConfidences = [...strengthConfidences, ...careerConfidences];
    if (allConfidences.length === 0) return 50;

    return Math.round(allConfidences.reduce((sum, c) => sum + c, 0) / allConfidences.length);
  }, [report]);

  const confidenceLabel = overallConfidence >= 75 ? 'High' : overallConfidence >= 45 ? 'Medium' : 'Low';
  const confidenceVariant = overallConfidence >= 75 ? 'default' : overallConfidence >= 45 ? 'secondary' : 'outline';

  const totalSources = dataSourceCount + quizResponseCount + sessionInsightCount;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-sans">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Report Confidence
          <Badge variant={confidenceVariant as 'default' | 'secondary' | 'outline'} className="ml-auto">
            {confidenceLabel}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Overall confidence</span>
              <span className="text-xs font-bold font-mono">{overallConfidence}%</span>
            </div>
            <Progress value={overallConfidence} className="h-2" />
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Based on <span className="font-bold text-foreground">{totalSources}</span> data points:</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-overlay-subtle border border-overlay-light p-2 text-center">
              <p className="text-lg font-bold font-mono">{dataSourceCount}</p>
              <p className="text-[10px] text-muted-foreground">Sources</p>
            </div>
            <div className="rounded-lg bg-overlay-subtle border border-overlay-light p-2 text-center">
              <p className="text-lg font-bold font-mono">{quizResponseCount}</p>
              <p className="text-[10px] text-muted-foreground">Quiz Answers</p>
            </div>
            <div className="rounded-lg bg-overlay-subtle border border-overlay-light p-2 text-center">
              <p className="text-lg font-bold font-mono">{sessionInsightCount}</p>
              <p className="text-[10px] text-muted-foreground">Session Insights</p>
            </div>
          </div>

          {overallConfidence < 60 && (
            <p className="text-[10px] text-muted-foreground">
              Tip: Connect more data sources or retake the quiz to improve report confidence.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
