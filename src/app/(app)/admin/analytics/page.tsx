'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/fetch-client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, Users, Star, TrendingUp } from 'lucide-react';

interface FunnelCounts {
  stage_started: number;
  stage_completed: number;
  quiz_module_completed: number;
  session_started: number;
  session_ended: number;
  report_generated: number;
  data_source_connected: number;
}

interface SessionStats {
  totalSessions: number;
  avgDurationMs: number;
  reconnections: number;
}

interface FeedbackDistribution {
  report_feedback: number;
  report_regenerated: number;
  challenge_completed: number;
  reflection_submitted: number;
}

interface AggregatedAnalytics {
  funnel: FunnelCounts;
  sessionStats: SessionStats;
  feedback: FeedbackDistribution;
  satisfactionAvg: number;
  satisfactionCount: number;
  totalEvents: number;
}

function formatDuration(ms: number): string {
  if (ms === 0) return 'N/A';
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes === 0) return `${remainingSeconds}s`;
  return `${minutes}m ${remainingSeconds}s`;
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AggregatedAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLoadAnalytics() {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFetch<AggregatedAnalytics>('/api/admin/analytics');
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Analytics Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View aggregated analytics for your account.
        </p>
      </div>

      <div className="mb-8">
        <Button onClick={handleLoadAnalytics} disabled={loading}>
          {loading ? 'Loading...' : 'Load Analytics'}
        </Button>
        {error && (
          <p className="text-sm text-destructive mt-2">{error}</p>
        )}
      </div>

      {data && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Completion Funnel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-sans">
                <TrendingUp className="h-4 w-4 text-primary" />
                Completion Funnel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Data Sources Connected</span>
                <Badge variant="secondary">{data.funnel.data_source_connected}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Stages Started</span>
                <Badge variant="secondary">{data.funnel.stage_started}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Stages Completed</span>
                <Badge variant="secondary">{data.funnel.stage_completed}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Quiz Modules Completed</span>
                <Badge variant="secondary">{data.funnel.quiz_module_completed}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Reports Generated</span>
                <Badge variant="secondary">{data.funnel.report_generated}</Badge>
              </div>
              <div className="mt-2 pt-2 border-t flex items-center justify-between">
                <span className="text-sm font-medium">Total Events</span>
                <Badge>{data.totalEvents}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Session Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-sans">
                <Users className="h-4 w-4 text-primary" />
                Session Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Sessions</span>
                <Badge variant="secondary">{data.sessionStats.totalSessions}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg Duration</span>
                <Badge variant="secondary">{formatDuration(data.sessionStats.avgDurationMs)}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Reconnections</span>
                <Badge variant="secondary">{data.sessionStats.reconnections}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Feedback Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-sans">
                <BarChart3 className="h-4 w-4 text-primary" />
                Feedback Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Report Feedback</span>
                <Badge variant="secondary">{data.feedback.report_feedback}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Reports Regenerated</span>
                <Badge variant="secondary">{data.feedback.report_regenerated}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Challenges Completed</span>
                <Badge variant="secondary">{data.feedback.challenge_completed}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Reflections Submitted</span>
                <Badge variant="secondary">{data.feedback.reflection_submitted}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Satisfaction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-sans">
                <Star className="h-4 w-4 text-primary" />
                Satisfaction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Average Rating</span>
                <Badge variant="secondary">
                  {data.satisfactionCount > 0 ? data.satisfactionAvg : 'N/A'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Ratings</span>
                <Badge variant="secondary">{data.satisfactionCount}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
