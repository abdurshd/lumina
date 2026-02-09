'use client';

import { useState, useEffect } from 'react';
import { getReportHistory } from '@/lib/firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { History, ChevronDown, ChevronRight } from 'lucide-react';
import type { TalentReport, QuizDimensionSummary } from '@/types';

interface ReportHistoryProps {
  uid: string;
}

interface HistoryEntry {
  report: TalentReport;
  timestamp: number;
  quizScores?: QuizDimensionSummary;
}

export function ReportHistory({ uid }: ReportHistoryProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    getReportHistory(uid).then((h) => {
      setHistory(h);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [uid]);

  if (loading || history.length <= 1) return null;

  return (
    <Card className="animate-fade-in-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-sans">
          <History className="h-5 w-5 text-primary" />
          Report History ({history.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {history.map((entry, i) => (
            <div key={entry.timestamp} className="rounded-lg border p-3">
              <button
                onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
                className="flex items-center justify-between w-full text-left"
              >
                <div>
                  <p className="text-sm font-medium">{entry.report.headline}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(entry.timestamp).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                {expandedIndex === i ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>

              {expandedIndex === i && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm text-muted-foreground">{entry.report.tagline}</p>
                  <div className="flex flex-wrap gap-1">
                    {entry.report.radarDimensions.map((dim, j) => (
                      <Badge key={j} variant="outline" className="text-xs">
                        {dim.label}: {dim.value}
                      </Badge>
                    ))}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground mb-1">Top Strengths:</p>
                    <div className="flex flex-wrap gap-1">
                      {entry.report.topStrengths.slice(0, 3).map((s, j) => (
                        <Badge key={j} variant="secondary" className="text-xs">
                          {s.name} ({s.score})
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
